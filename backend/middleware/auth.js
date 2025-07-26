const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'teamup_secret_key_change_in_production';

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token et charge l'utilisateur dans req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Accès refusé',
        details: ['Token d\'authentification manquant']
      });
    }

    // Vérifier le format "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({
        error: 'Accès refusé',
        details: ['Token d\'authentification invalide']
      });
    }

    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Vérifier que ce n'est pas un refresh token
    if (decoded.type === 'refresh') {
      return res.status(401).json({
        error: 'Token invalide',
        details: ['Impossible d\'utiliser un refresh token pour l\'authentification']
      });
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        details: ['L\'utilisateur associé à ce token n\'existe pas']
      });
    }

    // Vérifier que le compte utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Compte désactivé',
        details: ['Votre compte a été désactivé. Contactez le support.']
      });
    }

    // Ajouter l'utilisateur à la requête pour les middlewares suivants
    req.user = user;
    req.userId = user._id;
    req.token = token;

    next();

  } catch (error) {
    console.error('Erreur d\'authentification:', error);

    // Gestion des erreurs JWT spécifiques
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide',
        details: ['Le token d\'authentification n\'est pas valide']
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        details: ['Votre session a expiré. Veuillez vous reconnecter.']
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        error: 'Token non valide',
        details: ['Le token n\'est pas encore valide']
      });
    }

    // Erreur générique
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la vérification de l\'authentification'
    });
  }
};

/**
 * Middleware d'authentification optionnel
 * Charge l'utilisateur si un token valide est fourni, sinon continue sans erreur
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next(); // Pas de token, continuer sans utilisateur
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      return next(); // Token invalide, continuer sans utilisateur
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type === 'refresh') {
      return next(); // Refresh token, continuer sans utilisateur
    }

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
      req.token = token;
    }

    next();

  } catch (error) {
    // En cas d'erreur, continuer sans utilisateur (middleware optionnel)
    next();
  }
};

/**
 * Middleware pour vérifier les permissions d'administration
 * À utiliser après authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentification requise',
      details: ['Vous devez être connecté pour accéder à cette ressource']
    });
  }

  // Vérifier si l'utilisateur a les droits d'administration
  // Pour l'instant, on peut utiliser un champ role ou isAdmin
  if (!req.user.isAdmin && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès interdit',
      details: ['Vous n\'avez pas les droits d\'administration nécessaires']
    });
  }

  next();
};

/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres données
 * ou qu'il a les droits d'administration
 */
const ownerOrAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentification requise',
      details: ['Vous devez être connecté pour accéder à cette ressource']
    });
  }

  const resourceUserId = req.params.userId || req.params.id;
  const currentUserId = req.user._id.toString();
  
  // Vérifier si l'utilisateur accède à ses propres données ou s'il est admin
  if (currentUserId !== resourceUserId && !req.user.isAdmin && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès interdit',
      details: ['Vous ne pouvez accéder qu\'à vos propres données']
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  ownerOrAdminMiddleware
}; 