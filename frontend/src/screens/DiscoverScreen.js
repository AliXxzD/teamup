import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import GlobalMenu from '../components/GlobalMenu';
import { navigateToEventDetails } from '../utils/navigationUtils';

const DiscoverScreenTailwind = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    sport: '',
    level: '',
    isFree: null
  });
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchEvents();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [filters]);

  const sports = ['Football', 'Basketball', 'Tennis', 'Running', 'Yoga', 'Natation'];
  const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];

  const fetchEvents = async () => {
    try {
      console.log('🔄 Chargement des événements...');
      
      let url = `${API_BASE_URL}${API_ENDPOINTS.EVENTS.LIST}?`;
      const params = [];
      
      if (filters.sport) params.push(`sport=${encodeURIComponent(filters.sport)}`);
      if (filters.level) params.push(`level=${encodeURIComponent(filters.level)}`);
      if (filters.isFree !== null) params.push(`isFree=${filters.isFree}`);
      
      url += params.join('&');
      console.log('📡 URL de requête:', url);

      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📊 Statut de la réponse:', response.status);
      console.log('✅ Événements reçus:', data.data?.events?.length || 0);

      if (data.success) {
        setEvents(data.data.events);
      } else {
        console.error('Erreur API:', data.message);
        Alert.alert('Erreur', 'Impossible de charger les événements');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des événements:', error);
      Alert.alert('Erreur de connexion', 'Vérifiez votre connexion internet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      console.log('🔄 Tentative de rejoindre l\'événement:', eventId);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert('Connexion requise', 'Vous devez être connecté pour rejoindre un événement');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.JOIN(eventId)}`, {
        method: 'POST',
        headers: getAuthHeaders(token)
      });
      
      console.log('📊 Statut de participation:', response.status);
      const data = await response.json();

      if (data.success) {
        Alert.alert('Succès !', 'Vous avez rejoint l\'événement avec succès');
        fetchEvents();
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de rejoindre l\'événement');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', 'Impossible de rejoindre l\'événement');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatEventTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getEventImage = (sport) => {
    const sportImages = {
      'Football': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop',
      'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
      'Tennis': 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop',
      'Running': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'Yoga': 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=300&fit=crop',
      'Natation': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop'
    };
    return sportImages[sport] || sportImages['Football'];
  };

  const FilterChip = ({ title, isSelected, onPress, color = '#20B2AA' }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mr-3 mb-2 flex-row items-center ${
        isSelected 
          ? 'bg-primary-500' 
          : 'bg-dark-700 border border-dark-600'
      }`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text className={`text-sm font-semibold ${
        isSelected ? 'text-white' : 'text-dark-300'
      }`}>
        {title}
      </Text>
      {isSelected && (
        <Ionicons name="close" size={16} color="#ffffff" className="ml-2" />
      )}
    </TouchableOpacity>
  );

  const EventCard = ({ event }) => (
    <TouchableOpacity
      className="bg-dark-800 rounded-2xl mb-4 overflow-hidden"
      onPress={() => {
        console.log('🔍 Navigation vers EventDetails:', {
          eventId: event._id,
          eventTitle: event.title,
        });
        navigateToEventDetails(navigation, event._id);
      }}
      activeOpacity={0.9}
    >
      {/* Image Header */}
      <View className="h-40 relative">
        <Image
          source={{ uri: getEventImage(event.sport) }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          className="absolute inset-0"
        />
        
        {/* Badges */}
        <View className="absolute top-3 right-3 flex-col items-end">
          {event.price.isFree && (
            <View className="bg-success px-3 py-1 rounded-full mb-2">
              <Text className="text-white text-xs font-bold">GRATUIT</Text>
            </View>
          )}
          <View className="bg-black/70 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">{event.sport}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="text-white text-lg font-bold mb-2">{event.title}</Text>
        <Text className="text-dark-300 text-sm mb-4 leading-5" numberOfLines={2}>
          {event.description}
        </Text>

        {/* Event Details */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text className="text-dark-300 text-sm ml-2">
              {formatDate(event.date)} à {formatEventTime(event.time)}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={16} color="#64748b" />
            <Text className="text-dark-300 text-sm ml-2 flex-1" numberOfLines={1}>
              {event.location.address}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="people-outline" size={16} color="#64748b" />
            <Text className="text-dark-300 text-sm ml-2">
              {event.currentParticipants}/{event.maxParticipants} participants
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="star-outline" size={16} color="#64748b" />
            <Text className="text-dark-300 text-sm ml-2">
              Niveau: {event.level}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-sm font-bold">
                {event.organizer?.name ? event.organizer.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <Text className="text-dark-300 text-sm flex-1">
              Par {event.organizer?.name || 'Organisateur inconnu'}
            </Text>
          </View>

          <TouchableOpacity
            className={`px-6 py-3 rounded-lg flex-row items-center ${
              event.currentParticipants >= event.maxParticipants 
                ? 'bg-dark-600' 
                : 'bg-lime'
            }`}
            onPress={() => joinEvent(event._id)}
            disabled={event.currentParticipants >= event.maxParticipants}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={event.currentParticipants >= event.maxParticipants ? "lock-closed" : "add"} 
              size={18} 
              color="#ffffff"
            />
            <Text className="text-white text-base font-semibold ml-2">
              {event.currentParticipants >= event.maxParticipants ? 'Complet' : 'Rejoindre'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <LinearGradient
        colors={['#20B2AA', '#1a9b94', '#0f172a']}
        className="pb-4"
      >
        <View className="flex-row justify-between items-center px-5 pt-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center mr-3">
              <Ionicons name="trophy" size={20} color="#ffffff" />
            </View>
            <Text className="text-white text-xl font-bold">TEAMUP</Text>
          </View>
          <GlobalMenu navigation={navigation} />
        </View>
      </LinearGradient>

      {/* Title Section */}
      <Animated.View 
        className="px-5 py-5 -mt-6 bg-dark-800 mx-5 rounded-2xl mb-4"
        style={{ opacity: fadeAnim }}
      >
        <View className="flex-row items-center mb-2">
          <Ionicons name="search" size={28} color="#20B2AA" />
          <Text className="text-white text-2xl font-bold ml-3">Découvrir</Text>
        </View>
        <Text className="text-dark-300 text-base">Trouvez votre prochaine activité sportive</Text>
        <Text className="text-dark-400 text-xs mt-1 italic">Affiche uniquement les événements à venir</Text>
      </Animated.View>

      {/* Filters */}
      <View className="px-5 mb-4">
        <Text className="text-white text-lg font-semibold mb-3">Filtres</Text>
        
        {/* Sport Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row">
            <FilterChip
              title="Tous les sports"
              isSelected={!filters.sport}
              onPress={() => setFilters({ ...filters, sport: '' })}
            />
            {sports.map((sport) => (
              <FilterChip
                key={sport}
                title={sport}
                isSelected={filters.sport === sport}
                onPress={() => setFilters({ 
                  ...filters, 
                  sport: filters.sport === sport ? '' : sport 
                })}
              />
            ))}
          </View>
        </ScrollView>

        {/* Price and Level Filters */}
        <View className="flex-row flex-wrap">
          <FilterChip
            title="Gratuit"
            isSelected={filters.isFree === true}
            onPress={() => setFilters({ 
              ...filters, 
              isFree: filters.isFree === true ? null : true 
            })}
            color="#10B981"
          />
          <FilterChip
            title="Payant"
            isSelected={filters.isFree === false}
            onPress={() => setFilters({ 
              ...filters, 
              isFree: filters.isFree === false ? null : false 
            })}
            color="#F59E0B"
          />
        </View>
      </View>

      {/* Events List */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#20B2AA" />
            <Text className="text-dark-300 text-base mt-3">Chargement des événements...</Text>
          </View>
        ) : events.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="calendar-outline" size={64} color="#475569" />
            <Text className="text-white text-xl font-bold mt-4 mb-2">Aucun événement trouvé</Text>
            <Text className="text-dark-300 text-center text-base mb-6 leading-6">
              Essayez de modifier vos filtres ou créez votre propre événement
            </Text>
            <TouchableOpacity
              className="bg-primary-500 px-6 py-3 rounded-full flex-row items-center"
              onPress={() => navigation.navigate('CreateEvent')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text className="text-white text-base font-semibold ml-2">Créer un événement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-dark-300 text-base mb-4 font-medium">
              {events.length} événement{events.length > 1 ? 's' : ''} trouvé{events.length > 1 ? 's' : ''}
            </Text>
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverScreenTailwind;
