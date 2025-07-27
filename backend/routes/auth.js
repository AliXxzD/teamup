const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const emailService = require('../services/emailService');
const PasswordResetCode = require('../models/PasswordResetCode');
const Event = require('../models/Event');

const router = express.Router();

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'teamup_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Fonction pour générer les tokens
const generateTokens = (userId, rememberMe = false) => {
  // Durées selon l'option "Se souvenir de moi"
  const accessTokenExpiry = rememberMe ? '7d' : JWT_EXPIRES_IN; // 7 jours vs 24h
  const refreshTokenExpiry = rememberMe ? '30d' : REFRESH_TOKEN_EXPIRES_IN; // 30 jours vs 7 jours
  
  const accessToken = jwt.sign(
    { userId, rememberMe }, 
    JWT_SECRET, 
    { expiresIn: accessTokenExpiry }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh', rememberMe }, 
    JWT_SECRET, 
    { expiresIn: refreshTokenExpiry }
  );
  
  return { 
    accessToken, 
    refreshToken,
    expiresIn: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // millisecondes
  };
};

// Validation pour l'inscription
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    })
];

// Validation pour la connexion
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: errors.array().map(err => err.msg)
      });
    }

    const { name, email, password, rememberMe = false } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Cet email est déjà utilisé',
        details: ['Un compte avec cet email existe déjà']
      });
    }

    // Créer le nouvel utilisateur
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      stats: {
        registrationDate: new Date()
      }
    });

    await user.save();

    // Générer les tokens
    const { accessToken, refreshToken, expiresIn } = generateTokens(user._id, rememberMe);

    // Sauvegarder le refresh token
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });
    await user.save();

    // Mettre à jour la dernière connexion
    await user.updateLastLogin();

    // Envoyer l'email de bienvenue (en arrière-plan)
    emailService.sendWelcomeEmail(user.email, user.name)
      .then(() => console.log(`✅ Email de bienvenue envoyé à ${user.email}`))
      .catch(error => console.error('❌ Erreur envoi email bienvenue:', error));

    res.status(201).json({
      message: 'Inscription réussie ! Bienvenue sur TeamUp 🎉',
      user: user.getPublicProfile(),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: expiresIn
      },
      rememberMe: rememberMe,
      sessionInfo: {
        duration: rememberMe ? '30 jours' : '7 jours',
        autoRefresh: rememberMe
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email déjà utilisé',
        details: ['Cet email est déjà associé à un compte']
      });
    }
    
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de l\'inscription'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: errors.array().map(err => err.msg)
      });
    }

    const { email, password, rememberMe = false } = req.body;

    // Trouver l'utilisateur
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        details: ['Email ou mot de passe incorrect']
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Compte désactivé',
        details: ['Votre compte a été désactivé. Contactez le support.']
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        details: ['Email ou mot de passe incorrect']
      });
    }

    // Générer les tokens
    const { accessToken, refreshToken, expiresIn } = generateTokens(user._id, rememberMe);

    // Nettoyer les anciens refresh tokens (plus de 7 jours)
    user.refreshTokens = user.refreshTokens.filter(
      tokenObj => Date.now() - tokenObj.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
    );

    // Ajouter le nouveau refresh token
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });
    await user.save();

    // Mettre à jour la dernière connexion
    await user.updateLastLogin();

    res.json({
      message: 'Connexion réussie ! Bon retour sur TeamUp 👋',
      user: user.getPublicProfile(),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: expiresIn
      },
      rememberMe: rememberMe,
      sessionInfo: {
        duration: rememberMe ? '30 jours' : '7 jours',
        autoRefresh: rememberMe
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la connexion'
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchir le token d'accès
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token manquant',
        details: ['Le refresh token est requis']
      });
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Token invalide',
        details: ['Le token fourni n\'est pas un refresh token']
      });
    }

    // Récupérer l'option rememberMe du token
    const rememberMe = decoded.rememberMe || false;

    // Trouver l'utilisateur
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Utilisateur invalide',
        details: ['Utilisateur non trouvé ou compte désactivé']
      });
    }

    // Vérifier que le refresh token existe
    const tokenExists = user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        error: 'Refresh token invalide',
        details: ['Ce refresh token n\'est pas valide']
      });
    }

    // Générer nouveaux tokens (préserver rememberMe)
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = generateTokens(user._id, rememberMe);

    // Remplacer l'ancien refresh token
    user.refreshTokens = user.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken);
    user.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date()
    });
    await user.save();

    res.json({
      message: 'Token rafraîchi avec succès',
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: expiresIn
      },
      rememberMe: rememberMe,
      sessionInfo: {
        duration: rememberMe ? '30 jours' : '7 jours',
        autoRefresh: rememberMe
      }
    });

  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token invalide',
        details: ['Le refresh token est invalide ou expiré']
      });
    }
    
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors du rafraîchissement du token'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion d'un utilisateur
 * @access  Private
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken) {
      // Supprimer le refresh token spécifique
      user.refreshTokens = user.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken);
    } else {
      // Supprimer tous les refresh tokens (déconnexion de tous les appareils)
      user.refreshTokens = [];
    }

    await user.save();

    res.json({
      message: 'Déconnexion réussie ! À bientôt sur TeamUp 👋'
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la déconnexion'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      message: 'Profil utilisateur récupéré avec succès',
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération du profil'
    });
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Vérifier la validité du token
 * @access  Private
 */
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    message: 'Token valide',
    user: req.user.getPublicProfile(),
    isAuthenticated: true
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Demander une réinitialisation de mot de passe
 * @access  Public
 */
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: errors.array().map(err => err.msg)
      });
    }

    const { email } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email);
    
    // Pour la sécurité, on retourne toujours un succès même si l'email n'existe pas
    // Cela évite qu'un attaquant puisse découvrir quels emails sont enregistrés
    if (!user) {
      return res.json({
        message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.',
        success: true
      });
    }

    // Générer un code de réinitialisation (valide 10 minutes)
    const resetCode = await PasswordResetCode.createResetCode(user._id, email);

    try {
      // Envoyer l'email avec le code
      await emailService.sendPasswordResetCode(email, resetCode, user.name);
      
      res.json({
        message: 'Si cet email existe dans notre système, vous recevrez un code de réinitialisation.',
        success: true,
        // En développement, on peut retourner le code pour tester
        ...(process.env.NODE_ENV === 'development' && { resetCode })
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi du code:', emailError);
      
      // Même si l'email échoue, on ne révèle pas l'existence du compte
      res.json({
        message: 'Si cet email existe dans notre système, vous recevrez un code de réinitialisation.',
        success: true,
        // En cas d'erreur email, on peut quand même retourner le code en dev
        ...(process.env.NODE_ENV === 'development' && { 
          resetCode,
          emailError: 'Erreur d\'envoi d\'email - configurez les variables EMAIL_USER et EMAIL_PASSWORD'
        })
      });
    }

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la demande de réinitialisation'
    });
  }
});

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Vérifier le code de réinitialisation
 * @access  Public
 */
