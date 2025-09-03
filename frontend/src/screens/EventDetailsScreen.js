import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/globalStyles';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>Événement non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isEventFull = event.currentParticipants >= event.maxParticipants;
  const isEventPast = new Date(event.date) < new Date();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getEventImage(event.sport) }}
            style={styles.eventImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <SafeAreaView>
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <View style={styles.rightButtons}>
                  {isUserOrganizer() && (
                    <>
                      <TouchableOpacity style={styles.actionHeaderButton} onPress={handleEditEvent}>
                        <Ionicons name="create-outline" size={20} color={colors.white} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionHeaderButton} onPress={handleDeleteEvent}>
                        <Ionicons name="trash-outline" size={20} color={colors.white} />
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
            
            <View style={styles.eventBadges}>
              {event.price.isFree && (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>GRATUIT</Text>
                </View>
              )}
              <View style={styles.sportBadge}>
                <Text style={styles.sportBadgeText}>{event.sport}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Event Content */}
        <View style={styles.contentContainer}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
          </View>

          {/* Event Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Détails de l'événement</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Date et heure</Text>
                <Text style={styles.detailValue}>
                  {formatDate(event.date)} à {formatTime(event.time)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Lieu</Text>
                <Text style={styles.detailValue}>{event.location.address}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Participants</Text>
                <Text style={styles.detailValue}>
                  {event.currentParticipants}/{event.maxParticipants} personnes
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="star-outline" size={20} color={colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Niveau requis</Text>
                <Text style={styles.detailValue}>{event.level}</Text>
              </View>
            </View>

            {!event.price.isFree && (
              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Prix</Text>
                  <Text style={styles.detailValue}>{event.price.amount}€</Text>
                </View>
              </View>
            )}
          </View>

          {/* Organizer */}
          <View style={styles.organizerSection}>
            <Text style={styles.sectionTitle}>Organisateur</Text>
            <View style={styles.organizerInfo}>
              <View style={styles.organizerAvatar}>
                <Text style={styles.organizerAvatarText}>
                  {event.organizer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.organizerDetails}>
                <Text style={styles.organizerName}>{event.organizer.name}</Text>
                <Text style={styles.organizerEmail}>{event.organizer.email}</Text>
              </View>
            </View>
          </View>

          {/* Participants */}
          {event.participants && event.participants.length > 0 && (
            <View style={styles.participantsSection}>
              <Text style={styles.sectionTitle}>
                Participants ({event.participants.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.participantsList}>
                  {event.participants.map((participant, index) => (
                    <View key={index} style={styles.participantAvatar}>
                      <Text style={styles.participantAvatarText}>
                        {participant.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            {isEventPast ? (
              <View style={styles.pastEventNotice}>
                <Ionicons name="time-outline" size={24} color={colors.textMuted} />
                <Text style={styles.pastEventText}>Cet événement est terminé</Text>
              </View>
            ) : isUserOrganizer() ? (
              <View style={styles.organizerActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={handleEditEvent}
                  disabled={isJoining}
                >
                  <Ionicons name="create-outline" size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>Modifier l'événement</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDeleteEvent}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color={colors.white} />
                  )}
                  <Text style={styles.actionButtonText}>
                    {isJoining ? 'Suppression...' : 'Supprimer l\'événement'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : isUserParticipant() ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.leaveButton]}
                onPress={handleLeaveEvent}
                disabled={isJoining}
              >
                {isJoining ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="exit-outline" size={20} color={colors.white} />
                )}
                <Text style={styles.actionButtonText}>
                  {isJoining ? 'Désinscription...' : 'Quitter l\'événement'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.joinButton,
                  isEventFull && styles.actionButtonDisabled
                ]}
                onPress={handleJoinEvent}
                disabled={isJoining || isEventFull}
              >
                {isJoining ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons 
                    name={isEventFull ? "lock-closed" : "add"} 
                    size={20} 
                    color={colors.white} 
                  />
                )}
                <Text style={styles.actionButtonText}>
                  {isJoining ? 'Inscription...' : isEventFull ? 'Événement complet' : 'Rejoindre l\'événement'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    marginTop: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBadges: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  freeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  freeBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sportBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  sportBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  organizerSection: {
    marginBottom: 24,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  organizerAvatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  organizerDetails: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  organizerEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  participantsSection: {
    marginBottom: 24,
  },
  participantsList: {
    flexDirection: 'row',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  participantAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsSection: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: colors.primary,
  },
  leaveButton: {
    backgroundColor: colors.danger,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  organizerActions: {
    gap: 12,
  },
  actionButtonDisabled: {
    backgroundColor: colors.gray[600],
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 8,
  },
  pastEventNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  pastEventText: {
    fontSize: 16,
    color: colors.textMuted,
    marginLeft: 8,
  },
});

export default EventDetailsScreen; 