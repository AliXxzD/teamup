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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';
import EventManagementMenu from '../components/EventManagementMenu';
import { API_BASE_URL } from '../config/api';

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
    
    // Charger les événements au montage du composant
    loadEvents();
  }, []);

  // Recharger les événements quand l'utilisateur revient sur l'écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEvents();
    });

    return unsubscribe;
  }, [navigation]);

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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
      location: event.location?.address || event.location || 'Adresse non disponible',
      participants: event.participants?.length || 0,
      maxParticipants: event.maxParticipants,
      sport: event.sport,
      status: event.status || 'confirmed',
      isCreator: event.organizer?.toString() === user?.id || event.organizer === user?.id,
      sportIcon: sportIcons[event.sport] || 'football',
      sportColor: sportColors[event.sport] || '#22c55e',
      isFree: event.price?.isFree || event.price?.amount === 0,
      price: event.price?.amount > 0 ? `${event.price.amount}€` : 'Gratuit',
      image: event.images?.[0]?.url || `https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=200&fit=crop`
    };
  };

  const renderEventCard = (event, isOrganizer = false) => (
    <TouchableOpacity 
      key={event.id} 
      className="bg-dark-800/90 border border-dark-600/30 rounded-2xl overflow-hidden shadow-lg mb-4"
      activeOpacity={0.8}
      onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
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
            <Text className="text-dark-300 text-sm ml-2">{event.location}</Text>
          </View>
        </View>
        
        {/* Action Button */}
        <TouchableOpacity 
          className={`rounded-lg py-2 px-4 self-end ${
            isOrganizer ? 'bg-blue-500' : 'bg-lime'
          }`}
          onPress={() => {
            if (isOrganizer) {
              setSelectedEvent(event);
              setManagementMenuVisible(true);
            } else {
              // Logique pour rejoindre l'événement
              console.log('Rejoindre événement:', event.id);
            }
          }}
        >
          <View className="flex-row items-center">
            <Text className="text-white font-semibold text-sm mr-1">
              {isOrganizer ? 'Gérer' : 'Rejoindre'}
            </Text>
            <Ionicons 
              name={isOrganizer ? "settings" : "chevron-forward"} 
              size={16} 
              color="#ffffff" 
            />
          </View>
        </TouchableOpacity>
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
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gradient-to-br from-lime to-green-500 rounded-2xl items-center justify-center mr-3">
              <Ionicons name="people" size={24} color="#ffffff" />
            </View>
            <Text className="text-white text-2xl font-bold">TEAMUP</Text>
          </View>
          
          {/* Search and Menu Icons */}
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity className="w-12 h-12 bg-dark-800 rounded-2xl items-center justify-center">
              <Ionicons name="search" size={20} color="#ffffff" />
            </TouchableOpacity>
            <GlobalMenu navigation={navigation} />
          </View>
        </Animated.View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Profile and Stats Section */}
        <View className="px-6 mb-6">
        <Animated.View 
            className="bg-gradient-to-br from-dark-800/95 to-dark-700/95 border border-dark-600/30 rounded-3xl p-6 shadow-2xl"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
            <View className="flex-row items-center">
              {/* Profile Picture */}
              <View className="relative">
                <View className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center border-2 border-white/20">
                  <Text className="text-white text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </Text>
            </View>
                <View className="absolute -bottom-1 -right-1 bg-lime w-7 h-7 rounded-full items-center justify-center border-2 border-dark-800">
                  <Text className="text-dark-900 text-xs font-bold">12</Text>
            </View>
          </View>

              {/* User Info */}
              <View className="flex-1 ml-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-white text-xl font-bold mr-2">Salut {user?.name?.split(' ')[0] || 'Alex'} !</Text>
                  <Text className="text-2xl">👋</Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="star" size={20} color="#F59E0B" />
                  <Text className="text-white text-lg font-semibold ml-2">2450 pts</Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-lime text-sm font-medium underline">Voir profil</Text>
                </TouchableOpacity>
            </View>
              
              {/* Sports Count */}
              <View className="items-end">
                <Text className="text-white text-2xl font-bold">3</Text>
                <Text className="text-dark-300 text-sm">sports</Text>
            </View>
            </View>
          </Animated.View>
          </View>

                                {/* Navigation Tabs */}
        <View className="mb-6">
          <View className="flex-row bg-dark-900 rounded-2xl p-1.5 mx-6">
            <TouchableOpacity 
              className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-full ${
                activeTab === 'discover' ? 'bg-lime/20' : 'bg-transparent'
              }`}
              onPress={() => setActiveTab('discover')}
            >
              <Ionicons 
                name="search" 
                size={16} 
                color={activeTab === 'discover' ? '#84cc16' : '#94a3b8'} 
              />
              <Text className={`ml-2 font-normal text-sm ${
                activeTab === 'discover' ? 'text-lime' : 'text-slate-400'
              }`}>Découvrir</Text>
            </TouchableOpacity>
            
              <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-full ${
                activeTab === 'myEvents' ? 'bg-lime/20' : 'bg-transparent'
              }`}
              onPress={() => setActiveTab('myEvents')}
            >
              <Ionicons 
                name="calendar" 
                size={16} 
                color={activeTab === 'myEvents' ? '#84cc16' : '#94a3b8'} 
              />
              <Text className={`ml-2 font-normal text-sm ${
                activeTab === 'myEvents' ? 'text-lime' : 'text-slate-400'
              }`}>Mes Événements</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-full ${
                activeTab === 'success' ? 'bg-lime/20' : 'bg-transparent'
              }`}
              onPress={() => setActiveTab('success')}
            >
              <Ionicons 
                name="trophy" 
                size={16} 
                color={activeTab === 'success' ? '#84cc16' : '#94a3b8'} 
              />
              <Text className={`ml-2 font-normal text-sm ${
                activeTab === 'success' ? 'text-lime' : 'text-slate-400'
              }`}>Succès</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'discover' && (
          <>
            {/* Search Bar */}
            <View className="px-6 mb-6">
              <View className="bg-dark-800/60 border border-dark-600/30 rounded-2xl flex-row items-center px-4 py-3">
                <Ionicons name="search" size={20} color="#64748b" />
                <TextInput 
                  placeholder="Rechercher un sport, lieu..."
                  placeholderTextColor="#64748b"
                  className="flex-1 text-white text-base ml-3"
                />
                <TouchableOpacity className="w-10 h-10 bg-dark-700 rounded-xl items-center justify-center">
                  <Ionicons name="filter" size={18} color="#84cc16" />
                </TouchableOpacity>
              </View>
          </View>
          
            {/* Create Event Button */}
            <View className="px-6 mb-8">
              <TouchableOpacity 
                className="bg-lime rounded-lg p-4 shadow-lg w-full"
                onPress={() => navigation.navigate('CreateEvent')}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-semibold text-center">Créer un événement</Text>
              </TouchableOpacity>
            </View>

            {/* Events Near You Section */}
            <View className="px-6 mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">Événements près de vous</Text>
                <TouchableOpacity>
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
                ) : nearbyEvents.length > 0 ? (
                  nearbyEvents.map((event) => renderEventCard(formatEventData(event), false))
                ) : (
                  <View className="items-center py-8">
                    <Ionicons name="calendar-outline" size={48} color="#64748b" />
                    <Text className="text-dark-300 text-base mt-4 text-center">
                      Aucun événement à proximité pour le moment
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
              <Text className="text-white text-2xl font-bold mb-2">Vos événements</Text>
              <Text className="text-dark-300 text-base text-center leading-6">
                Gérez vos participations et créez de nouveaux événements
              </Text>
                        </View>

            {/* My Events List */}
            <View>
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
                    Vous n'avez pas encore d'événements
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

        {activeTab === 'success' && (
          <View className="px-6 mb-8">
            {/* Success Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-dark-700/60 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="trophy" size={40} color="#F59E0B" />
                    </View>
              <Text className="text-white text-2xl font-bold mb-2">Vos succès</Text>
              <Text className="text-dark-300 text-base text-center leading-6">
                Découvrez vos accomplissements et défis sportifs
                      </Text>
                    </View>
                    
            {/* Success Content */}
            <View className="space-y-4">
              <View className="bg-dark-800/60 border border-dark-600/30 rounded-2xl p-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-lime/20 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="medal" size={24} color="#84cc16" />
                    </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">Premier événement</Text>
                    <Text className="text-dark-300 text-sm">Vous avez créé votre premier événement</Text>
                  </View>
          </View>
        </View>

              <View className="bg-dark-800/60 border border-dark-600/30 rounded-2xl p-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="people" size={24} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">Organisateur actif</Text>
                    <Text className="text-dark-300 text-sm">Vous avez organisé 5 événements</Text>
                  </View>
                </View>
              </View>
            </View>
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

export default DashboardScreen;