router.post('/verify-reset-code', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Le code doit contenir exactement 6 chiffres')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: errors.array().map(err => err.msg)
      });
    }

    const { email, code } = req.body;

    // Valider le code
    const validation = await PasswordResetCode.validateCode(email, code);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Code invalide',
        details: [validation.error]
      });
    }

    // Générer un token temporaire pour le changement de mot de passe (valide 30 minutes)
    const resetToken = jwt.sign(
      { 
        userId: validation.userId, 
        type: 'password-change',
        codeId: validation.codeId,
        timestamp: Date.now()
      }, 
      JWT_SECRET, 
      { expiresIn: '30m' }
    );

    res.json({
      message: 'Code vérifié avec succès',
      success: true,
      resetToken, // Token pour la prochaine étape
      user: {
        id: validation.user._id,
        name: validation.user.name,
        email: validation.user.email
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la vérification'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Réinitialiser le mot de passe avec un token validé
 * @access  Public
 */
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Le token de réinitialisation est requis'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: errors.array().map(err => err.msg)
      });
    }

    const { token, newPassword } = req.body;

    // Vérifier et décoder le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        error: 'Token invalide',
        details: ['Le lien de réinitialisation est invalide ou expiré']
      });
    }

    // Vérifier que c'est bien un token de changement de mot de passe
    if (decoded.type !== 'password-change') {
      return res.status(400).json({
        error: 'Token invalide',
        details: ['Ce token n\'est pas valide pour le changement de mot de passe']
      });
    }

    // Trouver l'utilisateur
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        error: 'Utilisateur non trouvé',
        details: ['L\'utilisateur associé à ce token n\'existe pas']
      });
    }

    // Vérifier que le compte est actif
    if (!user.isActive) {
      return res.status(400).json({
        error: 'Compte désactivé',
        details: ['Ce compte a été désactivé']
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    
    // Invalider tous les refresh tokens existants pour des raisons de sécurité
    user.refreshTokens = [];
    
    await user.save();

    // Marquer le code comme utilisé si on a l'ID du code
    if (decoded.codeId) {
      await PasswordResetCode.markAsUsed(decoded.codeId);
    }

    // Envoyer l'email de confirmation (en arrière-plan)
    emailService.sendPasswordChangedConfirmation(user.email, user.name)
      .then(() => console.log(`✅ Email de confirmation mot de passe envoyé à ${user.email}`))
      .catch(error => console.error('❌ Erreur envoi confirmation mot de passe:', error));

    res.json({
      message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
      success: true
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
    });
  }
});

