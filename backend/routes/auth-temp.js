// SOLUTION TEMPORAIRE : Routes d'authentification sans email
// Remplacez temporairement backend/routes/auth.js par ce fichier pour tester

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'teamup_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Fonction pour générer les tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Validation pour l'inscription
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et traits d\'union'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
];

// Validation pour la connexion
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
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

    const { name, email, password } = req.body;

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
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Sauvegarder le refresh token
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });
    await user.save();

    // Mettre à jour la dernière connexion
    await user.updateLastLogin();

    // TEMPORAIRE : Pas d'email de bienvenue
    console.log(`🎉 Nouvel utilisateur inscrit: ${user.email} (Email de bienvenue désactivé en mode test)`);

    res.status(201).json({
      message: 'Inscription réussie ! Bienvenue sur TeamUp 🎉',
      user: user.getPublicProfile(),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: JWT_EXPIRES_IN
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
 * @desc    Connexion utilisateur
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

    const { email, password, rememberMe } = req.body;

    // Trouver l'utilisateur
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Identifiants incorrects',
        details: ['Email ou mot de passe incorrect']
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Identifiants incorrects',
        details: ['Email ou mot de passe incorrect']
      });
    }

    // Vérifier que le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Compte désactivé',
        details: ['Ce compte a été désactivé']
      });
    }

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Sauvegarder le refresh token
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });

    // Limiter le nombre de refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    // Mettre à jour la dernière connexion
    await user.updateLastLogin();

    res.json({
      message: 'Connexion réussie ! Bon retour sur TeamUp 🎯',
      user: user.getPublicProfile(),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: JWT_EXPIRES_IN
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
 * @route   POST /api/auth/forgot-password
 * @desc    Demander une réinitialisation de mot de passe (MODE TEST)
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
    if (!user) {
      return res.json({
        message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.',
        success: true
      });
    }

    // Générer un token de réinitialisation (valide 1 heure)
    const resetToken = jwt.sign(
      { 
        userId: user._id, 
        type: 'password-reset',
        timestamp: Date.now()
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // MODE TEST : Afficher le lien dans les logs au lieu d'envoyer un email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:19006'}/reset-password?token=${resetToken}`;
    
    console.log('\n🔗 LIEN DE RÉINITIALISATION (MODE TEST)');
    console.log('=====================================');
    console.log(`Email: ${email}`);
    console.log(`Lien: ${resetUrl}`);
    console.log(`Token: ${resetToken}`);
    console.log('=====================================\n');

    res.json({
      message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.',
      success: true,
      // En mode test, on retourne le token et le lien
      testMode: true,
      resetToken,
      resetUrl,
      instructions: 'MODE TEST: Utilisez le lien affiché dans les logs du serveur'
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la demande de réinitialisation'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Réinitialiser le mot de passe avec un token
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

    // Vérifier que c'est bien un token de réinitialisation
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({
        error: 'Token invalide',
        details: ['Ce token n\'est pas valide pour la réinitialisation de mot de passe']
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

    console.log(`✅ Mot de passe réinitialisé avec succès pour: ${user.email}`);

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

// Autres routes (refresh, logout, etc.) restent identiques...
// [Ajoutez ici les autres routes de votre auth.js original]

module.exports = router; 