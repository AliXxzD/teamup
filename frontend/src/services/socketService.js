/**
 * Service Socket.io pour la messagerie temps réel côté frontend
 */

import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isAuthenticated = false;
    this.currentConversationId = null;
    this.messageListeners = new Map();
    this.typingListeners = new Map();
    this.connectionListeners = [];
  }

  /**
   * Connexion à Socket.io
   */
  async connect() {
    try {
      if (this.socket && this.isConnected) {
        console.log('🔌 Socket déjà connecté');
        return true;
      }

      console.log('🔌 Connexion Socket.io...');
      
      this.socket = io(API_BASE_URL, {
        transports: ['polling', 'websocket'], // Polling en premier pour plus de fiabilité
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        forceNew: true, // Force une nouvelle connexion
        autoConnect: true,
      });

      // Événements de connexion
      this.socket.on('connect', () => {
        console.log('✅ Socket.io connecté:', this.socket.id);
        this.isConnected = true;
        this.authenticate();
        this.notifyConnectionListeners(true);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('👋 Socket.io déconnecté:', reason);
        this.isConnected = false;
        this.isAuthenticated = false;
        this.notifyConnectionListeners(false);
        
        // Reconnexion automatique si déconnexion involontaire
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          console.log('🔄 Reconnexion Socket.io programmée...');
        }
      });

      // Gestion des tentatives de reconnexion
      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket.io reconnecté après', attemptNumber, 'tentatives');
        this.isConnected = true;
        // Re-authentifier après reconnexion
        this.authenticate();
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Tentative de reconnexion Socket.io:', attemptNumber);
      });

      this.socket.on('reconnect_error', (error) => {
        console.log('🔄 Erreur reconnexion Socket.io (normal):', error.message);
      });

      this.socket.on('reconnect_failed', () => {
        console.log('❌ Échec de reconnexion Socket.io - Fallback HTTP actif');
        this.isConnected = false;
        this.isAuthenticated = false;
      });

      this.socket.on('connect_error', (error) => {
        // Ne pas logger comme erreur si c'est juste une reconnexion
        if (error.message.includes('websocket error') || error.message.includes('timeout')) {
          console.log('🔄 Reconnexion Socket.io en cours...', error.message);
        } else {
          console.error('❌ Erreur connexion Socket.io:', error.message);
        }
        this.notifyConnectionListeners(false);
      });

      // Événements d'authentification
      this.socket.on('authenticated', (data) => {
        console.log('✅ Socket authentifié:', data.userId);
        this.isAuthenticated = true;
      });

      this.socket.on('auth_error', (data) => {
        console.error('❌ Erreur authentification Socket:', data.error);
        this.isAuthenticated = false;
      });

      // Événements de messagerie
      this.socket.on('new_message', (data) => {
        this.handleNewMessage(data);
      });

      this.socket.on('conversation_updated', (data) => {
        this.handleConversationUpdated(data);
      });

      this.socket.on('messages_read', (data) => {
        this.handleMessagesRead(data);
      });

      this.socket.on('user_typing', (data) => {
        this.handleUserTyping(data);
      });

      // Événements d'erreur
      this.socket.on('error', (data) => {
        console.error('❌ Erreur Socket:', data.error);
      });

      return true;

    } catch (error) {
      console.error('❌ Erreur connexion Socket.io:', error);
      return false;
    }
  }

  /**
   * Authentification avec le token JWT
   */
  async authenticate() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('⚠️ Pas de token pour l\'authentification Socket');
        return false;
      }

      this.socket.emit('authenticate', { token });
      return true;

    } catch (error) {
      console.error('❌ Erreur authentification Socket:', error);
      return false;
    }
  }

  /**
   * Déconnexion
   */
  disconnect() {
    try {
      if (this.socket) {
        // Nettoyer les listeners avant de déconnecter
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
        this.isAuthenticated = false;
        this.currentConversationId = null;
        
        // Nettoyer les maps de listeners
        this.messageListeners.clear();
        this.typingListeners.clear();
        
        console.log('👋 Socket.io déconnecté proprement');
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la déconnexion Socket.io (normal):', error.message);
      // Forcer le nettoyage même en cas d'erreur
      this.socket = null;
      this.isConnected = false;
      this.isAuthenticated = false;
    }
  }

  /**
   * Rejoindre une conversation
   */
  joinConversation(conversationId) {
    if (!this.socket || !this.isAuthenticated) {
      console.warn('⚠️ Socket non authentifié pour rejoindre la conversation');
      return false;
    }

    this.currentConversationId = conversationId;
    this.socket.emit('join_conversation', { conversationId });
    console.log(`👥 Rejoindre la conversation: ${conversationId}`);
    return true;
  }

  /**
   * Quitter une conversation
   */
  leaveConversation(conversationId) {
    if (!this.socket) return;

    this.socket.emit('leave_conversation', { conversationId });
    
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
    
    console.log(`👋 Quitter la conversation: ${conversationId}`);
  }

  /**
   * Envoyer un message
   */
  sendMessage(conversationId, content, type = 'text', metadata = {}) {
    if (!this.socket || !this.isAuthenticated) {
      console.warn('⚠️ Socket non authentifié pour envoyer un message');
      return false;
    }

    this.socket.emit('send_message', {
      conversationId,
      content,
      type,
      metadata
    });

    console.log(`💬 Message envoyé à ${conversationId}:`, content.substring(0, 50));
    return true;
  }

  /**
   * Marquer les messages comme lus
   */
  markAsRead(conversationId) {
    if (!this.socket || !this.isAuthenticated) return false;

    this.socket.emit('mark_as_read', { conversationId });
    console.log(`✅ Messages marqués comme lus: ${conversationId}`);
    return true;
  }

  /**
   * Démarrer l'indicateur de frappe
   */
  startTyping(conversationId) {
    if (!this.socket || !this.isAuthenticated) return false;

    this.socket.emit('typing_start', { conversationId });
    return true;
  }

  /**
   * Arrêter l'indicateur de frappe
   */
  stopTyping(conversationId) {
    if (!this.socket || !this.isAuthenticated) return false;

    this.socket.emit('typing_stop', { conversationId });
    return true;
  }

  /**
   * Écouter les nouveaux messages
   */
  onMessage(conversationId, callback) {
    this.messageListeners.set(conversationId, callback);
  }

  /**
   * Arrêter d'écouter les messages
   */
  offMessage(conversationId) {
    this.messageListeners.delete(conversationId);
  }

  /**
   * Écouter les indicateurs de frappe
   */
  onTyping(conversationId, callback) {
    this.typingListeners.set(conversationId, callback);
  }

  /**
   * Arrêter d'écouter les indicateurs de frappe
   */
  offTyping(conversationId) {
    this.typingListeners.delete(conversationId);
  }

  /**
   * Écouter les changements de connexion
   */
  onConnectionChange(callback) {
    this.connectionListeners.push(callback);
  }

  /**
   * Arrêter d'écouter les changements de connexion
   */
  offConnectionChange(callback) {
    this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
  }

  /**
   * Gérer la réception d'un nouveau message
   */
  handleNewMessage(data) {
    const { message, conversationId } = data;
    
    console.log(`📨 Nouveau message reçu dans ${conversationId}:`, message.content?.substring(0, 50));
    
    const listener = this.messageListeners.get(conversationId);
    if (listener) {
      listener(message);
    }
  }

  /**
   * Gérer la mise à jour d'une conversation
   */
  handleConversationUpdated(data) {
    console.log('🔄 Conversation mise à jour:', data.conversationId);
    
    // Notifier les écrans de liste de conversations
    const listener = this.messageListeners.get('conversations_list');
    if (listener) {
      listener(data);
    }
  }

  /**
   * Gérer les messages marqués comme lus
   */
  handleMessagesRead(data) {
    const { conversationId, readBy } = data;
    
    console.log(`✅ Messages lus dans ${conversationId} par ${readBy}`);
    
    const listener = this.messageListeners.get(conversationId);
    if (listener) {
      listener({ type: 'messages_read', readBy, conversationId });
    }
  }

  /**
   * Gérer les indicateurs de frappe
   */
  handleUserTyping(data) {
    const { conversationId, userId, userName, isTyping } = data;
    
    console.log(`⌨️ ${userName} ${isTyping ? 'tape' : 'arrête de taper'} dans ${conversationId}`);
    
    const listener = this.typingListeners.get(conversationId);
    if (listener) {
      listener({ userId, userName, isTyping });
    }
  }

  /**
   * Notifier les listeners de changement de connexion
   */
  notifyConnectionListeners(isConnected) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('❌ Erreur listener connexion:', error);
      }
    });
  }

  /**
   * Obtenir le statut de connexion
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isAuthenticated: this.isAuthenticated,
      socketId: this.socket?.id,
      currentConversation: this.currentConversationId
    };
  }
}

// Instance singleton
const socketService = new SocketService();

export default socketService;

// Export pour compatibilité
export { socketService as SocketService };
