import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service pour gérer tous les boutons de l'application
 * Basé sur le modèle qui fonctionne parfaitement dans DiscoverScreen
 */
class ButtonService {

  /**
   * Rejoindre un événement (modèle de DiscoverScreen qui fonctionne)
   * @param {string} eventId - ID de l'événement
   * @param {Function} onSuccess - Callback de succès
   * @param {Function} onError - Callback d'erreur
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async joinEvent(eventId, onSuccess = null, onError = null) {
    try {
      console.log('🔄 ButtonService.joinEvent - DÉBUT DU CLIC');
      console.log('   - eventId:', eventId);
      console.log('   - onSuccess callback:', !!onSuccess);
      console.log('   - onError callback:', !!onError);
      console.log('   - Timestamp:', new Date().toISOString());
      
      const token = await AsyncStorage.getItem('accessToken');
      console.log('   - Token récupéré:', !!token);
      console.log('   - Token length:', token?.length || 0);
      
      if (!token) {
        console.log('❌ PAS DE TOKEN - Arrêt de la fonction');
        const error = {
          success: false,
          error: 'Connexion requise',
          message: 'Vous devez être connecté pour rejoindre un événement',
          isLoggedOut: true
        };
        console.log('   - Appel onError callback:', !!onError);
        if (onError) onError(error);
        return error;
      }

      // Utiliser exactement la même approche que DiscoverScreen
      const url = `${API_BASE_URL}${API_ENDPOINTS.EVENTS.JOIN(eventId)}`;
      console.log('   - URL de l\'API:', url);
      console.log('   - Headers:', getAuthHeaders(token));
      
      console.log('🌐 ENVOI DE LA REQUÊTE API...');
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token)
      });
      
      console.log('📊 RÉPONSE REÇUE:');
      console.log('   - Status:', response.status);
      console.log('   - Status Text:', response.statusText);
      console.log('   - Headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📊 DONNÉES DE RÉPONSE:', data);

      if (data.success) {
        console.log('✅ JOIN RÉUSSI !');
        const result = {
          success: true,
          data: data.data,
          message: data.message || 'Vous avez rejoint l\'événement avec succès'
        };
        console.log('   - Résultat de succès:', result);
        console.log('   - Appel onSuccess callback:', !!onSuccess);
        if (onSuccess) {
          console.log('   - Exécution du callback onSuccess...');
          onSuccess(result);
        }
        return result;
      } else {
        console.log('❌ JOIN ÉCHOUÉ:', data.message);
        const error = {
          success: false,
          error: data.message || 'Impossible de rejoindre l\'événement'
        };
        console.log('   - Résultat d\'erreur:', error);
        console.log('   - Appel onError callback:', !!onError);
        if (onError) {
          console.log('   - Exécution du callback onError...');
          onError(error);
        }
        return error;
      }

    } catch (error) {
      console.error('❌ ERREUR CRITIQUE joinEvent:', error);
      console.log('   - Type d\'erreur:', error.constructor.name);
      console.log('   - Message d\'erreur:', error.message);
      console.log('   - Stack trace:', error.stack);
      
      const errorResult = {
        success: false,
        error: 'Impossible de rejoindre l\'événement',
        details: error.message
      };
      console.log('   - Résultat d\'erreur critique:', errorResult);
      console.log('   - Appel onError callback:', !!onError);
      if (onError) {
        console.log('   - Exécution du callback onError...');
        onError(errorResult);
      }
      return errorResult;
    }
  }

  /**
   * Quitter un événement
   * @param {string} eventId - ID de l'événement
   * @param {Function} onSuccess - Callback de succès
   * @param {Function} onError - Callback d'erreur
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async leaveEvent(eventId, onSuccess = null, onError = null) {
    try {
      console.log('🔄 ButtonService.leaveEvent - DÉBUT DU CLIC LEAVE');
      console.log('   - eventId:', eventId);
      console.log('   - onSuccess callback:', !!onSuccess);
      console.log('   - onError callback:', !!onError);
      console.log('   - Timestamp:', new Date().toISOString());
      
      const token = await AsyncStorage.getItem('accessToken');
      console.log('   - Token récupéré:', !!token);
      console.log('   - Token length:', token?.length || 0);
      
      if (!token) {
        console.log('❌ PAS DE TOKEN - Arrêt de la fonction LEAVE');
        const error = {
          success: false,
          error: 'Connexion requise',
          message: 'Vous devez être connecté pour quitter un événement',
          isLoggedOut: true
        };
        console.log('   - Appel onError callback:', !!onError);
        if (onError) onError(error);
        return error;
      }

      const url = `${API_BASE_URL}${API_ENDPOINTS.EVENTS.LEAVE(eventId)}`;
      console.log('   - URL de l\'API LEAVE:', url);
      console.log('   - Headers:', getAuthHeaders(token));
      
      console.log('🌐 ENVOI DE LA REQUÊTE API LEAVE...');
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token)
      });
      
      console.log('📊 RÉPONSE LEAVE REÇUE:');
      console.log('   - Status:', response.status);
      console.log('   - Status Text:', response.statusText);
      console.log('   - Headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📊 DONNÉES DE RÉPONSE LEAVE:', data);

      if (data.success) {
        console.log('✅ LEAVE RÉUSSI !');
        const result = {
          success: true,
          data: data.data,
          message: data.message || 'Vous avez quitté l\'événement avec succès'
        };
        console.log('   - Résultat de succès LEAVE:', result);
        console.log('   - Appel onSuccess callback:', !!onSuccess);
        if (onSuccess) {
          console.log('   - Exécution du callback onSuccess LEAVE...');
          onSuccess(result);
        }
        return result;
      } else {
        console.log('❌ LEAVE ÉCHOUÉ:', data.message);
        const error = {
          success: false,
          error: data.message || 'Impossible de quitter l\'événement'
        };
        console.log('   - Résultat d\'erreur LEAVE:', error);
        console.log('   - Appel onError callback:', !!onError);
        if (onError) {
          console.log('   - Exécution du callback onError LEAVE...');
          onError(error);
        }
        return error;
      }

    } catch (error) {
      console.error('❌ ERREUR CRITIQUE leaveEvent:', error);
      console.log('   - Type d\'erreur:', error.constructor.name);
      console.log('   - Message d\'erreur:', error.message);
      console.log('   - Stack trace:', error.stack);
      
      const errorResult = {
        success: false,
        error: 'Impossible de quitter l\'événement',
        details: error.message
      };
      console.log('   - Résultat d\'erreur critique LEAVE:', errorResult);
      console.log('   - Appel onError callback:', !!onError);
      if (onError) {
        console.log('   - Exécution du callback onError LEAVE...');
        onError(errorResult);
      }
      return errorResult;
    }
  }

  /**
   * Créer un événement
   * @param {Object} eventData - Données de l'événement
   * @param {Function} onSuccess - Callback de succès
   * @param {Function} onError - Callback d'erreur
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async createEvent(eventData, onSuccess = null, onError = null) {
    try {
      console.log('🔄 ButtonService.createEvent - Début');
      console.log('   - eventData:', eventData);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        console.log('❌ Pas de token');
        const error = {
          success: false,
          error: 'Connexion requise',
          message: 'Vous devez être connecté pour créer un événement',
          isLoggedOut: true
        };
        if (onError) onError(error);
        return error;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.CREATE}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(eventData)
      });
      
      console.log('📊 Statut de création:', response.status);
      const data = await response.json();
      console.log('📊 Données de réponse:', data);

      if (data.success) {
        console.log('✅ Create réussi');
        const result = {
          success: true,
          data: data.data,
          message: data.message || 'Événement créé avec succès'
        };
        if (onSuccess) onSuccess(result);
        return result;
      } else {
        console.log('❌ Create échoué:', data.message);
        const error = {
          success: false,
          error: data.message || 'Impossible de créer l\'événement'
        };
        if (onError) onError(error);
        return error;
      }

    } catch (error) {
      console.error('❌ Erreur createEvent:', error);
      const errorResult = {
        success: false,
        error: 'Impossible de créer l\'événement'
      };
      if (onError) onError(errorResult);
      return errorResult;
    }
  }

  /**
   * Modifier un événement
   * @param {string} eventId - ID de l'événement
   * @param {Object} eventData - Nouvelles données de l'événement
   * @param {Function} onSuccess - Callback de succès
   * @param {Function} onError - Callback d'erreur
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async updateEvent(eventId, eventData, onSuccess = null, onError = null) {
    try {
      console.log('🔄 ButtonService.updateEvent - Début');
      console.log('   - eventId:', eventId);
      console.log('   - eventData:', eventData);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        console.log('❌ Pas de token');
        const error = {
          success: false,
          error: 'Connexion requise',
          message: 'Vous devez être connecté pour modifier un événement',
          isLoggedOut: true
        };
        if (onError) onError(error);
        return error;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.DETAILS(eventId)}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(eventData)
      });
      
      console.log('📊 Statut de modification:', response.status);
      const data = await response.json();
      console.log('📊 Données de réponse:', data);

      if (data.success) {
        console.log('✅ Update réussi');
        const result = {
          success: true,
          data: data.data,
          message: data.message || 'Événement modifié avec succès'
        };
        if (onSuccess) onSuccess(result);
        return result;
      } else {
        console.log('❌ Update échoué:', data.message);
        const error = {
          success: false,
          error: data.message || 'Impossible de modifier l\'événement'
        };
        if (onError) onError(error);
        return error;
      }

    } catch (error) {
      console.error('❌ Erreur updateEvent:', error);
      const errorResult = {
        success: false,
        error: 'Impossible de modifier l\'événement'
      };
      if (onError) onError(errorResult);
      return errorResult;
    }
  }

  /**
   * Supprimer un participant d'un événement
   * @param {string} eventId - ID de l'événement
   * @param {string} participantId - ID du participant
   * @param {Function} onSuccess - Callback de succès
   * @param {Function} onError - Callback d'erreur
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async removeParticipant(eventId, participantId, onSuccess = null, onError = null) {
    try {
      console.log('🔄 ButtonService.removeParticipant - Début');
      console.log('   - eventId:', eventId);
      console.log('   - participantId:', participantId);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        console.log('❌ Pas de token');
        const error = {
          success: false,
          error: 'Connexion requise',
          message: 'Vous devez être connecté pour gérer les participants',
          isLoggedOut: true
        };
        if (onError) onError(error);
        return error;
      }

      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/participants/${participantId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });
      
      console.log('📊 Statut de suppression:', response.status);
      const data = await response.json();
      console.log('📊 Données de réponse:', data);

      if (response.ok) {
        console.log('✅ Remove participant réussi');
        const result = {
          success: true,
          data: data,
          message: 'Participant retiré de l\'événement'
        };
        if (onSuccess) onSuccess(result);
        return result;
      } else {
        console.log('❌ Remove participant échoué');
        const error = {
          success: false,
          error: 'Impossible de retirer le participant'
        };
        if (onError) onError(error);
        return error;
      }

    } catch (error) {
      console.error('❌ Erreur removeParticipant:', error);
      const errorResult = {
        success: false,
        error: 'Impossible de retirer le participant'
      };
      if (onError) onError(errorResult);
      return errorResult;
    }
  }

  /**
   * Créer une conversation avec un organisateur
   * @param {string} eventId - ID de l'événement
   * @param {Function} onSuccess - Callback de succès
   * @param {Function} onError - Callback d'erreur
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async createConversationWithOrganizer(eventId, onSuccess = null, onError = null) {
    try {
      console.log('🔄 ButtonService.createConversationWithOrganizer - Début');
      console.log('   - eventId:', eventId);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        console.log('❌ Pas de token');
        const error = {
          success: false,
          error: 'Connexion requise',
          message: 'Vous devez être connecté pour contacter l\'organisateur',
          isLoggedOut: true
        };
        if (onError) onError(error);
        return error;
      }

      const response = await fetch(`${API_BASE_URL}/api/messages/conversations/with-organizer`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ eventId })
      });
      
      console.log('📊 Statut de création conversation:', response.status);
      const data = await response.json();
      console.log('📊 Données de réponse:', data);

      if (data.success) {
        console.log('✅ Create conversation réussi');
        const result = {
          success: true,
          data: data.data,
          message: data.message || 'Conversation créée avec succès'
        };
        if (onSuccess) onSuccess(result);
        return result;
      } else {
        console.log('❌ Create conversation échoué:', data.message);
        const error = {
          success: false,
          error: data.message || 'Impossible de créer la conversation'
        };
        if (onError) onError(error);
        return error;
      }

    } catch (error) {
      console.error('❌ Erreur createConversationWithOrganizer:', error);
      const errorResult = {
        success: false,
        error: 'Impossible de créer la conversation'
      };
      if (onError) onError(errorResult);
      return errorResult;
    }
  }
}

// Export d'une instance unique
const buttonService = new ButtonService();
export default buttonService;
