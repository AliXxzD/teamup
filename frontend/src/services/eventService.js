import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service pour gérer les événements
 */
class EventService {
  /**
   * Rejoindre un événement
   * @param {string} eventId - ID de l'événement
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async joinEvent(eventId) {
    try {
      console.log('🔄 EventService.joinEvent - Début (même approche que DiscoverScreen)');
      console.log('   - eventId:', eventId);
      
      const token = await AsyncStorage.getItem('accessToken');
      console.log('   - token exists:', !!token);
      
      if (!token) {
        console.log('❌ Pas de token');
        return {
          success: false,
          error: 'Utilisateur non connecté',
          isLoggedOut: true
        };
      }

      // Utiliser exactement la même approche que DiscoverScreen
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.JOIN(eventId)}`, {
        method: 'POST',
        headers: getAuthHeaders(token)
      });
      
      console.log('📊 Statut de participation:', response.status);
      const data = await response.json();
      console.log('📊 Données de réponse:', data);

      if (data.success) {
        console.log('✅ Join réussi');
        return {
          success: true,
          data: data.data,
          message: data.message || 'Vous avez rejoint l\'événement avec succès'
        };
      } else {
        console.log('❌ Join échoué:', data.message);
        return {
          success: false,
          error: data.message || 'Impossible de rejoindre l\'événement'
        };
      }

    } catch (error) {
      console.error('❌ Erreur joinEvent:', error);
      return {
        success: false,
        error: 'Impossible de rejoindre l\'événement'
      };
    }
  }

  /**
   * Quitter un événement
   * @param {string} eventId - ID de l'événement
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async leaveEvent(eventId) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return {
          success: false,
          error: 'Utilisateur non connecté',
          isLoggedOut: true
        };
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.LEAVE(eventId)}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Erreur lors de la sortie de l\'événement'
        };
      }

      return {
        success: true,
        data: data.data,
        message: data.message || 'Vous avez quitté l\'événement avec succès'
      };

    } catch (error) {
      console.error('Erreur leaveEvent:', error);
      return {
        success: false,
        error: 'Erreur de connexion'
      };
    }
  }

  /**
   * Vérifier si l'utilisateur peut rejoindre un événement
   * @param {Object} event - Données de l'événement
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Statut de participation
   */
  canUserJoinEvent(event, userId) {
    console.log('🔍 EventService.canUserJoinEvent - Début');
    console.log('   - event:', event);
    console.log('   - userId:', userId);
    
    if (!event || !userId) {
      console.log('❌ Données manquantes');
      return { canJoin: false, reason: 'Données manquantes' };
    }
    
    // Normaliser l'ID de l'utilisateur (string)
    const normalizedUserId = userId.toString();
    console.log('   - normalizedUserId:', normalizedUserId);

    // Vérifier si l'utilisateur est l'organisateur
    const organizerId = event.organizer?._id || event.organizer?.id || event.organizer;
    const normalizedOrganizerId = organizerId?.toString();
    console.log('   - organizerId:', organizerId);
    console.log('   - normalizedOrganizerId:', normalizedOrganizerId);
    console.log('   - normalizedUserId === normalizedOrganizerId:', normalizedUserId === normalizedOrganizerId);
    if (normalizedOrganizerId === normalizedUserId) {
      console.log('❌ Utilisateur est l\'organisateur');
      return { canJoin: false, reason: 'Vous êtes l\'organisateur de cet événement' };
    }

    // Vérifier le statut de l'événement
    if (event.status === 'cancelled') {
      return { canJoin: false, reason: 'Cet événement a été annulé' };
    }

    if (event.status === 'completed') {
      return { canJoin: false, reason: 'Cet événement est terminé' };
    }

    // Vérifier si l'événement est complet
    const currentParticipants = event.participants?.length || event.currentParticipants || 0;
    const maxParticipants = event.maxParticipants || 0;
    
    if (currentParticipants >= maxParticipants) {
      return { canJoin: false, reason: 'Cet événement est complet' };
    }

    // Vérifier si l'utilisateur participe déjà
    console.log('   - event.participants:', event.participants);
    const isParticipant = event.participants?.some(
      participant => {
        const participantId = participant.user?._id || participant.user?.id || participant.user;
        const normalizedParticipantId = participantId?.toString();
        console.log('   - participant:', participant);
        console.log('   - participantId:', participantId);
        console.log('   - normalizedParticipantId:', normalizedParticipantId);
        console.log('   - normalizedParticipantId === normalizedUserId:', normalizedParticipantId === normalizedUserId);
        return normalizedParticipantId === normalizedUserId;
      }
    );
    console.log('   - isParticipant:', isParticipant);

    if (isParticipant) {
      console.log('❌ Utilisateur participe déjà');
      return { canJoin: false, reason: 'Vous participez déjà à cet événement', isParticipant: true };
    }

    console.log('✅ Utilisateur peut rejoindre');
    return { canJoin: true, reason: 'Vous pouvez rejoindre cet événement' };
  }

  /**
   * Obtenir le texte du bouton selon le statut
   * @param {Object} event - Données de l'événement
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Texte et état du bouton
   */
  getJoinButtonState(event, userId) {
    const joinStatus = this.canUserJoinEvent(event, userId);
    
    if (joinStatus.isParticipant) {
      return {
        text: 'Quitter',
        action: 'leave',
        disabled: false,
        color: '#ef4444' // Rouge
      };
    }

    if (!joinStatus.canJoin) {
      return {
        text: joinStatus.reason,
        action: 'none',
        disabled: true,
        color: '#64748b' // Gris
      };
    }

    return {
      text: 'Rejoindre',
      action: 'join',
      disabled: false,
      color: '#22c55e' // Vert
    };
  }
}

export default new EventService();
