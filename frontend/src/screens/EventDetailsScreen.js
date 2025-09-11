import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getId, getOrganizerId, getEventId, getUserId, safeNavigate } from '../utils/idUtils';
import organizerMessageService from '../services/organizerMessageService';
import buttonService from '../services/buttonService';
import eventService from '../services/eventService';
import { getOrganizerName, getOrganizerInitial } from '../utils/eventUtils';
import ReviewForm from '../components/ReviewForm';

const { width } = Dimensions.get('window');

const EventDetailsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { eventId } = route.params || {};


  // Fonction pour extraire les initiales d'un nom
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Fonction pour obtenir une couleur de fond basée sur le nom
  const getAvatarColor = (name) => {
    const colors = [
      '#ef4444', // rouge
      '#f97316', // orange
      '#eab308', // jaune
      '#22c55e', // vert
      '#06b6d4', // cyan
      '#3b82f6', // bleu
      '#8b5cf6', // violet
      '#ec4899', // rose
      '#6b7280', // gris
      '#84cc16', // lime
    ];
    
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  const geocodeAddress = async (address) => {
    try {
      console.log('🗺️ Géocodage de l\'adresse:', address);
      
      // Réinitialiser les coordonnées avant le géocodage
      setMapCoordinates(null);
      
      // Pour la démo, utilisons Nominatim (OpenStreetMap) qui est gratuit
      const encodedAddress = encodeURIComponent(address);
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'TeamUp-App/1.0'
        }
      });
      const data = await response.json();
      
      if (data && data.length > 0) {
        const coordinates = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
        console.log('✅ Coordonnées trouvées pour', address, ':', coordinates);
        setMapCoordinates(coordinates);
      } else {
        console.log('❌ Adresse non trouvée:', address);
        // Coordonnées par défaut pour Paris
        setMapCoordinates({
          latitude: 48.8566,
          longitude: 2.3522
        });
      }
    } catch (error) {
      console.error('❌ Erreur géocodage pour', address, ':', error);
      // Coordonnées par défaut en cas d'erreur
      setMapCoordinates({
        latitude: 48.8566,
        longitude: 2.3522
      });
    }
  };

  useEffect(() => {
    // Réinitialiser les coordonnées à chaque changement d'événement
    setMapCoordinates(null);
    setEventData(null);
    fetchEventDetails();
  }, [eventId]);

  // Fonction pour contacter l'organisateur
  const handleMessageOrganizer = async () => {
    try {
      console.log('🔍 handleMessageOrganizer appelé');
      console.log('🔍 Données disponibles:', {
        eventData: !!eventData,
        user: !!user,
        eventTitle: eventData?.title,
        organizerExists: !!eventData?.organizer,
        organizerName: eventData?.organizer?.name,
        userId: user?.id
      });
      
      if (!eventData || !user) {
        console.log('❌ Données manquantes:', { eventData: !!eventData, user: !!user });
        Alert.alert('Erreur', 'Données manquantes pour contacter l\'organisateur');
        return;
      }

      if (!eventData.organizer) {
        console.log('❌ Pas d\'organisateur dans eventData');
        console.log('🔍 eventData structure:', Object.keys(eventData));
        Alert.alert('Erreur', 'Organisateur non trouvé pour cet événement');
        return;
      }

      // Vérifier si l'utilisateur peut contacter l'organisateur
      console.log('🔍 Appel canMessageOrganizer...');
      const canMessage = await organizerMessageService.canMessageOrganizer(eventData, user.id);
      console.log('🔍 Résultat canMessage:', canMessage);
      
      if (!canMessage.canMessage) {
        Alert.alert('Information', canMessage.reason);
        return;
      }

      // Envoi direct sans popup
      const prefilledMessage = organizerMessageService.generateOrganizerMessage(
        eventData.title,
        user.name
      );

      console.log('📤 Envoi direct du message à l\'organisateur');
      startConversationAndSendMessage(prefilledMessage);

    } catch (error) {
      console.error('❌ Erreur handleMessageOrganizer:', error);
      Alert.alert('Erreur', 'Impossible de contacter l\'organisateur');
    }
  };


  // Créer la conversation et envoyer le message automatiquement
  const startConversationAndSendMessage = async (message) => {
    try {
      const result = await buttonService.createConversationWithOrganizer(
        eventId,
        (successResult) => {
          console.log('✅ Callback succès conversation:', successResult);
          // Naviguer vers le chat avec la conversation
          navigation.navigate('Chat', {
            conversation: successResult.data,
            eventContext: {
              id: eventId,
              title: eventData.title,
              organizerName: eventData.organizer.name
            },
            autoSendMessage: message
          });
        },
        (errorResult) => {
          console.log('❌ Callback erreur conversation:', errorResult);
          Alert.alert('Erreur', errorResult.error || 'Impossible de créer la conversation');
        }
      );

      if (result.success && result.conversation) {
        console.log('✅ Conversation créée avec succès:', result.conversation.id);
        
        // Rafraîchir la liste des conversations dans MessagesScreen
        // Envoyer un événement pour rafraîchir la liste
        navigation.navigate('Messages', { refresh: true });
        
        // Naviguer vers le chat avec un message à envoyer automatiquement
        navigation.navigate('Chat', {
          conversation: result.conversation,
          eventContext: {
            id: eventId,
            title: eventData.title,
            organizerName: eventData.organizer.name
          },
          autoSendMessage: message
        });
      } else {
        console.log('❌ Échec création conversation, tentative de création directe');
        
        // Essayer de créer la conversation directement via API
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (accessToken) {
            const response = await fetch(`${API_BASE_URL}/api/messages/conversations/with-organizer`, {
              method: 'POST',
              headers: getAuthHeaders(accessToken),
              body: JSON.stringify({ eventId }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.conversation) {
                console.log('✅ Conversation créée directement:', data.conversation.id);
                
                // Rafraîchir la liste des conversations
                navigation.navigate('Messages', { refresh: true });
                
                // Naviguer vers le chat
                navigation.navigate('Chat', {
                  conversation: data.conversation,
                  eventContext: {
                    id: eventId,
                    title: eventData.title,
                    organizerName: eventData.organizer.name
                  },
                  autoSendMessage: message
                });
                return;
              }
            }
          }
        } catch (error) {
          console.log('❌ Erreur création directe:', error);
        }
        
        // Si tout échoue, créer une conversation temporaire
        const tempConversation = {
          id: `temp-${Date.now()}`,
          type: 'private',
          name: `Chat avec ${eventData.organizer.name}`,
          participants: [
            { _id: user.id, name: user.name },
            { _id: eventData.organizer._id, name: eventData.organizer.name }
          ],
          isActive: true,
          isTemporary: true
        };
        
        console.log('🔧 Création conversation temporaire pour envoi direct');
        navigation.navigate('Chat', {
          conversation: tempConversation,
          eventContext: {
            id: eventId,
            title: eventData.title,
            organizerName: eventData.organizer.name
          },
          autoSendMessage: message
        });
      }

    } catch (error) {
      console.error('❌ Erreur startConversationAndSendMessage:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const fetchEventDetails = async () => {
    try {
      console.log('🔄 fetchEventDetails - DÉBUT');
      console.log('   - eventId:', eventId);
      console.log('   - Timestamp:', new Date().toISOString());
      
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      console.log('   - Token récupéré:', !!token);
      
      const url = `${API_BASE_URL}/api/events/${eventId}`;
      console.log('   - URL:', url);
      
      const response = await fetch(url, {
        headers: token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' },
      });
      
      console.log('   - Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ fetchEventDetails - DONNÉES REÇUES');
        console.log('   - data:', data);
        console.log('   - data.data:', data.data);
        console.log('   - Timestamp:', new Date().toISOString());
        
        setEventData(data.data); // Correction: utiliser data.data au lieu de data.event
        console.log('   - eventData mis à jour dans le state');
        
        // Géocoder l'adresse pour obtenir les coordonnées
        if (data.data.location?.address) {
          console.log('🏠 Adresse de l\'événement:', data.data.location.address);
          geocodeAddress(data.data.location.address);
        } else {
          console.log('⚠️ Pas d\'adresse trouvée pour cet événement');
          // Coordonnées par défaut si pas d'adresse
          setMapCoordinates({
            latitude: 48.8566,
            longitude: 2.3522
          });
        }
      } else {
        console.error('❌ fetchEventDetails - ERREUR HTTP:', response.status);
        console.log('   - Response status:', response.status);
        console.log('   - Response statusText:', response.statusText);
        Alert.alert('Erreur', 'Impossible de charger les détails de l\'événement');
      }
    } catch (error) {
      console.error('❌ fetchEventDetails - ERREUR CRITIQUE:', error);
      console.log('   - Type d\'erreur:', error.constructor.name);
      console.log('   - Message:', error.message);
      console.log('   - Stack:', error.stack);
      Alert.alert('Erreur', 'Erreur de connexion');
    } finally {
      console.log('🔄 fetchEventDetails - FIN (setLoading false)');
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    Alert.alert('Partager', 'Fonctionnalité de partage en cours de développement');
  };

  const joinEvent = async (eventId) => {
    try {
      console.log('🔄 Tentative de rejoindre l\'événement:', eventId);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert('Connexion requise', 'Vous devez être connecté pour rejoindre un événement');
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
        fetchEventDetails(); // Recharger les données
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de rejoindre l\'événement');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', 'Impossible de rejoindre l\'événement');
    }
  };

  const handleViewProfile = () => {
    const userId = getOrganizerId(eventData);
    
    if (userId) {
      // S'assurer que l'ID est une string
      const userIdString = userId.toString();
      console.log('🔍 ID organisateur converti en string:', userIdString);
      safeNavigate(
        navigation, 
        'UserProfileModal', 
        { userId: userIdString }, 
        'Impossible d\'accéder au profil de l\'organisateur'
      );
    } else {
      debugEventData();
      Alert.alert('Erreur', 'ID de l\'organisateur non trouvé');
    }
  };

  // Fonction de debug pour afficher les données
  const debugEventData = () => {
    console.log('🔍 DEBUG COMPLET:');
    console.log('📊 eventData:', eventData);
    console.log('👤 organizer:', eventData?.organizer);
    if (eventData?.organizer) {
      console.log('🔑 Clés organizer:', Object.keys(eventData.organizer));
      console.log('🆔 _id:', eventData.organizer._id);
      console.log('🆔 id:', eventData.organizer.id);
      console.log('📛 name:', eventData.organizer.name);
    }
  };

  const handleMessage = async () => {
    try {
      console.log('🔍 handleMessage appelé');
      console.log('🔍 eventData exists:', !!eventData);
      console.log('🔍 eventData.organizer exists:', !!eventData?.organizer);
      
      if (!eventData) {
        console.log('❌ eventData est undefined');
        Alert.alert('Erreur', 'Données d\'événement non chargées. Veuillez réessayer.');
        return;
      }
      
      if (!eventData.organizer) {
        console.log('❌ eventData.organizer est undefined');
        console.log('🔍 eventData keys:', Object.keys(eventData));
        Alert.alert('Erreur', 'Organisateur non trouvé pour cet événement.');
        return;
      }
      
    const organizerId = getOrganizerId(eventData);
      const organizerName = eventData.organizer.name || 'l\'organisateur';
      
      console.log('🔍 organizerId:', organizerId);
      console.log('🔍 organizerName:', organizerName);
      
      // Debug: Vérifier les informations de l'organisateur
      console.log('🔍 Debug EventDetailsScreen - eventData:', eventData);
      console.log('🔍 Debug EventDetailsScreen - organizer:', eventData.organizer);
      console.log('🔍 Debug EventDetailsScreen - organizer name:', getOrganizerName(eventData));
    
    if (!organizerId) {
        console.log('❌ organizerId est undefined');
        console.log('🔍 eventData.organizer structure:', {
          _id: eventData.organizer._id,
          id: eventData.organizer.id,
          name: eventData.organizer.name,
          keys: Object.keys(eventData.organizer)
        });
      debugEventData();
      Alert.alert('Erreur', 'Impossible d\'identifier l\'organisateur');
      return;
    }

      // Utiliser le nouveau système de messagerie avec l'organisateur
      console.log('✅ Appel handleMessageOrganizer');
      await handleMessageOrganizer();
      
    } catch (error) {
      console.error('❌ Erreur dans handleMessage:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'ouverture du chat: ' + error.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text className="text-white text-lg mt-4">Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!eventData) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white text-lg">Événement non trouvé</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-cyan-400 text-base mt-4">Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleOpenMap = () => {
    const coords = mapCoordinates || { latitude: 48.8566, longitude: 2.3522 };
    const address = eventData.location?.address || eventData.location;
    
    // Utiliser l'adresse pour Google Maps si disponible, sinon les coordonnées
    const url = address 
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
    
    Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Background Image */}
        <View style={{ height: 280, position: 'relative' }}>
          <ImageBackground 
            source={{ 
              uri: eventData.images?.[0] || eventData.image || 
              (eventData.sport === 'Basketball' 
                ? 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                : 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')
            }}
            style={{ flex: 1 }}
            imageStyle={{ opacity: 0.9 }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
              style={{ flex: 1, justifyContent: 'space-between', padding: 24 }}
            >
              {/* Navigation and Actions */}
              <View className="flex-row items-center justify-between">
                <TouchableOpacity 
                  className="w-11 h-11 bg-black/40 rounded-full items-center justify-center"
                  onPress={() => navigation.goBack()}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    elevation: 6,
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>

                {/* GRATUIT/PRICE Badge */}
                {(eventData.isFree || eventData.price?.isFree) ? (
                  <View style={{
                    backgroundColor: '#06b6d4',
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 20,
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: [{ translateX: -40 }],
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>GRATUIT</Text>
                  </View>
                ) : eventData.price && (
                  <View style={{
                    backgroundColor: '#f59e0b',
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 20,
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: [{ translateX: -30 }],
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>€{eventData.price.amount}</Text>
                  </View>
                )}
                
                <View className="flex-row items-center" style={{ gap: 12 }}>
                      <TouchableOpacity 
                    className="w-11 h-11 bg-black/40 rounded-full items-center justify-center"
                    onPress={handleLike}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                      elevation: 6,
                    }}
                  >
                    <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={20} 
                      color={isLiked ? "#ef4444" : "white"} 
                    />
                      </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="w-11 h-11 bg-black/40 rounded-full items-center justify-center"
                    onPress={handleShare}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="share-outline" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Event Title and Info */}
              <View>
                <Text style={{ 
                  color: '#ffffff', 
                  fontSize: 28, 
                  fontWeight: 'bold', 
                  marginBottom: 16,
                  textShadowColor: 'rgba(0,0,0,0.5)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4
                }}>
                  {eventData.title}
                </Text>
                
                <View className="flex-row items-center">
                  <View className="flex-row items-center mr-6">
                    <Ionicons name="calendar-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text className="text-white text-base font-medium">{formatDate(eventData.date)}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text className="text-white text-base font-medium">{eventData.time}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Event Details Section */}
        <View className="bg-slate-900 px-6 pt-6">
          {/* Location with Map */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="location" size={20} color="#64748b" style={{ marginRight: 12 }} />
              <Text className="text-white text-lg font-medium">
                {eventData.location?.address || eventData.location || 'Lieu à définir'}
              </Text>
            </View>

            {/* Real Map */}
            <View className="mb-4">
              <View 
                className="h-40 bg-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden relative"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                {mapCoordinates ? (
                  <MapView
                    key={`map-${eventId}-${mapCoordinates.latitude}-${mapCoordinates.longitude}`}
                    style={{ flex: 1 }}
                    region={{
                      latitude: mapCoordinates.latitude,
                      longitude: mapCoordinates.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    mapType="standard"
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: mapCoordinates.latitude,
                        longitude: mapCoordinates.longitude,
                      }}
                      title={eventData.title}
                      description={eventData.location?.address || eventData.location}
                    >
                      <View className="items-center">
                        <View className="w-10 h-10 bg-cyan-500 rounded-full items-center justify-center border-2 border-white">
                          <Ionicons 
                            name={eventData.sport === 'Basketball' ? 'basketball' : eventData.sport === 'Tennis' ? 'tennisball' : 'football'} 
                            size={20} 
                            color="#ffffff" 
                          />
                        </View>
                        <View className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-cyan-500 -mt-1" />
                      </View>
                    </Marker>
                  </MapView>
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#06b6d4" />
                    <Text className="text-slate-400 text-xs mt-2">Chargement de la carte...</Text>
                  </View>
                )}
                
                {/* Map Controls */}
                <View className="absolute top-3 right-3 flex-row" style={{ gap: 8 }}>
                  <TouchableOpacity 
                    className="bg-white rounded-lg px-3 py-2 flex-row items-center"
                    onPress={handleOpenMap}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Ionicons name="navigate" size={16} color="#06b6d4" style={{ marginRight: 4 }} />
                    <Text className="text-slate-900 text-xs font-bold">Itinéraire</Text>
                  </TouchableOpacity>
                </View>

                {/* Location Info Overlay */}
                <View className="absolute bottom-3 left-3 bg-black/70 rounded-lg px-3 py-2">
                  <Text className="text-white text-xs font-medium">
                    📍 {eventData.location?.address || eventData.location || 'Lieu à définir'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Participants and Level */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="people" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <Text className="text-white text-base font-medium">
                  {eventData.currentParticipants || eventData.participants?.length || 0}/{eventData.maxParticipants} participants
                </Text>
              </View>
              <Text className="text-slate-400 text-base">Niveau: {eventData.level}</Text>
            </View>

            {/* Progress Bar */}
            <View className="mt-4">
              <View className="w-full h-2 bg-slate-700 rounded-full">
                <View 
                  className="h-2 bg-cyan-500 rounded-full"
                  style={{ 
                    width: `${((eventData.currentParticipants || eventData.participants?.length || 0) / eventData.maxParticipants) * 100}%` 
                  }}
                />
              </View>
            </View>
          </View>

          {/* Organizer Section */}
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-4">Organisateur</Text>
            
            <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-start flex-1">
                  <View className="relative">
                    <View
                      className="w-16 h-16 rounded-full mr-4 items-center justify-center"
                      style={{
                        backgroundColor: getAvatarColor(getOrganizerName(eventData)),
                        borderWidth: 2,
                        borderColor: '#06b6d4'
                      }}
                    >
                      <Text className="text-white text-xl font-bold">
                        {getInitials(getOrganizerName(eventData))}
                      </Text>
                    </View>
                    {/* Badge organisateur */}
                    <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full items-center justify-center border-2 border-slate-800">
                      <Ionicons name="crown" size={12} color="#ffffff" />
                    </View>
                    
                    {/* Indicateur de statut en ligne pour l'organisateur */}
                    <View className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800">
                      <View className="w-2 h-2 bg-white rounded-full m-0.5" />
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-xl font-bold mb-1">
                      {getOrganizerName(eventData)}
                    </Text>
                    
                    {/* Rating and Stats */}
                    <View className="flex-row items-center mb-2">
                      <View className="flex-row items-center mr-4">
                        <Ionicons name="star" size={16} color="#f59e0b" style={{ marginRight: 4 }} />
                        <Text className="text-white text-base font-semibold">
                          {eventData.organizer?.rating || '4.8'}
                        </Text>
                        <Text className="text-slate-400 text-sm ml-1">
                          ({eventData.organizer?.reviewsCount || '12'} avis)
                        </Text>
                      </View>
                    </View>
                    
                    {/* Stats Row */}
                    <View className="flex-row items-center" style={{ gap: 16 }}>
                      <View className="flex-row items-center">
                        <Ionicons name="calendar" size={14} color="#64748b" style={{ marginRight: 4 }} />
                        <Text className="text-slate-400 text-sm">
                          {eventData.organizer?.eventsCount || eventData.organizer?.totalEvents || '0'} événements
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="people" size={14} color="#64748b" style={{ marginRight: 4 }} />
                        <Text className="text-slate-400 text-sm">
                          {eventData.organizer?.participantsCount || '0'} participants
                        </Text>
                      </View>
                    </View>
                    
                    {/* Level/Badge */}
                    {eventData.organizer?.level && (
                      <View className="mt-2">
                        <View className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-3 py-1 self-start">
                          <Text className="text-cyan-400 text-xs font-bold">
                            Niveau {eventData.organizer.level}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
                
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  <TouchableOpacity 
                    className="w-12 h-12 bg-slate-700 rounded-full items-center justify-center"
                    onPress={handleMessage}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Ionicons name="chatbubble" size={20} color="#22d3ee" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="bg-cyan-500 rounded-xl px-4 py-3 flex-row items-center"
                    onPress={handleViewProfile}
                    style={{
                      shadowColor: '#06b6d4',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Ionicons name="person" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text className="text-white text-sm font-bold">Profil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
            <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-4">Description</Text>
            <Text className="text-slate-300 text-base leading-6">
              {eventData.description}
              </Text>
          </View>

          {/* Participants Section */}
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-4">
              Participants ({eventData.currentParticipants || eventData.participants?.length || 0})
            </Text>
            
            <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
              <View style={{ gap: 16 }}>
                {(eventData.participants || [])
                  .filter(participant => {
                    // Filtrer les participants qui n'ont pas d'utilisateur valide
                    const userId = getUserId(participant);
                    return participant && userId;
                  })
                  .map((participant, index) => {
                  
                  const participantKey = getId(participant) || `participant_${index}`;
                  const userId = getUserId(participant);
                  const userName = participant.user?.name || participant.name || `Participant ${index + 1}`;
                  const userRating = participant.user?.rating || participant.rating;
                  const userLevel = participant.user?.level || participant.level;
                  const userEventsCount = participant.user?.eventsCount || participant.eventsCount || 0;
                  const isCurrentUser = user && (user._id === userId || user.id === userId);
                  
                  // Debug: Log des informations du participant
                  console.log(`🔍 Participant ${index + 1}:`, {
                    participant,
                    userId,
                    userName,
                    hasUser: !!participant.user,
                    userData: participant.user
                  });
                  
                  return (
                    <TouchableOpacity 
                      key={participantKey}
                      className="flex-row items-start"
                      onPress={() => {
                        console.log('🔍 Clic sur participant:', {
                          userName,
                          userId,
                          isCurrentUser,
                          participantKey
                        });
                        
                        if (userId && !isCurrentUser) {
                          console.log('🔍 Navigation vers profil participant:', userId);
                          // S'assurer que l'ID est une string
                          const userIdString = userId.toString();
                          console.log('🔍 ID converti en string:', userIdString);
                          safeNavigate(
                            navigation,
                            'UserProfileModal',
                            { userId: userIdString },
                            'Profil du participant non disponible'
                          );
                        } else if (isCurrentUser) {
                          console.log('🔍 Navigation vers profil personnel');
                          navigation.navigate('Profile');
                        } else {
                          console.log('❌ Pas d\'ID utilisateur disponible pour:', userName);
                          Alert.alert(
                            'Profil non disponible', 
                            `Le profil de ${userName} n'est pas accessible. L'utilisateur a peut-être supprimé son compte.`,
                            [{ text: 'OK' }]
                          );
                        }
                      }}
                      style={{
                        backgroundColor: isCurrentUser ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: isCurrentUser ? 1 : 0,
                        borderColor: isCurrentUser ? '#06b6d4' : 'transparent'
                      }}
                    >
                      <View className="relative">
                        <View
                          className="w-14 h-14 rounded-full mr-4 items-center justify-center"
                          style={{
                            backgroundColor: getAvatarColor(userName),
                            borderWidth: 2,
                            borderColor: isCurrentUser ? '#06b6d4' : '#64748b'
                          }}
                        >
                          <Text className="text-white text-lg font-bold">
                            {getInitials(userName)}
                          </Text>
                        </View>
                        {/* Badge utilisateur actuel */}
                        {isCurrentUser && (
                          <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full items-center justify-center border-2 border-slate-800">
                            <Ionicons name="checkmark" size={10} color="#ffffff" />
                          </View>
                        )}
                        
                        {/* Indicateur de statut en ligne */}
                        <View className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800">
                          <View className="w-2 h-2 bg-white rounded-full m-0.5" />
                        </View>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-white text-lg font-bold">
                            {userName}
                            {isCurrentUser && (
                              <Text className="text-cyan-400 text-sm ml-2">(Vous)</Text>
                            )}
                          </Text>
                          <Ionicons name="chevron-forward" size={16} color="#64748b" />
                        </View>
                        
                        {/* Rating and Level */}
                        <View className="flex-row items-center mb-2" style={{ gap: 12 }}>
                          {userRating && (
                            <View className="flex-row items-center">
                              <Ionicons name="star" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                              <Text className="text-white text-sm font-medium">
                                {userRating}
                              </Text>
                            </View>
                          )}
                          {userLevel && (
                            <View className="bg-slate-600/50 border border-slate-500/50 rounded-lg px-2 py-1">
                              <Text className="text-slate-300 text-xs font-bold">
                                Niveau {userLevel}
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        {/* Stats */}
                        <View className="flex-row items-center" style={{ gap: 16 }}>
                          <View className="flex-row items-center">
                            <Ionicons name="calendar" size={12} color="#64748b" style={{ marginRight: 4 }} />
                            <Text className="text-slate-400 text-xs">
                              {userEventsCount} événements
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Ionicons name="time" size={12} color="#64748b" style={{ marginRight: 4 }} />
                            <Text className="text-slate-400 text-xs">
                              Inscrit récemment
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                
                {/* Show message if no participants to display */}
                {(() => {
                  const validParticipants = (eventData.participants || []).filter(participant => {
                    const userId = getUserId(participant);
                    return participant && userId;
                  });
                  
                  const totalParticipants = eventData.participants?.length || 0;
                  const filteredCount = totalParticipants - validParticipants.length;
                  
                  if (validParticipants.length === 0) {
                    return (
                      <View className="flex-row items-center justify-center py-8">
                        <View className="items-center">
                          <View className="w-16 h-16 bg-slate-700 rounded-full items-center justify-center mb-4">
                            <Ionicons name="people" size={24} color="#64748b" />
                          </View>
                          <Text className="text-slate-400 text-lg font-medium">
                            Aucun participant pour le moment
                          </Text>
                          <Text className="text-slate-500 text-sm mt-1">
                            Soyez le premier à rejoindre cet événement !
                          </Text>
                          {filteredCount > 0 && (
                            <Text className="text-slate-600 text-xs mt-2">
                              ({filteredCount} participant{filteredCount > 1 ? 's' : ''} avec des comptes supprimés)
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  }
                  
                  if (filteredCount > 0) {
                    return (
                      <View className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 mt-4">
                        <View className="flex-row items-center">
                          <Ionicons name="information-circle" size={16} color="#64748b" style={{ marginRight: 8 }} />
                          <Text className="text-slate-400 text-sm">
                            {filteredCount} participant{filteredCount > 1 ? 's' : ''} avec des comptes supprimés ne sont pas affichés
                          </Text>
                        </View>
                      </View>
                    );
                  }
                  
                  return null;
                })()}
              </View>
            </View>
          </View>

           {/* Join Button */}
           <View className="mb-8">
             {(() => {
               const userId = user?._id || user?.id;
               const isParticipant = eventData?.participants?.some(
                 participant => {
                   const participantId = participant.user?._id || participant.user?.id || participant.user;
                   return participantId?.toString() === userId?.toString();
                 }
               );
               
               console.log('🔍 EventDetailsScreen - isParticipant:', isParticipant);
               
               return (
                 <TouchableOpacity 
                   onPress={isParticipant ? null : () => joinEvent(eventId)}
                   disabled={isParticipant}
                   style={{
                     shadowColor: isParticipant ? '#64748b' : '#22c55e',
                     shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.3,
                     shadowRadius: 8,
                     elevation: 8,
                     opacity: isParticipant ? 0.6 : 1,
                   }}
                 >
                   <LinearGradient
                     colors={isParticipant ? ['#64748b', '#64748bCC'] : ['#22c55e', '#22c55eCC']}
                     style={{
                       borderRadius: 12,
                       paddingVertical: 20,
                       paddingHorizontal: 24,
                       flexDirection: 'row',
                       alignItems: 'center',
                       justifyContent: 'center',
                     }}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                   >
                     <Ionicons 
                       name={isParticipant ? "checkmark-circle" : "add-circle-outline"} 
                       size={22} 
                       color="#ffffff" 
                       style={{ marginRight: 12 }} 
                     />
                     <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
                       {isParticipant ? 'Inscrit' : 'Rejoindre'}
                     </Text>
                   </LinearGradient>
                 </TouchableOpacity>
               );
             })()}
             
             {/* Bouton pour donner un avis sur l'organisateur */}
             {(() => {
               const userId = user?._id || user?.id;
               const organizerId = getOrganizerId(eventData);
               const isParticipant = eventData?.participants?.some(
                 participant => {
                   const participantId = participant.user?._id || participant.user?.id || participant.user;
                   return participantId?.toString() === userId?.toString();
                 }
               );
               
               // L'utilisateur peut donner un avis s'il est participant et n'est pas l'organisateur
               const canReview = isParticipant && organizerId !== userId;
               
               if (!canReview) return null;
               
               return (
                 <TouchableOpacity 
                   onPress={() => setShowReviewForm(true)}
                   className="mt-4"
                   activeOpacity={0.8}
                 >
                   <LinearGradient
                     colors={['#3b82f6', '#3b82f6CC']}
                     style={{
                       borderRadius: 12,
                       paddingVertical: 16,
                       paddingHorizontal: 24,
                       flexDirection: 'row',
                       alignItems: 'center',
                       justifyContent: 'center',
                     }}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                   >
                     <Ionicons 
                       name="star-outline" 
                       size={20} 
                       color="#ffffff" 
                       style={{ marginRight: 8 }} 
                     />
                     <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                       Donner un avis
                     </Text>
                   </LinearGradient>
                 </TouchableOpacity>
               );
             })()}
           </View>
        </View>
      </ScrollView>
      
      {/* Modal pour donner un avis */}
      <ReviewForm
        visible={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        organizerId={getOrganizerId(eventData)}
        organizerName={getOrganizerName(eventData)}
        eventId={eventId}
        eventTitle={eventData?.title}
        onReviewSubmitted={(review) => {
          console.log('Avis soumis:', review);
          // Optionnel: recharger les données de l'événement
        }}
      />
    </SafeAreaView>
  );
};

export default EventDetailsScreen; 