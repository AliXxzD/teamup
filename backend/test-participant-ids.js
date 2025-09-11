const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Configuration de la base de données
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

async function testParticipantIds() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connecté à MongoDB');

    // Récupérer un événement avec participants
    const event = await Event.findById('68c1d14c774207ec38d6f31a')
      .populate('participants.user', 'name _id email');

    if (!event) {
      console.log('❌ Événement non trouvé');
      return;
    }

    console.log(`📅 Événement: ${event.title}`);
    console.log(`👥 Participants: ${event.participants.length}`);

    // Tester chaque participant
    for (let i = 0; i < event.participants.length; i++) {
      const participant = event.participants[i];
      const userId = participant.user?._id;
      
      console.log(`\n🔍 Test du participant ${i + 1}:`);
      console.log(`   Nom: ${participant.user?.name}`);
      console.log(`   ID: ${userId}`);
      console.log(`   Type d'ID: ${typeof userId}`);
      
      if (userId) {
        // Vérifier si l'utilisateur existe directement
        const userExists = await User.findById(userId);
        console.log(`   Utilisateur existe: ${!!userExists}`);
        
        if (userExists) {
          console.log(`   ✅ Utilisateur trouvé: ${userExists.name}`);
        } else {
          console.log(`   ❌ Utilisateur non trouvé avec l'ID: ${userId}`);
        }
        
        // Tester différentes variantes de l'ID
        const idVariants = [
          userId.toString(),
          userId,
          String(userId),
          userId._id || userId
        ];
        
        console.log(`   Variantes d'ID à tester:`, idVariants);
        
        for (const variant of idVariants) {
          const testUser = await User.findById(variant);
          console.log(`     - ${variant} (${typeof variant}): ${!!testUser}`);
        }
      } else {
        console.log(`   ❌ Pas d'ID utilisateur`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
testParticipantIds();
