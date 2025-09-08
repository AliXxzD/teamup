/**
 * Service de gestion des connexions Socket.io pour la messagerie temps réel
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

class SocketService {
  constructor() {
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map();    // socketId -> userId
    this.io = null;
  }

  /**
   * Initialise Socket.io avec le serveur
   */
  initialize(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log('🔌 Nouvelle connexion Socket.io:', socket.id);
      
      // Authentification du socket
      socket.on('authenticate', async (data) => {
        await this.authenticateSocket(socket, data);
      });

      // Rejoindre une conversation
      socket.on('join_conversation', async (data) => {
        await this.joinConversation(socket, data);
      });

      // Quitter une conversation
      socket.on('leave_conversation', async (data) => {
        await this.leaveConversation(socket, data);
      });

      // Envoyer un message
      socket.on('send_message', async (data) => {
        await this.handleSendMessage(socket, data);
      });

      // Marquer comme lu
      socket.on('mark_as_read', async (data) => {
        await this.handleMarkAsRead(socket, data);
      });

      // Indicateur de frappe
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Déconnexion
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
    });

    console.log('✅ Socket.io initialisé pour la messagerie temps réel');
  }

  /**
   * Authentifie un socket avec un token JWT
   */
  async authenticateSocket(socket, data) {
    try {
      const { token } = data;
      
      if (!token) {
        socket.emit('auth_error', { error: 'Token manquant' });
        return;
      }

      // Vérifier le token JWT
      const JWT_SECRET = process.env.JWT_SECRET || 'teamup_secret_key_change_in_production';
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Récupérer l'utilisateur
      const user = await User.findById(decoded.userId);
      if (!user) {
        socket.emit('auth_error', { error: 'Utilisateur non trouvé' });
        return;
      }

      // Enregistrer la connexion
      this.connectedUsers.set(user._id.toString(), socket.id);
      this.userSockets.set(socket.id, user._id.toString());
      
      socket.userId = user._id.toString();
      socket.user = user;

      socket.emit('authenticated', {
        message: 'Authentification réussie',
        userId: user._id,
        socketId: socket.id
      });

      console.log(`✅ Utilisateur authentifié: ${user.name} (${socket.id})`);

    } catch (error) {
      console.error('❌ Erreur authentification socket:', error.message);
      socket.emit('auth_error', { error: 'Token invalide' });
    }
  }

  /**
   * Rejoindre une conversation
   */
  async joinConversation(socket, data) {
    try {
      if (!socket.userId) {
        socket.emit('error', { error: 'Non authentifié' });
        return;
      }

      const { conversationId } = data;
      
      // Vérifier que l'utilisateur participe à la conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId
      });

      if (!conversation) {
        socket.emit('error', { error: 'Conversation non trouvée' });
        return;
      }

      // Rejoindre la room de la conversation
      socket.join(`conversation_${conversationId}`);
      
      socket.emit('conversation_joined', {
        conversationId,
        message: 'Conversation rejointe'
      });

      console.log(`👥 ${socket.user.name} a rejoint la conversation ${conversationId}`);

    } catch (error) {
      console.error('❌ Erreur join conversation:', error.message);
      socket.emit('error', { error: 'Erreur lors de la connexion à la conversation' });
    }
  }

  /**
   * Quitter une conversation
   */
  async leaveConversation(socket, data) {
    try {
      const { conversationId } = data;
      socket.leave(`conversation_${conversationId}`);
      
      socket.emit('conversation_left', {
        conversationId,
        message: 'Conversation quittée'
      });

      console.log(`👋 ${socket.user?.name} a quitté la conversation ${conversationId}`);

    } catch (error) {
      console.error('❌ Erreur leave conversation:', error.message);
    }
  }

  /**
   * Gérer l'envoi d'un message en temps réel
   */
  async handleSendMessage(socket, data) {
    try {
      if (!socket.userId) {
        socket.emit('error', { error: 'Non authentifié' });
        return;
      }

      const { conversationId, content, type = 'text', metadata = {} } = data;

      // Vérifier que l'utilisateur participe à la conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
        isActive: true
      });

      if (!conversation) {
        socket.emit('error', { error: 'Conversation non trouvée' });
        return;
      }

      // Créer le message
      const message = new Message({
        conversationId,
        sender: socket.userId,
        content,
        type,
        metadata
      });

      await message.save();

      // Populer les données du message
      await message.populate('sender', 'name profile.avatar');

      // Mettre à jour la conversation
      await conversation.updateLastMessage(content, socket.userId);

      // Incrémenter les compteurs de messages non lus pour les autres participants
      for (const participantId of conversation.participants) {
        if (participantId.toString() !== socket.userId) {
          await conversation.incrementUnreadCount(participantId);
        }
      }

      // Émettre le message à tous les participants de la conversation
      this.io.to(`conversation_${conversationId}`).emit('new_message', {
        message: message.toObject(),
        conversationId
      });

      // Émettre une notification aux utilisateurs connectés mais pas dans la conversation
      for (const participantId of conversation.participants) {
        if (participantId.toString() !== socket.userId) {
          const participantSocketId = this.connectedUsers.get(participantId.toString());
          if (participantSocketId) {
            this.io.to(participantSocketId).emit('conversation_updated', {
              conversationId,
              lastMessage: {
                content,
                sender: socket.user.name,
                timestamp: new Date()
              }
            });
          }
        }
      }

      console.log(`💬 Message envoyé par ${socket.user.name} dans ${conversationId}`);

    } catch (error) {
      console.error('❌ Erreur send message:', error.message);
      socket.emit('error', { error: 'Erreur lors de l\'envoi du message' });
    }
  }

  /**
   * Marquer les messages comme lus
   */
  async handleMarkAsRead(socket, data) {
    try {
      if (!socket.userId) {
        socket.emit('error', { error: 'Non authentifié' });
        return;
      }

      const { conversationId } = data;

      // Vérifier que l'utilisateur participe à la conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId
      });

      if (!conversation) {
        socket.emit('error', { error: 'Conversation non trouvée' });
        return;
      }

      // Réinitialiser le compteur de messages non lus
      await conversation.resetUnreadCount(socket.userId);

      // Marquer tous les messages non lus comme lus
      await Message.updateMany(
        {
          conversationId,
          sender: { $ne: socket.userId },
          status: { $ne: 'read' }
        },
        {
          status: 'read',
          readAt: new Date()
        }
      );

      // Notifier les autres participants que les messages ont été lus
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        readBy: socket.userId,
        readAt: new Date()
      });

      console.log(`✅ Messages marqués comme lus par ${socket.user.name} dans ${conversationId}`);

    } catch (error) {
      console.error('❌ Erreur mark as read:', error.message);
      socket.emit('error', { error: 'Erreur lors du marquage comme lu' });
    }
  }

  /**
   * Gérer l'indicateur de frappe
   */
  handleTypingStart(socket, data) {
    try {
      if (!socket.userId) return;

      const { conversationId } = data;
      
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId,
        userName: socket.user?.name,
        isTyping: true
      });

    } catch (error) {
      console.error('❌ Erreur typing start:', error.message);
    }
  }

  /**
   * Arrêter l'indicateur de frappe
   */
  handleTypingStop(socket, data) {
    try {
      if (!socket.userId) return;

      const { conversationId } = data;
      
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId,
        userName: socket.user?.name,
        isTyping: false
      });

    } catch (error) {
      console.error('❌ Erreur typing stop:', error.message);
    }
  }

  /**
   * Gérer la déconnexion
   */
  handleDisconnection(socket) {
    try {
      if (socket.userId) {
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);
        
        console.log(`👋 ${socket.user?.name || 'Utilisateur'} déconnecté (${socket.id})`);
      } else {
        console.log(`👋 Socket déconnecté (${socket.id})`);
      }
    } catch (error) {
      console.error('❌ Erreur disconnection:', error.message);
    }
  }

  /**
   * Obtenir les utilisateurs connectés
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Vérifier si un utilisateur est connecté
   */
  isUserConnected(userId) {
    return this.connectedUsers.has(userId.toString());
  }

  /**
   * Envoyer un message à un utilisateur spécifique
   */
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * Envoyer un message à tous les participants d'une conversation
   */
  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }
}

// Instance singleton
const socketService = new SocketService();

module.exports = socketService;

