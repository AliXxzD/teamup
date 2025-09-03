const express = require('express');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

const router = express.Router();

/**
 * @route   GET /api/events/stats/global
 * @desc    Récupérer les statistiques globales des événements
 * @access  Public
 */
router.get('/stats/global', async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Statistiques générales
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ 
      status: 'active',
      date: { $gte: now }
    });
    const completedEvents = await Event.countDocuments({ 
      status: 'completed' 
    });

    // Événements par sport
    const eventsBySport = await Event.aggregate([
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 },
          avgParticipants: { $avg: '$currentParticipants' },
          totalParticipants: { $sum: '$currentParticipants' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Événements par niveau
    const eventsByLevel = await Event.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Tendances temporelles
    const eventsThisMonth = await Event.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    const eventsThisWeek = await Event.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    // Événements gratuits vs payants
    const freeVsPaid = await Event.aggregate([
      {
        $group: {
          _id: '$price.isFree',
          count: { $sum: 1 },
          avgPrice: { $avg: { $cond: ['$price.isFree', 0, '$price.amount'] } }
        }
      }
    ]);

    // Top organisateurs
    const topOrganizers = await Event.aggregate([
      {
        $group: {
          _id: '$organizer',
          eventCount: { $sum: 1 },
          totalParticipants: { $sum: '$currentParticipants' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'organizer'
        }
      },
      { $unwind: '$organizer' },
      {
        $project: {
          name: '$organizer.name',
          eventCount: 1,
          totalParticipants: 1,
          avgParticipants: { $divide: ['$totalParticipants', '$eventCount'] }
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: 10 }
    ]);

    // Statistiques de participation
    const participationStats = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalParticipants: { $sum: '$currentParticipants' },
          avgParticipants: { $avg: '$currentParticipants' },
          maxParticipants: { $max: '$currentParticipants' },
          avgCapacity: { $avg: '$maxParticipants' },
          avgFillRate: { 
            $avg: { 
              $divide: ['$currentParticipants', '$maxParticipants'] 
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalEvents,
          activeEvents,
          completedEvents,
          eventsThisMonth,
          eventsThisWeek
        },
        sports: eventsBySport,
        levels: eventsByLevel,
        pricing: freeVsPaid,
        topOrganizers,
        participation: participationStats[0] || {
          totalParticipants: 0,
          avgParticipants: 0,
          maxParticipants: 0,
          avgCapacity: 0,
          avgFillRate: 0
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques globales:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

/**
 * @route   GET /api/events/stats/user
 * @desc    Récupérer les statistiques d'un utilisateur
 * @access  Private
 */
router.get('/stats/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    // Événements organisés
    const organizedEvents = await Event.find({ organizer: userId });
    const organizedCount = organizedEvents.length;
    const activeOrganized = organizedEvents.filter(e => e.date >= now && e.status === 'active').length;
    const completedOrganized = organizedEvents.filter(e => e.status === 'completed').length;

    // Événements rejoints
    const joinedEvents = await Event.find({
      'participants.user': userId,
      organizer: { $ne: userId }
    });
    const joinedCount = joinedEvents.length;
    const activeJoined = joinedEvents.filter(e => e.date >= now && e.status === 'active').length;
    const completedJoined = joinedEvents.filter(e => e.status === 'completed').length;

    // Sports favoris
    const favoriteSports = await Event.aggregate([
      {
        $match: {
          $or: [
            { organizer: userId },
            { 'participants.user': userId }
          ]
        }
      },
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Statistiques temporelles
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const eventsThisMonth = await Event.countDocuments({
      $or: [
        { organizer: userId },
        { 'participants.user': userId }
      ],
      createdAt: { $gte: lastMonth }
    });

    // Performance en tant qu'organisateur
    const organizerStats = {
      totalParticipants: organizedEvents.reduce((sum, event) => sum + event.currentParticipants, 0),
      avgParticipants: organizedCount > 0 ? 
        organizedEvents.reduce((sum, event) => sum + event.currentParticipants, 0) / organizedCount : 0,
      avgFillRate: organizedCount > 0 ?
        organizedEvents.reduce((sum, event) => sum + (event.currentParticipants / event.maxParticipants), 0) / organizedCount : 0,
      totalViews: organizedEvents.reduce((sum, event) => sum + event.stats.views, 0)
    };

    // Niveaux préférés
    const preferredLevels = await Event.aggregate([
      {
        $match: {
          $or: [
            { organizer: userId },
            { 'participants.user': userId }
          ]
        }
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        organized: {
          total: organizedCount,
          active: activeOrganized,
          completed: completedOrganized,
          stats: organizerStats
        },
        joined: {
          total: joinedCount,
          active: activeJoined,
          completed: completedJoined
        },
        overall: {
          totalEvents: organizedCount + joinedCount,
          eventsThisMonth,
          favoriteSports,
          preferredLevels
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

/**
 * @route   GET /api/events/stats/trends
 * @desc    Récupérer les tendances des événements
 * @access  Public
 */
router.get('/stats/trends', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    
    let dateRange;
    let groupBy;
    
    switch (period) {
      case 'week':
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'year':
        dateRange = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // month
        dateRange = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          week: { $week: '$createdAt' }
        };
    }

    // Tendance de création d'événements
    const eventCreationTrend = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          totalParticipants: { $sum: '$currentParticipants' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
    ]);

    // Tendance par sport
    const sportTrends = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: {
            sport: '$sport',
            ...groupBy
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.sport',
          timeline: {
            $push: {
              period: {
                year: '$_id.year',
                month: '$_id.month',
                week: '$_id.week',
                day: '$_id.day'
              },
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        eventCreation: eventCreationTrend,
        sportTrends: sportTrends.slice(0, 5) // Top 5 sports
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des tendances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des tendances'
    });
  }
});

/**
 * @route   GET /api/events/:id/stats
 * @desc    Récupérer les statistiques détaillées d'un événement
 * @access  Private (Organisateur seulement)
 */
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const event = await Event.findById(id)
      .populate('organizer', 'name email')
      .populate('participants.user', 'name email profile.avatar createdAt');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    if (event.organizer._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'organisateur peut voir les statistiques détaillées'
      });
    }

    // Analyse des participants
    const participantAnalysis = {
      total: event.currentParticipants,
      capacity: event.maxParticipants,
      fillRate: (event.currentParticipants / event.maxParticipants) * 100,
      joinTrend: event.participants.map(p => ({
        date: p.joinedAt,
        cumulativeCount: event.participants.filter(pp => pp.joinedAt <= p.joinedAt).length
      }))
    };

    // Profil des participants
    const participantProfiles = event.participants.map(p => ({
      name: p.user.name,
      joinedAt: p.joinedAt,
      memberSince: p.user.createdAt,
      status: p.status
    }));

    // Comparaison avec d'autres événements similaires
    const similarEvents = await Event.find({
      sport: event.sport,
      level: event.level,
      organizer: { $ne: userId },
      status: { $in: ['completed', 'active'] }
    }).limit(10);

    const benchmarks = {
      avgParticipants: similarEvents.reduce((sum, e) => sum + e.currentParticipants, 0) / similarEvents.length || 0,
      avgFillRate: similarEvents.reduce((sum, e) => sum + (e.currentParticipants / e.maxParticipants), 0) / similarEvents.length || 0,
      avgViews: similarEvents.reduce((sum, e) => sum + e.stats.views, 0) / similarEvents.length || 0
    };

    res.json({
      success: true,
      data: {
        eventInfo: {
          title: event.title,
          sport: event.sport,
          level: event.level,
          date: event.date,
          status: event.status
        },
        participation: participantAnalysis,
        participants: participantProfiles,
        engagement: {
          views: event.stats.views,
          joins: event.stats.joins,
          shares: event.stats.shares,
          conversionRate: event.stats.views > 0 ? (event.stats.joins / event.stats.views) * 100 : 0
        },
        benchmarks,
        performance: {
          vsAvgParticipants: benchmarks.avgParticipants > 0 ? 
            ((event.currentParticipants - benchmarks.avgParticipants) / benchmarks.avgParticipants) * 100 : 0,
          vsAvgViews: benchmarks.avgViews > 0 ? 
            ((event.stats.views - benchmarks.avgViews) / benchmarks.avgViews) * 100 : 0
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

module.exports = router;
