const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Event = require('../models/Event');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation pour la création d'événement
const createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le titre doit contenir entre 3 et 100 caractères'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit contenir entre 10 et 1000 caractères'),
  
  body('sport')
    .isIn(['Football', 'Basketball', 'Tennis', 'Running', 'Yoga', 'Natation', 
           'Volleyball', 'Badminton', 'Cyclisme', 'Fitness', 'Rugby', 'Handball'])
    .withMessage('Sport invalide'),
  
  body('date')
    .isISO8601()
    .withMessage('Date invalide')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('La date doit être dans le futur');
      }
      return true;
    }),
  
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Format d\'heure invalide (HH:MM)'),
  
  body('location')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('L\'adresse doit contenir entre 5 et 200 caractères'),
  
  body('maxParticipants')
    .isInt({ min: 2, max: 1000 })
    .withMessage('Le nombre de participants doit être entre 2 et 1000'),
  
  body('level')
    .isIn(['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'])
    .withMessage('Niveau invalide'),
  
  body('price')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Le prix doit être entre 0 et 1000€'),
  
  body('isFree')
    .isBoolean()
    .withMessage('isFree doit être un booléen')
];

// Validation pour la recherche d'événements
const searchEventsValidation = [
  query('sport').optional().isIn(['Football', 'Basketball', 'Tennis', 'Running', 'Yoga', 'Natation', 
                                   'Volleyball', 'Badminton', 'Cyclisme', 'Fitness', 'Rugby', 'Handball']),
  query('level').optional().isIn(['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux']),
  query('isFree').optional().isBoolean(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
];

// GET /api/events - Récupérer tous les événements avec filtres et pagination
router.get('/', searchEventsValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Construction des filtres
    const filters = {};
    if (req.query.sport) filters.sport = req.query.sport;
    if (req.query.level) filters.level = req.query.level;
    if (req.query.isFree !== undefined) filters.isFree = req.query.isFree === 'true';
    if (req.query.dateFrom || req.query.dateTo) {
      filters.dateFrom = req.query.dateFrom;
      filters.dateTo = req.query.dateTo;
    }

    // Recherche avec pagination (findByFilters inclut déjà les populates)
    const events = await Event.findByFilters(filters)
      .skip(skip)
      .limit(limit);

    // Compter le total avec les mêmes filtres que findByFilters
    const countQuery = { 
      status: 'active',
      date: { $gte: new Date() } // Exclure les événements passés
    };
    
    if (filters.sport) countQuery.sport = filters.sport;
    if (filters.level) countQuery.level = filters.level;
    if (filters.isFree !== undefined) countQuery['price.isFree'] = filters.isFree;
    if (filters.dateFrom) {
      countQuery.date.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      countQuery.date.$lte = new Date(filters.dateTo);
    }
    
    const totalEvents = await Event.countDocuments(countQuery);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalEvents / limit),
          totalEvents,
          hasNext: page < Math.ceil(totalEvents / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des événements'
    });
  }
});

// GET /api/events/past - Récupérer les événements passés (optionnel)
router.get('/past', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pastEvents = await Event.find({ 
      date: { $lt: new Date() },
      status: { $in: ['active', 'completed', 'full'] }
    })
      .populate('organizer', 'name email profile.avatar')
      .populate('participants.user', 'name profile.avatar')
      .sort({ date: -1 }) // Plus récents en premier
      .skip(skip)
      .limit(limit);

    const totalPastEvents = await Event.countDocuments({ 
      date: { $lt: new Date() },
      status: { $in: ['active', 'completed', 'full'] }
    });

    res.json({
      success: true,
      data: {
        events: pastEvents,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPastEvents / limit),
          totalEvents: totalPastEvents,
          hasNext: page < Math.ceil(totalPastEvents / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements passés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des événements passés'
    });
  }
});

// GET /api/events/:id - Récupérer un événement par ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profile.avatar')
      .populate('participants.user', 'name profile.avatar');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Incrémenter le nombre de vues
    event.stats.views += 1;
    await event.save();

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'événement'
    });
  }
});

