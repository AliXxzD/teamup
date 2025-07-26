const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  sport: {
    type: String,
    required: [true, 'Le sport est requis'],
    enum: [
      'Football', 'Basketball', 'Tennis', 'Running', 'Yoga', 'Natation',
      'Volleyball', 'Badminton', 'Cyclisme', 'Fitness', 'Rugby', 'Handball'
    ]
  },
  date: {
    type: Date,
    required: [true, 'La date est requise'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'La date doit être dans le futur'
    }
  },
  time: {
    type: String,
    required: [true, 'L\'heure est requise'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)']
  },
  location: {
    address: {
      type: String,
      required: [true, 'L\'adresse est requise'],
      trim: true,
      maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude invalide'],
        max: [90, 'Latitude invalide'],
        required: false
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude invalide'],
        max: [180, 'Longitude invalide'],
        required: false
      }
    }
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Le nombre maximum de participants est requis'],
    min: [2, 'Il doit y avoir au moins 2 participants'],
    max: [1000, 'Le nombre de participants ne peut pas dépasser 1000']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de participants ne peut pas être négatif']
  },
  level: {
    type: String,
    required: [true, 'Le niveau est requis'],
    enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux']
  },
  price: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Le prix ne peut pas être négatif'],
      max: [1000, 'Le prix ne peut pas dépasser 1000€']
    },
    isFree: {
      type: Boolean,
      default: true
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'organisateur est requis']
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed', 'full'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Un tag ne peut pas dépasser 30 caractères']
  }],
  requirements: {
    equipment: [{
      type: String,
      trim: true,
      maxlength: [100, 'Un équipement ne peut pas dépasser 100 caractères']
    }],
    additionalInfo: {
      type: String,
      maxlength: [500, 'Les informations additionnelles ne peuvent pas dépasser 500 caractères']
    }
  },
  images: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  recurrence: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    joins: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances des recherches
eventSchema.index({ sport: 1, date: 1 });
// TODO: Add geospatial index when coordinate support is implemented
// eventSchema.index({ 'location.coordinates': '2dsphere' }); // Pour les recherches géographiques
eventSchema.index({ organizer: 1 });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ createdAt: -1 });

// Virtual pour calculer les places disponibles
eventSchema.virtual('availableSpots').get(function() {
  return this.maxParticipants - this.currentParticipants;
});

// Virtual pour vérifier si l'événement est complet
eventSchema.virtual('isFull').get(function() {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual pour vérifier si l'événement est passé
eventSchema.virtual('isPast').get(function() {
  return new Date() > this.date;
});

// Middleware pre-save pour mettre à jour le statut automatiquement
eventSchema.pre('save', function(next) {
  // Si l'événement est complet, mettre le statut à 'full'
  if (this.currentParticipants >= this.maxParticipants && this.status === 'active') {
    this.status = 'full';
  }
  
  // Si l'événement est dans le passé, le marquer comme 'completed'
  if (this.date < new Date() && this.status === 'active') {
    this.status = 'completed';
  }
  
  // Valider que le prix est 0 si l'événement est gratuit
  if (this.price.isFree) {
    this.price.amount = 0;
  }
  
  next();
});

// Méthode pour ajouter un participant
eventSchema.methods.addParticipant = function(userId) {
  if (this.isFull) {
    throw new Error('Événement complet');
  }
  
  // Vérifier si l'utilisateur est déjà participant
  const isAlreadyParticipant = this.participants.some(
    participant => participant.user.toString() === userId.toString()
  );
  
  if (isAlreadyParticipant) {
    throw new Error('Utilisateur déjà inscrit');
  }
  
  this.participants.push({ user: userId });
  this.currentParticipants = this.participants.length;
  this.stats.joins += 1;
  
  return this.save();
};

// Méthode pour retirer un participant
eventSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    participant => participant.user.toString() !== userId.toString()
  );
  this.currentParticipants = this.participants.length;
  
  // Si l'événement était complet, le remettre à actif
  if (this.status === 'full') {
    this.status = 'active';
  }
  
  return this.save();
};

// Méthode pour vérifier si un utilisateur peut se joindre
eventSchema.methods.canUserJoin = function(userId) {
  if (this.isFull) return { canJoin: false, reason: 'Événement complet' };
  if (this.isPast) return { canJoin: false, reason: 'Événement passé' };
  if (this.status !== 'active') return { canJoin: false, reason: 'Événement non actif' };
  
  const isAlreadyParticipant = this.participants.some(
    participant => participant.user.toString() === userId.toString()
  );
  
  if (isAlreadyParticipant) return { canJoin: false, reason: 'Déjà inscrit' };
  
  return { canJoin: true };
};

// Méthode statique pour rechercher des événements
eventSchema.statics.findByFilters = function(filters = {}) {
  const query = { status: 'active' };
  
  if (filters.sport) query.sport = filters.sport;
  if (filters.level) query.level = filters.level;
  if (filters.isFree !== undefined) query['price.isFree'] = filters.isFree;
  if (filters.dateFrom) query.date = { $gte: new Date(filters.dateFrom) };
  if (filters.dateTo) {
    query.date = query.date || {};
    query.date.$lte = new Date(filters.dateTo);
  }
  
  return this.find(query)
    .populate('organizer', 'name profile.avatar')
    .populate('participants.user', 'name profile.avatar')
    .sort({ date: 1 });
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 