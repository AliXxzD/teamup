const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Configuration de la base de données
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

async function forceJoinEvent() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connecté à MongoDB');

    // ID de l'utilisateur de test
    const userId = '68c20d808961dc9135e60f98';
    const eventId = '68c1d14c774207ec38d6f31a';

    console.log('🔍 Ajout forcé de l\'utilisateur à l\'événement');
    console.log('👤 User ID:', userId);
    console.log('📅 Event ID:', eventId);

    // Vérifier l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    console.log('✅ Utilisateur trouvé:', user.name);

    // Vérifier l'événement
    const event = await Event.findById(eventId);
    if (!event) {
      console.log('❌ Événement non trouvé');
      return;
    }
    console.log('✅ Événement trouvé:', event.title);

    // Vérifier si l'utilisateur est déjà participant
    const isAlreadyParticipant = event.participants.some(
      participant => participant.user.toString() === userId
    );

    if (isAlreadyParticipant) {
      console.log('ℹ️ L\'utilisateur est déjà participant');
    } else {
      console.log('➕ Ajout de l\'utilisateur comme participant...');
      
      // Ajouter l'utilisateur comme participant
      event.participants.push({ 
        user: userId,
        status: 'confirmed',
        joinedAt: new Date()
      });
      event.currentParticipants = event.participants.length;
      event.stats.joins += 1;
      
      await event.save();
      console.log('✅ Utilisateur ajouté avec succès');
    }

    // Vérifier le résultat
    const updatedEvent = await Event.findById(eventId).populate('participants.user', 'name _id');
    console.log('📊 Participants après ajout:', updatedEvent.participants.length);
    updatedEvent.participants.forEach((participant, index) => {
      console.log(`  ${index + 1}. ${participant.user.name} (${participant.user._id})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

forceJoinEvent();
