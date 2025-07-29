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

const DiscoverScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    sport: '',
    level: '',
    isFree: null
  });

  // Configuration de l'API
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';

  const sports = ['Football', 'Basketball', 'Tennis', 'Running', 'Yoga', 'Natation'];
  const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];

  const fetchEvents = async () => {
    try {
      // Construire l'URL avec les filtres
      let url = `${API_BASE_URL}/api/events?`;
      const params = [];
      
      if (filters.sport) params.push(`sport=${encodeURIComponent(filters.sport)}`);
      if (filters.level) params.push(`level=${encodeURIComponent(filters.level)}`);
      if (filters.isFree !== null) params.push(`isFree=${filters.isFree}`);
      
      url += params.join('&');

      console.log('Fetching events from:', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data.events);
      } else {
        console.error('Erreur API:', data.message);
        Alert.alert('Erreur', 'Impossible de charger les événements');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      Alert.alert('Erreur de connexion', 'Vérifiez votre connexion internet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert('Connexion requise', 'Vous devez être connecté pour rejoindre un événement');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Succès !', 'Vous avez rejoint l\'événement avec succès');
        fetchEvents(); // Recharger la liste
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de rejoindre l\'événement');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', 'Impossible de rejoindre l\'événement');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

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

  const FilterChip = ({ title, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
        {title}
      </Text>
      {isSelected && (
        <Ionicons name="close" size={16} color={colors.white} style={styles.chipCloseIcon} />
      )}
    </TouchableOpacity>
  );

  const EventCard = ({ event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => {
        console.log('🔍 Navigation vers EventDetails:', {
          eventId: event._id,
          eventTitle: event.title,
          navigationState: navigation.getState()
        });
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

      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>
              {formatDate(event.date)} à {formatEventTime(event.time)}
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

          <View style={styles.eventDetailRow}>
            <Ionicons name="star-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>
              Niveau: {event.level}
            </Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <View style={styles.organizerInfo}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerAvatarText}>
                {event.organizer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.organizerName}>
              Par {event.organizer.name}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.joinButton,
              event.currentParticipants >= event.maxParticipants && styles.joinButtonDisabled
            ]}
            onPress={() => joinEvent(event._id)}
            disabled={event.currentParticipants >= event.maxParticipants}
          >
            <Ionicons 
              name={event.currentParticipants >= event.maxParticipants ? "lock-closed" : "add"} 
              size={16} 
              color={colors.white} 
            />
            <Text style={styles.joinButtonText}>
              {event.currentParticipants >= event.maxParticipants ? 'Complet' : 'Rejoindre'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
          <Ionicons name="search" size={32} color={colors.primary} />
          <Text style={styles.pageTitle}>Découvrir</Text>
        </View>
        <Text style={styles.pageSubtitle}>Trouvez votre prochaine activité sportive</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filtersTitle}>Filtres</Text>
        
        {/* Sport Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScrollView}>
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
              onPress={() => setFilters({ ...filters, sport: filters.sport === sport ? '' : sport })}
            />
          ))}
        </ScrollView>

        {/* Price and Level Filters */}
        <View style={styles.secondaryFilters}>
          <FilterChip
            title="Gratuit"
            isSelected={filters.isFree === true}
            onPress={() => setFilters({ ...filters, isFree: filters.isFree === true ? null : true })}
          />
          <FilterChip
            title="Payant"
            isSelected={filters.isFree === false}
            onPress={() => setFilters({ ...filters, isFree: filters.isFree === false ? null : false })}
          />
        </View>
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
            <Text style={styles.loadingText}>Chargement des événements...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucun événement trouvé</Text>
            <Text style={styles.emptySubtitle}>
              Essayez de modifier vos filtres ou créez votre propre événement
            </Text>
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.createEventButtonText}>Créer un événement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.eventsList}>
            <Text style={styles.resultsCount}>
              {events.length} événement{events.length > 1 ? 's' : ''} trouvé{events.length > 1 ? 's' : ''}
            </Text>
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  filtersScrollView: {
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.gray[700],
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  chipCloseIcon: {
    marginLeft: 6,
  },
  secondaryFilters: {
    flexDirection: 'row',
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
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
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createEventButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  eventsList: {
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
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
    height: 160,
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
    top: 12,
    right: 12,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  freeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  freeBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  sportBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sportBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  organizerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  organizerAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  organizerName: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonDisabled: {
    backgroundColor: colors.gray[600],
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default DiscoverScreen; 