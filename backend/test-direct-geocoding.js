/**
 * Test direct du géocodage sans API HTTP
 */

const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');
const geocodingService = require('./services/geocodingService');
require('dotenv').config();

async function testDirectGeocoding() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    // Trouver un utilisateur existant
    const existingUser = await User.findOne();
    if (!existingUser) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    console.log(`✅ Utilisateur: ${existingUser.name}`);

    // Adresses de test avec coordonnées connues
    const testAddresses = [
      {
        name: 'Stade de France',
        address: 'Stade de France, Saint-Denis',
        expectedCoords: { lat: 48.9244726, lng: 2.3601325 }
      },
      {
        name: 'Tour Eiffel',
        address: 'Tour Eiffel, Paris',
        expectedCoords: { lat: 48.8582599, lng: 2.2945006 }
      },
      {
        name: 'Parc des Princes',
        address: 'Parc des Princes, Paris',
        expectedCoords: { lat: 48.8413634, lng: 2.2530693 }
      }
    ];

    console.log('\n🗺️ Test de géocodage et création d\'événements...');

    for (let i = 0; i < testAddresses.length; i++) {
      const testAddr = testAddresses[i];
      console.log(`\n${i + 1}. ${testAddr.name}`);
      console.log(`   📍 Adresse: ${testAddr.address}`);

      try {
        // 1. Test du géocodage
        const geocodeResult = await geocodingService.geocode(testAddr.address);
        
        if (geocodeResult) {
          console.log(`   ✅ Géocodage réussi: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
          
          // 2. Créer l'événement avec coordonnées
          const eventData = {
            title: `Événement Test ${testAddr.name}`,
            description: `Événement de test au ${testAddr.name}`,
            sport: 'Football',
            date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
            time: '15:00',
            location: {
              address: testAddr.address,
              coordinates: {
                type: 'Point',
                coordinates: [geocodeResult.longitude, geocodeResult.latitude] // [lng, lat]
              }
            },
            maxParticipants: 20,
            level: 'Intermédiaire',
            price: { amount: 0, isFree: true },
            organizer: existingUser._id
          };

          const event = new Event(eventData);
          const savedEvent = await event.save();
          
          console.log(`   ✅ Événement créé: ${savedEvent.title}`);
          console.log(`   🗺️ Coordonnées sauvées: [${savedEvent.location.coordinates.coordinates[0]}, ${savedEvent.location.coordinates.coordinates[1]}]`);
          
        } else {
          console.log(`   ❌ Géocodage échoué`);
        }

        // Pause
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }

    // 3. Test de recherche par proximité
    console.log('\n🔍 Test de recherche par proximité...');
    
    const parisCoords = { longitude: 2.3522, latitude: 48.8566 };
    
    try {
      const nearbyEvents = await Event.findWithDistance(
        parisCoords.longitude,
        parisCoords.latitude,
        50000 // 50km autour de Paris
      );

      console.log(`\n🎉 ${nearbyEvents.length} événements trouvés près de Paris:`);
      nearbyEvents.forEach(event => {
        console.log(`   - ${event.title}`);
        console.log(`     📍 ${event.location.address}`);
        console.log(`     📏 Distance: ${event.distanceKm}km`);
        console.log('');
      });

      if (nearbyEvents.length > 0) {
        console.log('✅ LA RECHERCHE PAR PROXIMITÉ FONCTIONNE PARFAITEMENT !');
        
        // Test de l'API HTTP
        console.log('\n📡 Test de l\'endpoint API...');
        const testUrl = `http://localhost:5000/api/events/nearby?latitude=${parisCoords.latitude}&longitude=${parisCoords.longitude}&radius=50000`;
        console.log(`URL: ${testUrl}`);
        
        // Faire un test simple avec fetch
        const fetch = require('node-fetch');
        try {
          const response = await fetch(testUrl);
          const data = await response.json();
          
          if (data.success) {
            console.log(`   ✅ API HTTP fonctionne: ${data.data.length} événements`);
          } else {
            console.log(`   ❌ Erreur API: ${data.message}`);
          }
        } catch (fetchError) {
          console.log(`   ❌ Erreur fetch: ${fetchError.message}`);
        }
      }

    } catch (error) {
      console.log(`❌ Erreur recherche proximité: ${error.message}`);
      console.log('Stack:', error.stack);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Test terminé');
  }
}

// Exécuter le test
if (require.main === module) {
  console.log('🧪 Test direct du géocodage et proximité');
  console.log('=' .repeat(50));
  
  testDirectGeocoding().catch(console.error);
}

