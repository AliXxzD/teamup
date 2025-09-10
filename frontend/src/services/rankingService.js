import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class RankingService {
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
   * Récupérer le classement global
   */
  async getGlobalRanking(limit = 50, offset = 0) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/ranking/global?limit=${limit}&offset=${offset}`,
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
      console.error('Erreur lors de la récupération du classement global:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer le classement hebdomadaire
   */
  async getWeeklyRanking(limit = 50) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/ranking/weekly?limit=${limit}`,
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
      console.error('Erreur lors de la récupération du classement hebdomadaire:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer le classement mensuel
   */
  async getMonthlyRanking(limit = 50) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/ranking/monthly?limit=${limit}`,
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
      console.error('Erreur lors de la récupération du classement mensuel:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }


  /**
   * Récupérer le classement selon le filtre sélectionné
   */
  async getRankingByFilter(filter, limit = 50, offset = 0) {
    switch (filter) {
      case 'global':
        return await this.getGlobalRanking(limit, offset);
      case 'weekly':
        return await this.getWeeklyRanking(limit);
      case 'monthly':
        return await this.getMonthlyRanking(limit);
      default:
        return await this.getGlobalRanking(limit, offset);
    }
  }
}

export default new RankingService();
