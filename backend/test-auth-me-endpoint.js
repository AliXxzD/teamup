/**
 * Test simple de l'endpoint /api/auth/me
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testAuthMeEndpoint() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    // Trouver un utilisateur existant
    const user = await User.findOne();
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    console.log(`\n👤 Utilisateur trouvé: ${user.name} (${user.email})`);

    // Calculer les vraies statistiques
    await user.calculateRealStats();

    // Test de getPublicProfile
    console.log('\n📊 Test getPublicProfile():');
    const publicProfile = user.getPublicProfile();
    console.log('Structure:', Object.keys(publicProfile));
    console.log('Stats disponibles:', Object.keys(publicProfile.stats || {}));
    console.log('Stats values:', publicProfile.stats);

    // Test de getPublicProfileWithRealStats
    console.log('\n📊 Test getPublicProfileWithRealStats():');
    const profileWithRealStats = await user.getPublicProfileWithRealStats();
    console.log('Structure:', Object.keys(profileWithRealStats));
    console.log('Stats disponibles:', Object.keys(profileWithRealStats.stats || {}));
    console.log('Stats values:', profileWithRealStats.stats);

    // Simuler l'endpoint /api/auth/me
    console.log('\n🔍 Simulation de l\'endpoint /api/auth/me:');
    const apiResponse = {
      message: 'Profil utilisateur récupéré avec succès',
      user: publicProfile
    };
    
    console.log('Réponse API simulée:');
    console.log('- message:', apiResponse.message);
    console.log('- user.name:', apiResponse.user.name);
    console.log('- user.level:', apiResponse.user.level);
    console.log('- user.points:', apiResponse.user.points);
    console.log('- user.stats:', apiResponse.user.stats);

    console.log('\n✅ L\'endpoint /api/auth/me devrait fonctionner avec ces données');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Test terminé');
  }
}

// Exécuter le test
if (require.main === module) {
  console.log('🧪 Test de l\'endpoint /api/auth/me');
  console.log('=' .repeat(40));
  
  testAuthMeEndpoint().catch(console.error);
}

module.exports = { testAuthMeEndpoint };

