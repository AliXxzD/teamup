/**
 * Service pour calculer les points et achievements réels
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, getAuthHeaders } from '../config/api';

class PointsService {
  /**
   * Calcule les points basés sur les activités de l'utilisateur
   */
  calculatePoints(userStats) {
    if (!userStats) return 0;

    let points = 0;

    // Points pour les événements organisés (50 points par événement)
    points += (userStats.eventsOrganized || 0) * 50;

    // Points pour les événements rejoints (20 points par événement)
    points += (userStats.eventsJoined || 0) * 20;

    // Points bonus pour la note moyenne (max 500 points)
    if (userStats.averageRating && userStats.totalRatings > 0) {
      const ratingBonus = Math.round((userStats.averageRating / 5) * 500);
      points += ratingBonus;
    }

    // Points bonus pour l'ancienneté (1 point par jour depuis inscription)
    if (userStats.registrationDate) {
      const registrationDate = new Date(userStats.registrationDate);
      const daysSinceRegistration = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
      points += Math.min(daysSinceRegistration, 365); // Max 365 points pour l'ancienneté
    }

    // Points bonus pour la vérification email (100 points)
    if (userStats.isEmailVerified) {
      points += 100;
    }

    return Math.max(points, 0);
  }

  /**
   * Calcule le niveau basé sur les points
   */
  calculateLevel(points) {
    if (points < 100) return 1;
    if (points < 300) return 2;
    if (points < 600) return 3;
    if (points < 1000) return 4;
    if (points < 1500) return 5;
    if (points < 2200) return 6;
    if (points < 3000) return 7;
    if (points < 4000) return 8;
    if (points < 5500) return 9;
    if (points < 7500) return 10;
    
    // Niveaux élevés (formule exponentielle)
    const baseLevel = 10;
    const remainingPoints = points - 7500;
    const additionalLevels = Math.floor(remainingPoints / 1000);
    
    return Math.min(baseLevel + additionalLevels, 50); // Max niveau 50
  }

  /**
   * Calcule les points nécessaires pour le prochain niveau
   */
  getPointsForNextLevel(currentLevel) {
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];
    
    if (currentLevel < levelThresholds.length) {
      return levelThresholds[currentLevel];
    }
    
    // Pour les niveaux élevés
    return 7500 + ((currentLevel - 10) * 1000);
  }

  /**
   * Calcule les achievements de l'utilisateur
   */
  calculateAchievements(userStats, userEvents = []) {
    const achievements = [];

    // Achievement: Premier événement organisé
    if ((userStats?.eventsOrganized || 0) >= 1) {
      achievements.push({
        id: 'first_event_organized',
        title: 'Premier Organisateur',
        description: 'Organisez votre premier événement',
        icon: 'calendar',
        color: '#22c55e',
        unlocked: true,
        points: 50
      });
    }

    // Achievement: 5 événements organisés
    if ((userStats?.eventsOrganized || 0) >= 5) {
      achievements.push({
        id: 'event_organizer_5',
        title: 'Organisateur Actif',
        description: 'Organisez 5 événements',
        icon: 'trophy',
        color: '#f59e0b',
        unlocked: true,
        points: 100
      });
    }

    // Achievement: 10 événements rejoints
    if ((userStats?.eventsJoined || 0) >= 10) {
      achievements.push({
        id: 'participant_10',
        title: 'Sportif Régulier',
        description: 'Participez à 10 événements',
        icon: 'people',
        color: '#3b82f6',
        unlocked: true,
        points: 150
      });
    }

    // Achievement: Note moyenne élevée
    if ((userStats?.averageRating || 0) >= 4.5 && (userStats?.totalRatings || 0) >= 5) {
      achievements.push({
        id: 'high_rating',
        title: 'Très Apprécié',
        description: 'Obtenez une note moyenne de 4.5+',
        icon: 'star',
        color: '#8b5cf6',
        unlocked: true,
        points: 200
      });
    }

    // Achievement: Email vérifié
    if (userStats?.isEmailVerified) {
      achievements.push({
        id: 'email_verified',
        title: 'Compte Vérifié',
        description: 'Vérifiez votre adresse email',
        icon: 'checkmark-circle',
        color: '#06b6d4',
        unlocked: true,
        points: 100
      });
    }

    // Achievement: Membre depuis 30 jours
    if (userStats?.registrationDate) {
      const daysSinceRegistration = Math.floor((Date.now() - new Date(userStats.registrationDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceRegistration >= 30) {
        achievements.push({
          id: 'member_30_days',
          title: 'Membre Fidèle',
          description: 'Membre depuis 30 jours',
          icon: 'time',
          color: '#ef4444',
          unlocked: true,
          points: 150
        });
      }
    }

    // Achievements à débloquer (exemples)
    const lockedAchievements = [];

    if ((userStats?.eventsOrganized || 0) < 1) {
      lockedAchievements.push({
        id: 'first_event_organized',
        title: 'Premier Organisateur',
        description: 'Organisez votre premier événement',
        icon: 'calendar',
        color: '#6b7280',
        unlocked: false,
        points: 50
      });
    }

    if ((userStats?.eventsJoined || 0) < 10) {
      lockedAchievements.push({
        id: 'participant_10',
        title: 'Sportif Régulier',
        description: 'Participez à 10 événements',
        icon: 'people',
        color: '#6b7280',
        unlocked: false,
        points: 150,
        progress: `${userStats?.eventsJoined || 0}/10`
      });
    }

    return {
      unlocked: achievements,
      locked: lockedAchievements,
      total: achievements.length + lockedAchievements.length
    };
  }

  /**
   * Récupère les statistiques utilisateur depuis l'API
   */
  async getUserStats() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        // Pas d'erreur si pas de token (utilisateur déconnecté)
        return {
          success: false,
          error: 'Utilisateur non connecté',
          stats: null,
          isLoggedOut: true
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Si token invalide, c'est probablement une déconnexion
        if (response.status === 401) {
          return {
            success: false,
            error: 'Session expirée',
            stats: null,
            isLoggedOut: true
          };
        }
        
        // Pour les autres erreurs, retourner un objet d'erreur au lieu de lancer une exception
        return {
          success: false,
          error: errorData.message || 'Erreur lors de la récupération du profil',
          stats: null,
          isLoggedOut: false
        };
      }

      const data = await response.json();
      return {
        success: true,
        stats: data.user,
        isLoggedOut: false
      };

    } catch (error) {
      // Log uniquement les erreurs inattendues (pas les erreurs de déconnexion/réseau)
      const isExpectedError = error.message.includes('Token') || 
                             error.message.includes('401') || 
                             error.message.includes('fetch') ||
                             error.message.includes('Network') ||
                             error.message.includes('Failed to fetch');
      
      if (!isExpectedError) {
        console.error('Erreur getUserStats inattendue:', error);
      }
      
      return {
        success: false,
        error: error.message,
        stats: null,
        isLoggedOut: error.message.includes('Token') || error.message.includes('401')
      };
    }
  }

  /**
   * Calcule toutes les données de progression
   */
  async calculateUserProgression() {
    try {
      const statsResult = await this.getUserStats();
      
      if (!statsResult.success) {
        // Si l'utilisateur est déconnecté, ne pas traiter comme une erreur
        if (statsResult.isLoggedOut) {
          return {
            success: false,
            error: 'Utilisateur non connecté',
            isLoggedOut: true
          };
        }
        
        return {
          success: false,
          error: statsResult.error
        };
      }

      const userStats = statsResult.stats;
      
      // Debug: Vérifier la structure des données
      console.log('🔍 Debug getUserStats - userStats:', userStats);
      console.log('🔍 Debug getUserStats - userStats.stats:', userStats.stats);
      
      // Les statistiques sont maintenant dans userStats.stats (depuis getPublicProfileWithRealStats)
      const stats = userStats.stats || {};
      
      // Calculer les points
      const points = this.calculatePoints(stats);
      
      // Calculer le niveau
      const level = this.calculateLevel(points);
      
      // Points pour le prochain niveau
      const nextLevelPoints = this.getPointsForNextLevel(level);
      const currentLevelPoints = level > 1 ? this.getPointsForNextLevel(level - 1) : 0;
      const progressPoints = points - currentLevelPoints;
      const neededPoints = nextLevelPoints - currentLevelPoints;
      const progressPercentage = Math.min((progressPoints / neededPoints) * 100, 100);

      // Calculer les achievements
      const achievements = this.calculateAchievements(stats);

      return {
        success: true,
        data: {
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
            isEmailVerified: userStats.isEmailVerified || false,
            registrationDate: stats.registrationDate || userStats.createdAt
          }
        }
      };

    } catch (error) {
      console.error('Erreur calculateUserProgression:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtient le titre du niveau
   */
  getLevelTitle(level) {
    const levelTitles = {
      1: 'Débutant',
      2: 'Novice',
      3: 'Apprenti',
      4: 'Sportif',
      5: 'Athlète',
      6: 'Compétiteur',
      7: 'Expert',
      8: 'Champion',
      9: 'Maître',
      10: 'Légende',
    };

    if (level <= 10) {
      return levelTitles[level] || 'Sportif';
    }

    if (level <= 20) return 'Elite';
    if (level <= 30) return 'Pro';
    if (level <= 40) return 'Superstar';
    return 'Immortel';
  }

  /**
   * Obtient la couleur du niveau
   */
  getLevelColor(level) {
    if (level <= 3) return '#22c55e';      // Vert - Débutant
    if (level <= 6) return '#3b82f6';      // Bleu - Intermédiaire
    if (level <= 9) return '#8b5cf6';      // Violet - Avancé
    if (level <= 15) return '#f59e0b';     // Orange - Expert
    if (level <= 25) return '#ef4444';     // Rouge - Elite
    return '#06b6d4';                      // Cyan - Légendaire
  }
}

// Instance singleton
const pointsService = new PointsService();

export default pointsService;

export {
  pointsService as PointsService,
};
