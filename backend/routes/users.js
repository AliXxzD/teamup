const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/users/:id
 * Récupère le profil public d'un utilisateur par son ID
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'ID est valide
    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur requis'
      });
    }
    
    console.log('🔍 Récupération du profil utilisateur:', id);
    
    // Récupérer l'utilisateur avec ses statistiques
    const user = await User.findById(id).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Récupérer les statistiques réelles de l'utilisateur
    const userWithStats = await user.getPublicProfileWithRealStats();
    
    console.log('✅ Profil utilisateur récupéré:', {
      id: user._id,
      name: user.name,
      email: user.email,
      hasStats: !!userWithStats.stats
    });
    
    res.json({
      success: true,
      data: userWithStats,
      message: 'Profil utilisateur récupéré avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
});

/**
 * GET /api/users
 * Récupère la liste des utilisateurs (pour recherche, etc.)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    
    let query = {};
    
    // Ajouter une recherche par nom si fournie
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password -__v')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Utilisateurs récupérés avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
});

module.exports = router;
