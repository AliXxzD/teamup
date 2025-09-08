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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const [notifications, setNotifications] = useState({
    // Event notifications
    eventCreated: true,
    eventUpdated: true,
    eventCancelled: true,
    eventReminder1h: true,
    eventReminder24h: false,
    
    // Social notifications
    newFollower: true,
    newMessage: true,
    messageReply: true,
    friendRequest: true,
    
    // Activity notifications
    eventJoined: true,
    eventLeft: false,
    organizerMessage: true,
    reviewReceived: true,
    
    // Marketing notifications
    weeklyDigest: false,
    monthlyReport: true,
    newFeatures: true,
    promotions: false,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveNotificationSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...notifications, [key]: value };
    setNotifications(newSettings);
    saveNotificationSettings(newSettings);
  };

  const NotificationGroup = ({ title, items, icon, color = "#64748b" }) => (
    <View className="mb-6">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 bg-slate-700 rounded-lg items-center justify-center mr-3">
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text className="text-white text-lg font-bold">{title}</Text>
      </View>
      
      <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4">
        {items.map((item, index) => (
          <View key={item.key} className={`flex-row items-center justify-between ${
            index < items.length - 1 ? 'pb-4 mb-4 border-b border-slate-700/30' : ''
          }`}>
            <View className="flex-1 mr-4">
              <Text className="text-white text-base font-medium">{item.title}</Text>
              <Text className="text-slate-400 text-sm mt-1">{item.subtitle}</Text>
            </View>
            
            <Switch
              value={notifications[item.key]}
              onValueChange={(value) => updateSetting(item.key, value)}
              trackColor={{ false: '#374151', true: color }}
              thumbColor={notifications[item.key] ? '#ffffff' : '#9ca3af'}
              ios_backgroundColor="#374151"
            />
          </View>
        ))}
      </View>
    </View>
  );

  const eventNotifications = [
    {
      key: 'eventCreated',
      title: 'Nouvel événement créé',
      subtitle: 'Quand vous créez un événement'
    },
    {
      key: 'eventUpdated',
      title: 'Événement modifié',
      subtitle: 'Modifications de vos événements'
    },
    {
      key: 'eventReminder1h',
      title: 'Rappel 1h avant',
      subtitle: 'Notification 1 heure avant l\'événement'
    },
    {
      key: 'eventReminder24h',
      title: 'Rappel 24h avant',
      subtitle: 'Notification la veille de l\'événement'
    }
  ];

  const socialNotifications = [
    {
      key: 'newFollower',
      title: 'Nouvel abonné',
      subtitle: 'Quand quelqu\'un vous suit'
    },
    {
      key: 'newMessage',
      title: 'Nouveau message',
      subtitle: 'Messages privés et de groupe'
    },
    {
      key: 'friendRequest',
      title: 'Demande d\'ami',
      subtitle: 'Nouvelles demandes d\'amitié'
    },
    {
      key: 'reviewReceived',
      title: 'Nouvel avis',
      subtitle: 'Quand vous recevez un avis'
    }
  ];

  const activityNotifications = [
    {
      key: 'eventJoined',
      title: 'Participant rejoint',
      subtitle: 'Quand quelqu\'un rejoint votre événement'
    },
    {
      key: 'organizerMessage',
      title: 'Message organisateur',
      subtitle: 'Messages des organisateurs d\'événements'
    }
  ];

  const marketingNotifications = [
    {
      key: 'weeklyDigest',
      title: 'Résumé hebdomadaire',
      subtitle: 'Votre activité de la semaine'
    },
    {
      key: 'monthlyReport',
      title: 'Rapport mensuel',
      subtitle: 'Statistiques et achievements du mois'
    },
    {
      key: 'newFeatures',
      title: 'Nouvelles fonctionnalités',
      subtitle: 'Annonces de nouvelles features'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-slate-900 px-6 pt-6 pb-4 border-b border-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-11 h-11 bg-slate-800 border border-slate-700/50 rounded-xl items-center justify-center mr-4"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-orange-500/20 rounded-xl items-center justify-center mr-3">
              <Ionicons name="notifications" size={20} color="#f59e0b" />
            </View>
            <Text className="text-white text-2xl font-bold">Notifications</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View 
          className="px-6 pt-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0]
            })}]
          }}
        >
          {/* Quick Actions */}
          <View className="mb-6">
            <View className="flex-row justify-between" style={{ gap: 12 }}>
              <TouchableOpacity 
                className="flex-1 bg-cyan-500 rounded-xl py-4 items-center"
                onPress={() => {
                  const allEnabled = { ...notifications };
                  Object.keys(allEnabled).forEach(key => allEnabled[key] = true);
                  setNotifications(allEnabled);
                  saveNotificationSettings(allEnabled);
                  Alert.alert('Activé', 'Toutes les notifications ont été activées');
                }}
              >
                <Text className="text-white text-sm font-bold">Tout activer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-4 items-center"
                onPress={() => {
                  const allDisabled = { ...notifications };
                  Object.keys(allDisabled).forEach(key => allDisabled[key] = false);
                  setNotifications(allDisabled);
                  saveNotificationSettings(allDisabled);
                  Alert.alert('Désactivé', 'Toutes les notifications ont été désactivées');
                }}
              >
                <Text className="text-slate-300 text-sm font-bold">Tout désactiver</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notification Categories */}
          <NotificationGroup
            title="Événements"
            icon="calendar"
            color="#22d3ee"
            items={eventNotifications}
          />

          <NotificationGroup
            title="Social"
            icon="people"
            color="#8b5cf6"
            items={socialNotifications}
          />

          <NotificationGroup
            title="Activité"
            icon="pulse"
            color="#22c55e"
            items={activityNotifications}
          />

          <NotificationGroup
            title="Communications"
            icon="mail"
            color="#f59e0b"
            items={marketingNotifications}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

