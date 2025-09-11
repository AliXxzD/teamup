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
    
    console.log('🔍 Récupération du profil utilisateur:', {
      id,
      idType: typeof id,
      idLength: id?.length,
      isValidObjectId: id && id.length === 24
    });
    
    // Récupérer l'utilisateur avec ses statistiques
    // Essayer d'abord avec l'ID tel quel, puis avec conversion en ObjectId si nécessaire
    let user = await User.findById(id).select('-password -__v');
    
    // Si pas trouvé et que l'ID semble être un ObjectId valide, essayer avec new ObjectId
    if (!user && id && id.length === 24) {
      try {
        const mongoose = require('mongoose');
        const objectId = new mongoose.Types.ObjectId(id);
        user = await User.findById(objectId).select('-password -__v');
        console.log('🔍 Tentative avec ObjectId:', objectId);
      } catch (objectIdError) {
        console.log('❌ Erreur conversion ObjectId:', objectIdError.message);
      }
    }
    
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

/**
 * PUT /api/users/profile
 * Met à jour le profil de l'utilisateur connecté
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    console.log('📝 Mise à jour du profil utilisateur:', userId);
    console.log('📝 Données à mettre à jour:', updateData);
    
    // Champs autorisés pour la mise à jour
    const allowedFields = [
      'name', 'email', 'phone', 'bio', 'location', 
      'dateOfBirth', 'gender', 'favoriteSports'
    ];
    
    // Filtrer les champs autorisés
    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });
    
    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    if (filteredData.email) {
      const existingUser = await User.findOne({ 
        email: filteredData.email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé par un autre utilisateur'
        });
      }
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredData },
      { new: true, runValidators: true }
    ).select('-password -__v');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    console.log('✅ Profil utilisateur mis à jour:', {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email
    });
    
    res.json({
      success: true,
      user: updatedUser,
      message: 'Profil mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    
    // Gérer les erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil'
    });
  }
});

module.exports = router;
