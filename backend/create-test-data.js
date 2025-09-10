const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamup';

async function createTestData() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB');

    // 1. Créer un utilisateur de test
    console.log('\n👤 Création d\'un utilisateur de test...');
    
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        isActive: true,
        isEmailVerified: true,
        profile: {
          bio: 'Utilisateur de test pour les événements rejoints',
          points: 100,
          level: 2,
          stats: {
            eventsOrganized: 0,
            eventsJoined: 0,
            averageRating: 0,
            totalRatings: 0,
            registrationDate: new Date()
          }
        }
      });

      await user.save();
      console.log('✅ Utilisateur de test créé:', user._id);
    } else {
      console.log('ℹ️ Utilisateur de test existe déjà:', user._id);
    }

    // 2. Créer un événement de test
    console.log('\n📅 Création d\'un événement de test...');
    
    // Vérifier si l'événement existe déjà
    let event = await Event.findOne({ title: 'Test Event - Football' });
    
    if (!event) {
      event = new Event({
        title: 'Test Event - Football',
        description: 'Événement de test pour vérifier les participants',
        sport: 'Football',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
        time: '18:00',
        location: {
          address: 'Stade de Test, Paris',
          coordinates: {
            type: 'Point',
            coordinates: [2.3522, 48.8566] // Paris
          }
        },
        maxParticipants: 10,
        currentParticipants: 1,
        level: 'Tous niveaux',
        organizer: user._id,
        participants: [{ 
          user: user._id,
          joinedAt: new Date(),
          status: 'confirmed'
        }], // Ajouter l'utilisateur comme participant
        status: 'active',
        price: {
          amount: 0,
          isFree: true
        }
      });

      await event.save();
      console.log('✅ Événement de test créé:', event._id);
    } else {
      console.log('ℹ️ Événement de test existe déjà:', event._id);
    }

    // 3. Vérifier que l'utilisateur est bien participant
    console.log('\n🔍 Vérification des participants...');
    const updatedEvent = await Event.findById(event._id).populate('participants.user', 'name email');
    console.log(`📊 Participants dans l'événement: ${updatedEvent.participants.length}`);
    
    updatedEvent.participants.forEach((participant, index) => {
      console.log(`  ${index + 1}. ${participant.user.name} (${participant.user.email}) - Status: ${participant.status}`);
    });

    // 4. Tester la requête des événements rejoints
    console.log('\n🧪 Test de la requête des événements rejoints...');
    const joinedEvents = await Event.find({
      'participants.user': user._id,
      status: { $in: ['active', 'full', 'completed'] }
    });
    
    console.log(`📊 Événements rejoints trouvés: ${joinedEvents.length}`);
    
    if (joinedEvents.length > 0) {
      joinedEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title} - Status: ${event.status}`);
      });
    } else {
      console.log('❌ Aucun événement rejoint trouvé - Il y a un problème !');
    }

    // 5. Informations de connexion
    console.log('\n🔑 Informations de connexion pour les tests:');
    console.log('Email: test@example.com');
    console.log('Mot de passe: password123');
    console.log('User ID:', user._id);

    console.log('\n✅ Données de test créées avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.message.includes('Server at localhost:27017 reports maximum wire version 7')) {
      console.log('💡 Problème de version MongoDB. Essayons avec MongoDB Atlas...');
      
      // Essayer avec MongoDB Atlas
      const atlasUri = process.env.MONGODB_URI;
      if (atlasUri && atlasUri.includes('mongodb+srv://')) {
        console.log('🔄 Tentative de connexion à MongoDB Atlas...');
        try {
          await mongoose.disconnect();
          await mongoose.connect(atlasUri, {
            serverSelectionTimeoutMS: 10000,
          });
          console.log('✅ Connecté à MongoDB Atlas');
          
          // Répéter la création des données
          // ... (même code que ci-dessus)
          
        } catch (atlasError) {
          console.error('❌ Erreur avec MongoDB Atlas:', atlasError.message);
        }
      }
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.log('\n🔌 Déconnecté de MongoDB');
    } catch (disconnectError) {
      console.log('⚠️ Erreur lors de la déconnexion:', disconnectError.message);
    }
  }
}

// Exécuter la création des données de test
createTestData();
