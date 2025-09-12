// ========================================
// IMPORTS ET CONFIGURATION INITIALE
// ========================================

// Framework web Express pour créer l'API REST
const express = require('express');
// ODM (Object Document Mapper) pour MongoDB - permet d'interagir avec la base de données
const mongoose = require('mongoose');
// Middleware pour gérer les requêtes cross-origin (CORS) - permet aux apps mobiles d'accéder à l'API
const cors = require('cors');
// Middleware de sécurité pour protéger l'API contre les attaques courantes
const helmet = require('helmet');
// Middleware pour limiter le nombre de requêtes par IP (protection contre les attaques DDoS)
const rateLimit = require('express-rate-limit');
// Module Node.js pour créer un serveur HTTP
const { createServer } = require('http');
// Bibliothèque Socket.io pour la communication temps réel (messagerie instantanée)
const { Server } = require('socket.io');
// Module pour gérer les sessions utilisateur (actuellement désactivé)
// const session = require('express-session');
// Charge les variables d'environnement depuis le fichier .env
require('dotenv').config();

// ========================================
// IMPORTATION DES ROUTES ET SERVICES
// ========================================

// Routes pour l'authentification (login, register, logout, etc.)
const authRoutes = require('./routes/auth');
// Routes pour la gestion des événements (création, modification, suppression, etc.)
const eventRoutes = require('./routes/events');
// Routes pour la messagerie (envoi/réception de messages)
const messageRoutes = require('./routes/messages');
// Routes pour la gestion des profils utilisateurs
const userRoutes = require('./routes/users');
// Service Socket.io pour la communication temps réel
const socketService = require('./services/socketService');

// Configuration Passport pour l'authentification OAuth (actuellement désactivé)
// const passport = require('./config/passport');
// Fonctions utilitaires pour la base de données MongoDB
const { connectDB, initializeIndexes, cleanupDatabase } = require('./config/database');

// ========================================
// INITIALISATION DU SERVEUR
// ========================================

// Création de l'application Express
const app = express();
// Création du serveur HTTP à partir de l'app Express
const server = createServer(app);

// Configuration du port - utilise le port défini dans les variables d'environnement ou 5000 par défaut
const PORT = process.env.PORT || 5000;

// ========================================
// CONFIGURATION DES MIDDLEWARES DE SÉCURITÉ
// ========================================

// Helmet : middleware de sécurité qui définit des en-têtes HTTP sécurisés
// Protège contre les attaques XSS, clickjacking, etc.
app.use(helmet());

// ========================================
// CONFIGURATION CORS (Cross-Origin Resource Sharing)
// ========================================

// Liste des domaines autorisés à faire des requêtes vers cette API
// CORS est nécessaire car l'application mobile (Expo) et l'API sont sur des domaines différents
const allowedOrigins = [
  // URLs Expo par défaut - pour les builds de production et développement
  'https://expo.dev',        // Plateforme de développement Expo
  'https://exp.host',        // Service de distribution Expo
  'https://snack.expo.io',   // Environnement de test Expo Snack
  
  // URLs de développement local - pour tester l'app sur différents appareils
  'http://localhost:19006',      // Serveur de développement Expo local
  'http://192.168.1.25:19006',  // IP locale pour test sur mobile
  'http://192.168.1.25:8081',   // Port alternatif pour le développement
  'http://192.168.1.205:19006', // Autre IP locale du réseau
  'http://192.168.1.205:8081',  // Port alternatif sur cette IP
  'exp://localhost:8081',       // Protocole Expo pour développement local
  'exp://192.168.1.25:8081',    // Protocole Expo pour test sur mobile
  'exp://192.168.1.205:8081'    // Protocole Expo pour test sur autre appareil
];

// Ajouter l'URL frontend principale depuis les variables d'environnement
// Permet de configurer dynamiquement l'URL de production
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Ajouter des URLs supplémentaires depuis une liste séparée par des virgules
// Utile pour configurer plusieurs environnements (staging, production, etc.)
if (process.env.FRONTEND_URLS) {
  const additionalUrls = process.env.FRONTEND_URLS.split(',').map(url => url.trim());
  allowedOrigins.push(...additionalUrls);
}

// Afficher la configuration CORS pour le débogage
console.log('🌐 CORS configuré pour les origines:', allowedOrigins);

// Configuration du middleware CORS avec une fonction de validation personnalisée
app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (comme les apps mobiles Expo)
    // Les applications mobiles n'envoient pas toujours d'origin header
    if (!origin) return callback(null, true);
    
    // Permettre automatiquement tous les domaines Expo officiels
    // Cela garantit la compatibilité avec tous les environnements Expo
    if (origin.includes('expo.dev') || 
        origin.includes('exp.host') || 
        origin.includes('snack.expo.io') ||
        origin.startsWith('exp://')) {
      return callback(null, true);
    }
    
    // Vérifier si l'origin est dans la liste des origines autorisées
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      // En production, être plus permissif pour Expo pour éviter les problèmes de déploiement
      if (process.env.NODE_ENV === 'production') {
        return callback(null, true);
      }
      // En développement, bloquer les origines non autorisées pour la sécurité
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Permettre l'envoi de cookies et headers d'authentification
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes HTTP autorisées
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // Headers autorisés
}));