// POST /api/events - Créer un nouvel événement
router.post('/', authMiddleware, createEventValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      sport,
      date,
      time,
      location,
      maxParticipants,
      level,
      price,
      isFree
    } = req.body;

    const event = new Event({
      title,
      description,
      sport,
      date: new Date(date),
      time,
      location: {
        address: location
      },
      maxParticipants: parseInt(maxParticipants),
      level,
      price: {
        amount: isFree ? 0 : (price || 0),
        isFree
      },
      organizer: req.userId
    });

    const savedEvent = await event.save();

    // Mettre à jour les statistiques de l'organisateur
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (user) {
      await user.calculateRealStats();
    }

    // Populer les données de l'organisateur pour la réponse
    await savedEvent.populate('organizer', 'name email profile.avatar');

    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: savedEvent
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'événement'
    });
  }
});

// PUT /api/events/:id - Mettre à jour un événement
router.put('/:id', authMiddleware, createEventValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'organisateur
    if (event.organizer.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier cet événement'
      });
    }

    const {
      title,
      description,
      sport,
      date,
      time,
      location,
      maxParticipants,
      level,
      price,
      isFree
    } = req.body;

    // Mettre à jour les champs
    event.title = title;
    event.description = description;
    event.sport = sport;
    event.date = new Date(date);
    event.time = time;
    event.location.address = location;
    event.maxParticipants = parseInt(maxParticipants);
    event.level = level;
    event.price = {
      amount: isFree ? 0 : (price || 0),
      isFree
    };

    const updatedEvent = await event.save();
    await updatedEvent.populate('organizer', 'name email profile.avatar');

    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: updatedEvent
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'événement'
    });
  }
});

// DELETE /api/events/:id - Supprimer un événement
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'organisateur
    if (event.organizer.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer cet événement'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'événement'
    });
  }
});

// POST /api/events/:id/join - Rejoindre un événement
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier si l'utilisateur peut rejoindre
    const canJoin = event.canUserJoin(req.userId);
    if (!canJoin.canJoin) {
      return res.status(400).json({
        success: false,
        message: canJoin.reason
      });
    }

    await event.addParticipant(req.userId);
    await event.populate('participants.user', 'name profile.avatar');

    // Mettre à jour les statistiques de l'utilisateur
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (user) {
      await user.calculateRealStats();
    }

    res.json({
      success: true,
      message: 'Vous avez rejoint l\'événement avec succès',
      data: {
        eventId: event._id,
        currentParticipants: event.currentParticipants,
        availableSpots: event.availableSpots
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription à l\'événement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur lors de l\'inscription'
    });
  }
});

// DELETE /api/events/:id/leave - Quitter un événement
router.delete('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    const isParticipant = event.participants.some(
      participant => participant.user.toString() === req.userId.toString()
    );

    if (!isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Vous n\'êtes pas inscrit à cet événement'
      });
    }

    await event.removeParticipant(req.userId);

    // Mettre à jour les statistiques de l'utilisateur
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (user) {
      await user.calculateRealStats();
    }

    res.json({
      success: true,
      message: 'Vous avez quitté l\'événement avec succès',
      data: {
        eventId: event._id,
        currentParticipants: event.currentParticipants,
        availableSpots: event.availableSpots
      }
    });

  } catch (error) {
    console.error('Erreur lors de la désinscription de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la désinscription'
    });
  }
});

// GET /api/events/my/organized - Récupérer les événements organisés par l'utilisateur
router.get('/my/organized', authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.userId })
      .populate('participants.user', 'name profile.avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements organisés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des événements'
    });
  }
});

// GET /api/events/my/joined - Récupérer les événements auxquels l'utilisateur participe
router.get('/my/joined', authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({
      'participants.user': req.userId,
      status: { $in: ['active', 'full'] }
    })
      .populate('organizer', 'name profile.avatar')
      .sort({ date: 1 });

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements rejoints:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des événements'
    });
  }
});

// GET /api/events/stats - Statistiques générales des événements
router.get('/stats/general', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ status: 'active' });
    const totalParticipants = await Event.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$currentParticipants' } } }
    ]);

    const eventsBySport = await Event.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        totalParticipants: totalParticipants[0]?.total || 0,
        eventsBySport
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

module.exports = router; 