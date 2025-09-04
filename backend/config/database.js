const mongoose = require('mongoose');

/**
 * Configuration de la connexion à MongoDB
 */
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    
    const options = {
      maxPoolSize: 10, // Maintient jusqu'à 10 connexions de socket
      serverSelectionTimeoutMS: 5000, // Garde en essayant de se connecter pendant 5 secondes
      socketTimeoutMS: 45000, // Ferme les sockets après 45 secondes d'inactivité
      family: 4 // Utilise IPv4, ignore IPv6
    };

    const conn = await mongoose.connect(MONGODB_URI, options);
    
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    
    // Gestionnaires d'événements pour la connexion
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connecté à MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur de connexion MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose déconnecté de MongoDB');
    });

    // Fermeture propre de la connexion
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 Connexion MongoDB fermée par l\'application');
      process.exit(0);
    });

    return conn;
    
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    
    // Tentative de reconnexion après 5 secondes
    console.log('🔄 Tentative de reconnexion dans 5 secondes...');
    setTimeout(connectDB, 5000);
  }
};

/**
 * Fonction pour vérifier l'état de la connexion
 */
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'Déconnecté',
    1: 'Connecté',
    2: 'En cours de connexion',
    3: 'En cours de déconnexion'
  };
  
  return {
    state: states[state],
    isConnected: state === 1
  };
};

/**
 * Fonction pour initialiser les index de la base de données
 */
const initializeIndexes = async () => {
  try {
    // Créer les index pour améliorer les performances
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ 'profile.location.coordinates': '2dsphere' });
    
    console.log('🔍 Index de base de données créés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error);
  }
};

/**
 * Fonction pour nettoyer les anciennes données (tokens expirés, etc.)
 */
const cleanupDatabase = async () => {
  try {
    const User = require('../models/User');
    
    // Nettoyer les refresh tokens expirés (plus de 7 jours)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    await User.updateMany(
      {},
      {
        $pull: {
          refreshTokens: {
            createdAt: { $lt: sevenDaysAgo }
          }
        }
      }
    );
    
    console.log('🧹 Nettoyage de la base de données effectué');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error);
  }
};

/**
 * Fonction pour obtenir les statistiques de la base de données
 */
const getDatabaseStats = async () => {
  try {
    const User = require('../models/User');
    
    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      newUsersToday: await User.countDocuments({
        'stats.registrationDate': {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      usersWithLocation: await User.countDocuments({
        'profile.location.coordinates.latitude': { $exists: true }
      })
    };
    
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    return null;
  }
};

module.exports = {
  connectDB,
  checkConnection,
  initializeIndexes,
  cleanupDatabase,
  getDatabaseStats
}; 