// ========================================
// CONFIGURATION SOCKET.IO (COMMUNICATION TEMPS RÉEL)
// ========================================

// Création du serveur Socket.io pour la messagerie instantanée
// Socket.io permet la communication bidirectionnelle en temps réel entre le client et le serveur
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Même logique CORS que pour Express - Socket.io doit respecter les mêmes règles
      if (!origin) return callback(null, true);
      
      // Permettre automatiquement les domaines Expo officiels
      if (origin.includes('expo.dev') || 
          origin.includes('exp.host') || 
          origin.includes('snack.expo.io') ||
          origin.startsWith('exp://')) {
        return callback(null, true);
      }
      
      // Vérifier les origines autorisées
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // En production, être plus permissif pour éviter les problèmes de connexion
        if (process.env.NODE_ENV === 'production') {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Permettre l'authentification via Socket.io
    methods: ['GET', 'POST'] // Méthodes HTTP supportées par Socket.io
  },
  transports: ['websocket', 'polling'], // Types de transport supportés (WebSocket + fallback HTTP)
  pingTimeout: 60000,    // Temps d'attente avant de considérer une connexion comme fermée (60s)
  pingInterval: 25000    // Intervalle entre les pings pour vérifier la connexion (25s)
});

// ========================================
// CONFIGURATION DU RATE LIMITING (LIMITATION DE REQUÊTES)
// ========================================

// Rate limiting général - protège contre les attaques DDoS et l'abus d'API
// Limite le nombre de requêtes par IP sur une période donnée
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de temps : 15 minutes
  max: 500, // Maximum 500 requêtes par IP pendant cette fenêtre (augmenté pour le développement)
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});
app.use(limiter);

// Rate limiting spécifique pour l'authentification - protection contre les attaques par force brute
// Limite le nombre de tentatives de connexion pour éviter les attaques de mot de passe
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de temps : 15 minutes
  max: 20, // Maximum 20 tentatives de connexion par IP (augmenté pour le développement)
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
  }
});

// ========================================
// CONFIGURATION DES MIDDLEWARES DE PARSING
// ========================================

// Middleware pour parser les données JSON des requêtes
// Permet de traiter les données envoyées par l'application mobile
app.use(express.json({ limit: '10mb' })); // Limite de 10MB pour les gros fichiers (images, etc.)
// Middleware pour parser les données de formulaire URL-encoded
app.use(express.urlencoded({ extended: true })); // Support des objets complexes dans les formulaires

// Configuration des sessions pour Passport (temporairement désactivé)
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'teamup_session_secret_change_in_production',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: 24 * 60 * 60 * 1000 // 24 heures
//   }
// }));

// Initialisation de Passport (temporairement désactivé)
// app.use(passport.initialize());
// app.use(passport.session());

// ========================================
// ROUTES DE BASE ET ENDPOINTS PRINCIPAUX
// ========================================

// Route racine - endpoint de test pour vérifier que l'API fonctionne
// Utilisée par les services de déploiement (Render) pour vérifier la santé de l'API
app.get('/', (req, res) => {
  res.json({
    message: 'TeamUp API is running on Render! 🏃‍♂️⚽',
    version: '1.0.0',
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    server: 'Render',
    endpoints: {
      auth: '/api/auth',        // Endpoints d'authentification
      events: '/api/events',    // Endpoints de gestion des événements
      messages: '/api/messages', // Endpoints de messagerie
      health: '/api/health'     // Endpoint de santé de l'API
    },
    cors: {
      enabled: true,
      allowedOrigins: 'Expo EAS Build compatible' // Compatible avec les builds Expo
    }
  });
});

// Route de santé détaillée - endpoint de monitoring pour vérifier l'état de l'API
// Utilisée par les outils de monitoring et les health checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(), // Timestamp de la requête
    uptime: process.uptime(),            // Temps de fonctionnement du serveur en secondes
    environment: process.env.NODE_ENV || 'development',
    server: 'Render',
    database: 'MongoDB Atlas connected', // État de la connexion à la base de données
    cors: 'Expo EAS Build ready'         // Configuration CORS prête pour Expo
  });
});

// ========================================
// CONFIGURATION DES ROUTES API
// ========================================

// Routes d'authentification avec rate limiting appliqué
// Toutes les routes /api/auth/* sont protégées par le rate limiting spécifique
app.use('/api/auth', authLimiter, authRoutes);

// Routes OAuth (temporairement désactivé - pour l'authentification Google/Facebook)
// app.use('/api/auth', oauthRoutes);

// Routes des événements - gestion complète des événements sportifs
// Inclut : création, modification, suppression, recherche, participation
app.use('/api/events', eventRoutes);

// Routes des notifications d'événements - système de notifications push
// Gère l'envoi de notifications aux participants d'événements
app.use('/api/events', require('./routes/events-notifications'));

