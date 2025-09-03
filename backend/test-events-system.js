const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

require('dotenv').config();

async function testEventsSystem() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Test 1: Vérifier les modèles
    console.log('\n📊 Test 1: Vérification des modèles...');
    
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    
    console.log(`👥 Utilisateurs: ${userCount}`);
    console.log(`🎯 Événements: ${eventCount}`);

    // Test 2: Récupérer un utilisateur pour les tests
    const user = await User.findOne();
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé pour les tests');
      return;
    }

    console.log('\n👤 Utilisateur de test:', user.email);

    // Test 3: Créer un événement de test si nécessaire
    let testEvent = await Event.findOne({ organizer: user._id });
    
    if (!testEvent) {
      console.log('\n🆕 Création d\'un événement de test...');
      
      testEvent = new Event({
        title: 'Match de Football Test',
        description: 'Un match de football amical pour tester le système d\'événements. Venez nombreux !',
        sport: 'Football',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        time: '14:00',
        location: {
          address: 'Stade Municipal, 123 Rue du Sport, Paris'
        },
        maxParticipants: 20,
        level: 'Tous niveaux',
        price: {
          amount: 0,
          isFree: true
        },
        organizer: user._id,
        tags: ['amical', 'football', 'weekend'],
        requirements: {
          equipment: ['Chaussures de foot', 'Tenue de sport'],
          additionalInfo: 'N\'oubliez pas d\'apporter de l\'eau !'
        },
        visibility: 'public'
      });

      await testEvent.save();
      console.log('✅ Événement de test créé:', testEvent._id);
    } else {
      console.log('✅ Événement existant trouvé:', testEvent._id);
    }

    // Test 4: Vérifier les méthodes du modèle Event
    console.log('\n🔧 Test 4: Vérification des méthodes...');
    
    console.log('✅ Méthode addParticipant:', typeof testEvent.addParticipant === 'function');
    console.log('✅ Méthode removeParticipant:', typeof testEvent.removeParticipant === 'function');
    console.log('✅ Méthode canUserJoin:', typeof testEvent.canUserJoin === 'function');
    
    // Test des propriétés virtuelles
    console.log('✅ Propriété virtuelle isFull:', typeof testEvent.isFull === 'boolean');
    console.log('✅ Propriété virtuelle isPast:', typeof testEvent.isPast === 'boolean');
    console.log('✅ Propriété virtuelle availableSpots:', typeof testEvent.availableSpots === 'number');

    // Test 5: Test des méthodes statiques
    console.log('\n🔍 Test 5: Test des requêtes...');
    
    // Test de findByFilters
    const events = await Event.findByFilters({ sport: 'Football' }).limit(5);
    console.log(`✅ Événements Football trouvés: ${events.length}`);
    
    if (events.length > 0) {
      const event = events[0];
      console.log(`   - Titre: ${event.title}`);
      console.log(`   - Date: ${event.date.toLocaleDateString('fr-FR')}`);
      console.log(`   - Participants: ${event.currentParticipants}/${event.maxParticipants}`);
      console.log(`   - Organisateur: ${event.organizer?.name || 'Non chargé'}`);
    }

    // Test 6: Test de participation (simulé)
    console.log('\n👥 Test 6: Test de participation...');
    
    const canJoin = testEvent.canUserJoin(user._id);
    console.log(`   - Peut rejoindre: ${canJoin.canJoin}`);
    console.log(`   - Raison: ${canJoin.reason || 'OK'}`);

    // Test 7: Statistiques
    console.log('\n📊 Test 7: Statistiques...');
    
    const totalEvents = await Event.countDocuments({ status: 'active' });
    const futureEvents = await Event.countDocuments({ 
      status: 'active',
      date: { $gte: new Date() }
    });
    const pastEvents = await Event.countDocuments({
      date: { $lt: new Date() }
    });
    
    console.log(`   - Événements actifs: ${totalEvents}`);
    console.log(`   - Événements futurs: ${futureEvents}`);
    console.log(`   - Événements passés: ${pastEvents}`);

    // Test 8: Recherche avancée
    console.log('\n🔎 Test 8: Recherche avancée...');
    
    const freeEvents = await Event.find({ 'price.isFree': true }).limit(3);
    console.log(`   - Événements gratuits: ${freeEvents.length}`);
    
    const beginnerEvents = await Event.find({ level: 'Débutant' }).limit(3);
    console.log(`   - Événements débutant: ${beginnerEvents.length}`);

    console.log('\n✅ Tests du système d\'événements terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testEventsSystem();
