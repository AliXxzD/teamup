const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Event = require('../models/Event');

const router = express.Router();

/**
 * @route   GET /api/ranking/global
 * @desc    Récupérer le classement global des utilisateurs
 * @access  Private
 */
router.get('/global', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const currentUserId = req.userId;

    // Récupérer tous les utilisateurs avec leurs statistiques
    const users = await User.find({ isActive: true })
      .select('name email profile.avatar stats points xp createdAt')
      .sort({ points: -1, xp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Calculer les statistiques réelles pour chaque utilisateur
    const rankingData = await Promise.all(
      users.map(async (user, index) => {
        try {
          // Calculer les statistiques réelles
          const realStats = await user.calculateRealStats();
          
          // Calculer le niveau basé sur les points
          const level = calculateLevel(user.points || user.xp || 0);
          
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.profile?.avatar,
            points: user.points || user.xp || 0,
            level: level,
            rank: offset + index + 1,
            stats: {
              eventsOrganized: realStats.eventsOrganized || 0,
              eventsJoined: realStats.eventsJoined || 0,
              totalEvents: (realStats.eventsOrganized || 0) + (realStats.eventsJoined || 0),
              averageRating: realStats.averageRating || 0,
              totalReviews: realStats.totalReviews || 0
            },
            joinDate: user.createdAt
          };
        } catch (error) {
          console.error(`Erreur calcul stats pour utilisateur ${user._id}:`, error);
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.profile?.avatar,
            points: user.points || user.xp || 0,
            level: calculateLevel(user.points || user.xp || 0),
            rank: offset + index + 1,
            stats: {
              eventsOrganized: 0,
              eventsJoined: 0,
              totalEvents: 0,
              averageRating: 0,
              totalReviews: 0
            },
            joinDate: user.createdAt
          };
        }
      })
    );

    // Trouver la position de l'utilisateur actuel
    const currentUserRank = await User.countDocuments({
      isActive: true,
      $or: [
        { points: { $gt: req.user.points || req.user.xp || 0 } },
        { 
          points: req.user.points || req.user.xp || 0,
          xp: { $gt: req.user.xp || 0 }
        }
      ]
    }) + 1;

    // Récupérer les données de l'utilisateur actuel
    const currentUser = await User.findById(currentUserId)
      .select('name email profile.avatar stats points xp createdAt');
    
    let currentUserData = null;
    if (currentUser) {
      const realStats = await currentUser.calculateRealStats();
      currentUserData = {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.profile?.avatar,
        points: currentUser.points || currentUser.xp || 0,
        level: calculateLevel(currentUser.points || currentUser.xp || 0),
        rank: currentUserRank,
        stats: {
          eventsOrganized: realStats.eventsOrganized || 0,
          eventsJoined: realStats.eventsJoined || 0,
          totalEvents: (realStats.eventsOrganized || 0) + (realStats.eventsJoined || 0),
          averageRating: realStats.averageRating || 0,
          totalReviews: realStats.totalReviews || 0
        },
        joinDate: currentUser.createdAt
      };
    }

    res.json({
      success: true,
      data: {
        ranking: rankingData,
        currentUser: currentUserData,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: await User.countDocuments({ isActive: true })
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du classement global:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du classement'
    });
  }
});

/**
 * @route   GET /api/ranking/weekly
 * @desc    Récupérer le classement hebdomadaire des utilisateurs
 * @access  Private
 */
router.get('/weekly', authMiddleware, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const currentUserId = req.userId;
    
    // Calculer la date de début de la semaine (lundi)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Récupérer les événements de cette semaine
    const weeklyEvents = await Event.find({
      date: { $gte: startOfWeek },
      status: { $in: ['active', 'completed'] }
    });

    // Calculer les points hebdomadaires pour chaque utilisateur
    const weeklyPoints = new Map();
    
    for (const event of weeklyEvents) {
      // Points pour l'organisateur
      if (event.organizer) {
        const organizerId = event.organizer.toString();
        if (!weeklyPoints.has(organizerId)) {
          weeklyPoints.set(organizerId, { points: 0, eventsOrganized: 0, eventsJoined: 0 });
        }
        const userPoints = weeklyPoints.get(organizerId);
        userPoints.points += 50; // Points pour organiser un événement
        userPoints.eventsOrganized += 1;
      }

      // Points pour les participants
      for (const participant of event.participants) {
        const participantId = participant.user.toString();
        if (participantId !== event.organizer?.toString()) {
          if (!weeklyPoints.has(participantId)) {
            weeklyPoints.set(participantId, { points: 0, eventsOrganized: 0, eventsJoined: 0 });
          }
          const userPoints = weeklyPoints.get(participantId);
          userPoints.points += 25; // Points pour participer
          userPoints.eventsJoined += 1;
        }
      }
    }

    // Récupérer les informations des utilisateurs
    const userIds = Array.from(weeklyPoints.keys());
    const users = await User.find({ 
      _id: { $in: userIds },
      isActive: true 
    }).select('name email profile.avatar');

    // Créer le classement hebdomadaire
    const weeklyRanking = users.map(user => {
      const userPoints = weeklyPoints.get(user._id.toString());
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.profile?.avatar,
        points: userPoints.points,
        level: calculateLevel(userPoints.points),
        stats: {
          eventsOrganized: userPoints.eventsOrganized,
          eventsJoined: userPoints.eventsJoined,
          totalEvents: userPoints.eventsOrganized + userPoints.eventsJoined
        }
      };
    }).sort((a, b) => b.points - a.points);

    // Ajouter le rang
    const rankingWithRanks = weeklyRanking.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Trouver la position de l'utilisateur actuel
    const currentUserWeeklyData = rankingWithRanks.find(u => u._id.toString() === currentUserId.toString());

    res.json({
      success: true,
      data: {
        ranking: rankingWithRanks.slice(0, parseInt(limit)),
        currentUser: currentUserWeeklyData,
        period: {
          start: startOfWeek,
          end: now
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du classement hebdomadaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du classement hebdomadaire'
    });
  }
});

