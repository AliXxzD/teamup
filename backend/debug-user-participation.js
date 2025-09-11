const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Configuration de la base de données
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

async function debugUserParticipation() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connecté à MongoDB');

    // ID de l'utilisateur de test
    const userId = '68c20d808961dc9135e60f98';
    const eventId = '68c1d14c774207ec38d6f31a';

    console.log('🔍 Debug de la participation utilisateur');
    console.log('👤 User ID:', userId);
    console.log('📅 Event ID:', eventId);

    // Vérifier l'utilisateur
    const user = await User.findById(userId);
    if (user) {
      console.log('✅ Utilisateur trouvé:', user.name, user.email);
    } else {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    // Vérifier l'événement
    const event = await Event.findById(eventId).populate('participants.user', 'name _id');
    if (event) {
      console.log('✅ Événement trouvé:', event.title);
      console.log('📊 Participants:', event.participants.length);
      
      event.participants.forEach((participant, index) => {
        console.log(`  ${index + 1}. User ID: ${participant.user._id}`);
        console.log(`     Name: ${participant.user.name}`);
        console.log(`     Status: ${participant.status}`);
        console.log(`     Égal à userId recherché: ${participant.user._id.toString() === userId}`);
      });

      // Vérifier si l'utilisateur est participant
      const isParticipant = event.participants.some(p => p.user._id.toString() === userId);
      console.log('🎯 L\'utilisateur est-il participant?', isParticipant);

    } else {
      console.log('❌ Événement non trouvé');
    }

    // Test de la requête MongoDB
    console.log('\n🧪 Test de la requête MongoDB:');
    const eventsWithUser = await Event.find({
      'participants.user': new mongoose.Types.ObjectId(userId)
    }).select('title participants status');

    console.log('📊 Événements trouvés avec cette requête:', eventsWithUser.length);
    eventsWithUser.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title} - Status: ${event.status}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

debugUserParticipation();
