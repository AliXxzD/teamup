import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/globalStyles';
import GlobalMenu from '../components/GlobalMenu';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();

  const handleProfilePress = () => {
    navigation.navigate('MainTabs', { screen: 'Profile' });
  };

  const quickActions = [
    {
      title: 'Créer un événement',
      icon: 'add-circle-outline',
      iconLibrary: 'Ionicons',
      color: colors.primary,
      onPress: () => navigation.navigate('CreateEvent')
    },
    {
      title: 'Rejoindre un événement',
      icon: 'search-outline',
      iconLibrary: 'Ionicons',
      color: '#007AFF',
      onPress: () => navigation.navigate('Discover')
    },
    {
      title: 'Mes événements',
      icon: 'calendar-outline',
      iconLibrary: 'Ionicons',
      color: '#34C759',
      onPress: () => navigation.navigate('MyEventsStack')
    },
    {
      title: 'Inviter des amis',
      icon: 'people-outline',
      iconLibrary: 'Ionicons',
      color: '#FF9500',
      onPress: () => navigation.navigate('InviteFriends')
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Match de Football',
      date: 'Aujourd\'hui 18h00',
      location: 'Stade Municipal',
      participants: 12,
      maxParticipants: 22
    },
    {
      id: 2,
      title: 'Session Running',
      date: 'Demain 08h00',
      location: 'Parc de la Ville',
      participants: 8,
      maxParticipants: 15
    },
    {
      id: 3,
      title: 'Cours de Yoga',
      date: 'Vendredi 19h00',
      location: 'Studio Zen',
      participants: 5,
      maxParticipants: 10
    }
  ];

  const sports = [
    { name: 'Football', icon: 'play-circle', iconLibrary: 'Ionicons', count: 45 },
    { name: 'Basketball', icon: 'radio-button-off', iconLibrary: 'Ionicons', count: 32 },
    { name: 'Tennis', icon: 'fitness', iconLibrary: 'Ionicons', count: 28 },
    { name: 'Running', icon: 'walk', iconLibrary: 'Ionicons', count: 67 },
    { name: 'Yoga', icon: 'leaf', iconLibrary: 'Ionicons', count: 23 },
    { name: 'Natation', icon: 'water', iconLibrary: 'Ionicons', count: 18 }
  ];

  const IconComponent = ({ name, library = 'Ionicons', size = 24, color = colors.textSecondary }) => {
    switch (library) {
      case 'MaterialIcons':
        return <MaterialIcons name={name} size={size} color={color} />;
      default:
        return <Ionicons name={name} size={size} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="trophy" size={20} color={colors.white} />
          </View>
          <Text style={styles.appName}>TeamUp</Text>
        </View>
        <GlobalMenu navigation={navigation} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bonjour, {user?.name} ! 
            <Ionicons name="hand-right" size={20} color={colors.primary} style={{ marginLeft: 8 }} />
          </Text>
          <Text style={styles.welcomeSubtext}>Prêt pour votre prochaine aventure sportive ?</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <IconComponent 
                  name={action.icon} 
                  library={action.iconLibrary} 
                  size={28} 
                  color={action.color} 
                />
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Événements à venir</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
                <Text style={styles.eventLocation}>📍 {event.location}</Text>
              </View>
              <View style={styles.eventParticipants}>
                <Text style={styles.participantsText}>
                  {event.participants}/{event.maxParticipants}
                </Text>
                <Text style={styles.participantsLabel}>participants</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sports populaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports populaires</Text>
          <View style={styles.sportsGrid}>
            {sports.map((sport, index) => (
              <TouchableOpacity key={index} style={styles.sportCard}>
                <IconComponent 
                  name={sport.icon} 
                  library={sport.iconLibrary} 
                  size={24} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.sportName}>{sport.name}</Text>
                <Text style={styles.sportCount}>{sport.count} événements</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos statistiques</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Événements rejoints</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Événements créés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Heures d'activité</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[700],
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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

  content: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  eventParticipants: {
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  participantsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sportCard: {
    width: '31%',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  sportName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sportCount: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default DashboardScreen; 