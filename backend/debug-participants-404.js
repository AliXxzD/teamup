const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Configuration de la base de données
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

async function debugParticipants404() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connecté à MongoDB');

    // Récupérer tous les événements avec participants
    const events = await Event.find({ 
      'participants.0': { $exists: true } 
    }).populate('participants.user', 'name _id email');

    console.log(`📊 Trouvé ${events.length} événements avec participants`);

    for (const event of events) {
      console.log(`\n📅 Événement: ${event.title} (${event._id})`);
      console.log(`👥 Participants: ${event.participants.length}`);
      
      for (let i = 0; i < event.participants.length; i++) {
        const participant = event.participants[i];
        
        if (!participant.user) {
          console.log(`❌ Participant ${i + 1}: Référence utilisateur manquante (${participant.user})`);
          
          // Vérifier si l'utilisateur existe encore
          if (participant.user) {
            const userExists = await User.findById(participant.user);
            if (!userExists) {
              console.log(`   🔍 L'utilisateur ${participant.user} n'existe plus dans la base de données`);
            }
          }
        } else {
          console.log(`✅ Participant ${i + 1}: ${participant.user.name} (${participant.user._id})`);
        }
      }
    }

    // Vérifier spécifiquement les événements avec des participants problématiques
    console.log('\n🔍 Recherche d\'événements avec des participants problématiques...');
    
    const problematicEvents = await Event.find({
      'participants.user': { $exists: false }
    });

    if (problematicEvents.length > 0) {
      console.log(`⚠️ Trouvé ${problematicEvents.length} événements avec des participants problématiques:`);
      
      for (const event of problematicEvents) {
        console.log(`\n📅 ${event.title} (${event._id})`);
        console.log('Participants problématiques:');
        
        for (let i = 0; i < event.participants.length; i++) {
          const participant = event.participants[i];
          console.log(`   ${i + 1}. user: ${participant.user}, status: ${participant.status}`);
        }
      }
    } else {
      console.log('✅ Aucun événement avec des participants problématiques trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
debugParticipants404();
