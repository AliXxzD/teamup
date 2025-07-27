const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamup';

async function updateAllUserStats() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion réussie');

    console.log('👥 Récupération de tous les utilisateurs...');
    const users = await User.find({});
    console.log(`📊 ${users.length} utilisateurs trouvés`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`🔄 Mise à jour des statistiques pour ${user.name} (${user.email})...`);
        
        const stats = await user.calculateRealStats();
        
        console.log(`✅ Statistiques mises à jour pour ${user.name}:`);
        console.log(`   - Événements organisés: ${stats.eventsOrganized}`);
        console.log(`   - Événements rejoints: ${stats.eventsJoined}`);
        console.log(`   - Note moyenne: ${stats.averageRating}`);
        console.log(`   - Nombre d'évaluations: ${stats.totalRatings}`);
        
        updatedCount++;
      } catch (error) {
        console.error(`❌ Erreur pour ${user.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Mise à jour terminée !');
    console.log(`✅ ${updatedCount} utilisateurs mis à jour avec succès`);
    console.log(`❌ ${errorCount} erreurs rencontrées`);

    // Afficher un résumé des statistiques
    console.log('\n📊 Résumé des statistiques:');
    const allUsers = await User.find({});
    const totalStats = {
      eventsOrganized: 0,
      eventsJoined: 0,
      averageRating: 0,
      totalRatings: 0
    };

    allUsers.forEach(user => {
      if (user.profile?.stats) {
        totalStats.eventsOrganized += user.profile.stats.eventsOrganized || 0;
        totalStats.eventsJoined += user.profile.stats.eventsJoined || 0;
        totalStats.totalRatings += user.profile.stats.totalRatings || 0;
      }
    });

    const usersWithRatings = allUsers.filter(user => 
      user.profile?.stats?.totalRatings > 0
    );

    if (usersWithRatings.length > 0) {
      const totalRating = usersWithRatings.reduce((sum, user) => 
        sum + (user.profile.stats.averageRating * user.profile.stats.totalRatings), 0
      );
      const totalRatingCount = usersWithRatings.reduce((sum, user) => 
        sum + user.profile.stats.totalRatings, 0
      );
      totalStats.averageRating = totalRatingCount > 0 ? totalRating / totalRatingCount : 0;
    }

    console.log(`   - Total événements organisés: ${totalStats.eventsOrganized}`);
    console.log(`   - Total événements rejoints: ${totalStats.eventsJoined}`);
    console.log(`   - Note moyenne globale: ${totalStats.averageRating.toFixed(1)}`);
    console.log(`   - Total évaluations: ${totalStats.totalRatings}`);

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de la base de données');
  }
}

// Exécuter le script
updateAllUserStats().catch(console.error); 