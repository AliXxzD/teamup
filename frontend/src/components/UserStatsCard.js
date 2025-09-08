import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import pointsService from '../services/pointsService';

const UserStatsCard = ({ 
  user, 
  userProgression, 
  onProfilePress,
  style = {} 
}) => {
  if (!user || !userProgression) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Chargement des statistiques...</Text>
        </View>
      </View>
    );
  }

  const {
    points,
    level,
    nextLevelPoints,
    progressPercentage,
    stats
  } = userProgression;

  const levelTitle = pointsService.getLevelTitle(level);
  const levelColor = pointsService.getLevelColor(level);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#1e293b', '#334155']}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[levelColor, levelColor + '80']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
              
              {/* Level Badge */}
              <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                <Text style={styles.levelText}>{level}</Text>
              </View>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.greeting}>
                  Salut {user.name?.split(' ')[0] || 'Sportif'} !
                </Text>
                <Text style={styles.wave}>👋</Text>
              </View>
              
              <Text style={styles.levelTitle}>
                {levelTitle} • Niveau {level}
              </Text>
              
              <View style={styles.pointsRow}>
                <Ionicons name="star" size={18} color="#f59e0b" />
                <Text style={styles.pointsText}>
                  {points.toLocaleString()} points
                </Text>
              </View>
              
              <TouchableOpacity onPress={onProfilePress}>
                <Text style={styles.profileLink}>Voir profil</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Progression vers niveau {level + 1}
              </Text>
              <Text style={styles.progressPercentage}>
                {progressPercentage}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { 
                      width: `${progressPercentage}%`,
                      backgroundColor: levelColor
                    }
                  ]} 
                />
              </View>
            </View>
            
            <Text style={styles.progressDetails}>
              {nextLevelPoints - points} points pour le prochain niveau
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <StatItem
              icon="calendar"
              value={stats.eventsOrganized}
              label="Organisés"
              color="#22c55e"
            />
            <StatItem
              icon="people"
              value={stats.eventsJoined}
              label="Rejoints"
              color="#3b82f6"
            />
            <StatItem
              icon="star"
              value={stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              label="Note moy."
              color="#f59e0b"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Composant pour les statistiques rapides
const StatItem = ({ icon, value, label, color }) => (
  <View style={styles.statItem}>
    <View style={[styles.statIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={16} color="#ffffff" />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#475569',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    padding: 24,
  },
  loadingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  levelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  wave: {
    fontSize: 20,
  },
  levelTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 8,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  profileLink: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetails: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default UserStatsCard;

