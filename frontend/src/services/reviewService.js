import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ReviewService {
  /**
   * Récupérer les headers d'authentification
   */
  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Créer un nouvel avis
   */
  async createReview(reviewData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les avis d'un utilisateur
   */
  async getUserReviews(userId, page = 1, limit = 10) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/user/${userId}?page=${page}&limit=${limit}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les statistiques d'avis d'un utilisateur
   */
  async getUserStats(userId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/user/${userId}/stats`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les avis donnés par l'utilisateur connecté
   */
  async getMyReviews(page = 1, limit = 10) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/my?page=${page}&limit=${limit}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des avis donnés:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Modifier un avis
   */
  async updateReview(reviewId, updateData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erreur lors de la modification de l\'avis:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Supprimer un avis
   */
  async deleteReview(reviewId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'avis:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les avis liés à un événement
   */
  async getEventReviews(eventId, page = 1, limit = 10) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/event/${eventId}?page=${page}&limit=${limit}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des avis de l\'événement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Vérifier si l'utilisateur peut donner un avis
   */
  async canUserReview(userId, eventId = null) {
    try {
      const headers = await this.getAuthHeaders();
      const url = eventId 
        ? `${API_BASE_URL}/api/reviews/can-review/${userId}?eventId=${eventId}`
        : `${API_BASE_URL}/api/reviews/can-review/${userId}`;
      
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new ReviewService();
