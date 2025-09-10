import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
  Animated,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // Settings states
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    eventReminders: true,
    newMessages: true,
    eventUpdates: true,
    weeklyDigest: false,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'fr',
    units: 'metric',
    autoLocation: true,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedPrivacy = await AsyncStorage.getItem('privacy');
      const savedPreferences = await AsyncStorage.getItem('preferences');
      
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
      if (savedPreferences) setPreferences(JSON.parse(savedPreferences));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (category, newSettings) => {
    try {
      await AsyncStorage.setItem(category, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Découvrez TeamUp - La plateforme qui connecte les sportifs ! Téléchargez l\'app maintenant.',
        url: 'https://teamup.com', // Replace with your app URL
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, iconColor = "#64748b" }) => (
    <TouchableOpacity
      className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 mb-3 flex-row items-center"
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center mr-4">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      
      <View className="flex-1">
        <Text className="text-white text-base font-medium">{title}</Text>
        {subtitle && (
          <Text className="text-slate-400 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      
      {rightComponent || (
        <Ionicons name="chevron-forward" size={18} color="#64748b" />
      )}
    </TouchableOpacity>
  );

  const SwitchItem = ({ icon, title, subtitle, value, onValueChange, iconColor = "#64748b" }) => (
    <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 mb-3 flex-row items-center">
      <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center mr-4">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      
      <View className="flex-1">
        <Text className="text-white text-base font-medium">{title}</Text>
        {subtitle && (
          <Text className="text-slate-400 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#374151', true: '#06b6d4' }}
        thumbColor={value ? '#ffffff' : '#9ca3af'}
        ios_backgroundColor="#374151"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Fixed Header */}
      <View className="bg-slate-900 px-6 pt-6 pb-4 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            {/* Bouton retour */}
            <TouchableOpacity
              className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center mr-3"
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="settings" size={24} color="#ffffff" />
            </LinearGradient>
            <Text className="text-white text-2xl font-bold">Paramètres</Text>
          </View>
          
          <View className="flex-row items-center">
            <GlobalMenu navigation={navigation} currentRoute="Settings" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View 
          className="px-6 pt-6 pb-8"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Account Section */}
          <View className="bg-slate-800/30 border border-slate-700/20 rounded-2xl p-5 mb-6">
            <Text className="text-white text-xl font-bold mb-5 px-1">Compte</Text>
            
            <SettingItem
              icon="person-outline"
              title="Profil"
              subtitle="Modifier vos informations personnelles"
              onPress={() => navigation.navigate('Profile')}
              iconColor="#22d3ee"
            />
            
            <SettingItem
              icon="key-outline"
              title="Sécurité"
              subtitle="Mot de passe et authentification"
              onPress={() => Alert.alert('Sécurité', 'Page en cours de développement')}
              iconColor="#f59e0b"
            />
          </View>

          {/* Notifications Section */}
          <View className="bg-slate-800/30 border border-slate-700/20 rounded-2xl p-5 mb-6">
            <Text className="text-white text-xl font-bold mb-5 px-1">Notifications</Text>
            
            <SwitchItem
              icon="notifications-outline"
              title="Notifications push"
              subtitle="Recevoir des notifications sur votre appareil"
              value={notifications.pushNotifications}
              onValueChange={(value) => {
                const newNotifications = { ...notifications, pushNotifications: value };
                setNotifications(newNotifications);
                saveSettings('notifications', newNotifications);
              }}
              iconColor="#22d3ee"
            />
          </View>

          {/* App Preferences */}
          <View className="bg-slate-800/30 border border-slate-700/20 rounded-2xl p-5 mb-6">
            <Text className="text-white text-xl font-bold mb-5 px-1">Préférences</Text>
            
            <SettingItem
              icon="color-palette-outline"
              title="Thème"
              subtitle="Mode sombre (recommandé)"
              onPress={() => Alert.alert('Thème', 'Mode clair disponible prochainement')}
              iconColor="#8b5cf6"
              rightComponent={
                <Text className="text-slate-400 text-sm">Sombre</Text>
              }
            />
            
            <SettingItem
              icon="language-outline"
              title="Langue"
              subtitle="Français"
              onPress={() => Alert.alert('Langue', 'Autres langues disponibles prochainement')}
              iconColor="#22c55e"
              rightComponent={
                <Text className="text-slate-400 text-sm">FR</Text>
              }
            />
            
            <SwitchItem
              icon="location-outline"
              title="Localisation automatique"
              subtitle="Utiliser votre position pour les événements proches"
              value={preferences.autoLocation}
              onValueChange={(value) => {
                const newPreferences = { ...preferences, autoLocation: value };
                setPreferences(newPreferences);
                saveSettings('preferences', newPreferences);
              }}
              iconColor="#ef4444"
            />
          </View>

          {/* Support Section */}
          <View className="bg-slate-800/30 border border-slate-700/20 rounded-2xl p-5 mb-6">
            <Text className="text-white text-xl font-bold mb-5 px-1">Support</Text>
            
            <SettingItem
              icon="trophy-outline"
              title="Classement"
              subtitle="Voir le classement et les achievements"
              onPress={() => navigation.navigate('Ranking')}
              iconColor="#fbbf24"
            />

            <SettingItem
              icon="help-circle-outline"
              title="Aide et FAQ"
              subtitle="Questions fréquentes et support"
              onPress={() => Alert.alert('Aide', 'Page d\'aide en cours de développement')}
              iconColor="#22d3ee"
            />
            
            <SettingItem
              icon="chatbubble-ellipses-outline"
              title="Nous contacter"
              subtitle="Envoyez-nous vos commentaires"
              onPress={() => Alert.alert('Contact', 'Email: support@teamup.com')}
              iconColor="#22c55e"
            />
            
            <SettingItem
              icon="share-outline"
              title="Partager l'app"
              subtitle="Invitez vos amis à rejoindre TeamUp"
              onPress={handleShare}
              iconColor="#f59e0b"
            />
            
            <SettingItem
              icon="star-outline"
              title="Noter l'app"
              subtitle="Donnez votre avis sur l'App Store"
              onPress={() => Alert.alert('Merci !', 'Redirection vers l\'App Store...')}
              iconColor="#fbbf24"
            />
          </View>


          {/* Danger Zone */}
          <View className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-6">
            <Text className="text-red-400 text-xl font-bold mb-5 px-1">Zone de danger</Text>
            
            <TouchableOpacity
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-3 flex-row items-center"
              onPress={() => Alert.alert('Supprimer', 'Fonctionnalité en cours de développement')}
              activeOpacity={0.8}
              style={{
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="w-10 h-10 bg-red-500/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </View>
              
              <View className="flex-1">
                <Text className="text-red-400 text-base font-medium">Supprimer le compte</Text>
                <Text className="text-red-300/70 text-sm mt-1">Cette action est irréversible</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={18} color="#ef4444" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 flex-row items-center justify-center"
              onPress={handleLogout}
              activeOpacity={0.8}
              style={{
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 12 }} />
              <Text className="text-red-400 text-lg font-bold">Se déconnecter</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="bg-slate-800/50 border border-slate-700/30 rounded-3xl p-6 mb-8">
            <View className="items-center mb-6">
              <LinearGradient
                colors={['#06b6d4', '#0891b2']}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  shadowColor: '#06b6d4',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="people" size={40} color="#ffffff" />
              </LinearGradient>
              
              <Text className="text-white text-2xl font-bold mb-2">TeamUp</Text>
              <Text className="text-slate-300 text-base text-center mb-3 leading-6">
                Connectez-vous au sport local
              </Text>
              <Text className="text-slate-500 text-sm">
                Version 1.0.0 • Build 2024.01
              </Text>
            </View>
            
            {/* Legal Links */}
            <View className="space-y-3">
              <Text className="text-slate-300 text-lg font-semibold text-center mb-4">
                Informations légales
              </Text>
              
              <TouchableOpacity
                className="bg-slate-700/50 border border-slate-600/30 rounded-2xl p-4 flex-row items-center"
                onPress={() => {
                  console.log('About button pressed');
                  try {
                    navigation.push('About');
                  } catch (error) {
                    console.error('Navigation error:', error);
                    navigation.navigate('About');
                  }
                }}
                activeOpacity={0.8}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="w-10 h-10 bg-cyan-500/20 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="information-circle" size={20} color="#06b6d4" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-medium">À propos</Text>
                  <Text className="text-slate-400 text-sm mt-1">En savoir plus sur TeamUp</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-slate-700/50 border border-slate-600/30 rounded-2xl p-4 flex-row items-center"
                onPress={() => {
                  console.log('Privacy button pressed');
                  try {
                    navigation.push('Privacy');
                  } catch (error) {
                    console.error('Navigation error:', error);
                    navigation.navigate('Privacy');
                  }
                }}
                activeOpacity={0.8}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-medium">Confidentialité</Text>
                  <Text className="text-slate-400 text-sm mt-1">Politique de protection des données</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-slate-700/50 border border-slate-600/30 rounded-2xl p-4 flex-row items-center"
                onPress={() => {
                  console.log('Terms button pressed');
                  try {
                    navigation.push('Terms');
                  } catch (error) {
                    console.error('Navigation error:', error);
                    navigation.navigate('Terms');
                  }
                }}
                activeOpacity={0.8}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="w-10 h-10 bg-amber-500/20 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="document-text" size={20} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-medium">Conditions d'utilisation</Text>
                  <Text className="text-slate-400 text-sm mt-1">Termes et conditions du service</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
