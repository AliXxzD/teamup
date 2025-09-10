const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Utilisateur qui donne l'avis
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Utilisateur qui reçoit l'avis
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Événement lié à l'avis (optionnel)
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false
  },
  
  // Note de 1 à 5
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'La note doit être un nombre entier'
    }
  },
  
  // Commentaire de l'avis
  comment: {
    type: String,
    required: false,
    maxlength: 500,
    trim: true
  },
  
  // Type d'avis (organisateur, participant, etc.)
  type: {
    type: String,
    enum: ['organizer', 'participant', 'general'],
    default: 'general'
  },
  
  // Statut de l'avis
  status: {
    type: String,
    enum: ['active', 'reported', 'hidden'],
    default: 'active'
  },
  
  // Date de création
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Date de mise à jour
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour éviter les doublons (un utilisateur ne peut pas donner plusieurs avis au même utilisateur pour le même événement)
reviewSchema.index({ reviewer: 1, reviewedUser: 1, event: 1 }, { unique: true });

// Index pour les requêtes de performance
reviewSchema.index({ reviewedUser: 1, status: 1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ event: 1, status: 1 });

// Méthode pour obtenir les statistiques d'un utilisateur
reviewSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        reviewedUser: new mongoose.Types.ObjectId(userId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const stat = stats[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  stat.ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });

  return {
    totalReviews: stat.totalReviews,
    averageRating: Math.round(stat.averageRating * 10) / 10, // Arrondir à 1 décimale
    ratingDistribution: distribution
  };
};

// Méthode pour obtenir les avis récents d'un utilisateur
reviewSchema.statics.getUserReviews = async function(userId, limit = 10, offset = 0) {
  return await this.find({
    reviewedUser: userId,
    status: 'active'
  })
  .populate('reviewer', 'name profile.avatar')
  .populate('event', 'title sport date')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(offset);
};

// Méthode pour vérifier si un utilisateur peut donner un avis
reviewSchema.statics.canUserReview = async function(reviewerId, reviewedUserId, eventId = null) {
  const query = {
    reviewer: reviewerId,
    reviewedUser: reviewedUserId
  };
  
  if (eventId) {
    query.event = eventId;
  }
  
  const existingReview = await this.findOne(query);
  return !existingReview;
};

// Méthode pour créer un avis
reviewSchema.statics.createReview = async function(reviewData) {
  // Vérifier si l'utilisateur peut donner un avis
  const canReview = await this.canUserReview(
    reviewData.reviewer,
    reviewData.reviewedUser,
    reviewData.event
  );
  
  if (!canReview) {
    throw new Error('Vous avez déjà donné un avis pour cet utilisateur');
  }
  
  // Vérifier que l'utilisateur ne s'évalue pas lui-même
  if (reviewData.reviewer.toString() === reviewData.reviewedUser.toString()) {
    throw new Error('Vous ne pouvez pas vous évaluer vous-même');
  }
  
  const review = new this(reviewData);
  await review.save();
  
  // Mettre à jour les statistiques de l'utilisateur évalué
  await this.updateUserStats(reviewData.reviewedUser);
  
  return review;
};

// Méthode pour mettre à jour les statistiques d'un utilisateur
reviewSchema.statics.updateUserStats = async function(userId) {
  const stats = await this.getUserStats(userId);
  
  await mongoose.model('User').findByIdAndUpdate(userId, {
    'profile.stats.totalRatings': stats.totalReviews,
    'profile.stats.averageRating': stats.averageRating
  });
  
  return stats;
};

// Middleware pour mettre à jour updatedAt
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthode pour obtenir les avis avec pagination
reviewSchema.statics.getReviewsWithPagination = async function(userId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  
  const [reviews, total] = await Promise.all([
    this.getUserReviews(userId, limit, offset),
    this.countDocuments({ reviewedUser: userId, status: 'active' })
  ]);
  
  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

module.exports = mongoose.model('Review', reviewSchema);
