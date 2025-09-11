const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
// const session = require('express-session');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const socketService = require('./services/socketService');

// const passport = require('./config/passport');
const { connectDB, initializeIndexes, cleanupDatabase } = require('./config/database');

const app = express();
const server = createServer(app);

// Configuration des variables d'environnement
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet());

// Configuration CORS depuis les variables d'environnement
const allowedOrigins = [
  // URLs Expo par défaut
  'https://expo.dev',
  'https://exp.host',
  'https://snack.expo.io',
  
  // URLs de développement par défaut
  'http://localhost:19006',
  'http://192.168.1.25:19006',
  'http://192.168.1.25:8081',
  'http://192.168.1.205:19006',
  'http://192.168.1.205:8081',
  'exp://localhost:8081',
  'exp://192.168.1.25:8081',
  'exp://192.168.1.205:8081'
];

// Ajouter l'URL frontend principale si définie
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Ajouter les URLs supplémentaires depuis FRONTEND_URLS si définies
if (process.env.FRONTEND_URLS) {
  const additionalUrls = process.env.FRONTEND_URLS.split(',').map(url => url.trim());
  allowedOrigins.push(...additionalUrls);
}

console.log('🌐 CORS configuré pour les origines:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (comme les apps mobiles Expo)
    if (!origin) return callback(null, true);
    
    // Permettre tous les domaines expo.dev et exp.host
    if (origin.includes('expo.dev') || 
        origin.includes('exp.host') || 
        origin.includes('snack.expo.io') ||
        origin.startsWith('exp://')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      // En production, être plus permissif pour Expo
      if (process.env.NODE_ENV === 'production') {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Configuration Socket.io
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Même logique CORS que pour Express
      if (!origin) return callback(null, true);
      
      if (origin.includes('expo.dev') || 
          origin.includes('exp.host') || 
          origin.includes('snack.expo.io') ||
          origin.startsWith('exp://')) {
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        if (process.env.NODE_ENV === 'production') {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Rate limiting - Augmenté pour le développement
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Augmenté de 100 à 500 requêtes par windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});
app.use(limiter);

// Rate limiting spécifique pour l'auth - Augmenté pour le développement
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Augmenté de 5 à 20 tentatives de connexion par windowMs
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
  }
});

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Route de test pour Render
app.get('/', (req, res) => {
  res.json({
    message: 'TeamUp API is running on Render! 🏃‍♂️⚽',
    version: '1.0.0',
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    server: 'Render',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      messages: '/api/messages',
      health: '/api/health'
    },
    cors: {
      enabled: true,
      allowedOrigins: 'Expo EAS Build compatible'
    }
  });
});

// Route de santé pour Render
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Render',
    database: 'MongoDB Atlas connected',
    cors: 'Expo EAS Build ready'
  });
});

// Routes d'authentification avec rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Routes OAuth (temporairement désactivé)
// app.use('/api/auth', oauthRoutes);

// Routes des événements
app.use('/api/events', eventRoutes);

// Routes des notifications d'événements
app.use('/api/events', require('./routes/events-notifications'));

// Routes des statistiques d'événements
app.use('/api/events', require('./routes/events-stats'));

// Routes de classement
app.use('/api/ranking', require('./routes/ranking'));

// Routes d'avis
app.use('/api/reviews', require('./routes/reviews'));

// Routes de messagerie
app.use('/api/messages', messageRoutes);

// Routes des utilisateurs
app.use('/api/users', userRoutes);

// Initialiser Socket.io après la configuration CORS
socketService.initialize(io);

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors
    });
  }
  
  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field} déjà utilisé`,
      details: [`Ce ${field} existe déjà`]
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide'
    });
  }
  
  // Erreur par défaut
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Vérifier les variables d'environnement critiques
    console.log('🔧 Vérification des variables d\'environnement...');
    
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
      console.error('❌ Assurez-vous que le fichier .env est configuré correctement');
      process.exit(1);
    }
    
    console.log('✅ Variables d\'environnement validées');
    
    // Connexion à MongoDB
    await connectDB();
    
    // Initialiser les index
    setTimeout(async () => {
      await initializeIndexes();
      await cleanupDatabase();
    }, 2000);
    
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

// Gestion des signaux de fermeture
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, fermeture gracieuse du serveur...');
  mongoose.connection.close(() => {
    console.log('Connexion MongoDB fermée');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu, fermeture gracieuse du serveur...');
  mongoose.connection.close(() => {
    console.log('Connexion MongoDB fermée');
    process.exit(0);
  });
});

startServer().catch(console.error); 