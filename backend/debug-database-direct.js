// Test direct de la base de données sans passer par l'API
const mongoose = require('mongoose');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;

async function debugDatabaseDirect() {
  try {
    console.log('🔗 Connexion directe à MongoDB Atlas...');
    console.log('📡 URI:', MONGODB_URI ? 'Configurée' : 'Non configurée');
    
    if (!MONGODB_URI) {
      console.log('❌ MONGODB_URI non configurée');
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB Atlas');

    // 1. Vérifier les utilisateurs
    console.log('\n👥 Vérification des utilisateurs...');
    const User = require('./models/User');
    const users = await User.find({}).select('name email _id').limit(5);
    console.log(`📊 Nombre d'utilisateurs: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      return;
    }

    const testUser = users[0];
    console.log(`\n🧪 Utilisation de l'utilisateur de test: ${testUser.name} (${testUser._id})`);

    // 2. Vérifier les événements
    console.log('\n📅 Vérification des événements...');
    const Event = require('./models/Event');
    const allEvents = await Event.find({}).select('title status participants organizer').limit(10);
    console.log(`📊 Nombre total d'événements: ${allEvents.length}`);
    
    allEvents.forEach((event, index) => {
      console.log(`\n  ${index + 1}. ${event.title} (${event._id})`);
      console.log(`     Status: ${event.status}`);
      console.log(`     Organisateur: ${event.organizer}`);
      console.log(`     Participants: ${event.participants.length}`);
      
      if (event.participants.length > 0) {
        event.participants.forEach((participant, pIndex) => {
          console.log(`       ${pIndex + 1}. User: ${participant.user} (Status: ${participant.status})`);
        });
      }
    });

    // 3. Vérifier les événements où l'utilisateur de test est participant
    console.log('\n🔍 Vérification des événements où l\'utilisateur est participant...');
    const userEvents = await Event.find({
      'participants.user': testUser._id
    }).select('title status participants');
    
    console.log(`📊 Événements où ${testUser.name} est participant: ${userEvents.length}`);
    
    if (userEvents.length > 0) {
      userEvents.forEach((event, index) => {
        console.log(`\n  ${index + 1}. ${event.title} (${event._id})`);
        console.log(`     Status: ${event.status}`);
        console.log(`     Participants: ${event.participants.length}`);
        
        event.participants.forEach((participant, pIndex) => {
          const isTestUser = participant.user.toString() === testUser._id.toString();
          console.log(`       ${pIndex + 1}. User: ${participant.user} (Status: ${participant.status}) ${isTestUser ? '← C\'est notre utilisateur de test' : ''}`);
        });
      });
    } else {
      console.log('ℹ️ Aucun événement trouvé où l\'utilisateur est participant');
    }

    // 4. Vérifier les événements avec le filtre de statut
    console.log('\n🔍 Vérification avec le filtre de statut (active, full, completed)...');
    const filteredEvents = await Event.find({
      'participants.user': testUser._id,
      status: { $in: ['active', 'full', 'completed'] }
    }).select('title status participants');
    
    console.log(`📊 Événements avec filtre de statut: ${filteredEvents.length}`);
    
    if (filteredEvents.length > 0) {
      filteredEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title} - Status: ${event.status}`);
      });
    } else {
      console.log('ℹ️ Aucun événement trouvé avec le filtre de statut');
      
      // Vérifier quels statuts existent
      console.log('\n🔍 Vérification des statuts d\'événements existants...');
      const statusCounts = await Event.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log('📊 Répartition des statuts:');
      statusCounts.forEach(status => {
        console.log(`  ${status._id}: ${status.count} événements`);
      });
    }

    // 5. Créer un événement de test si nécessaire
    if (userEvents.length === 0) {
      console.log('\n🧪 Création d\'un événement de test...');
      
      const testEvent = new Event({
        title: 'Test Event - ' + testUser.name,
        description: 'Événement de test pour vérifier les participants',
        sport: 'Football',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
        time: '18:00',
        location: {
          address: 'Test Location'
        },
        maxParticipants: 10,
        currentParticipants: 1,
        level: 'Tous niveaux',
        organizer: testUser._id,
        participants: [{ 
          user: testUser._id,
          joinedAt: new Date(),
          status: 'confirmed'
        }],
        status: 'active',
        price: {
          amount: 0,
          isFree: true
        }
      });

      await testEvent.save();
      console.log('✅ Événement de test créé:', testEvent._id);
      
      // Vérifier que l'événement est bien créé
      const createdEvent = await Event.findById(testEvent._id);
      console.log('🔍 Événement créé vérifié:');
      console.log(`  Titre: ${createdEvent.title}`);
      console.log(`  Status: ${createdEvent.status}`);
      console.log(`  Participants: ${createdEvent.participants.length}`);
      console.log(`  Participant user: ${createdEvent.participants[0].user}`);
      console.log(`  Égal à testUser._id: ${createdEvent.participants[0].user.toString() === testUser._id.toString()}`);
    }

    console.log('\n✅ Debug terminé !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('\n🔌 Déconnecté de MongoDB');
    } catch (disconnectError) {
      console.log('⚠️ Erreur lors de la déconnexion:', disconnectError.message);
    }
  }
}

// Exécuter le debug
debugDatabaseDirect();
