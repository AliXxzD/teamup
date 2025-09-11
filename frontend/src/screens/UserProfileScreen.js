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
import { API_BASE_URL } from '../config/api';
import UserStatsCard from '../components/UserStatsCard';
import { AchievementsList } from '../components/AchievementCard';
import pointsService from '../services/pointsService';
import { LevelBadge, XPProgressBar, AchievementCard } from '../components/LevelingSystem';
import Avatar from '../components/Avatar';
import TeamupLogo from '../components/TeamupLogo';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import reviewService from '../services/reviewService';
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
  
  // Debug: Log des paramètres reçus
  console.log('🔍 UserProfileScreen - Paramètres reçus:', {
    userId,
    userIdType: typeof userId,
    isOwnProfile,
    currentUserId: user?._id || user?.id
  });
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Stats');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [userData, setUserData] = useState(null);
  const [userProgression, setUserProgression] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // États pour les avis
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    // Initialiser les données utilisateur
    loadUserData();
    
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

  // Charger les avis quand l'onglet Avis est sélectionné
  useEffect(() => {
    const userId = userData?._id || userData?.id;
    if (activeTab === 'Avis' && userId) {
      console.log('🔄 Chargement des avis pour l\'onglet Avis, userId:', userId);
      loadReviews();
    }
  }, [activeTab, userData]);

  // Charger les statistiques quand userData change
  useEffect(() => {
    if (userData) {
      loadUserProgression();
    }
  }, [userData]);

  const loadUserProgression = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 Chargement des statistiques utilisateur pour le profil...');
      
      if (isOwnProfile) {
        // Pour l'utilisateur connecté, utiliser le service normal
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
      } else if (userId && userData) {
        // Pour les autres utilisateurs, calculer les statistiques à partir des données récupérées
        console.log('📊 Calcul des statistiques pour un autre utilisateur:', userId);
        
        const otherUserProgression = await calculateOtherUserProgression(userData);
        setUserProgression(otherUserProgression);
        console.log('✅ Statistiques autre utilisateur calculées:', otherUserProgression);
      }
    } catch (error) {
      console.error('❌ Erreur loadUserProgression profil:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  /**
   * Calcule les statistiques de progression pour un autre utilisateur
   */
  const calculateOtherUserProgression = async (otherUserData) => {
    try {
      console.log('📊 Calcul des statistiques pour autre utilisateur:', otherUserData);
      
      // Utiliser la même logique que calculateUserProgression
      const stats = otherUserData.userStats || {};
      
      // Calculer les points
      const points = pointsService.calculatePoints(stats);
      
      // Calculer le niveau
      const level = pointsService.calculateLevel(points);
      
      // Points pour le prochain niveau (même logique que calculateUserProgression)
      const nextLevelPoints = pointsService.getPointsForNextLevel(level);
      const currentLevelPoints = level > 1 ? pointsService.getPointsForNextLevel(level - 1) : 0;
      const progressPoints = points - currentLevelPoints;
      const neededPoints = nextLevelPoints - currentLevelPoints;
      const progressPercentage = Math.min((progressPoints / neededPoints) * 100, 100);

      // Calculer les achievements
      const achievements = pointsService.calculateAchievements(stats);
      
      const progression = {
        points,
        level,
        nextLevelPoints,
        progressPercentage: Math.round(progressPercentage),
        achievements,
        stats: {
          eventsOrganized: stats.eventsOrganized || 0,
          eventsJoined: stats.eventsJoined || 0,
          averageRating: stats.averageRating || 0,
          totalRatings: stats.totalRatings || 0,
          isEmailVerified: otherUserData.stats?.isEmailVerified || false,
          registrationDate: stats.registrationDate || otherUserData.joinDate
        }
      };
      
      console.log('✅ Progression calculée pour autre utilisateur:', {
        points: progression.points,
        level: progression.level,
        achievements: progression.achievements.unlocked.length
      });
      
      return progression;
    } catch (error) {
      console.error('❌ Erreur calculateOtherUserProgression:', error);
      return null;
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
            const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
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
        console.log('Chargement du profil utilisateur:', userId);
        
        // Vérifier que l'ID est valide
        if (!userId || userId === 'undefined' || userId === 'null') {
          console.error('❌ ID utilisateur invalide:', userId);
          Alert.alert(
            'Erreur',
            'ID utilisateur invalide. Impossible de charger le profil.',
            [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]
          );
          return;
        }
        
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (accessToken) {
            console.log('🔍 Tentative de récupération du profil utilisateur:', userId);
            console.log('🔍 URL:', `${API_BASE_URL}/api/users/${userId}`);
            
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              }
            });
            
            console.log('🔍 Status de la réponse:', response.status);
            
            if (response.ok) {
              const userResponse = await response.json();
              const otherUser = userResponse.data || userResponse;
              
              console.log('📊 Profil autre utilisateur récupéré:', otherUser);
              
              const otherUserData = {
                name: otherUser.name || 'Utilisateur',
                username: otherUser.email ? `@${otherUser.email.split('@')[0]}` : '@utilisateur',
                location: typeof otherUser.location === 'string' ? otherUser.location : (otherUser.location?.address || otherUser.location?.city || 'France'),
                joinDate: otherUser.createdAt ? `Depuis ${new Date(otherUser.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}` : 'Récemment',
                bio: otherUser.bio || otherUser.profile?.bio || 'Passionné de sport !',
                stats: {
                  followers: otherUser.followers || 0,
                  following: otherUser.following || 0,
                  points: otherUser.points || otherUser.profile?.points || 0
                },
                sports: otherUser.sports || otherUser.profile?.favoritesSports || ['Football'],
                xp: otherUser.xp || otherUser.profile?.xp || 0,
                level: calculateLevel(otherUser.xp || otherUser.profile?.xp || 0),
                userStats: {
                  eventsOrganized: otherUser.profile?.stats?.eventsOrganized || otherUser.eventsOrganized || 0,
                  eventsJoined: otherUser.profile?.stats?.eventsJoined || otherUser.eventsJoined || 0,
                  averageRating: otherUser.profile?.stats?.averageRating || otherUser.averageRating || 0,
                  totalReviews: otherUser.profile?.stats?.totalRatings || otherUser.totalReviews || 0,
                  followers: otherUser.followers || 0,
                  sportEvents: otherUser.sportEvents || {
                    football: 0,
                    basketball: 0,
                    tennis: 0,
                    volleyball: 0
                  },
                  earlyEvents: otherUser.earlyEvents || 0,
                  weekendEvents: otherUser.weekendEvents || 0,
                  monthlyRank: otherUser.monthlyRank || 0,
                  maxStreak: otherUser.maxStreak || 0
                },
                profileImage: otherUser.profile?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                backgroundImage: otherUser.profile?.backgroundImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
              };
              
              setUserData(otherUserData);
            } else {
              const errorText = await response.text();
              console.error('❌ Erreur API pour récupérer le profil utilisateur:', response.status);
              console.error('❌ Réponse d\'erreur:', errorText);
              
              // Si c'est une erreur 404, l'utilisateur n'existe pas
              if (response.status === 404) {
                Alert.alert(
                  'Utilisateur non trouvé',
                  'Ce profil utilisateur n\'existe pas ou a été supprimé.',
                  [
                    { text: 'OK', onPress: () => navigation.goBack() }
                  ]
                );
                return;
              }
              
              // Fallback vers des données par défaut pour les autres erreurs
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
          } else {
            console.error('❌ Pas de token d\'accès pour récupérer le profil utilisateur');
            // Fallback vers des données par défaut
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
        } catch (apiError) {
          console.error('❌ Erreur lors de la récupération du profil utilisateur:', apiError);
          // Fallback vers des données par défaut
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
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les avis de l'utilisateur
  const loadReviews = async () => {
    const userId = userData?._id || userData?.id;
    if (!userId) {
      console.log('⚠️ loadReviews: Pas d\'ID utilisateur disponible');
      return;
    }
    
    try {
      setLoadingReviews(true);
      console.log('🔍 Chargement des avis pour l\'utilisateur:', userId);
      console.log('🔍 userData complet:', userData);
      
      const result = await reviewService.getUserReviews(userId);
      console.log('📊 Résultat getUserReviews:', result);
      
      if (result.success) {
        console.log('✅ Avis chargés:', result.data.reviews?.length || 0);
        console.log('✅ Stats chargées:', result.data.stats);
        setReviews(result.data.reviews || []);
        setReviewStats(result.data.stats || null);
      } else {
        console.error('❌ Erreur chargement avis:', result.message || result.error);
      }
    } catch (error) {
      console.error('❌ Erreur loadReviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Créer un nouvel avis
  const handleCreateReview = async (reviewData) => {
    const userId = userData?._id || userData?.id;
    if (!userId) return;
    
    try {
      const result = await reviewService.createReview({
        reviewedUserId: userId,
        ...reviewData
      });
      
      if (result.success) {
        setShowReviewForm(false);
        loadReviews(); // Recharger les avis
        Alert.alert('Succès', 'Votre avis a été publié avec succès');
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Erreur création avis:', error);
      Alert.alert('Erreur', 'Impossible de publier l\'avis');
    }
  };

  // Modifier un avis
  const handleEditReview = async (reviewData) => {
    if (!editingReview) return;
    
    try {
      const result = await reviewService.updateReview(editingReview._id, reviewData);
      
      if (result.success) {
        setShowReviewForm(false);
        setEditingReview(null);
        loadReviews(); // Recharger les avis
        Alert.alert('Succès', 'Votre avis a été modifié avec succès');
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Erreur modification avis:', error);
      Alert.alert('Erreur', 'Impossible de modifier l\'avis');
    }
  };

  // Supprimer un avis
  const handleDeleteReview = async (review) => {
    Alert.alert(
      'Supprimer l\'avis',
      'Êtes-vous sûr de vouloir supprimer cet avis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await reviewService.deleteReview(review._id);
              
              if (result.success) {
                loadReviews(); // Recharger les avis
                Alert.alert('Succès', 'Avis supprimé avec succès');
              } else {
                Alert.alert('Erreur', result.error);
              }
            } catch (error) {
              console.error('Erreur suppression avis:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'avis');
            }
          }
        }
      ]
    );
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
          <TeamupLogo size="medium" textColor="#ffffff" />
          
          {/* Menu and Actions */}
          <View className="flex-row items-center">
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
                <Avatar
                  name={userData.name}
                  size={96}
                  showBorder={true}
                  borderColor="#ffffff"
                  borderWidth={4}
                  style={{
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
            {isOwnProfile && (
              <TouchableOpacity 
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 flex-row items-center mb-4"
                onPress={() => navigation.navigate('EditProfile')}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={16} color="#06b6d4" style={{ marginRight: 6 }} />
                <Text className="text-cyan-400 text-sm font-medium">Modifier le profil</Text>
              </TouchableOpacity>
            )}
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
                  {reviewStats?.averageRating > 0 
                    ? reviewStats.averageRating.toFixed(1) 
                    : '0.0'
                  }
                </Text>
                <View className="flex-row mb-3">
                  {[1,2,3,4,5].map((star) => {
                    const rating = reviewStats?.averageRating || 0;
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
                  {reviewStats?.totalReviews > 0 
                    ? `Basé sur ${reviewStats.totalReviews} avis`
                    : 'Aucune évaluation pour le moment'
                  }
                </Text>
              </View>

              {/* Distribution des notes */}
              {reviewStats?.totalReviews > 0 && (
                <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
                  <Text className="text-white text-lg font-bold mb-4 text-center">
                    Distribution des notes
                  </Text>
                  <View className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviewStats.ratingDistribution?.[rating] || 0;
                      const percentage = reviewStats.totalReviews > 0 
                        ? (count / reviewStats.totalReviews) * 100 
                        : 0;
                      
                      return (
                        <View key={rating} className="flex-row items-center">
                          <Text className="text-slate-300 text-sm w-8">{rating}</Text>
                          <Ionicons name="star" size={16} color="#fbbf24" />
                          <View className="flex-1 bg-slate-700 rounded-full h-3 mx-3">
                            <View
                              className="bg-yellow-400 h-3 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </View>
                          <Text className="text-slate-300 text-sm w-12 text-right">
                            {count}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Recent Reviews */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-xl font-bold">Avis récents</Text>
                <View className="flex-row items-center space-x-2">
                  {reviewStats?.totalReviews > 0 && (
                    <TouchableOpacity
                      className="bg-slate-700 rounded-xl px-4 py-2"
                      onPress={() => navigation.navigate('UserReviews', { 
                        userId: userData._id || userData.id, 
                        userName: userData.name 
                      })}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-sm font-bold">Voir tous</Text>
                    </TouchableOpacity>
                  )}
                  {!isOwnProfile && user && (
                    <TouchableOpacity
                      className="bg-cyan-500 rounded-xl px-4 py-2"
                      onPress={() => setShowReviewForm(true)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-sm font-bold">Donner un avis</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              {loadingReviews ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#06b6d4" />
                  <Text className="text-slate-400 text-base mt-4">Chargement des avis...</Text>
                </View>
              ) : reviews.length > 0 ? (
                <View>
                  <View style={{ gap: 16 }}>
                    {reviews.slice(0, 3).map((review, index) => (
                      <ReviewCard
                        key={review._id || index}
                        review={review}
                        showActions={!isOwnProfile && user && review.reviewer._id === user._id}
                        onEdit={(review) => {
                          setEditingReview(review);
                          setShowReviewForm(true);
                        }}
                        onDelete={handleDeleteReview}
                        currentUserId={user?._id}
                      />
                    ))}
                  </View>
                  
                  {/* Bouton pour voir plus d'avis si il y en a plus de 3 */}
                  {reviews.length > 3 && (
                    <TouchableOpacity
                      className="bg-slate-700 rounded-xl py-3 px-6 mt-4 items-center"
                      onPress={() => navigation.navigate('UserReviews', { 
                        userId: userData._id || userData.id, 
                        userName: userData.name 
                      })}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-base font-bold">
                        Voir {reviews.length - 3} avis supplémentaires
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="items-center py-12">
                  <Ionicons name="star-outline" size={64} color="#475569" />
                  <Text className="text-white text-xl font-bold mt-4 mb-2">
                    Aucun avis pour le moment
                  </Text>
                  <Text className="text-slate-400 text-center text-base mb-6 leading-6">
                    {isOwnProfile 
                      ? 'Participez à des événements pour recevoir vos premiers avis !'
                      : 'Soyez le premier à donner un avis à cet utilisateur.'
                    }
                  </Text>
                  {!isOwnProfile && user && (
                    <TouchableOpacity
                      className="bg-cyan-500 rounded-xl px-6 py-3"
                      onPress={() => setShowReviewForm(true)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-base font-bold">Donner un avis</Text>
                    </TouchableOpacity>
                  )}
                  {reviewStats?.totalReviews > 0 && (
                    <TouchableOpacity
                      className="bg-slate-700 rounded-xl px-6 py-3 mt-3"
                      onPress={() => navigation.navigate('UserReviews', { 
                        userId: userData._id || userData.id, 
                        userName: userData.name 
                      })}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-base font-bold">Voir tous les avis</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
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

      {/* Review Form Modal */}
      <ReviewForm
        visible={showReviewForm}
        onClose={() => {
          setShowReviewForm(false);
          setEditingReview(null);
        }}
        onSubmit={editingReview ? handleEditReview : handleCreateReview}
        review={editingReview}
        user={userData}
        loading={loadingReviews}
      />
    </SafeAreaView>
  );
};

export default UserProfileScreen; 