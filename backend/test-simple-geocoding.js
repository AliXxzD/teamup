/**
 * Test simple du géocodage lors de la création d'événements
 */

const mongoose = require('mongoose');
const axios = require('axios');
const Event = require('./models/Event');
const User = require('./models/User');
const geocodingService = require('./services/geocodingService');
require('dotenv').config();

async function testSimpleGeocoding() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    // Trouver un utilisateur existant pour créer des événements
    const existingUser = await User.findOne();
    if (!existingUser) {
      console.log('❌ Aucun utilisateur trouvé en base');
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${existingUser.name} (${existingUser.email})`);

    // Événements de test avec différentes adresses
    const testEvents = [
      {
        title: 'Football au Parc des Princes',
        description: 'Match de football dans le stade mythique',
        sport: 'Football',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        time: '15:00',
        location: {
          address: 'Parc des Princes, Paris'
        },
        maxParticipants: 22,
        level: 'Intermédiaire',
        price: { amount: 0, isFree: true },
        organizer: existingUser._id
      },
      {
        title: 'Tennis à Roland Garros',
        description: 'Tournoi de tennis sur terre battue',
        sport: 'Tennis',
        date: new Date(Date.now() + 48 * 60 * 60 * 1000),
        time: '14:00',
        location: {
          address: 'Roland Garros, Bois de Boulogne, Paris'
        },
        maxParticipants: 8,
        level: 'Avancé',
        price: { amount: 25, isFree: false },
        organizer: existingUser._id
      },
      {
        title: 'Course Tour Eiffel',
        description: 'Course matinale autour de la Tour Eiffel',
        sport: 'Running',
        date: new Date(Date.now() + 72 * 60 * 60 * 1000),
        time: '08:00',
        location: {
          address: 'Tour Eiffel, Paris'
        },
        maxParticipants: 50,
        level: 'Tous niveaux',
        price: { amount: 0, isFree: true },
        organizer: existingUser._id
      }
    ];

    console.log('\n🗺️ Création d\'événements avec géocodage automatique...');

    for (let i = 0; i < testEvents.length; i++) {
      const eventData = testEvents[i];
      console.log(`\n${i + 1}. ${eventData.title}`);
      console.log(`   📍 Adresse: ${eventData.location.address}`);

      try {
        // Géocodage de l'adresse
        const geocodeResult = await geocodingService.geocode(eventData.location.address);
        
        if (geocodeResult) {
          eventData.location.coordinates = {
            type: 'Point',
            coordinates: [geocodeResult.longitude, geocodeResult.latitude]
          };
          console.log(`   ✅ Géocodage réussi: [${geocodeResult.longitude}, ${geocodeResult.latitude}]`);
        } else {
          console.log(`   ⚠️ Géocodage échoué, événement créé sans coordonnées`);
        }

        // Créer l'événement
        const event = new Event(eventData);
        const savedEvent = await event.save();
        
        console.log(`   ✅ Événement créé: ${savedEvent._id}`);
        
        if (savedEvent.location.coordinates) {
          console.log(`   🗺️ Coordonnées sauvées: ${JSON.stringify(savedEvent.location.coordinates)}`);
        }

        // Pause pour respecter les limites de l'API de géocodage
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }

    // Test de recherche par proximité avec les nouveaux événements
    console.log('\n🔍 Test de recherche par proximité...');
    
    // Test autour de Paris
    try {
      const parisCoords = { longitude: 2.3522, latitude: 48.8566 };
      const nearbyEvents = await Event.findWithDistance(
        parisCoords.longitude,
        parisCoords.latitude,
        25000 // 25km
      );

      console.log(`\n✅ ${nearbyEvents.length} événements trouvés près de Paris:`);
      nearbyEvents.forEach(event => {
        console.log(`   - ${event.title} (${event.distanceKm}km)`);
        console.log(`     📍 ${event.location.address}`);
      });

      if (nearbyEvents.length > 0) {
        console.log('\n🎉 LA RECHERCHE PAR PROXIMITÉ FONCTIONNE PARFAITEMENT !');
      }

    } catch (error) {
      console.log(`❌ Erreur recherche proximité: ${error.message}`);
    }

    // Statistiques finales
    console.log('\n📊 Statistiques finales...');
    const totalEvents = await Event.countDocuments();
    const eventsWithCoords = await Event.countDocuments({
      'location.coordinates.type': 'Point',
      'location.coordinates.coordinates': { $exists: true, $ne: null }
    });

    console.log(`   📈 Total événements: ${totalEvents}`);
    console.log(`   ✅ Avec coordonnées: ${eventsWithCoords}`);
    console.log(`   📊 Pourcentage: ${Math.round((eventsWithCoords / totalEvents) * 100)}%`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Test terminé');
  }
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Serveur accessible');
    return true;
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    return false;
  }
}

// Exécution
async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await testSimpleGeocoding();
  }
}

if (require.main === module) {
  main().catch(console.error);
}