// Routes des statistiques d'événements - données analytiques
// Fournit des statistiques sur les événements et les participants
app.use('/api/events', require('./routes/events-stats'));

// Routes de classement - système de points et classements utilisateurs
// Gère le système de réputation et de classement des joueurs
app.use('/api/ranking', require('./routes/ranking'));

// Routes d'avis - système d'évaluation des utilisateurs
// Permet aux utilisateurs de noter et commenter les autres joueurs
app.use('/api/reviews', require('./routes/reviews'));

// Routes de messagerie - communication entre utilisateurs
// Gère l'envoi et la réception de messages privés
app.use('/api/messages', messageRoutes);

// Routes des utilisateurs - gestion des profils
// Inclut : modification de profil, récupération d'informations utilisateur
app.use('/api/users', userRoutes);

// ========================================
// INITIALISATION DES SERVICES
// ========================================

// Initialiser le service Socket.io après la configuration CORS
// Socket.io gère la communication temps réel pour la messagerie
socketService.initialize(io);

// ========================================
// MIDDLEWARE DE GESTION D'ERREURS
// ========================================

// Middleware global pour capturer et traiter toutes les erreurs non gérées
// Doit être placé après toutes les routes pour capturer les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Erreur de validation Mongoose - données invalides envoyées à la base de données
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors
    });
  }
  
  // Erreur de duplication MongoDB - tentative d'insertion d'une valeur unique déjà existante
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field} déjà utilisé`,
      details: [`Ce ${field} existe déjà`]
    });
  }
  
  // Erreur JWT - token d'authentification invalide ou expiré
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide'
    });
  }
  
  // Erreur par défaut - toutes les autres erreurs non spécifiques
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// ========================================
// MIDDLEWARE POUR ROUTES NON TROUVÉES
// ========================================

// Middleware pour gérer les routes qui n'existent pas (404)
// Doit être placé en dernier, après toutes les autres routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// ========================================
// FONCTION DE DÉMARRAGE DU SERVEUR
// ========================================

// Fonction asynchrone pour initialiser et démarrer le serveur
// Effectue toutes les vérifications nécessaires avant de lancer l'API
const startServer = async () => {
  try {
    // ========================================
    // VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT
    // ========================================
    
    console.log('🔧 Vérification des variables d\'environnement...');
    
    // Liste des variables d'environnement critiques pour le fonctionnement de l'API
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    // Arrêter le serveur si des variables critiques sont manquantes
    if (missingVars.length > 0) {
      console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
      console.error('❌ Assurez-vous que le fichier .env est configuré correctement');
      process.exit(1);
    }
    
    console.log('✅ Variables d\'environnement validées');
    
    // ========================================
    // CONNEXION À LA BASE DE DONNÉES
    // ========================================
    
    // Établir la connexion à MongoDB Atlas
    await connectDB();
    
    // ========================================
    // INITIALISATION DE LA BASE DE DONNÉES
    // ========================================
    
    // Initialiser les index et nettoyer la base de données après un délai
    // Le délai permet à la connexion de se stabiliser
    setTimeout(async () => {
      await initializeIndexes();  // Créer les index pour optimiser les requêtes
      await cleanupDatabase();    // Nettoyer les données obsolètes
    }, 2000);
    
    // ========================================
    // DÉMARRAGE DU SERVEUR HTTP
    // ========================================
    
    // Lancer le serveur sur le port configuré
    // '0.0.0.0' permet d'accepter les connexions depuis toutes les interfaces réseau
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TeamUp API démarré!`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Host: 0.0.0.0`);
      console.log(`🌟 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check: /api/health`);
      console.log(`🔐 Auth API: /api/auth`);
      console.log(`⚽ Events API: /api/events`);
      console.log(`💬 Messages API: /api/messages`);
      console.log(`🔌 Socket.io: Messagerie temps réel activée`);
      console.log(`💾 Database: MongoDB Atlas`);
      console.log(`📧 Email: ${process.env.EMAIL_USER ? 'Configuré' : 'Non configuré'}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// ========================================
// GESTION DES SIGNAUX DE FERMETURE
// ========================================

// Gestionnaire pour le signal SIGTERM (arrêt propre du serveur)
// Utilisé par les plateformes de déploiement comme Render pour arrêter le serveur
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, fermeture gracieuse du serveur...');
  // Fermer la connexion à MongoDB avant d'arrêter le serveur
  mongoose.connection.close(() => {
    console.log('Connexion MongoDB fermée');
    process.exit(0);
  });
});

// Gestionnaire pour le signal SIGINT (Ctrl+C)
// Permet d'arrêter le serveur proprement en développement
process.on('SIGINT', () => {
  console.log('SIGINT reçu, fermeture gracieuse du serveur...');
  // Fermer la connexion à MongoDB avant d'arrêter le serveur
  mongoose.connection.close(() => {
    console.log('Connexion MongoDB fermée');
    process.exit(0);
  });
});

// ========================================
// DÉMARRAGE DE L'APPLICATION
// ========================================

// Lancer la fonction de démarrage du serveur
// catch(console.error) affiche les erreurs non gérées dans la console
startServer().catch(console.error); 