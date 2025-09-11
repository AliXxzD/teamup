import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper pour obtenir les headers d'authentification
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const reviewService = {
  /**
   * Créer un nouvel avis
   */
  createReview: async (reviewData) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erreur lors de la création de l\'avis'
        };
      }
    } catch (error) {
      console.error('Erreur createReview:', error);
      return {
        success: false,
        message: 'Erreur de connexion'
      };
    }
  },

  /**
   * Récupérer les avis d'un utilisateur
   */
  getUserReviews: async (userId, page = 1, limit = 10) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/user/${userId}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erreur lors de la récupération des avis'
        };
      }
    } catch (error) {
      console.error('Erreur getUserReviews:', error);
      return {
        success: false,
        message: 'Erreur de connexion'
      };
    }
  },

  /**
   * Récupérer les statistiques d'avis d'un utilisateur
   */
  getUserStats: async (userId) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/user/${userId}/stats`, {
        method: 'GET',
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erreur lors de la récupération des statistiques'
        };
      }
    } catch (error) {
      console.error('Erreur getUserStats:', error);
      return {
        success: false,
        message: 'Erreur de connexion'
      };
    }
  },

  /**
   * Récupérer les avis donnés par l'utilisateur connecté
   */
  getMyReviews: async (page = 1, limit = 10) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/my?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erreur lors de la récupération de vos avis'
        };
      }
    } catch (error) {
      console.error('Erreur getMyReviews:', error);
      return {
        success: false,
        message: 'Erreur de connexion'
      };
    }
  },

  /**
   * Récupérer les avis liés à un événement
   */
  getEventReviews: async (eventId, page = 1, limit = 10) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/event/${eventId}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erreur lors de la récupération des avis de l\'événement'
        };
      }
    } catch (error) {
      console.error('Erreur getEventReviews:', error);
      return {
        success: false,
        message: 'Erreur de connexion'
      };
    }
  },

  /**
   * Vérifier si l'utilisateur peut donner un avis
   */
  canReview: async (userId, eventId = null) => {
    try {
      const headers = await getAuthHeaders();
      
      const url = eventId 
        ? `${API_BASE_URL}/api/reviews/can-review/${userId}?eventId=${eventId}`
        : `${API_BASE_URL}/api/reviews/can-review/${userId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erreur lors de la vérification'
        };
      }
    } catch (error) {
      console.error('Erreur canReview:', error);
      return {
        success: false,
        message: 'Erreur de connexion'
      };
    }
  },

  /**
   * Modifier un avis
   */
  updateReview: async (reviewId, reviewData) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erreur lors de la modification de l\'avis'
        };
      }
    } catch (error) {
      console.error('Erreur updateReview:', error);
      return {
        success: false,
        message: 'Erreur de connexion'
      };
    }
  },

  /**
   * Supprimer un avis
   */
  deleteReview: async (reviewId) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erreur lors de la suppression de l\'avis'
        };
      }
    } catch (error) {
      console.error('Erreur deleteReview:', error);
      return {
        success: false,
        message: 'Erreur de connexion'
      };
    }
  }
};

export default reviewService;