// Route pour récupérer le profil utilisateur
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // L'utilisateur est déjà chargé par le middleware d'authentification
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas'
      });
    }

    // Récupérer le profil public avec statistiques réelles
    const profile = await user.getPublicProfileWithRealStats();
    
    // Ajouter quelques informations supplémentaires pour le profil personnel
    const enrichedProfile = {
      ...profile,
      isOwnProfile: true,
      canEdit: true,
      preferences: user.preferences // Inclure les préférences pour son propre profil
    };

    res.json({
      success: true,
      profile: enrichedProfile
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer les informations du profil'
    });
  }
});

// Route pour récupérer le profil d'un autre utilisateur
router.get('/profile/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas'
      });
    }

    // Récupérer le profil public avec statistiques réelles
    const profile = await user.getPublicProfileWithRealStats();
    
    // Vérifier si l'utilisateur actuel suit ce profil
    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser?.profile?.following?.includes(userId) || false;
    
    const enrichedProfile = {
      ...profile,
      isOwnProfile: currentUserId === userId,
      canEdit: currentUserId === userId,
      isFollowing: isFollowing
    };

    res.json({
      success: true,
      profile: enrichedProfile
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer les informations du profil'
    });
  }
});

// Route pour mettre à jour le profil utilisateur
router.put('/profile', authMiddleware, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La bio ne peut pas dépasser 500 caractères'),
    
  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ville ne peut pas dépasser 100 caractères'),
    
  body('location.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le pays ne peut pas dépasser 100 caractères'),
    
  body('favoritesSports')
    .optional()
    .isArray()
    .withMessage('Les sports favoris doivent être un tableau'),
    
  body('skillLevel')
    .optional()
    .isIn(['débutant', 'intermédiaire', 'avancé', 'expert'])
    .withMessage('Le niveau de compétence doit être valide')
], async (req, res) => {
  try {
    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array().map(err => err.msg)
      });
    }

    // L'utilisateur est déjà chargé par le middleware d'authentification
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Utiliser la nouvelle méthode updateProfile
    await user.updateProfile(req.body);

    // Retourner le profil mis à jour
    const updatedProfile = user.getPublicProfile();

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    
    // Gérer les erreurs spécifiques
    if (error.message.includes('nom d\'utilisateur')) {
      return res.status(400).json({
        error: 'Nom d\'utilisateur déjà pris',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de mettre à jour le profil'
    });
  }
});

