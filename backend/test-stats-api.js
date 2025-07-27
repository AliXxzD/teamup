const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamup';

async function testStatsAPI() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion réussie');

    console.log('\n📊 Test des statistiques via l\'API...');

    // Récupérer tous les utilisateurs
    const users = await User.find({});
    console.log(`👥 ${users.length} utilisateurs trouvés`);

    for (const user of users) {
      console.log(`\n👤 Test pour: ${user.name} (${user.email})`);
      
      try {
        // Tester la méthode getPublicProfileWithRealStats
        const profile = await user.getPublicProfileWithRealStats();
        
        console.log('✅ Profil avec statistiques réelles:');
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Nom: ${profile.name}`);
        console.log(`   - Username: ${profile.username}`);
        console.log(`   - Événements organisés: ${profile.stats.eventsOrganized}`);
        console.log(`   - Événements rejoints: ${profile.stats.eventsJoined}`);
        console.log(`   - Note moyenne: ${profile.stats.averageRating}`);
        console.log(`   - Nombre d'évaluations: ${profile.stats.totalRatings}`);
        
        // Vérifier que les statistiques sont cohérentes
        if (profile.stats.eventsOrganized >= 0 && profile.stats.eventsJoined >= 0) {
          console.log('✅ Statistiques valides');
        } else {
          console.log('❌ Statistiques invalides');
        }
        
      } catch (error) {
        console.error(`❌ Erreur pour ${user.name}:`, error.message);
      }
    }

    // Test spécifique pour un utilisateur avec des événements
    console.log('\n🎯 Test spécifique pour un utilisateur avec des événements...');
    const userWithEvents = await User.findOne({
      $or: [
        { 'profile.stats.eventsOrganized': { $gt: 0 } },
        { 'profile.stats.eventsJoined': { $gt: 0 } }
      ]
    });

    if (userWithEvents) {
      console.log(`👤 Utilisateur avec événements: ${userWithEvents.name}`);
      
      const profile = await userWithEvents.getPublicProfileWithRealStats();
      
      console.log('📊 Détails des statistiques:');
      console.log(`   - Événements organisés: ${profile.stats.eventsOrganized}`);
      console.log(`   - Événements rejoints: ${profile.stats.eventsJoined}`);
      
      // Vérifier la cohérence
      const totalEvents = profile.stats.eventsOrganized + profile.stats.eventsJoined;
      console.log(`   - Total événements: ${totalEvents}`);
      
      if (totalEvents > 0) {
        console.log('✅ Utilisateur actif avec des événements');
      } else {
        console.log('⚠️ Utilisateur sans événements');
      }
    } else {
      console.log('⚠️ Aucun utilisateur avec des événements trouvé');
    }

    // Test de performance
    console.log('\n⚡ Test de performance...');
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      await user.getPublicProfileWithRealStats();
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`⏱️ Temps moyen par requête: ${duration / 10}ms`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de la base de données');
  }
}

// Exécuter le script
testStatsAPI().catch(console.error); 