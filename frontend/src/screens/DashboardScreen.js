import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';

const { width } = Dimensions.get('window');

const DashboardScreenTailwind = ({ navigation }) => {
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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
  }, []);

  const quickActions = [
    {
      title: 'Créer un événement',
      subtitle: 'Organiser votre activité',
      icon: 'add-circle',
      gradient: ['#20B2AA', '#1a9b94'],
      onPress: () => navigation.navigate('CreateEvent')
    },
    {
      title: 'Découvrir',
      subtitle: 'Rejoindre des événements',
      icon: 'search',
      gradient: ['#3B82F6', '#2563EB'],
      onPress: () => navigation.navigate('Discover')
    },
    {
      title: 'Mes événements',
      subtitle: 'Gérer vos activités',
      icon: 'calendar',
      gradient: ['#10B981', '#059669'],
      onPress: () => navigation.navigate('MyEventsStack')
    },
    {
      title: 'Messages',
      subtitle: 'Communiquer',
      icon: 'chatbubbles',
      gradient: ['#F59E0B', '#D97706'],
      onPress: () => navigation.navigate('Messages')
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Match de Football',
      date: 'Aujourd\'hui 18h00',
      location: 'Stade Municipal',
      participants: 12,
      maxParticipants: 22,
      sport: 'football'
    },
    {
      id: 2,
      title: 'Session Running',
      date: 'Demain 08h00',
      location: 'Parc de la Ville',
      participants: 8,
      maxParticipants: 15,
      sport: 'running'
    },
    {
      id: 3,
      title: 'Cours de Yoga',
      date: 'Vendredi 19h00',
      location: 'Studio Zen',
      participants: 5,
      maxParticipants: 10,
      sport: 'yoga'
    }
  ];

  const sports = [
    { name: 'Football', icon: 'football', count: 45, color: '#10B981' },
    { name: 'Basketball', icon: 'basketball', count: 32, color: '#F59E0B' },
    { name: 'Tennis', icon: 'tennisball', count: 28, color: '#EF4444' },
    { name: 'Running', icon: 'walk', count: 67, color: '#3B82F6' },
    { name: 'Yoga', icon: 'leaf', count: 23, color: '#8B5CF6' },
    { name: 'Natation', icon: 'water', count: 18, color: '#06B6D4' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#20B2AA', '#1a9b94', '#0f172a']}
        className="pb-6"
      >
        <Animated.View 
          className="flex-row justify-between items-center px-5 pt-4"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="trophy" size={24} color="#ffffff" />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold">TeamUp</Text>
              <Text className="text-white/80 text-sm">Votre communauté sportive</Text>
            </View>
          </View>
          <TouchableOpacity 
            className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"
            onPress={() => navigation.navigate('Profile')}
          >
            <Text className="text-white text-lg font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <Animated.View 
          className="mx-5 -mt-8 bg-dark-800 rounded-3xl p-6 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-2">
                Bonjour, {user?.name} ! 👋
              </Text>
              <Text className="text-dark-300 text-base">
                Prêt pour votre prochaine aventure sportive ?
              </Text>
            </View>
            <View className="bg-warning/20 px-3 py-2 rounded-xl flex-row items-center">
              <Ionicons name="sunny" size={16} color="#F59E0B" />
              <Text className="text-warning ml-2 font-semibold">22°C</Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row justify-between">
            <View className="bg-dark-700 rounded-2xl p-4 flex-1 mr-2">
              <Text className="text-white text-2xl font-bold">12</Text>
              <Text className="text-dark-400 text-sm">Événements</Text>
            </View>
            <View className="bg-dark-700 rounded-2xl p-4 flex-1 mx-1">
              <Text className="text-white text-2xl font-bold">47h</Text>
              <Text className="text-dark-400 text-sm">Activité</Text>
            </View>
            <View className="bg-dark-700 rounded-2xl p-4 flex-1 ml-2">
              <Text className="text-white text-2xl font-bold">5⭐</Text>
              <Text className="text-dark-400 text-sm">Note</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View className="px-5 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Actions rapides</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className="w-[48%] mb-4"
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={action.gradient}
                  className="rounded-2xl p-4 h-24"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View className="flex-row items-center h-full">
                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                      <Ionicons name={action.icon} size={20} color="#ffffff" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-base">{action.title}</Text>
                      <Text className="text-white/80 text-xs">{action.subtitle}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View className="px-5 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Événements à venir</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-primary-500 font-semibold mr-1">Voir tout</Text>
              <Ionicons name="chevron-forward" size={16} color="#20B2AA" />
            </TouchableOpacity>
          </View>
          
          {upcomingEvents.map((event) => (
            <TouchableOpacity 
              key={event.id} 
              className="bg-dark-800 rounded-2xl p-4 mb-3"
              activeOpacity={0.8}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="w-10 h-10 bg-primary-500/20 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="calendar" size={20} color="#20B2AA" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg mb-1">{event.title}</Text>
                  <Text className="text-dark-300 text-sm mb-1">🕐 {event.date}</Text>
                  <Text className="text-dark-300 text-sm">📍 {event.location}</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="flex-row">
                    <View className="w-6 h-6 bg-primary-500 rounded-full border-2 border-dark-800" />
                    <View className="w-6 h-6 bg-secondary-500 rounded-full border-2 border-dark-800 -ml-2" />
                    <View className="w-6 h-6 bg-success rounded-full border-2 border-dark-800 -ml-2" />
                  </View>
                  <Text className="text-dark-300 text-sm ml-3">
                    {event.participants}/{event.maxParticipants}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-success rounded-full mr-2" />
                  <Text className="text-success text-sm font-semibold">Confirmé</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sports populaires */}
        <View className="px-5 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Sports populaires</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {sports.map((sport, index) => (
                <TouchableOpacity 
                  key={index} 
                  className="bg-dark-800 rounded-2xl p-4 mr-4 w-32"
                  style={{ minWidth: 120 }}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                    className="absolute inset-0 rounded-2xl"
                  />
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
                    style={{ backgroundColor: sport.color + '20' }}
                  >
                    <Ionicons 
                      name={sport.icon} 
                      size={24} 
                      color={sport.color}
                    />
                  </View>
                  <Text className="text-white font-bold text-base mb-1">{sport.name}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-white text-xl font-bold">{sport.count}</Text>
                    <Text className="text-dark-400 text-xs ml-1">événements</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreenTailwind;
