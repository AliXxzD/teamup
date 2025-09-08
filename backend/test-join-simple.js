/**
 * Test simple de l'endpoint join event
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

async function testJoinEvent() {
  try {
    console.log('🧪 Test simple de l\'endpoint join event');
    console.log('=' .repeat(50));

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // 1. Trouver un utilisateur
    const user = await User.findOne();
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    console.log('✅ Utilisateur trouvé:', user.name, user.email);

    // 2. Trouver un événement
    const event = await Event.findOne().populate('organizer');
    if (!event) {
      console.log('❌ Aucun événement trouvé');
      return;
    }
    console.log('✅ Événement trouvé:', event.title);
    console.log('   - ID:', event._id);
    console.log('   - Organisateur:', event.organizer.name);
    console.log('   - Participants:', event.participants?.length || 0);
    console.log('   - Max participants:', event.maxParticipants);

    // 3. Tester la méthode canUserJoin
    console.log('\n🔍 Test de canUserJoin...');
    const canJoin = event.canUserJoin(user._id);
    console.log('   - canJoin:', canJoin);

    // 4. Tester la méthode addParticipant
    if (canJoin.canJoin) {
      console.log('\n🎯 Test de addParticipant...');
      try {
        await event.addParticipant(user._id);
        console.log('✅ addParticipant réussi');
        console.log('   - Nouveaux participants:', event.participants?.length || 0);
      } catch (error) {
        console.log('❌ addParticipant échoué:', error.message);
      }
    } else {
      console.log('⚠️ Ne peut pas rejoindre:', canJoin.reason);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Test terminé');
  }
}

// Exécuter le test
if (require.main === module) {
  testJoinEvent().catch(console.error);
}

module.exports = { testJoinEvent };
