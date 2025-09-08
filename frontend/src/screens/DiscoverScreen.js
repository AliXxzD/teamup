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
  Animated,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import GlobalMenu from '../components/GlobalMenu';
import EventMap from '../components/EventMap';
import { navigateToEventDetails } from '../utils/navigationUtils';
import eventsService from '../services/eventsService';
import locationService from '../services/locationService';

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
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'
  const [useLocation, setUseLocation] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(10000); // 10km par défaut

  useEffect(() => {
    initializeLocation();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [filters, useLocation, radius]);

  const sports = ['Football', 'Basketball', 'Tennis', 'Running', 'Yoga', 'Natation'];
  const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];
  const radiusOptions = [
    { label: '1 km', value: 1000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
    { label: '25 km', value: 25000 },
    { label: '50 km', value: 50000 },
  ];

  const initializeLocation = async () => {
    try {
      const location = await locationService.getLocationSafe();
      setUserLocation(location);
    } catch (error) {
      console.warn('Impossible d\'obtenir la localisation:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      console.log('🔄 Chargement des événements...');
      setLoading(true);

      let result;

      if (useLocation && userLocation) {
        // Recherche par proximité
        console.log(`🗺️ Recherche par proximité (${radius / 1000}km)`);
        result = await eventsService.searchNearbyEvents({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: radius,
          sport: filters.sport || null,
          level: filters.level || null,
          isFree: filters.isFree,
          limit: 50
        });
      } else {
        // Recherche normale
        console.log('📋 Recherche normale');
        result = await eventsService.searchEvents({
          sport: filters.sport || null,
          level: filters.level || null,
          isFree: filters.isFree,
          limit: 50
        });
      }

      if (result.success) {
        console.log(`✅ ${result.events.length} événements chargés`);
        setEvents(result.events);
      } else {
        console.error('❌ Erreur:', result.error);
        Alert.alert('Erreur', result.error || 'Impossible de charger les événements');
        setEvents([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des événements:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les événements. Vérifiez votre connexion.',
        [{ text: 'OK' }]
      );
      setEvents([]);
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

  const FilterChip = ({ title, isSelected, onPress, color = '#84cc16' }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-lg mr-3 mb-2 flex-row items-center ${
        isSelected 
          ? 'bg-lime' 
          : 'bg-dark-700 border border-dark-600'
      }`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text className={`text-sm font-semibold ${
        isSelected ? 'text-dark-900' : 'text-dark-300'
      }`}>
        {title}
      </Text>
      {isSelected && (
        <Ionicons name="close" size={16} color="#0f172a" className="ml-2" />
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
        <View className="absolute inset-0 bg-black/30" />
        
        {/* Badges */}
        <View className="absolute top-3 right-3 flex-col items-end">
          {event.price.isFree && (
            <View className="bg-lime px-3 py-1 rounded-lg mb-2">
              <Text className="text-dark-900 text-xs font-bold">GRATUIT</Text>
            </View>
          )}
          <View className="bg-black/70 px-3 py-1 rounded-lg">
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
              {event.location?.address || event.location?.fullAddress || (typeof event.location === 'string' ? event.location : 'Adresse non disponible')}
            </Text>
            {event.distanceKm !== undefined && (
              <Text className="text-primary text-sm font-medium ml-2">
                📍 {event.distanceKm}km
              </Text>
            )}
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
            <View className="w-8 h-8 bg-lime rounded-full items-center justify-center mr-3">
              <Text className="text-dark-900 text-sm font-bold">
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
              color={event.currentParticipants >= event.maxParticipants ? "#ffffff" : "#0f172a"}
            />
            <Text className={`text-base font-semibold ml-2 ${
              event.currentParticipants >= event.maxParticipants ? 'text-white' : 'text-dark-900'
            }`}>
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
      
      {/* Fixed Header */}
      <View className="bg-dark-900 border-b border-dark-700">
        <View className="flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Découvrir</Text>
          <GlobalMenu navigation={navigation} currentRoute="Discover" />
        </View>
      </View>

      {/* Map View (Full Screen) */}
      {viewMode === 'map' ? (
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 items-center justify-center bg-dark-900">
              <ActivityIndicator size="large" color="#84cc16" />
              <Text className="text-dark-300 text-base mt-3">Chargement de la carte...</Text>
            </View>
          ) : (
            <EventMap
              events={events}
              onEventPress={(event) => {
                console.log('🗺️ Événement sélectionné sur la carte:', event.title);
                navigateToEventDetails(navigation, event._id);
              }}
              showUserLocation={useLocation}
              showRadius={useLocation}
              radius={radius}
              style={{ flex: 1 }}
            />
          )}
          
          {/* Floating Controls for Map */}
          <View className="absolute top-4 left-4 right-4 z-10">
            <View className="bg-dark-900/90 backdrop-blur rounded-lg p-4">
              {/* View Mode Toggle */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white font-semibold">Mode d'affichage</Text>
                <View className="flex-row bg-dark-700 rounded-lg p-1">
                  <TouchableOpacity
                    className={`px-3 py-2 rounded-md ${viewMode === 'list' ? 'bg-primary' : ''}`}
                    onPress={() => setViewMode('list')}
                  >
                    <Ionicons 
                      name="list" 
                      size={18} 
                      color={viewMode === 'list' ? '#ffffff' : '#9ca3af'} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-3 py-2 rounded-md ml-1 ${viewMode === 'map' ? 'bg-primary' : ''}`}
                    onPress={() => setViewMode('map')}
                  >
                    <Ionicons 
                      name="map" 
                      size={18} 
                      color={viewMode === 'map' ? '#ffffff' : '#9ca3af'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location Toggle */}
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-medium">Proximité ({radius / 1000}km)</Text>
                <Switch
                  value={useLocation}
                  onValueChange={setUseLocation}
                  trackColor={{ false: '#374151', true: '#3b82f6' }}
                  thumbColor={useLocation ? '#ffffff' : '#9ca3af'}
                />
              </View>
            </View>
          </View>
        </View>
      ) : (
        /* List View with Single ScrollView */
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Description Section */}
          <Animated.View 
            className="px-6 py-4"
            style={{ opacity: fadeAnim }}
          >
            <Text className="text-dark-300 text-base mb-1">Trouvez votre prochaine activité sportive</Text>
            <Text className="text-dark-400 text-sm">Découvrez des événements passionnants près de chez vous</Text>
          </Animated.View>

          {/* View Mode & Location Controls */}
          <View className="px-6 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-semibold">Options d'affichage</Text>
              
              {/* View Mode Toggle */}
              <View className="flex-row bg-dark-700 rounded-lg p-1">
                <TouchableOpacity
                  className={`px-3 py-2 rounded-md ${viewMode === 'list' ? 'bg-primary' : ''}`}
                  onPress={() => setViewMode('list')}
                >
                  <Ionicons 
                    name="list" 
                    size={18} 
                    color={viewMode === 'list' ? '#ffffff' : '#9ca3af'} 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-3 py-2 rounded-md ml-1 ${viewMode === 'map' ? 'bg-primary' : ''}`}
                  onPress={() => setViewMode('map')}
                >
                  <Ionicons 
                    name="map" 
                    size={18} 
                    color={viewMode === 'map' ? '#ffffff' : '#9ca3af'} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Location Controls */}
            <View className="bg-dark-800 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white font-semibold">Recherche par proximité</Text>
                <Switch
                  value={useLocation}
                  onValueChange={setUseLocation}
                  trackColor={{ false: '#374151', true: '#3b82f6' }}
                  thumbColor={useLocation ? '#ffffff' : '#9ca3af'}
                />
              </View>
              
              {useLocation && userLocation && (
                <View>
                  <Text className="text-dark-300 text-sm mb-2">
                    📍 Position: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </Text>
                  
                  <Text className="text-dark-300 text-sm mb-2">Rayon de recherche:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row">
                      {radiusOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          className={`px-3 py-2 rounded-lg mr-2 ${
                            radius === option.value ? 'bg-primary' : 'bg-dark-700'
                          }`}
                          onPress={() => setRadius(option.value)}
                        >
                          <Text className={`text-sm font-medium ${
                            radius === option.value ? 'text-white' : 'text-dark-300'
                          }`}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              
              {useLocation && !userLocation && (
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#ef4444" />
                  <Text className="text-red-400 text-sm ml-2">
                    Localisation non disponible
                  </Text>
                  <TouchableOpacity
                    className="ml-auto"
                    onPress={initializeLocation}
                  >
                    <Text className="text-primary text-sm font-medium">Réessayer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Filters */}
          <View className="px-6 mb-4">
            <Text className="text-white text-lg font-semibold mb-3">Filtres</Text>
            
            {/* Sport Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row">
                <FilterChip
                  title="Tous"
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

            {/* Price Filters */}
            <View className="flex-row">
              <FilterChip
                title="Gratuit"
                isSelected={filters.isFree === true}
                onPress={() => setFilters({ 
                  ...filters, 
                  isFree: filters.isFree === true ? null : true 
                })}
                color="#84cc16"
              />
              <FilterChip
                title="Payant"
                isSelected={filters.isFree === false}
                onPress={() => setFilters({ 
                  ...filters, 
                  isFree: filters.isFree === false ? null : false 
                })}
                color="#84cc16"
              />
            </View>
          </View>

          {/* Events List Content */}
          <View className="px-6">
            {loading ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color="#84cc16" />
                <Text className="text-dark-300 text-base mt-3">Chargement des événements...</Text>
              </View>
            ) : events.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Ionicons name="calendar-outline" size={64} color="#475569" />
                <Text className="text-white text-xl font-bold mt-4 mb-2">Aucun événement trouvé</Text>
                <Text className="text-dark-300 text-center text-base mb-6 leading-6">
                  {useLocation && !userLocation 
                    ? 'Activez la localisation ou modifiez vos filtres'
                    : 'Essayez de modifier vos filtres ou créez votre propre événement'
                  }
                </Text>
                <TouchableOpacity
                  className="bg-lime px-6 py-3 rounded-lg flex-row items-center"
                  onPress={() => navigation.navigate('CreateEvent')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={20} color="#0f172a" />
                  <Text className="text-dark-900 text-base font-semibold ml-2">Créer un événement</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-dark-300 text-base font-medium">
                    {events.length} événement{events.length > 1 ? 's' : ''} trouvé{events.length > 1 ? 's' : ''}
                    {useLocation && userLocation && ` dans un rayon de ${radius / 1000}km`}
                  </Text>
                  {events.some(event => event.distanceKm !== undefined) && (
                    <Text className="text-dark-400 text-sm">📍 Triés par distance</Text>
                  )}
                </View>
                {events.map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    navigation={navigation}
                    onPress={() => navigation.navigate('EventDetails', { eventId: event._id })}
                  />
                ))}
              </View>
            )}

            {/* Bottom Spacing */}
            <View className="h-6" />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DiscoverScreenTailwind;

