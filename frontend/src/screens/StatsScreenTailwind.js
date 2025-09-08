import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const StatsScreenTailwind = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('football');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const sports = [
    { 
      id: 'football', 
      name: 'Football', 
      icon: 'sports-soccer', 
      color: '#10B981',
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
      color: '#F59E0B',
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
      color: '#3B82F6',
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
      color: '#8B5CF6',
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

  const currentSport = sports.find(s => s.key === activeTab);

  const StatCard = ({ title, value, icon, color, subtitle = null }) => (
    <View className="bg-dark-800 rounded-2xl p-4 mb-4" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
      <View className="flex-row items-center mb-2">
        <MaterialIcons name={icon} size={24} color={color} />
        <Text className="text-dark-200 text-sm font-medium ml-2 flex-1">{title}</Text>
      </View>
      <Text className="text-white text-3xl font-bold" style={{ color }}>
        {value}
      </Text>
      {subtitle && (
        <Text className="text-dark-400 text-xs mt-1">{subtitle}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <LinearGradient
        colors={['#20B2AA', '#1a9b94', '#0f172a']}
        className="pb-4"
      >
        <View className="flex-row justify-between items-center px-6 pt-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Statistiques</Text>
          <View className="w-6" />
        </View>
      </LinearGradient>

      {/* Sport Tabs */}
      <Animated.View 
        className="px-6 py-4"
        style={{ opacity: fadeAnim }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport.key || sport.id}
                className={`flex-row items-center px-4 py-3 rounded-2xl mr-3 ${
                  activeTab === (sport.key || sport.id) 
                    ? 'border-2' 
                    : 'bg-dark-800 border border-dark-600'
                }`}
                style={{
                  backgroundColor: activeTab === (sport.key || sport.id) ? sport.color + '20' : undefined,
                  borderColor: activeTab === (sport.key || sport.id) ? sport.color : undefined
                }}
                onPress={() => setActiveTab(sport.key || sport.id)}
              >
                <MaterialIcons 
                  name={sport.icon} 
                  size={20} 
                  color={activeTab === (sport.key || sport.id) ? sport.color : '#64748b'} 
                />
                <Text className={`ml-2 font-medium ${
                  activeTab === (sport.key || sport.id) ? 'text-white' : 'text-dark-300'
                }`}>
                  {sport.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Stats Content */}
      <Animated.View 
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Overview Stats */}
          <Text className="text-white text-lg font-bold mb-4">Performance générale</Text>
          
          <View className="flex-row justify-between mb-6">
            <StatCard
              title="Matchs joués"
              value={currentSport.stats.matchesPlayed}
              icon="sports-soccer"
              color={currentSport.color}
            />
            <View className="w-2" />
            <StatCard
              title="Victoires"
              value={currentSport.stats.matchesWon}
              icon="emoji-events"
              color="#FFD700"
            />
          </View>

          <View className="flex-row justify-between mb-6">
            <StatCard
              title="Taux de victoire"
              value={`${currentSport.stats.winRate}%`}
              icon="trending-up"
              color="#10B981"
            />
            <View className="w-2" />
            <StatCard
              title="Note moyenne"
              value={currentSport.stats.averageRating.toFixed(1)}
              icon="star"
              color="#F59E0B"
              subtitle="sur 5 étoiles"
            />
          </View>

          {/* Sport-specific Stats */}
          <Text className="text-white text-lg font-bold mb-4">Statistiques détaillées</Text>
          
          {activeTab === 'football' && (
            <View className="flex-row justify-between mb-6">
              <StatCard
                title="Buts marqués"
                value={currentSport.stats.goals}
                icon="sports-soccer"
                color="#10B981"
              />
              <View className="w-2" />
              <StatCard
                title="Passes décisives"
                value={currentSport.stats.assists}
                icon="sports-handball"
                color="#3B82F6"
              />
            </View>
          )}

          {activeTab === 'basketball' && (
            <View className="flex-row justify-between mb-6">
              <StatCard
                title="Points marqués"
                value={currentSport.stats.points}
                icon="sports-basketball"
                color="#F59E0B"
              />
              <View className="w-2" />
              <StatCard
                title="Rebonds"
                value={currentSport.stats.rebounds}
                icon="sports-basketball"
                color="#8B5CF6"
              />
            </View>
          )}

          {activeTab === 'tennis' && (
            <View className="flex-row justify-between mb-6">
              <StatCard
                title="Sets gagnés"
                value={currentSport.stats.sets}
                icon="sports-tennis"
                color="#3B82F6"
              />
              <View className="w-2" />
              <StatCard
                title="Aces"
                value={currentSport.stats.aces}
                icon="sports-tennis"
                color="#EF4444"
              />
            </View>
          )}

          {activeTab === 'volleyball' && (
            <View className="flex-row justify-between mb-6">
              <StatCard
                title="Attaques"
                value={currentSport.stats.spikes}
                icon="sports-volleyball"
                color="#8B5CF6"
              />
              <View className="w-2" />
              <StatCard
                title="Contres"
                value={currentSport.stats.blocks}
                icon="sports-volleyball"
                color="#EF4444"
              />
            </View>
          )}

          {/* Progress Chart Placeholder */}
          <View className="bg-dark-800 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Progression</Text>
            <View className="bg-dark-700 rounded-xl p-8 items-center justify-center">
              <Ionicons name="bar-chart-outline" size={48} color="#64748b" />
              <Text className="text-dark-400 text-sm mt-2">Graphique à venir</Text>
            </View>
          </View>

          <View className="h-6" />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default StatsScreenTailwind;
