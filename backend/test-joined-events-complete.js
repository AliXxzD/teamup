const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Event = require('./models/Event');
const User = require('./models/User');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamup';
const JWT_SECRET = process.env.JWT_SECRET || 'teamup_secret_key_change_in_production';

async function testJoinedEventsComplete() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB');

    // 1. Trouver un utilisateur
    const user = await User.findOne();
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    console.log(`👤 Utilisateur de test: ${user.name} (${user._id})`);

    // 2. Créer un token JWT
    const token = jwt.sign(
      { userId: user._id, rememberMe: false }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    // 3. Décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`🔑 Token décodé - userId: ${decoded.userId} (type: ${typeof decoded.userId})`);

    // 4. Simuler le middleware d'authentification
    const foundUser = await User.findById(decoded.userId);
    if (!foundUser) {
      console.log('❌ Utilisateur non trouvé avec l\'ID du token');
      return;
    }
    
    const reqUserId = foundUser._id;
    console.log(`🔍 req.userId du middleware: ${reqUserId} (type: ${typeof reqUserId})`);

    // 5. Tester la nouvelle logique de conversion ObjectId
    const userId = mongoose.Types.ObjectId.isValid(reqUserId) ? reqUserId : new mongoose.Types.ObjectId(reqUserId);
    console.log(`🔧 userId après conversion: ${userId} (type: ${typeof userId})`);

    // 6. Vérifier tous les événements dans la base de données
    console.log('\n📊 Vérification de tous les événements dans la DB...');
    const allEvents = await Event.find({}).select('title participants status date');
    console.log(`📅 Total d'événements dans la DB: ${allEvents.length}`);
    
    allEvents.forEach((event, index) => {
      console.log(`\n  ${index + 1}. ${event.title} (${event._id})`);
      console.log(`     Status: ${event.status}`);
      console.log(`     Date: ${event.date}`);
      console.log(`     Participants: ${event.participants.length}`);
      event.participants.forEach((participant, pIndex) => {
        console.log(`       ${pIndex + 1}. User ID: ${participant.user} (type: ${typeof participant.user})`);
        console.log(`            Égal à userId recherché: ${participant.user.toString() === userId.toString()}`);
        console.log(`            Égal à user._id: ${participant.user.toString() === user._id.toString()}`);
      });
    });

    // 7. Tester la requête avec la nouvelle logique
    console.log('\n📊 Test de la requête des événements rejoints...');
    const events = await Event.find({
      'participants.user': userId,
      status: { $in: ['active', 'full', 'completed'] }
    });
    
    console.log(`✅ Événements trouvés avec le filtre: ${events.length}`);
    
    if (events.length > 0) {
      events.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title} - Status: ${event.status}`);
      });
    } else {
      console.log('ℹ️ Aucun événement rejoint trouvé avec le filtre');
      
      // Vérifier tous les événements où l'utilisateur est participant (sans filtre de statut)
      console.log('\n🔍 Test sans filtre de statut...');
      const allUserEvents = await Event.find({
        'participants.user': userId
      });
      
      console.log(`📊 Événements où l'utilisateur est participant (tous statuts): ${allUserEvents.length}`);
      allUserEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title} - Status: ${event.status}`);
      });

      // Vérifier avec l'ID original de l'utilisateur
      console.log('\n🔍 Test avec l\'ID original de l\'utilisateur...');
      const eventsWithOriginalId = await Event.find({
        'participants.user': user._id
      });
      
      console.log(`📊 Événements avec user._id: ${eventsWithOriginalId.length}`);
      eventsWithOriginalId.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title} - Status: ${event.status}`);
      });
    }

    // 8. Tester la création d'un événement de test avec cet utilisateur comme participant
    console.log('\n🧪 Test de création d\'un événement de test...');
    try {
      const testEvent = new Event({
        title: 'Test Event pour ' + user.name,
        description: 'Événement de test pour vérifier les participants',
        sport: 'Football',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
        time: '18:00',
        location: {
          address: 'Test Location'
        },
        maxParticipants: 10,
        level: 'Tous niveaux',
        organizer: user._id,
        participants: [{ user: user._id }] // Ajouter l'utilisateur comme participant
      });

      await testEvent.save();
      console.log(`✅ Événement de test créé: ${testEvent._id}`);

      // Maintenant tester la requête avec ce nouvel événement
      const testEvents = await Event.find({
        'participants.user': userId,
        status: { $in: ['active', 'full', 'completed'] }
      });
      
      console.log(`📊 Événements trouvés après création du test: ${testEvents.length}`);
      
      // Nettoyer l'événement de test
      await Event.findByIdAndDelete(testEvent._id);
      console.log('🧹 Événement de test supprimé');

    } catch (testError) {
      console.error('❌ Erreur lors de la création de l\'événement de test:', testError.message);
    }

    console.log('\n✅ Test terminé !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.message.includes('Server at localhost:27017 reports maximum wire version 7')) {
      console.log('💡 Problème de version MongoDB. Le test ne peut pas s\'exécuter.');
      console.log('💡 Mais nous pouvons analyser le problème autrement.');
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

// Exécuter le test
testJoinedEventsComplete();
