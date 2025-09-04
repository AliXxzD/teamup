import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import GradientButton from '../components/GradientButton';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params || {};
  
  // Vérifier que eventId est présent
  if (!eventId) {
    console.error('❌ EventDetailsScreen: eventId manquant dans les paramètres');
    Alert.alert('Erreur', 'ID de l\'événement manquant');
    navigation.goBack();
    return null;
  }
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);



  useEffect(() => {
    fetchEventDetails();
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const userData = await AsyncStorage.getItem('user');
    setUserToken(token);
    
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
      const data = await response.json();

      if (data.success) {
        setEvent(data.data);
      } else {
        Alert.alert('Erreur', 'Événement non trouvé');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'événement');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // HH:MM
  };

  const getEventImage = (sport) => {
    const sportImages = {
      'Football': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop',
      'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
      'Tennis': 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop',
      'Running': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'Yoga': 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&h=600&fit=crop',
      'Natation': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop'
    };
    return sportImages[sport] || sportImages['Football'];
  };

  const handleJoinEvent = async () => {
    if (!userToken) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour rejoindre un événement',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Succès !', 'Vous avez rejoint l\'événement avec succès');
        fetchEventDetails(); // Recharger les détails
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de rejoindre l\'événement');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', 'Impossible de rejoindre l\'événement');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    Alert.alert(
      'Quitter l\'événement',
      'Êtes-vous sûr de vouloir quitter cet événement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: async () => {
            setIsJoining(true);
            try {
              const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/leave`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${userToken}`,
                  'Content-Type': 'application/json'
                }
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Succès', 'Vous avez quitté l\'événement');
                fetchEventDetails();
              } else {
                Alert.alert('Erreur', data.message || 'Impossible de quitter l\'événement');
              }
            } catch (error) {
              console.error('Erreur lors de la désinscription:', error);
              Alert.alert('Erreur', 'Impossible de quitter l\'événement');
            } finally {
              setIsJoining(false);
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Rejoignez-moi pour "${event.title}" - ${event.description}`,
        title: event.title
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const isUserParticipant = () => {
    if (!currentUser || !event.participants) return false;
    return event.participants.some(
      participant => participant.user._id === currentUser._id
    );
  };

  const isUserOrganizer = () => {
    if (!currentUser || !event.organizer) return false;
    return event.organizer._id === currentUser._id;
  };

  const handleDeleteEvent = async () => {
    Alert.alert(
      'Supprimer l\'événement',
      'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsJoining(true);
            try {
              const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${userToken}`,
                  'Content-Type': 'application/json'
                }
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Succès', 'Événement supprimé avec succès', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert('Erreur', data.message || 'Impossible de supprimer l\'événement');
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
            } finally {
              setIsJoining(false);
            }
          }
        }
      ]
    );
  };

  const handleEditEvent = () => {
    navigation.navigate('CreateEvent', { 
      eventId: eventId,
      eventData: event,
      isEditing: true 
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-900">
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#20B2AA" />
          <Text className="text-dark-300 text-base mt-3">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-dark-900">
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-danger text-lg mt-3">Événement non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isEventFull = event.currentParticipants >= event.maxParticipants;
  const isEventPast = new Date(event.date) < new Date();

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="h-64 relative">
          <Image
            source={{ uri: getEventImage(event.sport) }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/40">
            <SafeAreaView>
              <View className="flex-row justify-between items-center px-5 pt-2">
                <TouchableOpacity 
                  className="w-11 h-11 rounded-full bg-black/50 items-center justify-center"
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <View className="flex-row items-center">
                  {isUserOrganizer() && (
                    <>
                      <TouchableOpacity 
                        className="w-10 h-10 rounded-full bg-black/50 items-center justify-center mr-2"
                        onPress={handleEditEvent}
                      >
                        <Ionicons name="create-outline" size={20} color="#ffffff" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="w-10 h-10 rounded-full bg-black/50 items-center justify-center mr-2"
                        onPress={handleDeleteEvent}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ffffff" />
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity 
                    className="w-11 h-11 rounded-full bg-black/50 items-center justify-center"
                    onPress={handleShare}
                  >
                    <Ionicons name="share-outline" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
            
            <View className="absolute bottom-4 right-4 items-end">
              {event.price.isFree && (
                <View className="bg-success px-3 py-1.5 rounded-full mb-2">
                  <Text className="text-white text-xs font-bold">GRATUIT</Text>
                </View>
              )}
              <View className="bg-black/70 px-3 py-1.5 rounded-full">
                <Text className="text-white text-sm font-semibold">{event.sport}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Event Content */}
        <View className="p-5">
          {/* Title and Description */}
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold mb-3">{event.title}</Text>
            <Text className="text-dark-300 text-base leading-6">{event.description}</Text>
          </View>

          {/* Event Details */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">Détails de l'événement</Text>
            
            <View className="flex-row items-start mb-4">
              <Ionicons name="calendar-outline" size={20} color="#20B2AA" />
              <View className="ml-3 flex-1">
                <Text className="text-dark-400 text-sm mb-0.5">Date et heure</Text>
                <Text className="text-white text-base font-medium">
                  {formatDate(event.date)} à {formatTime(event.time)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-4">
              <Ionicons name="location-outline" size={20} color="#20B2AA" />
              <View className="ml-3 flex-1">
                <Text className="text-dark-400 text-sm mb-0.5">Lieu</Text>
                <Text className="text-white text-base font-medium">{event.location.address}</Text>
              </View>
            </View>

            <View className="flex-row items-start mb-4">
              <Ionicons name="people-outline" size={20} color="#20B2AA" />
              <View className="ml-3 flex-1">
                <Text className="text-dark-400 text-sm mb-0.5">Participants</Text>
                <Text className="text-white text-base font-medium">
                  {event.currentParticipants}/{event.maxParticipants} personnes
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-4">
              <Ionicons name="star-outline" size={20} color="#20B2AA" />
              <View className="ml-3 flex-1">
                <Text className="text-dark-400 text-sm mb-0.5">Niveau requis</Text>
                <Text className="text-white text-base font-medium">{event.level}</Text>
              </View>
            </View>

            {!event.price.isFree && (
              <View className="flex-row items-start mb-4">
                <Ionicons name="card-outline" size={20} color="#20B2AA" />
                <View className="ml-3 flex-1">
                  <Text className="text-dark-400 text-sm mb-0.5">Prix</Text>
                  <Text className="text-white text-base font-medium">{event.price.amount}€</Text>
                </View>
              </View>
            )}
          </View>

          {/* Organizer */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">Organisateur</Text>
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center mr-3">
                <Text className="text-white text-lg font-bold">
                  {event.organizer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">{event.organizer.name}</Text>
                <Text className="text-dark-300 text-sm">{event.organizer.email}</Text>
              </View>
            </View>
          </View>

          {/* Participants */}
          {event.participants && event.participants.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-4">
                Participants ({event.participants.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {event.participants.map((participant, index) => (
                    <View key={index} className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center mr-2">
                      <Text className="text-white text-sm font-bold">
                        {participant.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Action Buttons */}
          <View className="mt-5">
            {isEventPast ? (
              <View className="flex-row items-center justify-center py-4 bg-dark-800 rounded-xl">
                <Ionicons name="time-outline" size={24} color="#64748b" />
                <Text className="text-dark-400 text-base ml-2">Cet événement est terminé</Text>
              </View>
            ) : isUserOrganizer() ? (
              <View className="gap-3">
                <GradientButton
                  title="Modifier l'événement"
                  onPress={handleEditEvent}
                  disabled={isJoining}
                  variant="primary"
                  size="large"
                  icon="create-outline"
                />
                <GradientButton
                  title={isJoining ? 'Suppression...' : 'Supprimer l\'événement'}
                  onPress={handleDeleteEvent}
                  loading={isJoining}
                  disabled={isJoining}
                  variant="danger"
                  size="large"
                  icon="trash-outline"
                />
              </View>
            ) : isUserParticipant() ? (
              <GradientButton
                title={isJoining ? 'Désinscription...' : 'Quitter l\'événement'}
                onPress={handleLeaveEvent}
                loading={isJoining}
                disabled={isJoining}
                variant="danger"
                size="large"
                icon="exit-outline"
              />
            ) : (
              <GradientButton
                title={isJoining ? 'Inscription...' : isEventFull ? 'Événement complet' : 'Rejoindre l\'événement'}
                onPress={handleJoinEvent}
                loading={isJoining}
                disabled={isJoining || isEventFull}
                variant={isEventFull ? "disabled" : "primary"}
                size="large"
                icon={isEventFull ? "lock-closed" : "add"}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



export default EventDetailsScreen; 