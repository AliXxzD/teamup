const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // Type de conversation (privée, groupe, événement)
  type: {
    type: String,
    enum: ['private', 'group', 'event'],
    default: 'private'
  },
  
  // Participants de la conversation
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Nom de la conversation (pour les groupes)
  name: {
    type: String,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  
  // Description (pour les groupes)
  description: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  
  // Image de la conversation (pour les groupes)
  avatar: {
    type: String,
    default: null
  },
  
  // Événement associé (pour les conversations d'événements)
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  
  // Dernier message de la conversation
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  
  // Nombre de messages non lus par participant
  unreadCounts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  
  // Statut de la conversation
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Conversation archivée
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Paramètres de notification
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    muteUntil: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ eventId: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });

// Méthode pour ajouter un participant
conversationSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.unreadCounts.push({ user: userId, count: 0 });
  }
  return this.save();
};

// Méthode pour retirer un participant
conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(id => !id.equals(userId));
  this.unreadCounts = this.unreadCounts.filter(count => !count.user.equals(userId));
  return this.save();
};

// Méthode pour mettre à jour le dernier message
conversationSchema.methods.updateLastMessage = function(content, senderId) {
  this.lastMessage = {
    content: content.length > 50 ? content.substring(0, 50) + '...' : content,
    sender: senderId,
    timestamp: new Date()
  };
  return this.save();
};

// Méthode pour incrémenter le compteur de messages non lus
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const unreadCount = this.unreadCounts.find(count => count.user.equals(userId));
  if (unreadCount) {
    unreadCount.count += 1;
  } else {
    this.unreadCounts.push({ user: userId, count: 1 });
  }
  return this.save();
};

// Méthode pour réinitialiser le compteur de messages non lus
conversationSchema.methods.resetUnreadCount = function(userId) {
  const unreadCount = this.unreadCounts.find(count => count.user.equals(userId));
  if (unreadCount) {
    unreadCount.count = 0;
  }
  return this.save();
};

// Méthode pour obtenir le nombre de messages non lus pour un utilisateur
conversationSchema.methods.getUnreadCount = function(userId) {
  const unreadCount = this.unreadCounts.find(count => count.user.equals(userId));
  return unreadCount ? unreadCount.count : 0;
};

// Méthode pour obtenir les informations publiques de la conversation
conversationSchema.methods.getPublicInfo = function(currentUserId) {
  return {
    id: this._id,
    type: this.type,
    name: this.name,
    description: this.description,
    avatar: this.avatar,
    eventId: this.eventId,
    lastMessage: this.lastMessage,
    unreadCount: this.getUnreadCount(currentUserId),
    participants: this.participants,
    isActive: this.isActive,
    isArchived: this.isArchived,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Méthode statique pour trouver ou créer une conversation privée
conversationSchema.statics.findOrCreatePrivate = async function(userId1, userId2) {
  // Chercher une conversation privée existante entre ces deux utilisateurs
  let conversation = await this.findOne({
    type: 'private',
    participants: { 
      $all: [userId1, userId2],
      $size: 2 
    }
  });
  
  // Si pas de conversation, en créer une nouvelle
  if (!conversation) {
    conversation = new this({
      type: 'private',
      participants: [userId1, userId2],
      unreadCounts: [
        { user: userId1, count: 0 },
        { user: userId2, count: 0 }
      ]
    });
    await conversation.save();
  }
  
  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 