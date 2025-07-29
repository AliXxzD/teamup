import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

const StatsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('football');
  const [slideAnim] = useState(new Animated.Value(0));

  const sports = [
    { 
      id: 'football', 
      name: 'Football', 
      icon: 'sports-soccer', 
      color: '#4CAF50',
      stats: {
        matchesPlayed: 15,
        matchesWon: 12,
        goals: 8,
        assists: 5,
        winRate: 80,
        averageRating: 4.7
      }
    },
    { 
      id: 'basketball', 
      name: 'Basketball', 
      icon: 'sports-basketball', 
      color: '#FF9800',
      stats: {
        matchesPlayed: 8,
        matchesWon: 6,
        points: 142,
        rebounds: 28,
        winRate: 75,
        averageRating: 4.5
      }
    },
    { 
      id: 'tennis', 
      name: 'Tennis', 
      icon: 'sports-tennis', 
      color: '#2196F3',
      stats: {
        matchesPlayed: 12,
        matchesWon: 9,
        sets: 27,
        aces: 45,
        winRate: 75,
        averageRating: 4.6
      }
    },
    { 
      id: 'volleyball', 
      name: 'Volleyball', 
      icon: 'sports-volleyball', 
      color: '#9C27B0',
      stats: {
        matchesPlayed: 6,
        matchesWon: 4,
        spikes: 32,
        blocks: 15,
        winRate: 67,
        averageRating: 4.3
      }
    }
  ];

  const currentSport = sports.find(s => s.id === activeTab);

  const changeTab = (sportId) => {
    const newIndex = sports.findIndex(s => s.id === sportId);
    const currentIndex = sports.findIndex(s => s.id === activeTab);
    
    Animated.timing(slideAnim, {
      toValue: newIndex > currentIndex ? 50 : -50,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(sportId);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const StatCard = ({ icon, value, label, color, subtitle }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ProgressBar = ({ percentage, color, label, value }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[
          styles.progressBarFill, 
          { width: `${percentage}%`, backgroundColor: color }
        ]} />
      </View>
    </View>
  );

  const ActionButton = ({ icon, label, active, onPress, color = colors.primary }) => (
    <TouchableOpacity 
      style={[
        styles.actionButton, 
        active && { backgroundColor: color + '20' }
      ]}
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={active ? color : colors.textSecondary} 
      />
      <Text style={[
        styles.actionButtonText,
        { color: active ? color : colors.textSecondary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Statistiques</Text>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Onglets sports */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {sports.map((sport) => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.tab,
                activeTab === sport.id && { backgroundColor: sport.color + '20' }
              ]}
              onPress={() => changeTab(sport.id)}
            >
              <MaterialIcons 
                name={sport.icon} 
                size={20} 
                color={activeTab === sport.id ? sport.color : colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === sport.id ? sport.color : colors.textSecondary }
              ]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView}>
        <Animated.View style={[
          styles.content,
          { transform: [{ translateX: slideAnim }] }
        ]}>
          {/* Boutons d'action */}
          <View style={styles.actionsContainer}>
            <ActionButton
              icon="bar-chart"
              label="Stats"
              active={true}
              color={currentSport.color}
            />
            <ActionButton
              icon="star"
              label="Avis"
              active={false}
              color={currentSport.color}
            />
            <ActionButton
              icon="trophy"
              label="Succès"
              active={false}
              color={currentSport.color}
            />
          </View>

          {/* Cartes principales */}
          <View style={styles.mainStatsContainer}>
            <Text style={styles.sectionTitle}>Statistiques générales</Text>
            <View style={styles.statsGrid}>
              <StatCard 
                icon="calendar"
                value={currentSport.stats.matchesPlayed}
                label="Matchs joués"
                color={currentSport.color}
              />
              <StatCard 
                icon="trophy"
                value={currentSport.stats.matchesWon}
                label="Matchs gagnés"
                color="#4CAF50"
              />
              <StatCard 
                icon="star"
                value={currentSport.stats.averageRating}
                label="Note moyenne"
                color="#FFC107"
              />
              <StatCard 
                icon="trending-up"
                value={`${currentSport.stats.winRate}%`}
                label="Taux de victoire"
                color="#FF6B6B"
              />
            </View>
          </View>

          {/* Statistiques spécifiques au sport */}
          <View style={styles.specificStatsContainer}>
            <Text style={styles.sectionTitle}>Performances détaillées</Text>
            
            {activeTab === 'football' && (
              <View style={styles.statsGrid}>
                <StatCard 
                  icon="football"
                  value={currentSport.stats.goals}
                  label="Buts marqués"
                  color="#4CAF50"
                />
                <StatCard 
                  icon="people"
                  value={currentSport.stats.assists}
                  label="Passes décisives"
                  color="#2196F3"
                />
              </View>
            )}

            {activeTab === 'basketball' && (
              <View style={styles.statsGrid}>
                <StatCard 
                  icon="basketball"
                  value={currentSport.stats.points}
                  label="Points marqués"
                  color="#FF9800"
                />
                <StatCard 
                  icon="refresh"
                  value={currentSport.stats.rebounds}
                  label="Rebonds"
                  color="#795548"
                />
              </View>
            )}

            {activeTab === 'tennis' && (
              <View style={styles.statsGrid}>
                <StatCard 
                  icon="tennisball"
                  value={currentSport.stats.sets}
                  label="Sets gagnés"
                  color="#2196F3"
                />
                <StatCard 
                  icon="flash"
                  value={currentSport.stats.aces}
                  label="Aces"
                  color="#FFC107"
                />
              </View>
            )}

            {activeTab === 'volleyball' && (
              <View style={styles.statsGrid}>
                <StatCard 
                  icon="arrow-up"
                  value={currentSport.stats.spikes}
                  label="Attaques"
                  color="#9C27B0"
                />
                <StatCard 
                  icon="shield"
                  value={currentSport.stats.blocks}
                  label="Blocs"
                  color="#607D8B"
                />
              </View>
            )}
          </View>

          {/* Progression */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Progression</Text>
            <View style={styles.progressCard}>
              <ProgressBar 
                percentage={currentSport.stats.winRate}
                color={currentSport.color}
                label="Taux de victoire"
                value={`${currentSport.stats.winRate}%`}
              />
              <ProgressBar 
                percentage={(currentSport.stats.averageRating / 5) * 100}
                color="#FFC107"
                label="Note moyenne"
                value={`${currentSport.stats.averageRating}/5`}
              />
              <ProgressBar 
                percentage={75}
                color="#4CAF50"
                label="Participation"
                value="75%"
              />
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerButton: {
    padding: 8,
  },

  // Tabs
  tabsContainer: {
    paddingBottom: 20,
  },
  tabsScrollContainer: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Stats
  mainStatsContainer: {
    marginBottom: 30,
  },
  specificStatsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Progress
  progressSection: {
    marginBottom: 30,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  bottomPadding: {
    height: 100,
  },
});

export default StatsScreen; 