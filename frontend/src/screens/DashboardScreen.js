import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  TextInput,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';
import EventManagementMenu from '../components/EventManagementMenu';
import SimplifiedUserCard from '../components/SimplifiedUserCard';
import { AchievementsList } from '../components/AchievementCard';
import pointsService from '../services/pointsService';
import { API_BASE_URL, getAuthHeaders } from '../config/api';
import TeamupLogo from '../components/TeamupLogo';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [activeTab, setActiveTab] = useState('discover');
  const [userEvents, setUserEvents] = useState([]);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [managementMenuVisible, setManagementMenuVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userProgression, setUserProgression] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loadingJoinedEvents, setLoadingJoinedEvents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

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
    
    // Charger les événements et statistiques au montage du composant
    loadEvents();
    loadUserProgression();
  }, []);

  // Recharger les données quand l'utilisateur revient sur l'écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEvents();
      loadUserProgression();
      // Recharger aussi les événements rejoints si l'utilisateur est connecté
      if (user && user._id) {
        loadJoinedEvents();
      }
    });

    return unsubscribe;
  }, [navigation, user]);

  // Charger les événements rejoints quand l'utilisateur est disponible
  useEffect(() => {
    if (user && user._id) {
      console.log('🔄 Chargement des événements rejoints pour l\'utilisateur:', user._id);
      console.log('🔄 Détails utilisateur:', { name: user.name, email: user.email, _id: user._id });
      loadJoinedEvents();
    } else if (!user) {
      console.log('⚠️ Utilisateur non connecté, pas de chargement des événements rejoints');
      setJoinedEvents([]);
    } else {
      console.log('⚠️ Utilisateur partiellement chargé:', user);
    }
  }, [user]);

  // Recharger les événements rejoints quand l'onglet activity est sélectionné
  useEffect(() => {
    if (activeTab === 'activity' && user && user._id) {
      console.log('🔄 Rechargement des événements rejoints pour l\'onglet activity');
      loadJoinedEvents();
    }
  }, [activeTab]);

  // Filtrer les événements basé sur la recherche
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(nearbyEvents);
    } else {
      const filtered = nearbyEvents.filter(event => {
        const query = searchQuery.toLowerCase();
        return (
          event.title?.toLowerCase().includes(query) ||
          event.sport?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
        );
      });
      setFilteredEvents(filtered);
    }
  }, [searchQuery, nearbyEvents]);

  const loadUserProgression = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 Chargement des statistiques utilisateur...');
      
      const result = await pointsService.calculateUserProgression();
      
      if (result.success) {
        setUserProgression(result.data);
        console.log('✅ Statistiques chargées:', result.data);
      } else {
        // Ne pas afficher d'erreur si l'utilisateur est déconnecté
        if (!result.isLoggedOut) {
          console.error('❌ Erreur chargement statistiques:', result.error);
          Alert.alert('Erreur', 'Impossible de charger vos statistiques');
        } else {
          console.log('ℹ️ Utilisateur déconnecté, pas de chargement de stats');
        }
      }
    } catch (error) {
      console.error('❌ Erreur loadUserProgression:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadJoinedEvents = async () => {
    try {
      setLoadingJoinedEvents(true);
      console.log('📅 Chargement des événements rejoints...');
      
      // Vérifier que l'utilisateur est bien connecté
      if (!user || !user._id) {
        console.log('⚠️ Utilisateur non connecté, impossible de charger les événements rejoints');
        setJoinedEvents([]);
        setLoadingJoinedEvents(false);
        return;
      }
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('⚠️ Pas de token, impossible de charger les événements rejoints');
        setJoinedEvents([]);
        setLoadingJoinedEvents(false);
        return;
      }

      console.log('🔍 Token trouvé, appel API...');
      const response = await fetch(`${API_BASE_URL}/api/events/my/joined`, {
        headers: getAuthHeaders(token)
      });

      console.log('📊 Réponse API:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Événements rejoints chargés:', data.data?.length || 0);
        console.log('🔍 Debug - Premier événement rejoint:', data.data?.[0]);
        console.log('🔍 Tous les événements rejoints:', data.data?.map(e => `${e.title}: ${e.status}`));
        console.log('🔍 Réponse complète de l\'API:', JSON.stringify(data, null, 2));
        
        // Le backend filtre déjà les événements, pas besoin de filtrer côté frontend
        setJoinedEvents(data.data || []);
        console.log('🔍 État joinedEvents mis à jour:', data.data || []);
      } else if (response.status === 401) {
        console.log('🔐 Token expiré, déconnexion nécessaire');
        setJoinedEvents([]);
      } else {
        console.error('❌ Erreur chargement événements rejoints:', response.status);
        setJoinedEvents([]);
      }
    } catch (error) {
      console.error('❌ Erreur loadJoinedEvents:', error);
      setJoinedEvents([]);
    } finally {
      setLoadingJoinedEvents(false);
    }
  };

  const loadEvents = async () => {
    // Récupérer le token depuis AsyncStorage
    const token = await AsyncStorage.getItem('accessToken');
    
    console.log('🔍 Debug utilisateur:', {
      user: user,
      hasToken: !!token,
      tokenLength: token?.length,
      userId: user?.id
    });
    
    if (!token) {
      console.log('❌ Pas de token utilisateur');
      return;
    }
    
    console.log('🔄 Chargement des événements...');
    setLoading(true);
    try {
      // Charger les événements organisés par l'utilisateur
      console.log('📡 Appel API:', `${API_BASE_URL}/api/events/my/organized`);
      const userEventsResponse = await fetch(`${API_BASE_URL}/api/events/my/organized`, {
        headers: getAuthHeaders(token),
      });
      
      console.log('📊 Status réponse événements utilisateur:', userEventsResponse.status);
      
      if (userEventsResponse.ok) {
        const userEventsData = await userEventsResponse.json();
        console.log('✅ Événements utilisateur reçus:', userEventsData);
        console.log('📝 Nombre d\'événements:', userEventsData.data?.length || 0);
        setUserEvents(userEventsData.data || []);
      } else {
        const errorText = await userEventsResponse.text();
        console.error('❌ Erreur réponse événements utilisateur:', userEventsResponse.status, errorText);
      }

      // Charger les événements à proximité (tous les événements actifs)
      console.log('📡 Appel API:', `${API_BASE_URL}/api/events`);
      const nearbyEventsResponse = await fetch(`${API_BASE_URL}/api/events`, {
        headers: getAuthHeaders(token),
      });
      
      console.log('📊 Status réponse événements à proximité:', nearbyEventsResponse.status);
      
      if (nearbyEventsResponse.ok) {
        const nearbyEventsData = await nearbyEventsResponse.json();
        console.log('✅ Événements à proximité reçus:', nearbyEventsData);
        console.log('📝 Nombre d\'événements à proximité:', nearbyEventsData.data?.events?.length || 0);
        setNearbyEvents(nearbyEventsData.data?.events || []);
      } else {
        const errorText = await nearbyEventsResponse.text();
        console.error('❌ Erreur réponse événements à proximité:', nearbyEventsResponse.status, errorText);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des événements:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater les données d'événement
  const formatEventData = (event) => {
    console.log('📝 Formatage événement:', event);
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateText = '';
    if (eventDate.toDateString() === today.toDateString()) {
      dateText = 'Aujourd\'hui';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      dateText = 'Demain';
    } else {
      dateText = eventDate.toLocaleDateString('fr-FR', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }

    const timeText = eventDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Déterminer l'icône du sport
    const sportIcons = {
      'football': 'football',
      'basketball': 'basketball',
      'tennis': 'tennisball',
      'running': 'walk',
      'yoga': 'leaf',
      'swimming': 'water',
      'cycling': 'bicycle',
      'volleyball': 'basketball-outline'
    };

    // Déterminer la couleur du sport
    const sportColors = {
      'football': '#22c55e',
      'basketball': '#F59E0B',
      'tennis': '#EF4444',
      'running': '#3B82F6',
      'yoga': '#8B5CF6',
      'swimming': '#06B6D4',
      'cycling': '#84cc16',
      'volleyball': '#F97316'
    };

    return {
      id: event._id,
      title: event.title,
      subtitle: event.description || `${event.sport} - ${event.level || 'Tous niveaux'}`,
      date: dateText,
      time: timeText,
      location: event.location?.address || event.location?.fullAddress || (typeof event.location === 'string' ? event.location : 'Adresse non disponible'),
      participants: event.participants?.length || 0,
      maxParticipants: event.maxParticipants,
      sport: event.sport,
      status: event.status || 'confirmed',
      isCreator: event.organizer?.toString() === (user?._id || user?.id) || event.organizer === (user?._id || user?.id),
      sportIcon: sportIcons[event.sport] || 'football',
      sportColor: sportColors[event.sport] || '#22c55e',
      isFree: event.price?.isFree || event.price?.amount === 0,
      price: event.price?.amount > 0 ? `${event.price.amount}€` : 'Gratuit',
      image: event.images?.[0]?.url || `https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=200&fit=crop`
    };
  };

  const renderEventCard = (event, isOrganizer = false) => (
    <TouchableOpacity 
      key={event._id || event.id} 
      className="bg-dark-800/90 border border-dark-600/30 rounded-2xl overflow-hidden shadow-lg mb-4"
      activeOpacity={0.8}
      onPress={() => navigation.navigate('EventDetails', { eventId: event._id || event.id })}
    >
      {/* Event Image Background */}
      <View className="h-24 relative">
        <Image 
          source={{ uri: event.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Dark overlay for better text readability */}
        <View className="absolute inset-0 bg-black/20" />
        
        {/* Free Badge */}
        {event.isFree && (
          <View className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-bold">Gratuit</Text>
          </View>
        )}
        {!event.isFree && (
          <View className="absolute top-2 left-2 bg-orange-500 px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-bold">{event.price}</Text>
          </View>
        )}
        
        {/* Sport Icon Overlay */}
        <View className="absolute bottom-2 right-2 w-8 h-8 bg-white/20 rounded-lg items-center justify-center">
          <Ionicons name={event.sportIcon} size={16} color={event.sportColor} />
        </View>
      </View>

      <View className="p-4">
        {/* Event Title */}
        <Text className="text-white font-bold text-base mb-2">{event.title}</Text>
        
        {/* Event Details */}
        <View className="space-y-2 mb-3">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#84cc16" />
            <Text className="text-white text-sm ml-2">{event.date} {event.time}</Text>
            <View className="flex-row items-center ml-4">
              <Ionicons name="people-outline" size={14} color="#84cc16" />
              <Text className="text-white text-sm ml-1">{event.participants}/{event.maxParticipants}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#84cc16" />
            <Text className="text-dark-300 text-sm ml-2">{typeof event.location === 'string' ? event.location : (event.location?.address || event.location?.fullAddress || 'Adresse non disponible')}</Text>
          </View>
        </View>
        
        {/* Action Button */}
        {isOrganizer ? (
          <TouchableOpacity 
            className="bg-blue-500 rounded-lg py-2 px-4 self-end"
            onPress={() => {
              setSelectedEvent(event);
              setManagementMenuVisible(true);
            }}
          >
            <View className="flex-row items-center">
              <Text className="text-white font-semibold text-sm mr-1">Modifier</Text>
              <Ionicons name="create-outline" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="bg-lime rounded-lg py-2 px-4 self-end"
            onPress={() => {
              // Logique pour rejoindre l'événement
              console.log('Rejoindre événement:', event._id || event.id);
            }}
          >
            <View className="flex-row items-center">
              <Text className="text-white font-semibold text-sm mr-1">Rejoindre</Text>
              <Ionicons name="chevron-forward" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-dark-900 px-6 pt-6 pb-4">
        <Animated.View 
          className="flex-row justify-between items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Logo and App Name */}
          <TeamupLogo size="medium" textColor="#ffffff" />
          
          {/* Search and Menu Icons */}
          <View className="flex-row items-center">
            <GlobalMenu navigation={navigation} currentRoute="Dashboard" />
          </View>
        </Animated.View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Profile and Stats Section */}
        <View className="px-6 mb-6">
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <SimplifiedUserCard
              user={user}
              userProgression={userProgression}
              onProfilePress={() => navigation.navigate('Profile')}
            />
          </Animated.View>
        </View>

        {/* Navigation Tabs */}
        <View className="mb-6">
          <View className="flex-row bg-dark-800/60 border border-dark-600/30 rounded-2xl p-2 mx-6">
            <TouchableOpacity 
              className={`flex-1 flex-row items-center justify-center py-4 px-3 rounded-xl ${
                activeTab === 'discover' ? 'bg-lime/20' : 'bg-transparent'
              }`}
              onPress={() => setActiveTab('discover')}
            >
              <Ionicons 
                name="search" 
                size={20} 
                color={activeTab === 'discover' ? '#84cc16' : '#94a3b8'} 
              />
              <Text className={`ml-2 font-semibold text-base ${
                activeTab === 'discover' ? 'text-lime' : 'text-slate-400'
              }`}>Découvrir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-4 px-3 rounded-xl ${
                activeTab === 'myEvents' ? 'bg-lime/20' : 'bg-transparent'
              }`}
              onPress={() => setActiveTab('myEvents')}
            >
              <Ionicons 
                name="calendar" 
                size={20} 
                color={activeTab === 'myEvents' ? '#84cc16' : '#94a3b8'} 
              />
              <Text className={`ml-2 font-semibold text-base ${
                activeTab === 'myEvents' ? 'text-lime' : 'text-slate-400'
              }`}>Mes événements</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`flex-1 flex-row items-center justify-center py-4 px-3 rounded-xl ${
                activeTab === 'activity' ? 'bg-lime/20' : 'bg-transparent'
              }`}
              onPress={() => setActiveTab('activity')}
            >
              <Ionicons 
                name="people" 
                size={20} 
                color={activeTab === 'activity' ? '#84cc16' : '#94a3b8'} 
              />
              <Text className={`ml-2 font-semibold text-base ${
                activeTab === 'activity' ? 'text-lime' : 'text-slate-400'
              }`}>Événements rejoints</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'discover' && (
          <>
            {/* Search Bar */}
            <View className="px-6 mb-6">
              <View className="bg-slate-800/60 border border-slate-600/30 rounded-2xl flex-row items-center px-4 py-3">
                <Ionicons name="search" size={20} color="#64748b" />
                <TextInput 
                  placeholder="Rechercher un sport, lieu..."
                  placeholderTextColor="#64748b"
                  className="flex-1 text-white text-base ml-3"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    className="w-8 h-8 bg-slate-700 rounded-full items-center justify-center mr-2"
                    onPress={() => setSearchQuery('')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={16} color="#64748b" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center">
                  <Ionicons name="filter" size={18} color="#84cc16" />
                </TouchableOpacity>
              </View>
            </View>
          
            {/* Create Event Button */}
            <View className="px-6 mb-8">
              <TouchableOpacity 
                className="bg-lime rounded-xl py-4 px-6 shadow-lg w-full"
                onPress={() => navigation.navigate('CreateEvent')}
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg font-bold text-center">Créer un événement</Text>
              </TouchableOpacity>
            </View>

            {/* Events Near You Section */}
            <View className="px-6 mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">Événements près de vous</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Discover')}
                  activeOpacity={0.8}
                >
                  <Text className="text-lime text-sm font-medium underline">Voir tout</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center mb-6">
                <Ionicons name="chatbubble" size={20} color="#84cc16" />
              </View>
              
              <View>
                {loading ? (
                  <View className="items-center py-8">
                    <Text className="text-white text-base">Chargement des événements...</Text>
                  </View>
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => renderEventCard(formatEventData(event), false))
                ) : searchQuery.trim() !== '' ? (
                  <View className="items-center py-8">
                    <Ionicons name="search-outline" size={48} color="#64748b" />
                    <Text className="text-white text-lg font-medium mt-3 mb-2">Aucun résultat trouvé</Text>
                    <Text className="text-slate-400 text-center text-base leading-6">
                      Aucun événement ne correspond à votre recherche "{searchQuery}".
                    </Text>
                    <TouchableOpacity 
                      className="mt-4 bg-slate-700 rounded-xl px-4 py-2"
                      onPress={() => setSearchQuery('')}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-sm font-medium">Effacer la recherche</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <Ionicons name="calendar-outline" size={48} color="#64748b" />
                    <Text className="text-white text-lg font-medium mt-3 mb-2">Aucun événement trouvé</Text>
                    <Text className="text-slate-400 text-center text-base leading-6">
                      Il n'y a pas d'événements près de vous pour le moment.
                    </Text>
                  </View>
                )}
              </View>
                  </View>
          </>
        )}

        {activeTab === 'myEvents' && (
          <View className="px-6 mb-8">
            {/* My Events Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-dark-700/60 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="calendar" size={40} color="#84cc16" />
              </View>
              <Text className="text-white text-2xl font-bold mb-2">Mes événements</Text>
              <Text className="text-dark-300 text-base text-center leading-6">
                Gérez vos événements organisés
              </Text>
            </View>

            {/* Events Organized Section */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="create-outline" size={20} color="#84cc16" />
                <Text className="text-white text-lg font-bold ml-2">Événements organisés</Text>
              </View>
              
              {loading ? (
                <View className="items-center py-8">
                  <Text className="text-white text-base">Chargement de vos événements...</Text>
                </View>
              ) : userEvents.length > 0 ? (
                userEvents.map((event) => renderEventCard(formatEventData(event), true))
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="calendar-outline" size={48} color="#64748b" />
                  <Text className="text-dark-300 text-base mt-4 text-center">
                    Vous n'avez pas encore organisé d'événements
                  </Text>
                  <TouchableOpacity 
                    className="bg-lime/20 border border-lime/30 px-6 py-3 rounded-2xl mt-4"
                    onPress={() => navigation.navigate('CreateEvent')}
                  >
                    <Text className="text-lime text-sm font-bold">Créer votre premier événement</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

          </View>
        )}

        {activeTab === 'activity' && (
          <View className="flex-1 px-6">
            {/* Header */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <View className="w-12 h-12 bg-lime/20 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="people" size={24} color="#84cc16" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold">Événements rejoints</Text>
                  <Text className="text-slate-400 text-sm">
                    {Array.isArray(joinedEvents) ? joinedEvents.length : 0} événement{(Array.isArray(joinedEvents) ? joinedEvents.length : 0) > 1 ? 's' : ''} rejoint{(Array.isArray(joinedEvents) ? joinedEvents.length : 0) > 1 ? 's' : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center"
                  onPress={() => {
                    if (user && user._id) {
                      loadJoinedEvents();
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={20} color="#84cc16" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Liste des événements rejoints */}
            {(() => {
              console.log('🔍 DEBUG AFFICHAGE - loadingJoinedEvents:', loadingJoinedEvents);
              console.log('🔍 DEBUG AFFICHAGE - joinedEvents:', joinedEvents);
              console.log('🔍 DEBUG AFFICHAGE - joinedEvents.length:', joinedEvents?.length);
              console.log('🔍 DEBUG AFFICHAGE - Array.isArray(joinedEvents):', Array.isArray(joinedEvents));
              console.log('🔍 DEBUG AFFICHAGE - user:', user);
              return null;
            })()}
            {loadingJoinedEvents ? (
              <View className="flex-1 items-center justify-center py-20">
                <View className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mb-4" />
                <Text className="text-slate-400 text-base">Chargement des événements...</Text>
              </View>
            ) : !Array.isArray(joinedEvents) || joinedEvents.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <View className="w-20 h-20 bg-slate-800 rounded-full items-center justify-center mb-6">
                  <Ionicons name="calendar-outline" size={40} color="#64748b" />
                </View>
                <Text className="text-white text-xl font-bold mb-2">Aucun événement rejoint</Text>
                <Text className="text-slate-400 text-center text-base mb-8 leading-6">
                  Vous n'avez pas encore rejoint d'événements.{'\n'}
                  Découvrez des événements près de chez vous !
                </Text>
                <TouchableOpacity 
                  className="bg-lime rounded-xl py-4 px-8"
                  onPress={() => setActiveTab('discover')}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-lg font-bold">Découvrir des événements</Text>
                </TouchableOpacity>
                
                {/* Bouton de debug temporaire */}
                <TouchableOpacity 
                  className="bg-slate-700 rounded-xl py-2 px-4 mt-4"
                  onPress={() => {
                    console.log('🔍 DEBUG - État actuel:');
                    console.log('  loadingJoinedEvents:', loadingJoinedEvents);
                    console.log('  joinedEvents:', joinedEvents);
                    console.log('  joinedEvents.length:', joinedEvents?.length);
                    console.log('  Array.isArray(joinedEvents):', Array.isArray(joinedEvents));
                    console.log('  user:', user);
                    
                    // Forcer le rechargement
                    if (user && user._id) {
                      console.log('🔄 Forçage du rechargement...');
                      loadJoinedEvents();
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-sm">Debug & Recharger</Text>
                </TouchableOpacity>
              </View>
            ) : Array.isArray(joinedEvents) && joinedEvents.length > 0 ? (
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="space-y-4">
                  {joinedEvents.map((event, index) => {
                    return (
                    <TouchableOpacity
                      key={event._id || index}
                      className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6"
                      onPress={() => {
                        if (event._id && navigation) {
                          navigation.navigate('EventDetails', { eventId: event._id });
                        } else {
                          console.error('❌ Erreur navigation: event._id ou navigation manquant', {
                            eventId: event._id,
                            hasNavigation: !!navigation
                          });
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      {/* Header de l'événement */}
                      <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                          <Text className="text-white text-lg font-bold mb-1" numberOfLines={2}>
                            {event.title}
                          </Text>
                          <Text className="text-slate-400 text-sm" numberOfLines={1}>
                            {event.sport} • {event.location?.address || 'Lieu non spécifié'}
                          </Text>
                        </View>
                        <View className="ml-4">
                          <View className={`px-3 py-1 rounded-full ${
                            event.status === 'active' ? 'bg-green-500/20' : 'bg-slate-500/20'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              event.status === 'active' ? 'text-green-400' : 'text-slate-400'
                            }`}>
                              {event.status === 'active' ? 'Actif' : event.status}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Détails de l'événement */}
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                          <Ionicons name="calendar" size={16} color="#64748b" />
                          <Text className="text-slate-400 text-sm ml-2">
                            {new Date(event.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="time" size={16} color="#64748b" />
                          <Text className="text-slate-400 text-sm ml-2">{event.time}</Text>
                        </View>
                      </View>

                      {/* Participants */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="people" size={16} color="#64748b" />
                          <Text className="text-slate-400 text-sm ml-2">
                            {event.currentParticipants || 0}/{event.maxParticipants} participants
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="chevron-forward" size={16} color="#64748b" />
                        </View>
                      </View>
                    </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              // Fallback pour les cas inattendus
              <View className="flex-1 items-center justify-center py-20">
                <View className="w-20 h-20 bg-slate-800 rounded-full items-center justify-center mb-6">
                  <Ionicons name="alert-circle-outline" size={40} color="#64748b" />
                </View>
                <Text className="text-white text-xl font-bold mb-2">Erreur de chargement</Text>
                <Text className="text-slate-400 text-center text-base mb-8 leading-6">
                  Impossible de charger les événements rejoints.{'\n'}
                  Veuillez réessayer plus tard.
                </Text>
                <TouchableOpacity 
                  className="bg-slate-700 rounded-xl py-4 px-8"
                  onPress={() => loadJoinedEvents()}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-lg font-bold">Réessayer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Bottom spacing for bottom navigation */}
        <View className="h-24" />
      </ScrollView>

      {/* Event Management Menu */}
      <EventManagementMenu
        visible={managementMenuVisible}
        onClose={() => setManagementMenuVisible(false)}
        onModifyEvent={() => {
          navigation.navigate('CreateEvent', { 
            eventId: selectedEvent?.id, 
            eventData: selectedEvent, 
            isEditing: true 
          });
        }}
        onManageParticipants={() => {
          navigation.navigate('EventParticipants', { 
            eventId: selectedEvent?.id, 
            eventData: selectedEvent 
          });
        }}
      />
    </SafeAreaView>
  );
};

// Styles pour la section activité
const activityStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryStats: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: '#cbd5e1',
    fontSize: 15,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  achievementTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '500',
  },
  ctaCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ctaTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ctaDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButton: {
    backgroundColor: '#84cc16',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});

export default DashboardScreen;
