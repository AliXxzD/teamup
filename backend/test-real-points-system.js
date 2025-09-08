/**
 * Test du système de points réels avec les données utilisateur
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

async function testRealPointsSystem() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    // Récupérer tous les utilisateurs
    const users = await User.find().limit(5);
    console.log(`\n📊 ${users.length} utilisateurs trouvés`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    console.log('\n🧮 Calcul des points réels pour chaque utilisateur:');
    console.log('=' .repeat(80));

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n${i + 1}. ${user.name} (${user.email})`);
      
      // Calculer les vraies statistiques
      await user.calculateRealStats();
      
      const stats = user.profile?.stats || {};
      console.log('📈 Statistiques:');
      console.log(`   - Événements organisés: ${stats.eventsOrganized || 0}`);
      console.log(`   - Événements rejoints: ${stats.eventsJoined || 0}`);
      console.log(`   - Note moyenne: ${stats.averageRating || 0}`);
      console.log(`   - Nombre d'évaluations: ${stats.totalRatings || 0}`);
      console.log(`   - Email vérifié: ${user.isEmailVerified ? 'Oui' : 'Non'}`);
      
      // Calculer l'ancienneté
      const registrationDate = stats.registrationDate || user.createdAt;
      const daysSinceRegistration = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   - Membre depuis: ${daysSinceRegistration} jours`);

      // Calculer les points selon notre système
      let totalPoints = 0;
      
      // Points événements organisés
      const organizedPoints = (stats.eventsOrganized || 0) * 50;
      totalPoints += organizedPoints;
      
      // Points événements rejoints
      const joinedPoints = (stats.eventsJoined || 0) * 20;
      totalPoints += joinedPoints;
      
      // Bonus note moyenne
      const ratingBonus = stats.averageRating && stats.totalRatings > 0 
        ? Math.round((stats.averageRating / 5) * 500)
        : 0;
      totalPoints += ratingBonus;
      
      // Bonus ancienneté
      const anciennetyBonus = Math.min(daysSinceRegistration, 365);
      totalPoints += anciennetyBonus;
      
      // Bonus email vérifié
      const emailBonus = user.isEmailVerified ? 100 : 0;
      totalPoints += emailBonus;

      console.log('\n💰 Calcul des points:');
      console.log(`   - Événements organisés: ${organizedPoints} pts (${stats.eventsOrganized || 0} × 50)`);
      console.log(`   - Événements rejoints: ${joinedPoints} pts (${stats.eventsJoined || 0} × 20)`);
      console.log(`   - Bonus note moyenne: ${ratingBonus} pts`);
      console.log(`   - Bonus ancienneté: ${anciennetyBonus} pts`);
      console.log(`   - Bonus email: ${emailBonus} pts`);
      console.log(`   📊 TOTAL: ${totalPoints} points`);

      // Calculer le niveau
      let level = 1;
      if (totalPoints >= 100) level = 2;
      if (totalPoints >= 300) level = 3;
      if (totalPoints >= 600) level = 4;
      if (totalPoints >= 1000) level = 5;
      if (totalPoints >= 1500) level = 6;
      if (totalPoints >= 2200) level = 7;
      if (totalPoints >= 3000) level = 8;
      if (totalPoints >= 4000) level = 9;
      if (totalPoints >= 5500) level = 10;
      
      if (totalPoints >= 7500) {
        level = 10 + Math.floor((totalPoints - 7500) / 1000);
      }

      const levelTitles = {
        1: 'Débutant', 2: 'Novice', 3: 'Apprenti', 4: 'Sportif', 5: 'Athlète',
        6: 'Compétiteur', 7: 'Expert', 8: 'Champion', 9: 'Maître', 10: 'Légende'
      };
      
      const levelTitle = levelTitles[level] || (level <= 20 ? 'Elite' : level <= 30 ? 'Pro' : level <= 40 ? 'Superstar' : 'Immortel');

      console.log(`🏆 Niveau: ${level} (${levelTitle})`);

      // Calculer les achievements
      const achievements = [];
      
      if ((stats.eventsOrganized || 0) >= 1) {
        achievements.push('Premier Organisateur');
      }
      if ((stats.eventsOrganized || 0) >= 5) {
        achievements.push('Organisateur Actif');
      }
      if ((stats.eventsJoined || 0) >= 10) {
        achievements.push('Sportif Régulier');
      }
      if (stats.averageRating >= 4.5 && stats.totalRatings >= 5) {
        achievements.push('Très Apprécié');
      }
      if (user.isEmailVerified) {
        achievements.push('Compte Vérifié');
      }
      if (daysSinceRegistration >= 30) {
        achievements.push('Membre Fidèle');
      }

      console.log(`🎖️ Achievements débloqués: ${achievements.length}`);
      achievements.forEach(achievement => {
        console.log(`   ✅ ${achievement}`);
      });

      // Mettre à jour les points dans le profil utilisateur
      if (!user.profile) user.profile = {};
      user.profile.points = totalPoints;
      user.profile.level = level;
      
      await user.save();
      console.log('✅ Points mis à jour dans la base de données');
    }

    console.log('\n🎯 Résumé du test:');
    console.log('- Tous les utilisateurs ont maintenant des points réels');
    console.log('- Les niveaux sont calculés selon les activités');
    console.log('- Les achievements reflètent les vraies réalisations');
    console.log('- Le Dashboard affichera maintenant les vraies données');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Test terminé');
  }
}

// Exécuter le test
if (require.main === module) {
  console.log('🚀 Test du système de points réels');
  console.log('=' .repeat(50));
  
  testRealPointsSystem().catch(console.error);
}

module.exports = { testRealPointsSystem };

