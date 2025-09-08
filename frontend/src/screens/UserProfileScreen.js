import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Share,
  Alert,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserStatsCard from '../components/UserStatsCard';
import { AchievementsList } from '../components/AchievementCard';
import pointsService from '../services/pointsService';
import { LevelBadge, XPProgressBar, AchievementCard } from '../components/LevelingSystem';
import { 
  calculateLevel, 
  getAllAchievementsWithStatus, 
  getLevelTier 
} from '../utils/levelingSystem';

const { width } = Dimensions.get('window');

const UserProfileScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { userId } = route.params || {};
  const isOwnProfile = !userId || userId === (user?._id || user?.id);
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Stats');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [userData, setUserData] = useState(null);
  const [userProgression, setUserProgression] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Initialiser les données utilisateur
    loadUserData();
    loadUserProgression();
    
    // Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user, userId]); // Recharger quand l'utilisateur ou l'userId change

  const loadUserProgression = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 Chargement des statistiques utilisateur pour le profil...');
      
      const result = await pointsService.calculateUserProgression();
      
      if (result.success) {
        setUserProgression(result.data);
        console.log('✅ Statistiques profil chargées:', result.data);
      } else {
        // Ne pas afficher d'erreur si l'utilisateur est déconnecté
        if (!result.isLoggedOut) {
          console.error('❌ Erreur chargement statistiques profil:', result.error);
        } else {
          console.log('ℹ️ Utilisateur déconnecté, arrêt du chargement de stats');
          setUserProgression(null);
        }
      }
    } catch (error) {
      console.error('❌ Erreur loadUserProgression profil:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (isOwnProfile && user) {
        // Récupérer les statistiques à jour depuis l'API
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (accessToken) {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000'}/api/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              }
            });
            
            if (response.ok) {
              const profileData = await response.json();
              console.log('📊 Données profil récupérées:', profileData);
              
              // Utiliser les données à jour du backend
              const updatedUser = profileData.data || user;
              
              const defaultUserData = {
                name: updatedUser.name || 'Utilisateur',
                username: updatedUser.email ? `@${updatedUser.email.split('@')[0]}` : '@utilisateur',
                location: typeof updatedUser.location === 'string' ? updatedUser.location : (updatedUser.location?.address || updatedUser.location?.city || 'France'),
                joinDate: updatedUser.createdAt ? `Depuis ${new Date(updatedUser.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}` : 'Récemment',
                bio: updatedUser.bio || updatedUser.profile?.bio || 'Passionné de sport depuis toujours ! J\'organise régulièrement des événements sportifs et j\'adore découvrir de nouveaux sports. Toujours partant pour une bonne session ! ⚽ 🏀 🏸',
                stats: {
                  followers: updatedUser.followers || 0,
                  following: updatedUser.following || 0,
                  points: updatedUser.points || updatedUser.profile?.points || 0
                },
                sports: updatedUser.sports || updatedUser.profile?.favoritesSports || ['Football', 'Basketball', 'Tennis'],
                // Leveling system data
                xp: updatedUser.xp || updatedUser.profile?.xp || 0,
                level: calculateLevel(updatedUser.xp || updatedUser.profile?.xp || 0),
                userStats: {
                  eventsOrganized: updatedUser.profile?.stats?.eventsOrganized || updatedUser.eventsOrganized || 0,
                  eventsJoined: updatedUser.profile?.stats?.eventsJoined || updatedUser.eventsJoined || 0,
                  averageRating: updatedUser.profile?.stats?.averageRating || updatedUser.averageRating || 0,
                  totalReviews: updatedUser.profile?.stats?.totalRatings || updatedUser.totalReviews || 0,
                  followers: updatedUser.followers || 0,
                  sportEvents: updatedUser.sportEvents || {
                    football: 0,
                    basketball: 0,
                    tennis: 0,
                    volleyball: 0
                  },
                  earlyEvents: updatedUser.earlyEvents || 0,
                  weekendEvents: updatedUser.weekendEvents || 0,
                  monthlyRank: updatedUser.monthlyRank || 0,
                  maxStreak: updatedUser.maxStreak || 0
                },
                profileImage: updatedUser.profile?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                backgroundImage: updatedUser.profile?.backgroundImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
              };
              
              setUserData(defaultUserData);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.log('⚠️ Erreur API, utilisation des données locales:', apiError);
        }
        
        // Fallback vers les données du contexte si l'API échoue
        const defaultUserData = {
          name: user.name || 'Utilisateur',
          username: user.email ? `@${user.email.split('@')[0]}` : '@utilisateur',
          location: typeof user.location === 'string' ? user.location : (user.location?.address || user.location?.city || 'France'),
          joinDate: user.createdAt ? `Depuis ${new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}` : 'Récemment',
          bio: user.bio || 'Passionné de sport depuis toujours ! J\'organise régulièrement des événements sportifs et j\'adore découvrir de nouveaux sports. Toujours partant pour une bonne session ! ⚽ 🏀 🏸',
          stats: {
            followers: user.followers || 0,
            following: user.following || 0,
            points: user.points || 0
          },
          sports: user.sports || ['Football', 'Basketball', 'Tennis'],
          // Leveling system data
          xp: user.xp || 0,
          level: calculateLevel(user.xp || 0),
          userStats: {
            eventsOrganized: user.profile?.stats?.eventsOrganized || user.eventsOrganized || 0,
            eventsJoined: user.profile?.stats?.eventsJoined || user.eventsJoined || 0,
            averageRating: user.profile?.stats?.averageRating || user.averageRating || 0,
            totalReviews: user.profile?.stats?.totalRatings || user.totalReviews || 0,
            followers: user.followers || 0,
            sportEvents: user.sportEvents || {
              football: 0,
              basketball: 0,
              tennis: 0,
              volleyball: 0
            },
            earlyEvents: user.earlyEvents || 0,
            weekendEvents: user.weekendEvents || 0,
            monthlyRank: user.monthlyRank || 0,
            maxStreak: user.maxStreak || 0
          },
          profileImage: user.profile?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          backgroundImage: user.profile?.backgroundImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        };
        
        setUserData(defaultUserData);
      } else if (userId) {
        // Pour un autre utilisateur, charger depuis l'API
        // TODO: Implémenter l'appel API pour charger le profil d'un autre utilisateur
        console.log('Chargement du profil utilisateur:', userId);
        // Pour l'instant, utiliser des données par défaut
        setUserData({
          name: 'Utilisateur',
          username: '@utilisateur',
          location: 'France',
          joinDate: 'Récemment',
          bio: 'Profil utilisateur',
          stats: { followers: 0, following: 0, points: 0 },
          sports: ['Football'],
          xp: 0,
          level: 1,
          userStats: {
            eventsOrganized: 0,
            eventsJoined: 0,
            averageRating: 0,
            totalReviews: 0,
            followers: 0,
            sportEvents: { football: 0, basketball: 0, tennis: 0, volleyball: 0 },
            earlyEvents: 0,
            weekendEvents: 0,
            monthlyRank: 0,
            maxStreak: 0
          },
          profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          backgroundImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez le profil de ${userData?.name || 'un utilisateur'} sur TeamUp !`,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const StatItem = ({ number, label }) => (
    <View className="items-center">
      <Text className="text-white text-2xl font-bold">{number}</Text>
      <Text className="text-slate-400 text-sm">{label}</Text>
    </View>
  );

  const SportTag = ({ sport, index }) => (
    <TouchableOpacity 
      className="bg-cyan-500/20 border border-cyan-400/30 rounded-xl px-4 py-2 mr-3 mb-3"
      style={{
        shadowColor: '#06b6d4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
      activeOpacity={0.8}
      onPress={() => Alert.alert('Sport', `Voir les événements de ${sport}`)}
    >
      <Text className="text-cyan-400 text-sm font-medium">{sport}</Text>
    </TouchableOpacity>
  );

  if (loading || !userData) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text className="text-white mt-4">Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Fixed Header */}
      <View className="bg-slate-900 px-6 pt-6 pb-4 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          {/* Logo and App Name */}
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
              <Ionicons name="people" size={24} color="#ffffff" />
            </LinearGradient>
            <Text className="text-white text-2xl font-bold">TEAMUP</Text>
          </View>
          
          {/* Menu and Actions */}
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <TouchableOpacity className="w-11 h-11 bg-slate-800 border border-slate-700/50 rounded-xl items-center justify-center">
              <Ionicons name="search" size={20} color="#ffffff" />
            </TouchableOpacity>
            <GlobalMenu navigation={navigation} currentRoute="Profile" />
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([
                loadUserData(),
                loadUserProgression()
              ]);
              setRefreshing(false);
            }} 
          />
        }
      >
        {/* Header with Background Image - Smaller */}
        <View style={{ height: 200, position: 'relative' }}>
      <ImageBackground 
        source={{ uri: userData.backgroundImage }}
            style={{ flex: 1 }}
            imageStyle={{ opacity: 0.8 }}
      >
        <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
              style={{ flex: 1, justifyContent: 'flex-start', padding: 24 }}
        >
              {/* Navigation Buttons */}
              <View className="flex-row items-center justify-between">
            <TouchableOpacity 
                  className="w-11 h-11 bg-black/30 rounded-xl items-center justify-center"
              onPress={() => navigation.goBack()}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <TouchableOpacity 
                    className="w-11 h-11 bg-black/30 rounded-xl items-center justify-center"
                    onPress={handleShare}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <Ionicons name="share-outline" size={20} color="white" />
              </TouchableOpacity>
              
                  <TouchableOpacity 
                    className="w-11 h-11 bg-black/30 rounded-xl items-center justify-center"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
        </View>

        {/* Profile Image Section - Between background and content */}
        <Animated.View 
          className="bg-slate-900 px-6 pt-6 pb-4 relative"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View className="flex-row items-end justify-between">
            {/* Profile Image */}
            <Animated.View 
              className="relative -mt-12"
              style={{
                transform: [{ scale: scaleAnim }]
              }}
            >
              <TouchableOpacity activeOpacity={0.9}>
                <Image
                  source={{ uri: userData.profileImage }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    borderWidth: 4,
                    borderColor: '#ffffff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 15,
                  }}
                />
              </TouchableOpacity>
              <Animated.View 
                className="absolute -bottom-1 -right-1 rounded-full items-center justify-center border-4 border-white"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: userProgression 
                    ? pointsService.getLevelColor(userProgression.level)
                    : '#06b6d4',
                  shadowColor: userProgression 
                    ? pointsService.getLevelColor(userProgression.level)
                    : '#06b6d4',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 10,
                  transform: [{ scale: scaleAnim }]
                }}
              >
                <Text className="text-white text-sm font-bold">
                  {userProgression ? userProgression.level : (userData?.level || 1)}
                </Text>
              </Animated.View>
            </Animated.View>

            {/* Edit Button */}
              <TouchableOpacity 
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 flex-row items-center mb-4"
              onPress={() => Alert.alert('Éditer', 'Fonction d\'édition en cours de développement')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={16} color="#64748b" style={{ marginRight: 6 }} />
              <Text className="text-slate-300 text-sm font-medium">Éditer</Text>
              </TouchableOpacity>
          </View>
          
          {/* Name and Info */}
          <Animated.View 
            className="mt-4"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text className="text-white text-2xl font-bold mb-1">{userData.name}</Text>
            <Text className="text-slate-400 text-base mb-2">{userData.username}</Text>
            
            <View className="flex-row items-center mb-4">
              <Ionicons name="location-outline" size={16} color="#64748b" style={{ marginRight: 6 }} />
              <Text className="text-slate-400 text-sm mr-4">{userData.location}</Text>
              <Text className="text-slate-400 text-sm">{userData.joinDate}</Text>
            </View>

            {/* Level and Points Summary */}
            <View className="flex-row items-center justify-center mb-4">
              <View className="bg-slate-800/60 border border-slate-700/50 rounded-full px-4 py-2 flex-row items-center">
                <View 
                  className="w-6 h-6 rounded-full items-center justify-center mr-2"
                  style={{ 
                    backgroundColor: userProgression 
                      ? pointsService.getLevelColor(userProgression.level)
                      : '#06b6d4'
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    {userProgression ? userProgression.level : (userData?.level || 1)}
                  </Text>
                </View>
                <Text className="text-white text-sm font-semibold mr-3">
                  {userProgression 
                    ? pointsService.getLevelTitle(userProgression.level)
                    : 'Débutant'
                  }
                </Text>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text className="text-white text-sm font-semibold ml-1">
                  {userProgression ? userProgression.points : (userData?.stats?.points || 0)}
                </Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Profile Content Section */}
        <Animated.View 
          className="bg-slate-900 px-6 relative"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >

          {/* Bio */}
          <Animated.View 
            className="mb-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text className="text-slate-300 text-base leading-6">
              {userData.bio}
            </Text>
          </Animated.View>

          {/* Social Stats (Simplified) */}
          <Animated.View 
            className="flex-row justify-center items-center mb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <TouchableOpacity 
              className="items-center flex-1"
              activeOpacity={0.8}
            >
              <Text className="text-white text-2xl font-bold">{userData?.stats?.followers || 0}</Text>
              <Text className="text-slate-400 text-sm">Abonnés</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center flex-1"
              activeOpacity={0.8}
            >
              <Text className="text-white text-2xl font-bold">{userData?.stats?.following || 0}</Text>
              <Text className="text-slate-400 text-sm">Abonnements</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Sports Tags */}
          <Animated.View 
            className="mb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="flex-row flex-wrap">
              {userData.sports.map((sport, index) => (
                <SportTag key={index} sport={sport} index={index} />
              ))}
        </View>
          </Animated.View>

          {/* Tab Navigation */}
          <Animated.View 
            className="flex-row justify-between mb-8" 
            style={{ 
              gap: 8,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
              <TouchableOpacity 
              className={`flex-1 rounded-xl py-3 flex-row items-center justify-center ${
                activeTab === 'Stats' ? 'bg-cyan-500' : 'bg-slate-800 border border-slate-700'
              }`}
              onPress={() => handleTabPress('Stats')}
              style={{
                shadowColor: activeTab === 'Stats' ? '#06b6d4' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: activeTab === 'Stats' ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: activeTab === 'Stats' ? 6 : 2,
              }}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="stats-chart" 
                size={18} 
                color={activeTab === 'Stats' ? "#ffffff" : "#64748b"} 
                style={{ marginRight: 6 }} 
              />
              <Text className={`text-sm font-medium ${
                activeTab === 'Stats' ? 'text-white font-bold' : 'text-slate-300'
              }`}>Stats</Text>
              </TouchableOpacity>

            <TouchableOpacity 
              className={`flex-1 rounded-xl py-3 flex-row items-center justify-center ${
                activeTab === 'Avis' ? 'bg-cyan-500' : 'bg-slate-800 border border-slate-700'
              }`}
              onPress={() => handleTabPress('Avis')}
              style={{
                shadowColor: activeTab === 'Avis' ? '#06b6d4' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: activeTab === 'Avis' ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: activeTab === 'Avis' ? 6 : 2,
              }}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="star-outline" 
                size={18} 
                color={activeTab === 'Avis' ? "#ffffff" : "#64748b"} 
                style={{ marginRight: 6 }} 
              />
              <Text className={`text-sm font-medium ${
                activeTab === 'Avis' ? 'text-white font-bold' : 'text-slate-300'
              }`}>Avis</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className={`flex-1 rounded-xl py-3 flex-row items-center justify-center ${
                activeTab === 'Succès' ? 'bg-cyan-500' : 'bg-slate-800 border border-slate-700'
              }`}
              onPress={() => handleTabPress('Succès')}
              style={{
                shadowColor: activeTab === 'Succès' ? '#06b6d4' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: activeTab === 'Succès' ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: activeTab === 'Succès' ? 6 : 2,
              }}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="trophy-outline" 
                size={18} 
                color={activeTab === 'Succès' ? "#ffffff" : "#64748b"} 
                style={{ marginRight: 6 }} 
              />
              <Text className={`text-sm font-medium ${
                activeTab === 'Succès' ? 'text-white font-bold' : 'text-slate-300'
              }`}>Succès</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Tab Content */}
          {activeTab === 'Stats' && (
            <View className="mb-8">
              {userProgression ? (
                <>
                  {/* Real Statistics Grid */}
                  <View className="flex-row justify-between mb-4" style={{ gap: 12 }}>
                    {/* Événements organisés */}
                    <View className="flex-1 bg-slate-800 border border-slate-700/50 rounded-2xl p-6 items-center">
                      <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mb-4">
                        <Ionicons name="calendar" size={24} color="#22c55e" />
                      </View>
                      <Text className="text-white text-3xl font-bold mb-2">
                        {userProgression.stats.eventsOrganized}
                      </Text>
                      <Text className="text-slate-400 text-sm text-center leading-5">
                        Événements{'\n'}organisés
                      </Text>
                    </View>
            
                    {/* Événements rejoints */}
                    <View className="flex-1 bg-slate-800 border border-slate-700/50 rounded-2xl p-6 items-center">
                      <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mb-4">
                        <Ionicons name="people" size={24} color="#3b82f6" />
                      </View>
                      <Text className="text-white text-3xl font-bold mb-2">
                        {userProgression.stats.eventsJoined}
                      </Text>
                      <Text className="text-slate-400 text-sm text-center leading-5">
                        Événements{'\n'}rejoints
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between mb-6" style={{ gap: 12 }}>
                    {/* Note moyenne */}
                    <View className="flex-1 bg-slate-800 border border-slate-700/50 rounded-2xl p-6 items-center">
                      <View className="w-12 h-12 bg-yellow-500/20 rounded-xl items-center justify-center mb-4">
                        <Ionicons name="star" size={24} color="#f59e0b" />
                      </View>
                      <Text className="text-white text-3xl font-bold mb-2">
                        {userProgression.stats.averageRating > 0 
                          ? userProgression.stats.averageRating.toFixed(1) 
                          : '0.0'
                        }
                      </Text>
                      <Text className="text-slate-400 text-sm text-center">
                        Note moyenne
                      </Text>
                    </View>

                    {/* Points totaux */}
                    <View className="flex-1 bg-slate-800 border border-slate-700/50 rounded-2xl p-6 items-center">
                      <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center mb-4">
                        <Ionicons name="trophy" size={24} color="#8b5cf6" />
                      </View>
                      <Text className="text-white text-3xl font-bold mb-2">
                        {userProgression.points}
                      </Text>
                      <Text className="text-slate-400 text-sm text-center">
                        Points totaux
                      </Text>
                    </View>
                  </View>

                  {/* Additional Stats */}
                  <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
                    <Text className="text-white text-lg font-bold mb-4">📊 Détails</Text>
                    
                    <View style={{ gap: 16 }}>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-slate-300 text-base">Niveau actuel</Text>
                        <Text className="text-white text-base font-bold">
                          {userProgression.level} ({pointsService.getLevelTitle(userProgression.level)})
                        </Text>
                      </View>
                      
                      <View className="flex-row justify-between items-center">
                        <Text className="text-slate-300 text-base">Évaluations reçues</Text>
                        <Text className="text-white text-base font-bold">
                          {userProgression.stats.totalRatings}
                        </Text>
                      </View>
                      
                      <View className="flex-row justify-between items-center">
                        <Text className="text-slate-300 text-base">Email vérifié</Text>
                        <View className="flex-row items-center">
                          <Ionicons 
                            name={userProgression.stats.isEmailVerified ? "checkmark-circle" : "close-circle"} 
                            size={16} 
                            color={userProgression.stats.isEmailVerified ? "#22c55e" : "#ef4444"} 
                          />
                          <Text className={`text-base font-bold ml-2 ${
                            userProgression.stats.isEmailVerified ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {userProgression.stats.isEmailVerified ? 'Oui' : 'Non'}
                          </Text>
                        </View>
                      </View>
                      
                      {userProgression.stats.registrationDate && (
                        <View className="flex-row justify-between items-center">
                          <Text className="text-slate-300 text-base">Membre depuis</Text>
                          <Text className="text-white text-base font-bold">
                            {new Date(userProgression.stats.registrationDate).toLocaleDateString('fr-FR', { 
                              day: 'numeric',
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </>
              ) : (
                <View className="items-center py-12">
                  <Text className="text-slate-400 text-base">Chargement des statistiques...</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'Avis' && (
            <View className="mb-8">
              {/* Real Rating Overview */}
              <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 items-center mb-6">
                <Text className="text-white text-5xl font-bold mb-2">
                  {userProgression?.stats.averageRating > 0 
                    ? userProgression.stats.averageRating.toFixed(1) 
                    : '0.0'
                  }
                </Text>
                <View className="flex-row mb-3">
                  {[1,2,3,4,5].map((star) => {
                    const rating = userProgression?.stats.averageRating || 0;
                    const isFilledStar = star <= Math.floor(rating);
                    const isHalfStar = star === Math.ceil(rating) && rating % 1 !== 0;
                    
                    return (
                      <Ionicons 
                        key={star}
                        name={isFilledStar ? "star" : isHalfStar ? "star-half" : "star-outline"} 
                        size={24} 
                        color={isFilledStar || isHalfStar ? "#f59e0b" : "#64748b"}
                        style={{ marginHorizontal: 2 }}
                      />
                    );
                  })}
                </View>
                <Text className="text-slate-400 text-base">
                  {userProgression?.stats.totalRatings > 0 
                    ? `Basé sur ${userProgression.stats.totalRatings} avis`
                    : 'Aucune évaluation pour le moment'
                  }
                </Text>
              </View>

              {/* Recent Reviews */}
              <Text className="text-white text-xl font-bold mb-6">Avis récents</Text>
              
              <View style={{ gap: 16 }}>
                {/* Sophie Laurent Review */}
                <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <View>
                        <Text className="text-white text-base font-bold">Sophie Laurent</Text>
                        <View className="flex-row">
                          {[1,2,3,4,5].map((star) => (
              <Ionicons 
                              key={star}
                name="star" 
                              size={14} 
                              color="#f59e0b"
                              style={{ marginRight: 2 }}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Text className="text-slate-400 text-sm">Il y a 2 jours</Text>
                  </View>
                  
                  <Text className="text-slate-300 text-base leading-6 mb-3">
                    Excellent organisateur ! Match très bien organisé, ambiance super. Je recommande vivement !
              </Text>
                  
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-400 text-sm">Événement: Match de Football</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="heart-outline" size={16} color="#64748b" style={{ marginRight: 4 }} />
                      <Text className="text-slate-400 text-sm">12</Text>
                    </View>
                  </View>
                </View>

                {/* Marc Dubois Review */}
                <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <View>
                        <Text className="text-white text-base font-bold">Marc Dubois</Text>
                        <View className="flex-row">
                          {[1,2,3,4,5].map((star) => (
              <Ionicons 
                              key={star}
                              name="star" 
                              size={14} 
                              color="#f59e0b"
                              style={{ marginRight: 2 }}
                            />
                          ))}
          </View>
        </View>
                </View>
                    <Text className="text-slate-400 text-sm">Il y a 1 semaine</Text>
                </View>
                
                  <Text className="text-slate-300 text-base leading-6 mb-3">
                    Très bon joueur et super sympa ! Toujours de bonne humeur et fair-play.
                  </Text>
                  
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-400 text-sm">Événement: Session Basketball</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="heart-outline" size={16} color="#64748b" style={{ marginRight: 4 }} />
                      <Text className="text-slate-400 text-sm">8</Text>
                </View>
              </View>
            </View>
            </View>
            </View>
          )}

          {activeTab === 'Succès' && (
            <View className="mb-8">
              {userProgression ? (
                <>
                  {/* Unlocked Achievements */}
                  {userProgression.achievements.unlocked.length > 0 && (
                    <AchievementsList
                      achievements={userProgression.achievements.unlocked}
                      title="🏆 Succès Débloqués"
                      maxDisplay={10}
                    />
                  )}

                  {/* Locked Achievements */}
                  {userProgression.achievements.locked.length > 0 && (
                    <AchievementsList
                      achievements={userProgression.achievements.locked}
                      title="🔒 Prochains Défis"
                      maxDisplay={10}
                    />
                  )}

                  {/* No Achievements */}
                  {userProgression.achievements.unlocked.length === 0 && userProgression.achievements.locked.length === 0 && (
                    <View className="items-center py-12">
                      <Ionicons name="trophy-outline" size={64} color="#475569" />
                      <Text className="text-white text-xl font-bold mt-4 mb-2">
                        Aucun succès pour le moment
                      </Text>
                      <Text className="text-slate-400 text-center text-base mb-6 leading-6">
                        Participez à des événements pour débloquer vos premiers achievements !
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View className="items-center py-12">
                  <Text className="text-slate-400 text-base">Chargement des succès...</Text>
                </View>
              )}
            </View>
          )}

          {/* Événements récents - Always show at bottom */}
          <Animated.View 
            className="mb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text className="text-white text-xl font-bold mb-6">Événements récents</Text>
            
            <View style={{ gap: 12 }}>
              {/* Match de Football */}
              <TouchableOpacity className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 flex-row items-center">
                <View className="w-14 h-14 rounded-xl overflow-hidden mr-4">
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold mb-1">Match de Football</Text>
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-sm mr-3">Hier</Text>
                    <View className="bg-cyan-500/20 px-2 py-1 rounded-lg">
                      <Text className="text-cyan-400 text-xs font-medium">Organisateur</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Session Basketball */}
              <TouchableOpacity className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 flex-row items-center">
                <View className="w-14 h-14 rounded-xl overflow-hidden mr-4">
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold mb-1">Session Basketball</Text>
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-sm mr-3">3 jours</Text>
                    <View className="bg-blue-500/20 px-2 py-1 rounded-lg">
                      <Text className="text-blue-400 text-xs font-medium">Participant</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Tournoi Tennis */}
              <TouchableOpacity className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 flex-row items-center">
                <View className="w-14 h-14 rounded-xl overflow-hidden mr-4">
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold mb-1">Tournoi Tennis</Text>
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-sm mr-3">1 semaine</Text>
                    <View className="bg-blue-500/20 px-2 py-1 rounded-lg">
                      <Text className="text-blue-400 text-xs font-medium">Participant</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen; 