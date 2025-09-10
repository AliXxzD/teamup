const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Veuillez entrer un email valide'
    ]
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Permet les valeurs null/undefined
    trim: true,
    minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
    maxlength: [30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères'],
    match: [
      /^[a-zA-Z0-9_-]+$/,
      'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'
    ]
  },
  password: {
    type: String,
    required: function() { 
      // Le mot de passe n'est requis que si l'utilisateur n'utilise pas OAuth
      return !this.oauth || (!this.oauth.google && !this.oauth.facebook);
    },
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  

  
  // Vérification email
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Statut du compte
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    backgroundImage: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    location: {
      city: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    bio: {
      type: String,
      maxlength: [500, 'La bio ne peut pas dépasser 500 caractères']
    },
    favoritesSports: [{
      name: String,
      icon: String,
      color: String
    }],
    skillLevel: {
      type: String,
      enum: ['débutant', 'intermédiaire', 'avancé', 'expert'],
      default: 'débutant'
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    stats: {
      eventsOrganized: {
        type: Number,
        default: 0
      },
      eventsJoined: {
        type: Number,
        default: 0
      },
      averageRating: {
        type: Number,
        default: 0
      },
      totalRatings: {
        type: Number,
        default: 0
      },
      registrationDate: {
        type: Date,
        default: Date.now
      }
    }
  },
  
  // Refresh tokens pour la gestion des sessions
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
      }
    }
  }],
  
  // Statistiques de connexion
  lastLogin: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  
  // Préférences utilisateur
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      events: {
        type: Boolean,
        default: true
      },
      messages: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showLocation: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
userSchema.index({ email: 1 });
userSchema.index({ 'profile.location.coordinates': '2dsphere' });

// Méthode pour générer un nom d'utilisateur unique
userSchema.methods.generateUsername = function() {
  const baseUsername = this.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const timestamp = Date.now().toString().slice(-4);
  return `${baseUsername}${timestamp}`;
};

// Méthode pour hasher le mot de passe
userSchema.methods.hashPassword = async function() {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
};

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false; // Utilisateur OAuth sans mot de passe
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir le profil public
userSchema.methods.getPublicProfile = function() {
  // Générer un username si il n'existe pas
  if (!this.username) {
    this.username = this.generateUsername();
    this.save().catch(err => console.error('Erreur lors de la sauvegarde du username:', err));
  }

  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    avatar: this.profile?.avatar,
    backgroundImage: this.profile?.backgroundImage,
    location: this.profile?.location,
    joinDate: this.createdAt,
    bio: this.profile?.bio,
    followers: this.profile?.followers?.length || 0,
    following: this.profile?.following?.length || 0,
    points: this.profile?.points || 0,
    level: this.profile?.level || 1,
    favoritesSports: this.profile?.favoritesSports || [],
    stats: this.profile?.stats || {
      eventsOrganized: 0,
      eventsJoined: 0,
      averageRating: 0,
      totalRatings: 0,
      registrationDate: this.createdAt
    },
    isEmailVerified: this.isEmailVerified,
    skillLevel: this.profile?.skillLevel || 'débutant'
  };
};

// Méthode pour mettre à jour les statistiques
userSchema.methods.updateStats = function(statType, increment = 1) {
  if (!this.profile) {
    this.profile = { stats: {} };
  }
  if (!this.profile.stats) {
    this.profile.stats = {};
  }
  
  if (statType === 'eventsOrganized') {
    this.profile.stats.eventsOrganized = (this.profile.stats.eventsOrganized || 0) + increment;
  } else if (statType === 'eventsJoined') {
    this.profile.stats.eventsJoined = (this.profile.stats.eventsJoined || 0) + increment;
  }
  
  return this.save();
};

