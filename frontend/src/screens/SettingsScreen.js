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
          
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <TouchableOpacity className="w-11 h-11 bg-slate-800 border border-slate-700/50 rounded-xl items-center justify-center">
              <Ionicons name="search" size={20} color="#ffffff" />
            </TouchableOpacity>
            <GlobalMenu navigation={navigation} currentRoute="Settings" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View 
          className="px-6 pt-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Account Section */}
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Compte</Text>
            
            <SettingItem
              icon="person-outline"
              title="Profil"
              subtitle="Modifier vos informations personnelles"
              onPress={() => navigation.navigate('Profile')}
              iconColor="#22d3ee"
            />
            
            <SettingItem
              icon="shield-outline"
              title="Confidentialité"
              subtitle="Gérer la visibilité de votre profil"
              onPress={() => Alert.alert('Confidentialité', 'Page en cours de développement')}
              iconColor="#8b5cf6"
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
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Notifications</Text>
            
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
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Préférences</Text>
            
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
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Support</Text>
            
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

          {/* About Section */}
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">À propos</Text>
            
            <SettingItem
              icon="information-circle-outline"
              title="À propos de TeamUp"
              subtitle="Version 1.0.0"
              onPress={() => Alert.alert('TeamUp', 'Version 1.0.0\nDéveloppé avec ❤️ pour les sportifs')}
              iconColor="#64748b"
            />
            
            <SettingItem
              icon="document-text-outline"
              title="Conditions d'utilisation"
              subtitle="Lire nos conditions d'utilisation"
              onPress={() => Alert.alert('Conditions', 'Page en cours de développement')}
              iconColor="#64748b"
            />
            
            <SettingItem
              icon="shield-checkmark-outline"
              title="Politique de confidentialité"
              subtitle="Comment nous protégeons vos données"
              onPress={() => Alert.alert('Confidentialité', 'Page en cours de développement')}
              iconColor="#64748b"
            />
          </View>

          {/* Danger Zone */}
          <View className="mb-8">
            <Text className="text-red-400 text-xl font-bold mb-4">Zone de danger</Text>
            
            <TouchableOpacity
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-3 flex-row items-center"
              onPress={() => Alert.alert('Supprimer', 'Fonctionnalité en cours de développement')}
              activeOpacity={0.8}
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
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 12 }} />
              <Text className="text-red-400 text-lg font-bold">Se déconnecter</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="items-center mb-8">
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="people" size={32} color="#ffffff" />
            </LinearGradient>
            
            <Text className="text-white text-xl font-bold mb-2">TeamUp</Text>
            <Text className="text-slate-400 text-sm text-center mb-4">
              Connectez-vous au sport local
            </Text>
            <Text className="text-slate-500 text-xs">
              Version 1.0.0 • Build 2024.01
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
