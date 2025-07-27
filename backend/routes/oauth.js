const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

/**
 * @route   GET /api/auth/google
 * @desc    Rediriger vers Google pour l'authentification
 * @access  Public
 */
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // Force le choix du compte
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Callback Google OAuth
 * @access  Public
 */
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/auth/failure',
    session: false
  }),
  async (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:19006'}/auth/error?message=authentication_failed`);
      }

      // Générer les tokens JWT
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

      console.log('✅ Connexion Google réussie:', {
        userId: user._id,
        email: user.email,
        name: user.name,
        isNewUser: user.profile?.stats?.registrationDate > new Date(Date.now() - 30000) // Créé dans les 30 dernières secondes
      });

      // Redirection vers le frontend avec les tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:19006';
      const redirectUrl = `${frontendUrl}/auth/success?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(JSON.stringify(user.getPublicProfile()))}`;
      
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('❌ Erreur callback Google:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:19006';
      res.redirect(`${frontendUrl}/auth/error?message=callback_error`);
    }
  }
);

/**
 * @route   GET /api/auth/google/link
 * @desc    Lier un compte Google à un compte existant
 * @access  Private (utilisateur connecté)
 */
router.get('/google/link',
  // Middleware pour vérifier que l'utilisateur est connecté
  async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token requis',
        details: ['Vous devez être connecté pour lier un compte Google']
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          error: 'Utilisateur non trouvé',
          details: ['Token invalide']
        });
      }

      req.user = user;
      req.isLinking = true; // Flag pour indiquer qu'on lie un compte
      next();
    } catch (error) {
      return res.status(401).json({
        error: 'Token invalide',
        details: ['Token expiré ou malformé']
      });
    }
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

/**
 * @route   POST /api/auth/google/unlink
 * @desc    Délier un compte Google
 * @access  Private
 */
router.post('/google/unlink', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token requis',
        details: ['Authentification requise']
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        details: ['Token invalide']
      });
    }

    // Vérifier que l'utilisateur a un moyen de se connecter après déliaison
    if (!user.password && user.isOAuthUser() && Object.keys(user.oauth).length === 1 && user.oauth.google) {
      return res.status(400).json({
        error: 'Déliaison impossible',
        details: ['Vous devez définir un mot de passe avant de délier votre compte Google']
      });
    }

    // Délier le compte Google
    if (user.oauth && user.oauth.google) {
      user.oauth.google = undefined;
      await user.save();
      
      console.log(`✅ Compte Google délié pour ${user.email}`);
      
      res.json({
        message: 'Compte Google délié avec succès',
        success: true,
        user: user.getPublicProfile()
      });
    } else {
      res.status(400).json({
        error: 'Aucun compte Google lié',
        details: ['Ce compte n\'est pas lié à Google']
      });
    }

  } catch (error) {
    console.error('❌ Erreur déliaison Google:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la déliaison'
    });
  }
});

/**
 * @route   GET /auth/failure
 * @desc    Page d'erreur d'authentification
 * @access  Public
 */
router.get('/failure', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:19006';
  res.redirect(`${frontendUrl}/auth/error?message=oauth_failed`);
});

/**
 * @route   GET /api/auth/oauth/status
 * @desc    Obtenir le statut OAuth d'un utilisateur
 * @access  Private
 */
router.get('/oauth/status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token requis',
        details: ['Authentification requise']
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        details: ['Token invalide']
      });
    }

    res.json({
      success: true,
      oauth: user.getOAuthInfo(),
      canUnlinkGoogle: user.password || (user.oauth && Object.keys(user.oauth).length > 1)
    });

  } catch (error) {
    console.error('❌ Erreur statut OAuth:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue'
    });
  }
});

module.exports = router; 