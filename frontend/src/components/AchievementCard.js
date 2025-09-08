import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AchievementCard = ({ 
  achievement, 
  onPress, 
  style = {} 
}) => {
  const {
    title,
    description,
    icon,
    color,
    unlocked,
    points,
    progress
  } = achievement;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!unlocked}
    >
      <View style={[
        styles.card,
        { 
          backgroundColor: unlocked ? '#1e293b' : '#0f172a',
          borderColor: unlocked ? color : '#374151',
          opacity: unlocked ? 1 : 0.6
        }
      ]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          {unlocked ? (
            <LinearGradient
              colors={[color, color + '80']}
              style={styles.iconGradient}
            >
              <Ionicons name={icon} size={24} color="#ffffff" />
            </LinearGradient>
          ) : (
            <View style={[styles.iconLocked, { borderColor: color }]}>
              <Ionicons name={icon} size={24} color="#64748b" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[
            styles.title,
            { color: unlocked ? '#ffffff' : '#94a3b8' }
          ]}>
            {title}
          </Text>
          
          <Text style={[
            styles.description,
            { color: unlocked ? '#cbd5e1' : '#64748b' }
          ]}>
            {description}
          </Text>

          {/* Progress or Points */}
          <View style={styles.footer}>
            {progress && !unlocked ? (
              <Text style={styles.progress}>
                {progress}
              </Text>
            ) : (
              <View style={styles.pointsContainer}>
                <Ionicons 
                  name="star" 
                  size={14} 
                  color={unlocked ? '#f59e0b' : '#64748b'} 
                />
                <Text style={[
                  styles.points,
                  { color: unlocked ? '#f59e0b' : '#64748b' }
                ]}>
                  {points} pts
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Unlock indicator */}
        {unlocked && (
          <View style={styles.unlockedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={color} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Composant pour afficher une liste d'achievements
export const AchievementsList = ({ 
  achievements, 
  title = "Achievements",
  maxDisplay = 3,
  onSeeAll 
}) => {
  const displayAchievements = achievements.slice(0, maxDisplay);
  const hasMore = achievements.length > maxDisplay;

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{title}</Text>
        {hasMore && onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.achievementsList}>
        {displayAchievements.map((achievement, index) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            style={{ marginBottom: index < displayAchievements.length - 1 ? 12 : 0 }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLocked: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  progress: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  unlockedIndicator: {
    marginLeft: 12,
  },
  // Styles pour la liste
  listContainer: {
    marginBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsList: {
    // Container pour la liste
  },
});

export default AchievementCard;

