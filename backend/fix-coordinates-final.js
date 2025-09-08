/**
 * Script final pour corriger toutes les coordonnées
 */

const mongoose = require('mongoose');
const Event = require('./models/Event');
const geocodingService = require('./services/geocodingService');
require('dotenv').config();

async function fixAllCoordinates() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    // 1. Supprimer tous les champs coordinates corrompus
    console.log('\n🧹 Nettoyage des coordonnées corrompues...');
    const cleanResult = await Event.updateMany(
      {},
      {
        $unset: {
          'location.coordinates': 1
        }
      }
    );
    console.log(`✅ ${cleanResult.modifiedCount} événements nettoyés`);

    // 2. Recréer l'index
    console.log('\n🔧 Recréation de l\'index géospatial...');
    try {
      await Event.collection.dropIndex('location.coordinates_2dsphere');
    } catch (error) {
      console.log('⚠️ Ancien index non trouvé');
    }
    await Event.collection.createIndex({ 'location.coordinates': '2dsphere' });
    console.log('✅ Index géospatial créé');

    // 3. Régeocoder tous les événements avec des adresses valides
    const allEvents = await Event.find({});
    console.log(`\n🗺️ Géocodage de ${allEvents.length} événements...`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < allEvents.length; i++) {
      const event = allEvents[i];
      const address = event.location?.address;

      console.log(`\n${i + 1}/${allEvents.length} - ${event.title}`);
      console.log(`📍 Adresse: ${address}`);

      if (!address || address.length < 5) {
        console.log('⏭️ Adresse trop courte, ignoré');
        skippedCount++;
        continue;
      }

      const quality = geocodingService.estimateAddressQuality(address);
      if (quality < 2) {
        console.log(`⏭️ Qualité insuffisante (${quality}/5), ignoré`);
        skippedCount++;
        continue;
      }

      try {
        const geocodeResult = await geocodingService.geocode(address);
        
        if (geocodeResult && geocodeResult.latitude && geocodeResult.longitude) {
          // Format GeoJSON correct
          const geoJSONCoords = {
            type: 'Point',
            coordinates: [geocodeResult.longitude, geocodeResult.latitude] // [lng, lat]
          };

          await Event.updateOne(
            { _id: event._id },
            {
              $set: {
                'location.coordinates': geoJSONCoords
              }
            }
          );

          console.log(`✅ Coordonnées ajoutées: [${geocodeResult.longitude}, ${geocodeResult.latitude}]`);
          successCount++;
        } else {
          console.log('❌ Géocodage échoué');
          failCount++;
        }

        // Pause pour respecter les limites de l'API
        if (i < allEvents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.log(`❌ Erreur: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n📊 Résultats finaux:');
    console.log('=' .repeat(50));
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Échecs: ${failCount}`);
    console.log(`⏭️ Ignorés: ${skippedCount}`);

    // 4. Test final de la recherche par proximité
    console.log('\n🔍 Test final de recherche par proximité...');
    
    // Coordonnées de Drancy (où devraient être nos événements)
    const drancyCoords = { longitude: 2.453889, latitude: 48.92306 };
    
    try {
      const nearbyEvents = await Event.findWithDistance(
        drancyCoords.longitude,
        drancyCoords.latitude,
        50000 // 50km
      );

      console.log(`🎉 ${nearbyEvents.length} événements trouvés avec recherche par proximité !`);
      nearbyEvents.forEach(event => {
        console.log(`   - ${event.title} (${event.distanceKm}km)`);
      });

      if (nearbyEvents.length > 0) {
        console.log('\n✅ LA RECHERCHE PAR PROXIMITÉ FONCTIONNE MAINTENANT ! 🎉');
      }

    } catch (error) {
      console.log(`❌ Erreur test proximité: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Correction terminée');
  }
}

// Exécuter la correction
if (require.main === module) {
  console.log('🚀 Correction finale des coordonnées');
  console.log('=' .repeat(50));
  
  fixAllCoordinates().catch(console.error);
}

module.exports = { fixAllCoordinates };


