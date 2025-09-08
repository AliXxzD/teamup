/**
 * Service pour gérer les messages avec les organisateurs d'événements
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

class OrganizerMessageService {
  /**
   * Créer ou trouver une conversation avec l'organisateur d'un événement
   */
  async createConversationWithOrganizer(eventId) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      console.log('💬 Création conversation avec organisateur pour événement:', eventId);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MESSAGES.WITH_ORGANIZER}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ eventId }),
      });

      console.log('📡 Réponse API status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Erreur API:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la création de la conversation');
      }

      const data = await response.json();
      
      console.log('📊 Données API reçues:', {
        success: data.success,
        hasConversation: !!data.conversation,
        conversationKeys: data.conversation ? Object.keys(data.conversation) : [],
        conversationId: data.conversation?.id,
        hasEvent: !!data.event
      });
      
      if (!data.conversation) {
        throw new Error('Conversation non retournée par l\'API');
      }
      
      console.log('✅ Conversation créée/trouvée:', data.conversation.id);
      
      return {
        success: true,
        conversation: data.conversation,
        event: data.event
      };

    } catch (error) {
      console.error('❌ Erreur createConversationWithOrganizer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Naviguer vers le chat avec l'organisateur
   */
  async messageOrganizer(navigation, eventId, eventTitle, organizerName) {
    try {
      console.log(`💬 Démarrage conversation avec organisateur pour: ${eventTitle}`);
      
      const result = await this.createConversationWithOrganizer(eventId);
      
      console.log('🔍 Résultat createConversationWithOrganizer:', {
        success: result.success,
        hasConversation: !!result.conversation,
        conversationId: result.conversation?.id,
        error: result.error
      });
      
      if (result.success && result.conversation) {
        console.log('🔍 Structure conversation:', {
          id: result.conversation.id,
          type: result.conversation.type || 'private',
          participants: result.conversation.participants?.length,
          keys: Object.keys(result.conversation)
        });
        
        // Naviguer vers l'écran de chat
        navigation.navigate('Chat', {
          conversation: result.conversation,
          eventContext: {
            id: eventId,
            title: eventTitle,
            organizerName: organizerName
          }
        });
        
        return { success: true };
      } else {
        console.log('❌ Conversation non créée, création d\'une conversation temporaire');
        
        // Créer une conversation temporaire pour éviter le crash
        const tempConversation = {
          id: `temp-${Date.now()}`,
          type: 'private',
          name: `Chat avec ${organizerName}`,
          participants: [
            { _id: 'current-user', name: 'Vous' },
            { _id: 'organizer', name: organizerName }
          ],
          isActive: true,
          isTemporary: true
        };
        
        console.log('🔧 Conversation temporaire créée:', tempConversation);
        
        // Naviguer avec la conversation temporaire
        navigation.navigate('Chat', {
          conversation: tempConversation,
          eventContext: {
            id: eventId,
            title: eventTitle,
            organizerName: organizerName
          },
          autoSendMessage: this.generateOrganizerMessage(eventTitle, 'Utilisateur')
        });
        
        return { success: true, temporary: true };
      }

    } catch (error) {
      console.error('❌ Erreur messageOrganizer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Créer un message pré-rempli pour l'organisateur
   */
  generateOrganizerMessage(eventTitle, userName) {
    const templates = [
      `Bonjour ! Je suis intéressé(e) par votre événement "${eventTitle}". Pourriez-vous me donner plus d'informations ?`,
      `Salut ! J'aimerais participer à "${eventTitle}". Y a-t-il des prérequis particuliers ?`,
      `Bonjour ! Votre événement "${eventTitle}" m'intéresse beaucoup. Des places sont-elles encore disponibles ?`,
      `Salut ! Je souhaiterais rejoindre "${eventTitle}". Pouvez-vous me donner plus de détails ?`
    ];
    
    // Choisir un template aléatoire
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return randomTemplate;
  }

  /**
   * Vérifier si l'utilisateur peut contacter l'organisateur
   */
  async canMessageOrganizer(eventData, currentUserId) {
    // Vérifications de sécurité
    if (!eventData) {
      return {
        canMessage: false,
        reason: 'Données d\'événement manquantes'
      };
    }

    if (!eventData.organizer) {
      return {
        canMessage: false,
        reason: 'Organisateur non disponible'
      };
    }

    if (!currentUserId) {
      return {
        canMessage: false,
        reason: 'Utilisateur non connecté'
      };
    }

    const organizerId = eventData.organizer._id || eventData.organizer.id;
    
    if (!organizerId) {
      return {
        canMessage: false,
        reason: 'ID organisateur manquant'
      };
    }
    
    // Vérifier que l'utilisateur n'est pas l'organisateur
    if (organizerId === currentUserId) {
      return {
        canMessage: false,
        reason: 'Vous êtes l\'organisateur de cet événement'
      };
    }

    // Vérifier que l'événement est actif
    if (eventData.status && eventData.status !== 'active') {
      return {
        canMessage: false,
        reason: 'Événement non actif'
      };
    }

    return {
      canMessage: true,
      organizerName: eventData.organizer.name || 'Organisateur',
      organizerId: organizerId
    };
  }

  /**
   * Obtenir les informations de l'organisateur pour l'affichage
   */
  getOrganizerInfo(eventData) {
    if (!eventData || !eventData.organizer) {
      return null;
    }

    // Vérifications de sécurité pour éviter les erreurs _id undefined
    const organizer = eventData.organizer;
    
    return {
      id: organizer._id || organizer.id || null,
      name: organizer.name || 'Organisateur',
      avatar: organizer.profile?.avatar || organizer.avatar || null,
      email: organizer.email || null
    };
  }
}

// Instance singleton
const organizerMessageService = new OrganizerMessageService();

export default organizerMessageService;

// Export pour compatibilité
export { organizerMessageService as OrganizerMessageService };
