import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import pointsService from '../services/pointsService';

const SimplifiedUserCard = ({ 
  user, 
  userProgression, 
  onProfilePress,
  style = {} 
}) => {
  if (!user || !userProgression) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingAvatar} />
            <View style={styles.loadingInfo}>
              <View style={styles.loadingLine} />
              <View style={[styles.loadingLine, { width: '60%' }]} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  const {
    points,
    level,
    nextLevelPoints,
    progressPercentage
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
          {/* Main Profile Section */}
          <View style={styles.profileSection}>
            {/* Avatar with Level */}
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
            </View>

            {/* Profile Link */}
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={onProfilePress}
            >
              <Ionicons name="person-outline" size={20} color="#06b6d4" />
              <Text style={styles.profileButtonText}>Profil</Text>
            </TouchableOpacity>
          </View>

          {/* Simplified Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Niveau {level + 1}
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
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

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
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    marginRight: 16,
  },
  loadingInfo: {
    flex: 1,
  },
  loadingLine: {
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    marginBottom: 8,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  levelText: {
    color: '#ffffff',
    fontSize: 11,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 6,
  },
  wave: {
    fontSize: 18,
  },
  levelTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 6,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  profileButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  profileButtonText: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default SimplifiedUserCard;

