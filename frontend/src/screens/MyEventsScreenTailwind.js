import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

const MyEventsScreenTailwind = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('organized');
  const [organizedEvents, setOrganizedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadEvents();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        Alert.alert('Erreur', 'Session expirée');
        navigation.navigate('Login');
        return;
      }

      const headers = getAuthHeaders(accessToken);

      // Charger les événements organisés
      const organizedResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.MY_ORGANIZED}`, { headers });
      
      // Charger les événements rejoints
      const joinedResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.MY_JOINED}`, { headers });

      if (organizedResponse.ok) {
        const organizedData = await organizedResponse.json();
        setOrganizedEvents(organizedData.data || []);
      }

      if (joinedResponse.ok) {
        const joinedData = await joinedResponse.json();
        setJoinedEvents(joinedData.data || []);
      }

    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (eventDate < now) return '#64748b'; // Past - gray
    if (event.status === 'full') return '#F59E0B'; // Full - orange
    return '#10B981'; // Active - green
  };

  const getStatusText = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (eventDate < now) return 'Terminé';
    if (event.status === 'full') return 'Complet';
    return 'Actif';
  };

  const EventCard = ({ event, showManageButton = false }) => (
    <TouchableOpacity
      className="bg-dark-800 rounded-2xl p-4 mb-4"
      onPress={() => navigation.navigate('EventDetailsModal', { eventId: event._id })}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1">{event.title}</Text>
          <Text className="text-dark-300 text-sm" numberOfLines={2}>
            {event.description}
          </Text>
        </View>
        <View 
          className="px-3 py-1 rounded-full ml-3"
          style={{ backgroundColor: getStatusColor(event) + '20' }}
        >
          <Text 
            className="text-xs font-semibold"
            style={{ color: getStatusColor(event) }}
          >
            {getStatusText(event)}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#64748b" />
          <Text className="text-dark-300 text-sm ml-2">
            {formatDate(event.date)} • {event.time}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text className="text-dark-300 text-sm ml-1" numberOfLines={1}>
            {event.location?.address}
          </Text>
        </View>
      </View>

      {/* Sport & Participants */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="bg-primary-500/20 px-3 py-1 rounded-full">
            <Text className="text-primary-500 text-xs font-semibold">{event.sport}</Text>
          </View>
          <Text className="text-dark-400 text-sm ml-3">
            {event.currentParticipants}/{event.maxParticipants} participants
          </Text>
        </View>
        
        {showManageButton && (
          <TouchableOpacity
            className="bg-secondary-500 px-6 py-3 rounded-lg flex-row items-center"
            onPress={() => navigation.navigate('CreateEvent', { 
              eventId: event._id, 
              eventData: event, 
              isEditing: true 
            })}
          >
            <Ionicons name="settings" size={18} color="#ffffff" />
            <Text className="text-white text-base font-medium ml-2">Gérer</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const currentEvents = activeTab === 'organized' ? organizedEvents : joinedEvents;

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <LinearGradient
        colors={['#20B2AA', '#1a9b94', '#0f172a']}
        className="pb-4"
      >
        <View className="flex-row justify-between items-center px-6 pt-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Mes Événements</Text>
          <View className="w-6" />
        </View>
      </LinearGradient>

      {/* Tabs */}
      <Animated.View 
        className="px-6 py-4"
        style={{ opacity: fadeAnim }}
      >
        <View className="bg-dark-800 rounded-2xl p-1 flex-row">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${
              activeTab === 'organized' ? 'bg-primary-500' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('organized')}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'organized' ? 'text-white' : 'text-dark-300'
            }`}>
              Organisés ({organizedEvents.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${
              activeTab === 'joined' ? 'bg-secondary-500' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('joined')}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'joined' ? 'text-white' : 'text-dark-300'
            }`}>
              Rejoints ({joinedEvents.length})
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#20B2AA" />
            <Text className="text-dark-300 text-base mt-3">Chargement des événements...</Text>
          </View>
        ) : currentEvents.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-24 h-24 bg-dark-700 rounded-full items-center justify-center mb-6">
              <Ionicons 
                name={activeTab === 'organized' ? "calendar-outline" : "people-outline"} 
                size={40} 
                color="#64748b" 
              />
            </View>
            <Text className="text-white text-xl font-bold mb-2 text-center">
              {activeTab === 'organized' 
                ? 'Aucun événement organisé' 
                : 'Aucun événement rejoint'}
            </Text>
            <Text className="text-dark-300 text-center text-base mb-8 leading-6">
              {activeTab === 'organized'
                ? 'Créez votre premier événement et rassemblez votre communauté sportive'
                : 'Découvrez et rejoignez des événements qui vous intéressent'}
            </Text>
            <TouchableOpacity
              className="bg-primary-500 px-6 py-3 rounded-xl flex-row items-center"
              onPress={() => navigation.navigate(
                activeTab === 'organized' ? 'CreateEvent' : 'DiscoverMain'
              )}
            >
              <Ionicons 
                name={activeTab === 'organized' ? "add" : "search"} 
                size={20} 
                color="#ffffff" 
              />
              <Text className="text-white font-semibold ml-2">
                {activeTab === 'organized' ? 'Créer un événement' : 'Découvrir'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                tintColor="#20B2AA"
              />
            }
          >
            {currentEvents.map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                navigation={navigation}
                showManageButton={activeTab === 'organized'}
                onPress={() => navigation.navigate('EventDetailsModal', { eventId: event._id })}
                onManage={() => {
                  // Handle event management
                  Alert.alert('Gérer', `Gérer l'événement: ${event.title}`);
                }}
              />
            ))}
            
            <View className="h-6" />
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

export default MyEventsScreenTailwind;
