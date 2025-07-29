import React, { useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthContext';
import { colors } from '../styles/globalStyles';

const OAuthSuccessScreen = ({ route, navigation }) => {
  const { login } = useContext(AuthContext);

  useEffect(() => {
    handleOAuthSuccess();
  }, []);

  const handleOAuthSuccess = async () => {
    try {
      // Récupérer les paramètres de l'URL
      const { token, refresh, user } = route.params || {};
      
      if (!token || !user) {
        console.error('❌ Paramètres OAuth manquants:', { token: !!token, user: !!user });
        navigation.replace('Login');
        return;
      }

      // Parser les données utilisateur
      let userData;
      try {
        userData = typeof user === 'string' ? JSON.parse(user) : user;
      } catch (parseError) {
        console.error('❌ Erreur parsing user data:', parseError);
        navigation.replace('Login');
        return;
      }

      console.log('✅ Connexion Google réussie:', {
        userId: userData._id,
        email: userData.email,
        name: userData.name,
        isOAuth: userData.oauth?.google ? 'Oui' : 'Non'
      });

      // Sauvegarder les tokens
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['refreshToken', refresh || ''],
        ['userData', JSON.stringify(userData)]
      ]);

      // Mettre à jour le contexte d'authentification
      login(userData, token);

      // Navigation vers l'app principale avec un délai pour l'animation
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur handleOAuthSuccess:', error);
      navigation.replace('Login');
    }
  };

  return (
    <LinearGradient
      colors={['#20B2AA', '#17A2B8', '#0891B2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.content}>
        {/* Icône de succès */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.white} />
        </View>
        
        {/* Message de bienvenue */}
        <Text style={styles.title}>Connexion réussie !</Text>
        <Text style={styles.subtitle}>
          Bienvenue dans TeamUp{'\n'}
          Redirection en cours...
        </Text>
        
        {/* Indicateur de chargement */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
        
        {/* Logo Google */}
        <View style={styles.googleInfo}>
          <View style={styles.googleLogo}>
            <Text style={styles.googleLogoText}>G</Text>
          </View>
          <Text style={styles.googleText}>Connecté avec Google</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
    opacity: 0.9,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 48,
  },
  loadingContainer: {
    marginBottom: 48,
  },
  googleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  googleLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleLogoText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OAuthSuccessScreen; 