// Route pour mettre à jour les statistiques d'un utilisateur
router.post('/profile/stats/update', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Calculer et mettre à jour les statistiques réelles
    const realStats = await user.calculateRealStats();
    
    res.json({
      success: true,
      message: 'Statistiques mises à jour avec succès',
      stats: realStats
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de mettre à jour les statistiques'
    });
  }
});

// Route pour récupérer les événements récents d'un utilisateur
router.get('/profile/events/recent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; // Utiliser req.user._id au lieu de req.user.userId
    const limit = parseInt(req.query.limit) || 5;
    
    // Récupérer les événements récents où l'utilisateur est organisateur ou participant
    const recentEvents = await Event.find({
      $or: [
        { organizer: userId },
        { participants: userId }
      ]
    })
    .sort({ date: -1 })
    .limit(limit)
    .populate('organizer', 'name')
    .select('title sport date organizer participants createdAt');

    // Formater les événements pour le frontend
    const formattedEvents = recentEvents.map(event => {
      const isOrganizer = event.organizer._id.toString() === userId;
      const timeDiff = new Date() - new Date(event.date);
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      let timeLabel;
      if (daysAgo === 0) {
        timeLabel = "Aujourd'hui";
      } else if (daysAgo === 1) {
        timeLabel = "Hier";
      } else if (daysAgo < 7) {
        timeLabel = `${daysAgo} jours`;
      } else if (daysAgo < 30) {
        const weeksAgo = Math.floor(daysAgo / 7);
        timeLabel = `${weeksAgo} semaine${weeksAgo > 1 ? 's' : ''}`;
      } else {
        const monthsAgo = Math.floor(daysAgo / 30);
        timeLabel = `${monthsAgo} mois`;
      }

      // Mapper les sports aux icônes et couleurs
      const sportMapping = {
        'Football': { icon: 'sports-soccer', color: '#22C55E' },
        'Basketball': { icon: 'sports-basketball', color: '#F97316' },
        'Tennis': { icon: 'sports-tennis', color: '#3B82F6' },
        'Volleyball': { icon: 'sports-volleyball', color: '#A855F7' },
        'Running': { icon: 'directions-run', color: '#EF4444' },
        'Natation': { icon: 'pool', color: '#06B6D4' },
        'Cyclisme': { icon: 'directions-bike', color: '#10B981' },
        'Fitness': { icon: 'fitness-center', color: '#F59E0B' }
      };

      const sportInfo = sportMapping[event.sport] || { icon: 'sports', color: '#6B7280' };

      return {
        id: event._id,
        title: event.title,
        time: timeLabel,
        role: isOrganizer ? 'Organisateur' : 'Participant',
        sport: event.sport.toLowerCase(),
        color: sportInfo.color,
        icon: sportInfo.icon
      };
    });

    res.json({
      success: true,
      events: formattedEvents
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements récents:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer les événements récents'
    });
  }
});

// Route pour suivre/ne plus suivre un utilisateur
router.post('/profile/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    
    if (currentUserId === userId) {
      return res.status(400).json({
        error: 'Action impossible',
        message: 'Vous ne pouvez pas vous suivre vous-même'
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!targetUser) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    const isCurrentlyFollowing = currentUser?.profile?.following?.includes(userId) || false;

    if (isCurrentlyFollowing) {
      // Unfollow
      await currentUser.unfollow(userId);
      await targetUser.removeFollower(currentUserId);
      
      res.json({
        success: true,
        action: 'unfollow',
        message: `Vous ne suivez plus ${targetUser.name}`,
        isFollowing: false
      });
    } else {
      // Follow
      await currentUser.follow(userId);
      await targetUser.addFollower(currentUserId);
      
      res.json({
        success: true,
        action: 'follow',
        message: `Vous suivez maintenant ${targetUser.name}`,
        isFollowing: true
      });
    }

  } catch (error) {
    console.error('Erreur lors du follow/unfollow:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible d\'effectuer cette action'
    });
  }
});

module.exports = router; 