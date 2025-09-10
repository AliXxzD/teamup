const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');
const Event = require('../models/Event');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être un nombre entier entre 1 et 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Le commentaire ne peut pas dépasser 500 caractères'),
  body('type')
    .optional()
    .isIn(['organizer', 'participant', 'general'])
    .withMessage('Le type d\'avis doit être organizer, participant ou general')
];

/**
 * @route   POST /api/reviews
 * @desc    Créer un nouvel avis
 * @access  Private
 */
router.post('/', authMiddleware, reviewValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: errors.array()
      });
    }

    const { reviewedUserId, eventId, rating, comment, type = 'general' } = req.body;
    const reviewerId = req.userId;

    // Vérifier que l'utilisateur évalué existe
    const reviewedUser = await User.findById(reviewedUserId);
    if (!reviewedUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier que l'événement existe si fourni
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Événement non trouvé'
        });
      }
    }

    // Créer l'avis
    const reviewData = {
      reviewer: reviewerId,
      reviewedUser: reviewedUserId,
      rating,
      comment: comment?.trim(),
      type
    };

    if (eventId) {
      reviewData.event = eventId;
    }

    const review = await Review.createReview(reviewData);

    // Populer les données pour la réponse
    await review.populate([
      { path: 'reviewer', select: 'name profile.avatar' },
      { path: 'event', select: 'title sport date' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès',
      data: review
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    
    if (error.message === 'Vous avez déjà donné un avis pour cet utilisateur') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Vous ne pouvez pas vous évaluer vous-même') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'avis'
    });
  }
});

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Récupérer les avis d'un utilisateur
 * @access  Private
 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les avis avec pagination
    const result = await Review.getReviewsWithPagination(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    // Récupérer les statistiques de l'utilisateur
    const stats = await Review.getUserStats(userId);

    res.json({
      success: true,
      data: {
        reviews: result.reviews,
        stats,
        pagination: result.pagination
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des avis'
    });
  }
});

/**
 * @route   GET /api/reviews/user/:userId/stats
 * @desc    Récupérer les statistiques d'avis d'un utilisateur
 * @access  Private
 */
router.get('/user/:userId/stats', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les statistiques
    const stats = await Review.getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

/**
 * @route   GET /api/reviews/my
 * @desc    Récupérer les avis donnés par l'utilisateur connecté
 * @access  Private
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.userId;

    const reviews = await Review.find({
      reviewer: userId,
      status: 'active'
    })
    .populate('reviewedUser', 'name profile.avatar')
    .populate('event', 'title sport date')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments({
      reviewer: userId,
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalReviews: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des avis donnés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des avis donnés'
    });
  }
});

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Modifier un avis
 * @access  Private
 */
router.put('/:reviewId', authMiddleware, reviewValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: errors.array()
      });
    }

    const { reviewId } = req.params;
    const { rating, comment, type } = req.body;
    const userId = req.userId;

    // Vérifier que l'avis existe et appartient à l'utilisateur
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    if (review.reviewer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas modifier cet avis'
      });
    }

    // Mettre à jour l'avis
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment?.trim();
    if (type !== undefined) updateData.type = type;

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'reviewer', select: 'name profile.avatar' },
      { path: 'event', select: 'title sport date' }
    ]);

    // Mettre à jour les statistiques de l'utilisateur évalué
    await Review.updateUserStats(review.reviewedUser);

    res.json({
      success: true,
      message: 'Avis modifié avec succès',
      data: updatedReview
    });

  } catch (error) {
    console.error('Erreur lors de la modification de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la modification de l\'avis'
    });
  }
});

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Supprimer un avis
 * @access  Private
 */
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;

    // Vérifier que l'avis existe et appartient à l'utilisateur
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    if (review.reviewer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer cet avis'
      });
    }

    // Supprimer l'avis
    await Review.findByIdAndDelete(reviewId);

    // Mettre à jour les statistiques de l'utilisateur évalué
    await Review.updateUserStats(review.reviewedUser);

    res.json({
      success: true,
      message: 'Avis supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'avis'
    });
  }
});

/**
 * @route   GET /api/reviews/event/:eventId
 * @desc    Récupérer les avis liés à un événement
 * @access  Private
 */
router.get('/event/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Vérifier que l'événement existe
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    const reviews = await Review.find({
      event: eventId,
      status: 'active'
    })
    .populate('reviewer', 'name profile.avatar')
    .populate('reviewedUser', 'name profile.avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments({
      event: eventId,
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalReviews: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des avis de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des avis de l\'événement'
    });
  }
});

/**
 * @route   GET /api/reviews/can-review/:userId
 * @desc    Vérifier si l'utilisateur peut donner un avis à un autre utilisateur
 * @access  Private
 */
router.get('/can-review/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { eventId } = req.query;
    const reviewerId = req.userId;

    // Vérifier que l'utilisateur évalué existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur peut donner un avis
    const canReview = await Review.canUserReview(reviewerId, userId, eventId);

    res.json({
      success: true,
      data: {
        canReview,
        reason: canReview ? null : 'Vous avez déjà donné un avis pour cet utilisateur'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification'
    });
  }
});

module.exports = router;
