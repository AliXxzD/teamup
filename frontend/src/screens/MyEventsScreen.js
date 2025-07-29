import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/globalStyles';
import GlobalMenu from '../components/GlobalMenu';
import { navigateToEventDetails } from '../utils/navigationUtils';

const MyEventsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('organized'); // 'organized' or 'joined'
  const [organizedEvents, setOrganizedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Configuration de l'API
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert('Connexion requise', 'Vous devez être connecté pour voir vos événements');
        navigation.navigate('Login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Récupérer les événements organisés
      const organizedResponse = await fetch(`${API_BASE_URL}/api/events/my/organized`, { headers });
      const organizedData = await organizedResponse.json();

      // Récupérer les événements auxquels je participe
      const joinedResponse = await fetch(`${API_BASE_URL}/api/events/my/joined`, { headers });
      const joinedData = await joinedResponse.json();

      if (organizedData.success) {
        setOrganizedEvents(organizedData.data);
      }

      if (joinedData.success) {
        setJoinedEvents(joinedData.data);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      Alert.alert('Erreur', 'Impossible de charger vos événements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyEvents();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // HH:MM
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'full': return colors.warning;
      case 'cancelled': return colors.danger;
      case 'completed': return colors.textMuted;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'full': return 'Complet';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const deleteEvent = async (eventId) => {
    Alert.alert(
      'Supprimer l\'événement',
      'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');
              const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Succès', 'Événement supprimé avec succès');
                fetchMyEvents();
              } else {
                Alert.alert('Erreur', data.message || 'Impossible de supprimer l\'événement');
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
            }
          }
        }
      ]
    );
  };

  const leaveEvent = async (eventId) => {
    Alert.alert(
      'Quitter l\'événement',
      'Êtes-vous sûr de vouloir quitter cet événement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');
              const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/leave`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Succès', 'Vous avez quitté l\'événement');
                fetchMyEvents();
              } else {
                Alert.alert('Erreur', data.message || 'Impossible de quitter l\'événement');
              }
            } catch (error) {
              console.error('Erreur lors de la désinscription:', error);
              Alert.alert('Erreur', 'Impossible de quitter l\'événement');
            }
          }
        }
      ]
    );
  };

  const EventCard = ({ event, isOrganizer = false }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => {
        // Utiliser push pour naviguer vers EventDetails dans le même navigateur
        navigateToEventDetails(navigation, event._id);
      }}
    >
      <View style={styles.eventImageContainer}>
        <Image
          source={{ uri: getEventImage(event.sport) }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        <View style={styles.eventImageOverlay}>
          <View style={styles.eventBadges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
              <Text style={styles.statusBadgeText}>{getStatusText(event.status)}</Text>
            </View>
            {event.price.isFree && (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>GRATUIT</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.eventInfo}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventActions}>
            {isOrganizer ? (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('CreateEvent', { 
                    eventId: event._id,
                    eventData: event,
                    isEditing: true 
                  })}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteEvent(event._id)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => leaveEvent(event._id)}
              >
                <Ionicons name="exit-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>
              {formatDate(event.date)} à {formatTime(event.time)}
            </Text>
          </View>

          <View style={styles.eventDetailRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.eventDetailText} numberOfLines={1}>
              {event.location.address}
            </Text>
          </View>

          <View style={styles.eventDetailRow}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>
              {event.currentParticipants}/{event.maxParticipants} participants
            </Text>
          </View>
        </View>

        {isOrganizer && event.participants && event.participants.length > 0 && (
          <View style={styles.participantsPreview}>
            <Text style={styles.participantsTitle}>Participants :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.participantsList}>
                {event.participants.slice(0, 5).map((participant, index) => (
                  <View key={index} style={styles.participantAvatar}>
                    <Text style={styles.participantAvatarText}>
                      {participant.user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ))}
                {event.participants.length > 5 && (
                  <View style={styles.moreParticipants}>
                    <Text style={styles.moreParticipantsText}>+{event.participants.length - 5}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const EmptyState = ({ type }) => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={type === 'organized' ? "add-circle-outline" : "calendar-outline"} 
        size={64} 
        color={colors.textMuted} 
      />
      <Text style={styles.emptyTitle}>
        {type === 'organized' ? 'Aucun événement organisé' : 'Aucun événement rejoint'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {type === 'organized' 
          ? 'Créez votre premier événement pour commencer à organiser'
          : 'Explorez les événements disponibles et rejoignez-en un'
        }
      </Text>
      <TouchableOpacity
        style={styles.emptyActionButton}
        onPress={() => navigation.navigate(type === 'organized' ? 'CreateEvent' : 'Discover')}
      >
        <Ionicons 
          name={type === 'organized' ? "add" : "search"} 
          size={20} 
          color={colors.white} 
        />
        <Text style={styles.emptyActionButtonText}>
          {type === 'organized' ? 'Créer un événement' : 'Découvrir des événements'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="trophy" size={20} color={colors.white} />
          </View>
          <Text style={styles.appName}>TEAMUP</Text>
        </View>
        <GlobalMenu navigation={navigation} />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <View style={styles.titleContainer}>
          <Ionicons name="calendar" size={32} color={colors.primary} />
          <Text style={styles.pageTitle}>Mes Événements</Text>
        </View>
        <Text style={styles.pageSubtitle}>Gérez vos événements organisés et rejoints</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'organized' && styles.activeTab]}
          onPress={() => setActiveTab('organized')}
        >
          <Ionicons 
            name="create-outline" 
            size={20} 
            color={activeTab === 'organized' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'organized' && styles.activeTabText]}>
            Organisés ({organizedEvents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'joined' && styles.activeTab]}
          onPress={() => setActiveTab('joined')}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === 'joined' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>
            Rejoints ({joinedEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.eventsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {activeTab === 'organized' ? (
              organizedEvents.length === 0 ? (
                <EmptyState type="organized" />
              ) : (
                organizedEvents.map((event) => (
                  <EventCard key={event._id} event={event} isOrganizer={true} />
                ))
              )
            ) : (
              joinedEvents.length === 0 ? (
                <EmptyState type="joined" />
              ) : (
                joinedEvents.map((event) => (
                  <EventCard key={event._id} event={event} isOrganizer={false} />
                ))
              )
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  pageSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.primary,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  eventsList: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventImageContainer: {
    height: 120,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  eventBadges: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  freeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  eventActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  participantsPreview: {
    marginTop: 8,
  },
  participantsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  participantsList: {
    flexDirection: 'row',
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  participantAvatarText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  moreParticipants: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreParticipantsText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MyEventsScreen; 