const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');
require('dotenv').config();

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamup';

async function debugEventsParticipants() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion réussie');

    console.log('\n📊 Analyse des événements et participants...');

    // Récupérer tous les événements
    const events = await Event.find({}).populate('organizer', 'name email');
    console.log(`📅 ${events.length} événements trouvés`);

    // Analyser chaque événement
    for (const event of events) {
      console.log(`\n🎯 Événement: "${event.title}"`);
      console.log(`   - ID: ${event._id}`);
      console.log(`   - Organisateur: ${event.organizer?.name} (${event.organizer?.email})`);
      console.log(`   - Statut: ${event.status}`);
      console.log(`   - Participants: ${event.participants?.length || 0}`);
      
      if (event.participants && event.participants.length > 0) {
        console.log('   - Détails des participants:');
        for (const participant of event.participants) {
          console.log(`     * User ID: ${participant.user}`);
          console.log(`     * Status: ${participant.status}`);
          console.log(`     * Joined at: ${participant.joinedAt}`);
        }
      }
    }

    // Tester le comptage des participants pour un utilisateur spécifique
    console.log('\n🔍 Test du comptage des participants...');
    const users = await User.find({}).limit(3);
    
    for (const user of users) {
      console.log(`\n👤 Utilisateur: ${user.name} (${user.email})`);
      
      // Compter les événements organisés
      const eventsOrganized = await Event.countDocuments({ 
        organizer: user._id,
        status: { $ne: 'cancelled' }
      });
      
      // Compter les événements rejoints
      const eventsJoined = await Event.countDocuments({
        'participants.user': user._id,
        status: { $ne: 'cancelled' }
      });
      
      console.log(`   - Événements organisés: ${eventsOrganized}`);
      console.log(`   - Événements rejoints: ${eventsJoined}`);
      
      // Vérifier les événements spécifiques
      const joinedEvents = await Event.find({
        'participants.user': user._id
      }).select('title status');
      
      if (joinedEvents.length > 0) {
        console.log('   - Événements rejoints:');
        joinedEvents.forEach(event => {
          console.log(`     * "${event.title}" (${event.status})`);
        });
      }
    }

    // Vérifier la structure des participants
    console.log('\n🔍 Vérification de la structure des participants...');
    const eventsWithParticipants = await Event.find({
      'participants.0': { $exists: true }
    }).limit(3);
    
    for (const event of eventsWithParticipants) {
      console.log(`\n📋 Événement: "${event.title}"`);
      console.log('   Structure des participants:');
      console.log(JSON.stringify(event.participants, null, 2));
    }

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de la base de données');
  }
}

// Exécuter le script
debugEventsParticipants().catch(console.error); 