// Méthode pour mettre à jour le profil avec validation du username
userSchema.methods.updateProfile = async function(updates) {
  // Si un nouveau username est fourni, vérifier qu'il est unique
  if (updates.username && updates.username !== this.username) {
    const existingUser = await this.constructor.findOne({ username: updates.username });
    if (existingUser) {
      throw new Error('Ce nom d\'utilisateur est déjà pris');
    }
    this.username = updates.username;
  }

  // Mettre à jour les autres champs
  if (updates.name) this.name = updates.name;
  if (updates.email) this.email = updates.email;
  
  if (!this.profile) this.profile = {};
  
  if (updates.bio !== undefined) this.profile.bio = updates.bio;
  if (updates.avatar !== undefined) this.profile.avatar = updates.avatar;
  if (updates.backgroundImage !== undefined) this.profile.backgroundImage = updates.backgroundImage;
  if (updates.location) this.profile.location = updates.location;
  if (updates.favoritesSports) this.profile.favoritesSports = updates.favoritesSports;
  if (updates.skillLevel) this.profile.skillLevel = updates.skillLevel;
  if (updates.points !== undefined) this.profile.points = updates.points;
  if (updates.level !== undefined) this.profile.level = updates.level;

  return this.save();
};

// Méthode pour ajouter une note
userSchema.methods.addRating = function(rating) {
  if (!this.profile) {
    this.profile = { stats: {} };
  }
  if (!this.profile.stats) {
    this.profile.stats = {};
  }
  
  const currentTotal = (this.profile.stats.averageRating || 0) * (this.profile.stats.totalRatings || 0);
  this.profile.stats.totalRatings = (this.profile.stats.totalRatings || 0) + 1;
  this.profile.stats.averageRating = (currentTotal + rating) / this.profile.stats.totalRatings;
  
  return this.save();
};

// Méthodes pour les followers/following
userSchema.methods.follow = function(userId) {
  if (!this.profile) {
    this.profile = {};
  }
  if (!this.profile.following) {
    this.profile.following = [];
  }
  
  if (!this.profile.following.includes(userId)) {
    this.profile.following.push(userId);
  }
  
  return this.save();
};

userSchema.methods.unfollow = function(userId) {
  if (!this.profile || !this.profile.following) {
    return this.save();
  }
  
  this.profile.following = this.profile.following.filter(id => !id.equals(userId));
  return this.save();
};

userSchema.methods.addFollower = function(userId) {
  if (!this.profile) {
    this.profile = {};
  }
  if (!this.profile.followers) {
    this.profile.followers = [];
  }
  
  if (!this.profile.followers.includes(userId)) {
    this.profile.followers.push(userId);
  }
  
  return this.save();
};

userSchema.methods.removeFollower = function(userId) {
  if (!this.profile || !this.profile.followers) {
    return this.save();
  }
  
  this.profile.followers = this.profile.followers.filter(id => !id.equals(userId));
  return this.save();
};

// Méthode statique pour trouver un utilisateur par email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Méthodes OAuth
userSchema.methods.isOAuthUser = function() {
  return !!(this.oauth && (this.oauth.google || this.oauth.facebook));
};

userSchema.methods.hasGoogleAuth = function() {
  return !!(this.oauth && this.oauth.google && this.oauth.google.id);
};

userSchema.methods.hasFacebookAuth = function() {
  return !!(this.oauth && this.oauth.facebook && this.oauth.facebook.id);
};

userSchema.methods.canLoginWithPassword = function() {
  return !!this.password;
};

// Méthode pour obtenir les informations OAuth publiques
userSchema.methods.getOAuthInfo = function() {
  const oauthInfo = {
    hasGoogle: this.hasGoogleAuth(),
    hasFacebook: this.hasFacebookAuth(),
    isOAuthOnly: this.isOAuthUser() && !this.password
  };
  
  if (this.oauth && this.oauth.google && this.oauth.google.profile) {
    oauthInfo.google = {
      displayName: this.oauth.google.profile.displayName,
      avatar: this.oauth.google.profile.photos?.[0]?.value
    };
  }
  
  return oauthInfo;
};

