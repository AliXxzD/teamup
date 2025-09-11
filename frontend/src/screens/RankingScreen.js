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
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';
import { RankingCard, LevelBadge } from '../components/LevelingSystem';
import { calculateLevel, getLevelTier } from '../utils/levelingSystem';
import Avatar from '../components/Avatar';
import rankingService from '../services/rankingService';

const RankingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [activeFilter, setActiveFilter] = useState('global');
  
  // États pour les données de classement
  const [rankingData, setRankingData] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    loadRankingData();
  }, [activeFilter]);

  const loadRankingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement du classement:', activeFilter);
      
      const result = await rankingService.getRankingByFilter(activeFilter);
      
      if (result.success) {
        console.log('✅ Classement chargé:', result.data.ranking?.length || 0, 'utilisateurs');
        setRankingData(result.data.ranking || []);
        setCurrentUserData(result.data.currentUser || null);
      } else {
        console.error('❌ Erreur chargement classement:', result.error);
        setError(result.error);
        setRankingData([]);
        setCurrentUserData(null);
      }
    } catch (error) {
      console.error('❌ Erreur loadRankingData:', error);
      setError('Erreur lors du chargement du classement');
      setRankingData([]);
      setCurrentUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRankingData();
    setRefreshing(false);
  };

  const filters = [
    { key: 'global', label: 'Global', icon: 'globe-outline' },
    { key: 'weekly', label: 'Semaine', icon: 'calendar-outline' },
    { key: 'monthly', label: 'Mois', icon: 'calendar' }
  ];

  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Fixed Header */}
      <View className="bg-slate-900 px-6 pt-6 pb-4 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            {/* Bouton retour */}
            <TouchableOpacity
              className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center mr-3"
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
            
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
          
          <View className="flex-row items-center">
            <GlobalMenu navigation={navigation} currentRoute="Ranking" />
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#06b6d4"
            colors={['#06b6d4']}
          />
        }
      >
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
          {currentUserData && (
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
                      <Text className="text-white text-2xl font-bold">#{currentUserData.rank}</Text>
                    </View>
                    <View>
                      <Text className="text-white text-xl font-bold">{currentUserData.name}</Text>
                      <Text className="text-cyan-100 text-sm">
                        {currentUserData.points.toLocaleString()} pts • Niveau {currentUserData.level}
                      </Text>
                    </View>
                  </View>
                  
                  <LevelBadge xp={currentUserData.points} size="large" />
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Filter Tabs */}
          <View className="flex-row justify-between mb-6" style={{ gap: 8 }}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                className={`flex-1 rounded-xl py-3 flex-row items-center justify-center ${
                  activeFilter === filter.key ? 'bg-cyan-500' : 'bg-slate-800 border border-slate-700'
                }`}
                onPress={() => handleFilterChange(filter.key)}
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
          {rankingData.length >= 3 && (
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-4">Top 3 du Classement</Text>
              
              <View className="flex-row items-end justify-center mb-6" style={{ gap: 12 }}>
                {/* 2nd Place */}
                <View className="items-center flex-1">
                  <Avatar
                    name={rankingData[1]?.name}
                    imageUri={rankingData[1]?.avatar}
                    size={64}
                    style={{ marginBottom: 8 }}
                  />
                  <View className="w-12 h-16 bg-slate-600 rounded-t-xl items-center justify-center">
                    <Ionicons name="medal" size={20} color="#c0c0c0" />
                    <Text className="text-white text-xs font-bold">2</Text>
                  </View>
                  <Text className="text-white text-sm font-medium mt-2 text-center">
                    {rankingData[1]?.name}
                  </Text>
                  <Text className="text-slate-400 text-xs">
                    {rankingData[1]?.points?.toLocaleString()} pts
                  </Text>
                </View>

                {/* 1st Place */}
                <View className="items-center flex-1">
                  <Avatar
                    name={rankingData[0]?.name}
                    imageUri={rankingData[0]?.avatar}
                    size={80}
                    showBorder={true}
                    borderColor="#fbbf24"
                    borderWidth={2}
                    style={{ marginBottom: 8 }}
                  />
                  <View className="w-16 h-20 bg-yellow-500 rounded-t-xl items-center justify-center">
                    <Ionicons name="trophy" size={24} color="#ffffff" />
                    <Text className="text-white text-sm font-bold">1</Text>
                  </View>
                  <Text className="text-white text-base font-bold mt-2 text-center">
                    {rankingData[0]?.name}
                  </Text>
                  <Text className="text-yellow-400 text-sm font-medium">
                    {rankingData[0]?.points?.toLocaleString()} pts
                  </Text>
                </View>

                {/* 3rd Place */}
                <View className="items-center flex-1">
                  <Avatar
                    name={rankingData[2]?.name}
                    imageUri={rankingData[2]?.avatar}
                    size={64}
                    style={{ marginBottom: 8 }}
                  />
                  <View className="w-12 h-12 bg-orange-600 rounded-t-xl items-center justify-center">
                    <Ionicons name="medal" size={18} color="#cd7f32" />
                    <Text className="text-white text-xs font-bold">3</Text>
                  </View>
                  <Text className="text-white text-sm font-medium mt-2 text-center">
                    {rankingData[2]?.name}
                  </Text>
                  <Text className="text-slate-400 text-xs">
                    {rankingData[2]?.points?.toLocaleString()} pts
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#06b6d4" />
              <Text className="text-white text-lg font-medium mt-4">Chargement du classement...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-20 h-20 bg-red-500/20 rounded-full items-center justify-center mb-6">
                <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
              </View>
              <Text className="text-white text-xl font-bold mb-2">Erreur de chargement</Text>
              <Text className="text-slate-400 text-center text-base mb-8 leading-6">
                {error}
              </Text>
              <TouchableOpacity 
                className="bg-cyan-500 rounded-xl py-4 px-8"
                onPress={loadRankingData}
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg font-bold">Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && rankingData.length === 0 && (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-20 h-20 bg-slate-800 rounded-full items-center justify-center mb-6">
                <Ionicons name="trophy-outline" size={40} color="#64748b" />
              </View>
              <Text className="text-white text-xl font-bold mb-2">Aucun classement disponible</Text>
              <Text className="text-slate-400 text-center text-base leading-6">
                Il n'y a pas encore de données de classement pour ce filtre.
              </Text>
            </View>
          )}

          {/* Full Ranking List */}
          {!loading && !error && rankingData.length > 0 && (
            <View className="mb-8">
              <Text className="text-white text-xl font-bold mb-4">Classement Complet</Text>
              
              {rankingData.map((user, index) => (
                <RankingCard
                  key={user._id || user.id || index}
                  rank={user.rank || index + 1}
                  user={user}
                  currentUserId={user?._id || user?.id}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RankingScreen;