/**
 * @route   GET /api/ranking/monthly
 * @desc    Récupérer le classement mensuel des utilisateurs
 * @access  Private
 */
router.get('/monthly', authMiddleware, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const currentUserId = req.userId;
    
    // Calculer la date de début du mois
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Récupérer les événements de ce mois
    const monthlyEvents = await Event.find({
      date: { $gte: startOfMonth },
      status: { $in: ['active', 'completed'] }
    });

    // Calculer les points mensuels pour chaque utilisateur
    const monthlyPoints = new Map();
    
    for (const event of monthlyEvents) {
      // Points pour l'organisateur
      if (event.organizer) {
        const organizerId = event.organizer.toString();
        if (!monthlyPoints.has(organizerId)) {
          monthlyPoints.set(organizerId, { points: 0, eventsOrganized: 0, eventsJoined: 0 });
        }
        const userPoints = monthlyPoints.get(organizerId);
        userPoints.points += 50; // Points pour organiser un événement
        userPoints.eventsOrganized += 1;
      }

      // Points pour les participants
      for (const participant of event.participants) {
        const participantId = participant.user.toString();
        if (participantId !== event.organizer?.toString()) {
          if (!monthlyPoints.has(participantId)) {
            monthlyPoints.set(participantId, { points: 0, eventsOrganized: 0, eventsJoined: 0 });
          }
          const userPoints = monthlyPoints.get(participantId);
          userPoints.points += 25; // Points pour participer
          userPoints.eventsJoined += 1;
        }
      }
    }

    // Récupérer les informations des utilisateurs
    const userIds = Array.from(monthlyPoints.keys());
    const users = await User.find({ 
      _id: { $in: userIds },
      isActive: true 
    }).select('name email profile.avatar');

    // Créer le classement mensuel
    const monthlyRanking = users.map(user => {
      const userPoints = monthlyPoints.get(user._id.toString());
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.profile?.avatar,
        points: userPoints.points,
        level: calculateLevel(userPoints.points),
        stats: {
          eventsOrganized: userPoints.eventsOrganized,
          eventsJoined: userPoints.eventsJoined,
          totalEvents: userPoints.eventsOrganized + userPoints.eventsJoined
        }
      };
    }).sort((a, b) => b.points - a.points);

    // Ajouter le rang
    const rankingWithRanks = monthlyRanking.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Trouver la position de l'utilisateur actuel
    const currentUserMonthlyData = rankingWithRanks.find(u => u._id.toString() === currentUserId.toString());

    res.json({
      success: true,
      data: {
        ranking: rankingWithRanks.slice(0, parseInt(limit)),
        currentUser: currentUserMonthlyData,
        period: {
          start: startOfMonth,
          end: now
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du classement mensuel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du classement mensuel'
    });
  }
});


// Fonction utilitaire pour calculer le niveau basé sur les points
function calculateLevel(points) {
  if (points < 100) return 1;
  if (points < 300) return 2;
  if (points < 600) return 3;
  if (points < 1000) return 4;
  if (points < 1500) return 5;
  if (points < 2100) return 6;
  if (points < 2800) return 7;
  if (points < 3600) return 8;
  if (points < 4500) return 9;
  if (points < 5500) return 10;
  if (points < 6600) return 11;
  if (points < 7800) return 12;
  if (points < 9100) return 13;
  if (points < 10500) return 14;
  if (points < 12000) return 15;
  if (points < 13600) return 16;
  if (points < 15300) return 17;
  if (points < 17100) return 18;
  if (points < 19000) return 19;
  if (points < 21000) return 20;
  return Math.floor((points - 21000) / 2000) + 21;
}

module.exports = router;