// Méthode pour mettre à jour la dernière connexion
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount = (this.loginCount || 0) + 1;
  return this.save();
};

// Méthode pour activer/désactiver le compte
userSchema.methods.setActiveStatus = function(active) {
  this.isActive = active;
  return this.save();
};

// Middleware pre-save pour hasher le mot de passe
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    await this.hashPassword();
  }
  
  // Générer un nom d'utilisateur si pas déjà défini
  if (!this.username) {
    this.username = this.generateUsername();
  }
  
  next();
});

// Middleware pre-remove pour nettoyer les données associées
userSchema.pre('remove', async function(next) {
  // Ici on pourrait supprimer les événements créés par l'utilisateur
  // et autres données associées
  next();
});

// Validation personnalisée pour l'âge minimum
userSchema.path('profile.dateOfBirth').validate(function(value) {
  if (!value) return true; // Optionnel
  
  const today = new Date();
  const birthDate = new Date(value);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 13; // Âge minimum 13 ans
}, 'Vous devez avoir au moins 13 ans pour utiliser cette application');

// Méthode pour calculer les vraies statistiques depuis la base de données
userSchema.methods.calculateRealStats = async function() {
  const Event = require('./Event');
  
  try {
    // Compter les événements organisés
    const eventsOrganized = await Event.countDocuments({ 
      organizer: this._id,
      status: { $in: ['active', 'completed', 'full'] }
    });
    
    // Compter les événements rejoints (participant)
    // Les participants sont stockés dans un tableau d'objets { user: ObjectId, status: 'confirmed' }
    const eventsJoined = await Event.countDocuments({
      $and: [
        { 'participants.user': this._id },
        { 'participants.status': { $in: ['confirmed', 'pending'] } },
        { status: { $ne: 'cancelled' } }
      ]
    });
    
    // Calculer les vraies statistiques de rating
    const Review = require('./Review');
    const ratingStats = await Review.getUserStats(this._id);
    const averageRating = ratingStats.averageRating;
    const ratingCount = ratingStats.totalReviews;
    
    // Mettre à jour les statistiques dans le profil
    if (!this.profile) {
      this.profile = {};
    }
    if (!this.profile.stats) {
      this.profile.stats = {};
    }
    
    this.profile.stats.eventsOrganized = eventsOrganized;
    this.profile.stats.eventsJoined = eventsJoined;
    this.profile.stats.averageRating = averageRating;
    this.profile.stats.totalRatings = ratingCount;
    
    await this.save();
    
    console.log(`📊 Statistiques calculées pour ${this.name}:`);
    console.log(`   - Événements organisés: ${eventsOrganized}`);
    console.log(`   - Événements rejoints: ${eventsJoined}`);
    console.log(`   - Note moyenne: ${averageRating}`);
    console.log(`   - Nombre d'avis: ${ratingCount}`);
    
    return {
      eventsOrganized,
      eventsJoined,
      averageRating,
      totalRatings: ratingCount
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      eventsOrganized: 0,
      eventsJoined: 0,
      averageRating: 0,
      totalRatings: 0
    };
  }
};

// Méthode pour obtenir le profil public avec statistiques réelles
userSchema.methods.getPublicProfileWithRealStats = async function() {
  // Calculer les vraies statistiques
  const realStats = await this.calculateRealStats();
  
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    avatar: this.profile?.avatar,
    backgroundImage: this.profile?.backgroundImage,
    location: this.profile?.location,
    joinDate: this.createdAt,
    bio: this.profile?.bio,
    followers: this.profile?.followers?.length || 0,
    following: this.profile?.following?.length || 0,
    points: this.profile?.points || 0,
    level: this.profile?.level || 1,
    favoritesSports: this.profile?.favoritesSports || [],
    stats: realStats,
    isEmailVerified: this.isEmailVerified,
    skillLevel: this.profile?.skillLevel || 'débutant'
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User; 