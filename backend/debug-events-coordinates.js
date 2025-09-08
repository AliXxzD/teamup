/**
 * Script de diagnostic pour vérifier les coordonnées des événements
 */

const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

async function debugEventsCoordinates() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    // Récupérer tous les événements
    const events = await Event.find().sort({ createdAt: -1 }).limit(10);
    console.log(`\n📊 ${events.length} événements trouvés`);

    if (events.length === 0) {
      console.log('⚠️ Aucun événement en base de données');
      return;
    }

    console.log('\n🔍 Analyse des coordonnées:');
    console.log('=' .repeat(80));

    let eventsWithCoords = 0;
    let eventsWithoutCoords = 0;

    events.forEach((event, index) => {
      const hasCoords = event.location && event.location.coordinates && 
                       event.location.coordinates.latitude && 
                       event.location.coordinates.longitude;
      
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   📅 Date: ${event.date.toLocaleDateString()}`);
      console.log(`   📍 Adresse: ${event.location?.address || 'Non définie'}`);
      
      if (hasCoords) {
        console.log(`   🗺️ Coordonnées: ✅ (${event.location.coordinates.latitude}, ${event.location.coordinates.longitude})`);
        eventsWithCoords++;
      } else {
        console.log(`   🗺️ Coordonnées: ❌ Manquantes`);
        eventsWithoutCoords++;
      }
      console.log('');
    });

    console.log('📈 Résumé:');
    console.log(`   ✅ Événements avec coordonnées: ${eventsWithCoords}`);
    console.log(`   ❌ Événements sans coordonnées: ${eventsWithoutCoords}`);
    console.log(`   📊 Pourcentage avec coordonnées: ${Math.round((eventsWithCoords / events.length) * 100)}%`);

    // Test de recherche par proximité
    if (eventsWithCoords > 0) {
      console.log('\n🔍 Test de recherche par proximité (Paris):');
      const parisCoords = { latitude: 48.8566, longitude: 2.3522 };
      
      try {
        const nearbyEvents = await Event.findWithDistance(
          parisCoords.longitude, 
          parisCoords.latitude, 
          100000 // 100km
        );
        
        console.log(`   ✅ ${nearbyEvents.length} événements trouvés près de Paris`);
        nearbyEvents.forEach(event => {
          console.log(`      - ${event.title} (${event.distanceKm}km)`);
        });
      } catch (error) {
        console.log('   ❌ Erreur recherche proximité:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Diagnostic terminé');
  }
}

// Exécuter le diagnostic
debugEventsCoordinates().catch(console.error);


