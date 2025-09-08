import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';
import { RankingCard, LevelBadge } from '../components/LevelingSystem';
import { calculateLevel, getLevelTier } from '../utils/levelingSystem';

const RankingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [activeFilter, setActiveFilter] = useState('global');
  
  // Sample ranking data - this would come from your API
  const [rankingData, setRankingData] = useState([
    {
      id: 1,
      name: 'Alex Martin',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      xp: 4500,
      eventsOrganized: 28,
      eventsJoined: 45
    },
    {
      id: 2,
      name: 'Sophie Laurent',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      xp: 4200,
      eventsOrganized: 22,
      eventsJoined: 38
    },
    {
      id: 3,
      name: 'Marc Dubois',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      xp: 3950,
      eventsOrganized: 15,
      eventsJoined: 52
    },
    {
      id: 4,
      name: 'Julie Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      xp: 3850,
      eventsOrganized: 23,
      eventsJoined: 67
    },
    {
      id: 5,
      name: 'Pierre Martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      xp: 3600,
      eventsOrganized: 18,
      eventsJoined: 42
    }
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const filters = [
    { key: 'global', label: 'Global', icon: 'globe-outline' },
    { key: 'weekly', label: 'Semaine', icon: 'calendar-outline' },
    { key: 'monthly', label: 'Mois', icon: 'calendar' },
    { key: 'sport', label: 'Par Sport', icon: 'trophy-outline' }
  ];

  const currentUserRank = rankingData.findIndex(u => u.name === 'Alex Martin') + 1;

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Fixed Header */}
      <View className="bg-slate-900 px-6 pt-6 pb-4 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="trophy" size={24} color="#ffffff" />
            </LinearGradient>
            <Text className="text-white text-2xl font-bold">Classement</Text>
          </View>
          
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <TouchableOpacity className="w-11 h-11 bg-slate-800 border border-slate-700/50 rounded-xl items-center justify-center">
              <Ionicons name="search" size={20} color="#ffffff" />
            </TouchableOpacity>
            <GlobalMenu navigation={navigation} currentRoute="Ranking" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View 
          className="px-6 pt-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })}]
          }}
        >
          {/* Your Rank Card */}
          <View className="mb-6">
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={{
                borderRadius: 16,
                padding: 20,
                shadowColor: '#06b6d4',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text className="text-white text-lg font-bold mb-4">Votre Position</Text>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mr-4">
                    <Text className="text-white text-2xl font-bold">#{currentUserRank}</Text>
                  </View>
                  <View>
                    <Text className="text-white text-xl font-bold">Alex Martin</Text>
                    <Text className="text-cyan-100 text-sm">3,850 XP • Niveau 12</Text>
                  </View>
                </View>
                
                <LevelBadge xp={3850} size="large" />
              </View>
            </LinearGradient>
          </View>

          {/* Filter Tabs */}
          <View className="flex-row justify-between mb-6" style={{ gap: 8 }}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                className={`flex-1 rounded-xl py-3 flex-row items-center justify-center ${
                  activeFilter === filter.key ? 'bg-cyan-500' : 'bg-slate-800 border border-slate-700'
                }`}
                onPress={() => setActiveFilter(filter.key)}
                style={{
                  shadowColor: activeFilter === filter.key ? '#06b6d4' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: activeFilter === filter.key ? 0.3 : 0.1,
                  shadowRadius: 4,
                  elevation: activeFilter === filter.key ? 4 : 2,
                }}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={16} 
                  color={activeFilter === filter.key ? "#ffffff" : "#64748b"}
                  style={{ marginRight: 6 }}
                />
                <Text className={`text-sm font-medium ${
                  activeFilter === filter.key ? 'text-white' : 'text-slate-300'
                }`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Top 3 Podium */}
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-4">Top 3 du Classement</Text>
            
            <View className="flex-row items-end justify-center mb-6" style={{ gap: 12 }}>
              {/* 2nd Place */}
              <View className="items-center flex-1">
                <View className="w-16 h-16 rounded-full overflow-hidden mb-2">
                  <Image 
                    source={{ uri: rankingData[1]?.avatar }} 
                    className="w-full h-full"
                  />
                </View>
                <View className="w-12 h-16 bg-slate-600 rounded-t-xl items-center justify-center">
                  <Ionicons name="medal" size={20} color="#c0c0c0" />
                  <Text className="text-white text-xs font-bold">2</Text>
                </View>
                <Text className="text-white text-sm font-medium mt-2 text-center">
                  {rankingData[1]?.name}
                </Text>
                <Text className="text-slate-400 text-xs">
                  {rankingData[1]?.xp} XP
                </Text>
              </View>

              {/* 1st Place */}
              <View className="items-center flex-1">
                <View className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-yellow-400">
                  <Image 
                    source={{ uri: rankingData[0]?.avatar }} 
                    className="w-full h-full"
                  />
                </View>
                <View className="w-16 h-20 bg-yellow-500 rounded-t-xl items-center justify-center">
                  <Ionicons name="trophy" size={24} color="#ffffff" />
                  <Text className="text-white text-sm font-bold">1</Text>
                </View>
                <Text className="text-white text-base font-bold mt-2 text-center">
                  {rankingData[0]?.name}
                </Text>
                <Text className="text-yellow-400 text-sm font-medium">
                  {rankingData[0]?.xp} XP
                </Text>
              </View>

              {/* 3rd Place */}
              <View className="items-center flex-1">
                <View className="w-16 h-16 rounded-full overflow-hidden mb-2">
                  <Image 
                    source={{ uri: rankingData[2]?.avatar }} 
                    className="w-full h-full"
                  />
                </View>
                <View className="w-12 h-12 bg-orange-600 rounded-t-xl items-center justify-center">
                  <Ionicons name="medal" size={18} color="#cd7f32" />
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
                <Text className="text-white text-sm font-medium mt-2 text-center">
                  {rankingData[2]?.name}
                </Text>
                <Text className="text-slate-400 text-xs">
                  {rankingData[2]?.xp} XP
                </Text>
              </View>
            </View>
          </View>

          {/* Full Ranking List */}
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Classement Complet</Text>
            
            {rankingData.map((user, index) => (
              <RankingCard
                key={user._id || user.id}
                rank={index + 1}
                user={user}
                currentUserId={4} // Alex Martin's ID
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RankingScreen;

