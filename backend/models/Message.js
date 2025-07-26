const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Conversation (groupe de messages entre utilisateurs)
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  // Expéditeur du message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contenu du message
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Le message ne peut pas dépasser 1000 caractères']
  },
  
  // Type de message (texte, image, etc.)
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'event'],
    default: 'text'
  },
  
  // Métadonnées pour les messages spéciaux
  metadata: {
    // Pour les messages d'événements
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    // Pour les images
    imageUrl: String,
    // Pour les fichiers
    fileName: String,
    fileSize: Number,
    fileType: String
  },
  
  // Statut du message
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Horodatage de lecture
  readAt: {
    type: Date,
    default: null
  },
  
  // Message supprimé (soft delete)
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'metadata.eventId': 1 });

// Méthode pour marquer comme lu
messageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Méthode pour marquer comme livré
messageSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  return this.save();
};

// Méthode pour obtenir les informations publiques du message
messageSchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    content: this.content,
    type: this.type,
    metadata: this.metadata,
    status: this.status,
    readAt: this.readAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 