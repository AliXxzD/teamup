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
  StyleSheet
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logNetworkInfo, generateNetworkReport } from '../utils/networkUtils';
import { navigateToEventDetails } from '../utils/navigationUtils';
import GradientButton from '../components/GradientButton';

const { width } = Dimensions.get('window');

const UserProfileScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { userId } = route.params || {};
  const isOwnProfile = !userId || userId === user?.id;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fonctions API
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';
  
  const fetchProfile = async (targetUserId = null) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('❌ Token non trouvé - Redirection vers la connexion');
        // Rediriger vers la connexion si pas de token
        navigation.replace('Login');
        return null;
      }

      const url = targetUserId 
        ? `${API_BASE_URL}/api/auth/profile/${targetUserId}`
        : `${API_BASE_URL}/api/auth/profile`;
      
      console.log('🔍 Fetching profile from:', url);
      console.log('🔑 Token présent:', token ? 'Oui' : 'Non');
      
      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 Profile response status:', response.status);

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Token invalide - Redirection vers la connexion');
          // Token invalide, rediriger vers la connexion
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
          navigation.replace('Login');
          return null;
        }
        throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      return data.profile;
    } catch (error) {
      console.error('❌ Erreur fetchProfile:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Délai d\'attente dépassé. Vérifiez votre connexion internet.');
      }
      
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        throw new Error('Erreur de connexion réseau. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  };

  const fetchRecentEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return [];
      }

      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/events/recent?limit=3`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.events;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erreur fetchRecentEvents:', error);
      if (error.name === 'AbortError') {
        console.log('Timeout lors de la récupération des événements récents');
      }
      return [];
    }
  };

  const followUser = async (targetUserId) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/${targetUserId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du follow/unfollow');
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur followUser:', error);
      if (error.name === 'AbortError') {
        throw new Error('Délai d\'attente dépassé. Vérifiez votre connexion internet.');
      }
      throw error;
    }
  };
  
  const [userData, setUserData] = useState({
    id: null,
    name: '',
    username: '',
    avatar: null,
    backgroundImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=400&fit=crop',
    location: '',
    joinDate: '',
    bio: '',
    followers: 0,
    following: 0,
    points: 0,
    level: 1,
    favoritesSports: [],
    isFollowing: false,
    stats: {
      eventsOrganized: 0,
      eventsJoined: 0,
      averageRating: 0,
      totalRatings: 0
    },
    recentEvents: []
  });

  const [activeTab, setActiveTab] = useState('stats');

  // Fonction utilitaire pour formater l'affichage de la localisation
  const formatLocation = (location) => {
    if (!location) return 'Localisation non spécifiée';
    
    if (typeof location === 'string') return location;
    
    if (typeof location === 'object') {
      const city = location.city;
      const country = location.country;
      
      if (city && country) {
        return `${city}, ${country}`;
      } else if (city) {
        return city;
      } else if (country) {
        return country;
      }
    }
    
    return 'Localisation non spécifiée';
  };

  // Fonction pour diagnostiquer les problèmes réseau
  const debugNetworkIssues = async () => {
    console.log('🔧 Démarrage du diagnostic réseau...');
    logNetworkInfo();
    
    const report = await generateNetworkReport();
    console.log('📊 Rapport de diagnostic:', JSON.stringify(report, null, 2));
    
    // Afficher une alerte avec les informations de diagnostic
    Alert.alert(
      'Diagnostic Réseau',
      `Serveur accessible: ${report.networkStatus.serverReachable ? '✅' : '❌'}\n` +
      `Token valide: ${report.networkStatus.tokenValid ? '✅' : '❌'}\n` +
      `URL API: ${report.environment.apiUrl}\n` +
      `Erreur: ${report.networkStatus.error || 'Aucune'}`,
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'Copier le rapport', 
          onPress: () => {
            // Copier le rapport dans le presse-papiers (si disponible)
            console.log('📋 Rapport copié dans la console');
          }
        }
      ]
    );
  };

  // Fonction pour rafraîchir les statistiques
  const refreshStats = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      console.log('🔄 Rafraîchissement des statistiques...');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/stats/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Statistiques mises à jour:', data.stats);
        
        // Recharger les données du profil
        await loadData();
        
        Alert.alert('Succès', 'Statistiques mises à jour !');
      } else {
        throw new Error(data.message || 'Erreur lors de la mise à jour des statistiques');
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement des statistiques:', error);
      Alert.alert('Erreur', error.message || 'Impossible de rafraîchir les statistiques');
    }
  };

  // Fonction pour diagnostiquer les données utilisateur
  const debugUserData = () => {
    console.log('🔍 Diagnostic des données utilisateur:');
    console.log('userData:', JSON.stringify(userData, null, 2));
    
    // Vérifier les types de données
    console.log('Types de données:');
    console.log('- location:', typeof userData.location, userData.location);
    console.log('- stats:', typeof userData.stats, userData.stats);
    console.log('- favoritesSports:', typeof userData.favoritesSports, userData.favoritesSports);
    
    Alert.alert(
      'Diagnostic Données',
      `Location: ${typeof userData.location}\n` +
      `Stats: ${typeof userData.stats}\n` +
      `Sports: ${typeof userData.favoritesSports}\n` +
      `Voir la console pour plus de détails`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Fonction pour charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger le profil
      const profile = await fetchProfile(userId);
      
      // Charger les événements récents (seulement pour son propre profil)
      let recentEvents = [];
      if (isOwnProfile) {
        recentEvents = await fetchRecentEvents();
      }
      
      // Formatter la date de création
      const joinDate = profile.joinDate 
        ? new Date(profile.joinDate).toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long' 
          })
        : '';

      // Mettre à jour les données
      setUserData({
        id: profile.id,
        name: profile.name || 'Utilisateur',
        username: profile.username || profile.email?.split('@')[0] || 'utilisateur',
        avatar: profile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        backgroundImage: profile.backgroundImage || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=400&fit=crop',
        location: profile.location || null, // Garder l'objet location pour l'affichage conditionnel
        joinDate: joinDate,
        bio: profile.bio || (isOwnProfile ? 'Ajoutez une description à votre profil !' : ''),
        followers: profile.followers || 0,
        following: profile.following || 0,
        points: profile.points || 0,
        level: profile.level || 1,
        favoritesSports: profile.favoritesSports || [],
        isFollowing: profile.isFollowing || false,
        stats: profile.stats || {
          eventsOrganized: 0,
          eventsJoined: 0,
          averageRating: 0,
          totalRatings: 0
        },
        recentEvents: recentEvents
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les données du profil. Veuillez réessayer.',
        [
          { text: 'Réessayer', onPress: loadData },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    // Vérifier l'authentification avant de charger les données
    const checkAuthAndLoadData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          console.log('❌ Pas de token - Redirection vers Login');
          navigation.replace('Login');
          return;
        }
        
        // Vérifier la validité du token
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.log('❌ Token invalide - Redirection vers Login');
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
          navigation.replace('Login');
          return;
        }
        
        // Token valide, charger les données
        await loadData();
      } catch (error) {
        console.error('❌ Erreur lors de la vérification d\'authentification:', error);
        navigation.replace('Login');
      }
    };
    
    checkAuthAndLoadData();
  }, [userId, isOwnProfile]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez le profil de ${userData.name} sur TeamUp !`,
        url: `teamup://profile/${userData.id}`
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const result = await followUser(userData.id);
      
      setUserData(prev => ({
        ...prev,
        isFollowing: result.isFollowing,
        followers: result.isFollowing ? prev.followers + 1 : prev.followers - 1
      }));
      
      Alert.alert('Succès', result.message);
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible d\'effectuer cette action');
    }
  };

  const SportTag = ({ sport }) => (
    <View style={[styles.sportTag, { backgroundColor: sport.color }]}>
      <MaterialIcons name={sport.icon} size={16} color="white" />
      <Text style={styles.sportTagText}>
        {sport.name}
      </Text>
    </View>
  );

  const StatCard = ({ icon, value, label, color = colors.primary }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const EventCard = ({ event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigateToEventDetails(navigation, event.id)}
    >
      <View style={[styles.eventIcon, { backgroundColor: event.color }]}>
        <MaterialIcons name={event.icon} size={24} color="white" />
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventMeta}>
          <Text style={styles.eventTime}>{event.time}</Text>
          <Text style={styles.eventRole}>• {event.role}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
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

  const StatItem = ({ value, label }) => (
    <View style={styles.statItem}>
      <Text style={styles.statItemValue}>{value}</Text>
      <Text style={styles.statItemLabel}>{label}</Text>
    </View>
  );

  // Affichage du chargement
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-dark-900">
        <ActivityIndicator size="large" color="#84cc16" />
        <Text className="text-dark-300 text-base mt-4">Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header avec image de fond */}
      <ImageBackground 
        source={{ uri: userData.backgroundImage }}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
          style={styles.headerOverlay}
        >
          {/* Navigation Header */}
          <View style={styles.navigationHeader}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.navButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.navButton}>
                <Ionicons name="ellipsis-vertical" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#84cc16']}
            tintColor={'#84cc16'}
          />
        }
      >
        {/* Photo de profil et informations utilisateur */}
        <View style={styles.profileSection}>
          {/* Photo de profil avec badge de niveau */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userData.level}</Text>
            </View>
          </View>

          {/* Nom et bouton éditer */}
          <View style={styles.nameSection}>
            <Text style={styles.name}>{userData.name}</Text>
            {isOwnProfile && (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => Alert.alert(
                  'Édition du profil',
                  'Cette fonctionnalité sera bientôt disponible !',
                  [{ text: 'OK', style: 'default' }]
                )}
              >
                <Ionicons name="create-outline" size={16} color="#94a3b8" />
                <Text style={styles.editButtonText}>Éditer</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Username */}
          <Text style={styles.username}>@{userData.username}</Text>
          
          {/* Localisation et date d'inscription */}
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#94a3b8" />
            <Text style={styles.locationText}>
              {formatLocation(userData.location)}
            </Text>
            <Text style={styles.joinDate}>Depuis {userData.joinDate}</Text>
          </View>
          
          {/* Bio */}
          <Text style={styles.bio}>{userData.bio}</Text>

          {/* Bouton s'abonner pour les autres profils */}
          {!isOwnProfile && (
            <TouchableOpacity 
              style={[
                styles.followButton,
                userData.isFollowing && styles.followingButton
              ]}
              onPress={handleFollow}
            >
              <LinearGradient
                colors={userData.isFollowing ? 
                  ['#64748B', '#475569'] : 
                  ['#84cc16', '#65a30d']
                }
                style={styles.followButtonGradient}
              >
                <Ionicons 
                  name={userData.isFollowing ? 'checkmark' : 'person-add'} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.followButtonText}>
                  {userData.isFollowing ? 'Abonné' : 'S\'abonner'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Statistiques sociales */}
        <View style={styles.socialStats}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>{userData.followers}</Text>
            <Text style={styles.statLabel}>Abonnés</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>{userData.following}</Text>
            <Text style={styles.statLabel}>Abonnements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>{userData.points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </TouchableOpacity>
        </View>

        {/* Cartes de statistiques détaillées */}
        <View style={styles.mainStatsSection}>
          <View style={styles.statsHeader}>
            <Text style={styles.sectionTitle}>Statistiques détaillées</Text>
            {isOwnProfile && (
              <TouchableOpacity 
                style={styles.refreshStatsButton}
                onPress={refreshStats}
              >
                <Ionicons name="refresh" size={16} color={colors.primary} />
                <Text style={styles.refreshStatsText}>Actualiser</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="calendar"
              value={userData.stats?.eventsOrganized || 0}
              label="Événements organisés"
              color="#84cc16"
            />
            <StatCard
              icon="people"
              value={userData.stats?.eventsJoined || 0}
              label="Événements rejoints"
              color="#84cc16"
            />
            <StatCard
              icon="star"
              value={userData.stats?.averageRating ? userData.stats.averageRating.toFixed(1) : '0.0'}
              label="Note moyenne"
              color="#84cc16"
            />
            <StatCard
              icon="trophy"
              value={userData.favoritesSports ? userData.favoritesSports.length : 0}
              label="Sports pratiqués"
              color="#84cc16"
            />
          </View>
          
          {/* Statistiques supplémentaires */}
          {userData.stats?.totalRatings > 0 && (
            <View style={styles.additionalStats}>
              <Text style={styles.additionalStatsTitle}>Détails des évaluations</Text>
              <View style={styles.additionalStatsRow}>
                <View style={styles.additionalStatItem}>
                  <Ionicons name="star" size={20} color="#F59730" />
                  <Text style={styles.additionalStatValue}>
                    {userData.stats.totalRatings}
                  </Text>
                  <Text style={styles.additionalStatLabel}>Évaluations reçues</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Sports pratiqués */}
        {userData.favoritesSports && userData.favoritesSports.length > 0 && (
          <View style={styles.sportsSection}>
            <View style={styles.sportsContainer}>
              {userData.favoritesSports.map((sport, index) => (
                <SportTag key={index} sport={sport} />
              ))}
            </View>
          </View>
        )}

        {/* Événements récents */}
        {userData.recentEvents && userData.recentEvents.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Événements récents</Text>
            <View style={styles.eventsContainer}>
              {userData.recentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </View>
          </View>
        )}

        {/* Navigation tabs */}
        <View style={styles.tabsSection}>
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'stats' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('stats')}
            >
              <Ionicons 
                name="trophy" 
                size={20} 
                color={activeTab === 'stats' ? '#84cc16' : '#94a3b8'} 
              />
              <Text style={[
                styles.tabButtonText,
                activeTab === 'stats' && styles.activeTabButtonText
              ]}>
                Stats
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'reviews' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('reviews')}
            >
              <Ionicons 
                name="star" 
                size={20} 
                color={activeTab === 'reviews' ? '#84cc16' : '#94a3b8'} 
              />
              <Text style={[
                styles.tabButtonText,
                activeTab === 'reviews' && styles.activeTabButtonText
              ]}>
                Avis
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'achievements' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('achievements')}
            >
              <Ionicons 
                name="ribbon" 
                size={20} 
                color={activeTab === 'achievements' ? '#84cc16' : '#94a3b8'} 
              />
              <Text style={[
                styles.tabButtonText,
                activeTab === 'achievements' && styles.activeTabButtonText
              ]}>
                Succès
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenu selon l'onglet actif */}
        <View style={styles.tabContent}>
          {activeTab === 'stats' && (
            <View style={styles.statsContent}>
              <Text style={styles.sectionTitle}>Statistiques sportives</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="calendar" size={32} color="#84cc16" />
                  <Text style={styles.statCardValue}>{userData.stats?.eventsOrganized || 0}</Text>
                  <Text style={styles.statCardLabel}>Événements organisés</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="people" size={32} color="#84cc16" />
                  <Text style={styles.statCardValue}>{userData.stats?.eventsJoined || 0}</Text>
                  <Text style={styles.statCardLabel}>Événements rejoints</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="star" size={32} color="#84cc16" />
                  <Text style={styles.statCardValue}>{userData.stats?.averageRating || 0}</Text>
                  <Text style={styles.statCardLabel}>Note moyenne</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="trophy" size={32} color="#84cc16" />
                  <Text style={styles.statCardValue}>{userData.favoritesSports ? userData.favoritesSports.length : 0}</Text>
                  <Text style={styles.statCardLabel}>Sports pratiqués</Text>
                </View>
              </View>
            </View>
          )}
          
          {activeTab === 'reviews' && (
            <View style={styles.reviewsContent}>
              <Text style={styles.sectionTitle}>Avis et commentaires</Text>
              <Text style={styles.comingSoon}>Fonctionnalité à venir...</Text>
            </View>
          )}
          
          {activeTab === 'achievements' && (
            <View style={styles.achievementsContent}>
              <Text style={styles.sectionTitle}>Succès débloqués</Text>
              <Text style={styles.comingSoon}>Fonctionnalité à venir...</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // dark-900
  },
  
  // Header Background
  headerBackground: {
    width: width,
    height: 200,
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // Navigation
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },

  // Profile Section
  profileSection: {
    backgroundColor: '#0f172a', // dark-900
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: -30,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#84cc16',
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  nameSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff', // white
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#1e293b', // dark-800
    borderWidth: 1,
    borderColor: '#334155', // dark-700
  },
  editButtonText: {
    fontSize: 12,
    color: '#94a3b8', // dark-400
    marginLeft: 4,
    fontWeight: '500',
  },
  username: {
    fontSize: 14,
    color: '#94a3b8', // dark-400
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#94a3b8', // dark-400
    marginLeft: 4,
    marginRight: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#94a3b8', // dark-400
  },
  bio: {
    fontSize: 14,
    color: '#ffffff', // white
    lineHeight: 20,
    marginBottom: 20,
  },
  
  // Follow Button
  followButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  followButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Main Stats Section
  mainStatsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#0f172a', // dark-900
    marginBottom: 10,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshStatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#1e293b', // dark-800
    borderWidth: 1,
    borderColor: '#334155', // dark-700
  },
  refreshStatsText: {
    fontSize: 14,
    color: '#94a3b8', // dark-400
    marginLeft: 4,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#1e293b', // dark-800
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155', // dark-700
    marginBottom: 10,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  additionalStats: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  additionalStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff', // white
    marginBottom: 12,
  },
  additionalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  additionalStatItem: {
    alignItems: 'center',
  },
  additionalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff', // white
    marginTop: 4,
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#94a3b8', // dark-400
  },

  // Social Stats
  socialStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#0f172a', // dark-900
    marginBottom: 0,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff', // white
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8', // dark-400
  },

  // Sports Section
  sportsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0f172a', // dark-900
    marginBottom: 0,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  sportTagText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    color: 'white',
  },

  // Events Section
  eventsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#0f172a', // dark-900
    marginBottom: 20,
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b', // dark-800
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155', // dark-700
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff', // white
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 14,
    color: '#94a3b8', // dark-400
  },
  eventRole: {
    fontSize: 14,
    color: '#84cc16', // lime
    fontWeight: '500',
  },

  // Tabs Section
  tabsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0f172a', // dark-900
    marginBottom: 0,
  },
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: 'rgba(132, 204, 22, 0.1)', // lime/10
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    color: '#94a3b8', // dark-400
  },
  activeTabButtonText: {
    color: '#84cc16', // lime
  },

  // Tab Content
  tabContent: {
    paddingHorizontal: 20,
  },
  statsContent: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1e293b', // dark-800
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155', // dark-700
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff', // white
    marginVertical: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#94a3b8', // dark-400
    textAlign: 'center',
  },
  
  comingSoon: {
    fontSize: 16,
    color: '#94a3b8', // dark-400
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
  
  bottomPadding: {
    height: 100,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a', // dark-900
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8', // dark-400
  },
});

export default UserProfileScreen; 