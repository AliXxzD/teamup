const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Validation pour l'envoi de message
const sendMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Le message doit contenir entre 1 et 1000 caractères')
];

// Validation pour créer une conversation
const createConversationValidation = [
  body('participants')
    .isArray({ min: 1 })
    .withMessage('Au moins un participant est requis'),
  
  body('participants.*')
    .isMongoId()
    .withMessage('ID d\'utilisateur invalide'),
  
  body('type')
    .isIn(['private', 'group', 'event'])
    .withMessage('Type de conversation invalide')
];

/**
 * @route   GET /api/messages/conversations
 * @desc    Récupérer toutes les conversations de l'utilisateur
 * @access  Private
 */
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les conversations de l'utilisateur
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email profile.avatar')
    .populate('lastMessage.sender', 'name profile.avatar')
    .populate('eventId', 'title sport date')
    .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });
    
    // Formater les conversations
    const formattedConversations = conversations.map(conversation => {
      const conversationInfo = conversation.getPublicInfo(userId);
      
      // Pour les conversations privées, obtenir le nom de l'autre participant
      if (conversation.type === 'private') {
        const otherParticipant = conversation.participants.find(p => p._id.toString() !== userId);
        if (otherParticipant) {
          conversationInfo.displayName = otherParticipant.name;
          conversationInfo.displayAvatar = otherParticipant.profile?.avatar;
        }
      }
      
      return conversationInfo;
    });
    
    res.json({
      success: true,
      conversations: formattedConversations
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer les conversations'
    });
  }
});

/**
 * @route   POST /api/messages/conversations
 * @desc    Créer une nouvelle conversation
 * @access  Private
 */
router.post('/conversations', authMiddleware, createConversationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: errors.array().map(err => err.msg)
      });
    }
    
    const { type, participants, name, description, eventId } = req.body;
    const userId = req.user.id;
    
    // S'assurer que l'utilisateur actuel est dans les participants
    if (!participants.includes(userId)) {
      participants.push(userId);
    }
    
    // Pour les conversations privées, vérifier s'il en existe déjà une
    if (type === 'private' && participants.length === 2) {
      const existingConversation = await Conversation.findOrCreatePrivate(participants[0], participants[1]);
      
      return res.json({
        success: true,
        conversation: existingConversation.getPublicInfo(userId),
        message: 'Conversation récupérée'
      });
    }
    
    // Créer une nouvelle conversation
    const conversation = new Conversation({
      type,
      participants,
      name,
      description,
      eventId,
      unreadCounts: participants.map(userId => ({ user: userId, count: 0 }))
    });
    
    await conversation.save();
    
    // Populate les informations
    await conversation.populate('participants', 'name email profile.avatar');
    if (eventId) {
      await conversation.populate('eventId', 'title sport date');
    }
    
    res.status(201).json({
      success: true,
      conversation: conversation.getPublicInfo(userId),
      message: 'Conversation créée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de créer la conversation'
    });
  }
});

/**
 * @route   GET /api/messages/conversations/:conversationId
 * @desc    Récupérer une conversation spécifique
 * @access  Private
 */
router.get('/conversations/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email profile.avatar')
    .populate('eventId', 'title sport date location');
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation non trouvée',
        message: 'Cette conversation n\'existe pas ou vous n\'y avez pas accès'
      });
    }
    
    res.json({
      success: true,
      conversation: conversation.getPublicInfo(userId)
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer la conversation'
    });
  }
});

/**
 * @route   GET /api/messages/conversations/:conversationId/messages
 * @desc    Récupérer les messages d'une conversation
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur participe à la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation non trouvée',
        message: 'Cette conversation n\'existe pas ou vous n\'y avez pas accès'
      });
    }
    
    // Récupérer les messages
    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
    .populate('sender', 'name profile.avatar')
    .populate('metadata.eventId', 'title sport date')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Marquer les messages comme lus
    const unreadMessages = messages.filter(msg => 
      msg.sender._id.toString() !== userId && msg.status !== 'read'
    );
    
    for (const message of unreadMessages) {
      await message.markAsRead();
    }
    
    // Réinitialiser le compteur de messages non lus
    await conversation.resetUnreadCount(userId);
    
    // Formater les messages
    const formattedMessages = messages.reverse().map(message => ({
      ...message.getPublicInfo(),
      sender: {
        id: message.sender._id,
        name: message.sender.name,
        avatar: message.sender.profile?.avatar
      }
    }));
    
    res.json({
      success: true,
      messages: formattedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({ conversationId, isDeleted: false })
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer les messages'
    });
  }
});

/**
 * @route   POST /api/messages/conversations/:conversationId/messages
 * @desc    Envoyer un message dans une conversation
 * @access  Private
 */
router.post('/conversations/:conversationId/messages', authMiddleware, sendMessageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: errors.array().map(err => err.msg)
      });
    }
    
    const { conversationId } = req.params;
    const { content, type = 'text', metadata = {} } = req.body;
    const userId = req.user.id;
    
    // Vérifier que l'ID de conversation est un ObjectId valide
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: ['ID de conversation invalide']
      });
    }
    
    // Vérifier que l'utilisateur participe à la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation non trouvée',
        message: 'Cette conversation n\'existe pas ou vous n\'y avez pas accès'
      });
    }
    
    // Créer le message
    const message = new Message({
      conversationId,
      sender: userId,
      content,
      type,
      metadata
    });
    
    await message.save();
    
    // Mettre à jour la conversation
    await conversation.updateLastMessage(content, userId);
    
    // Incrémenter les compteurs de messages non lus pour les autres participants
    for (const participantId of conversation.participants) {
      if (participantId.toString() !== userId) {
        await conversation.incrementUnreadCount(participantId);
      }
    }
    
    // Populate les informations du message
    await message.populate('sender', 'name profile.avatar');
    if (metadata.eventId) {
      await message.populate('metadata.eventId', 'title sport date');
    }
    
    res.status(201).json({
      success: true,
      message: {
        ...message.getPublicInfo(),
        sender: {
          id: message.sender._id,
          name: message.sender.name,
          avatar: message.sender.profile?.avatar
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible d\'envoyer le message'
    });
  }
});

/**
 * @route   DELETE /api/messages/conversations/:conversationId/messages/:messageId
 * @desc    Supprimer un message
 * @access  Private
 */
router.delete('/conversations/:conversationId/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false
    });
    
    if (!message) {
      return res.status(404).json({
        error: 'Message non trouvé',
        message: 'Ce message n\'existe pas ou vous ne pouvez pas le supprimer'
      });
    }
    
    // Soft delete
    message.isDeleted = true;
    await message.save();
    
    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de supprimer le message'
    });
  }
});

/**
 * @route   GET /api/messages/users
 * @desc    Récupérer la liste des utilisateurs pour démarrer une conversation
 * @access  Private
 */
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const userId = req.user.id;
    
    // Rechercher les utilisateurs
    const users = await User.find({
      _id: { $ne: userId },
      isActive: true,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    })
    .select('name email profile.avatar profile.skillLevel')
    .limit(20);
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.profile?.avatar,
        skillLevel: user.profile?.skillLevel
      }))
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer les utilisateurs'
    });
  }
});

module.exports = router; 