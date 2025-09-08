/**
 * Diagnostic complet de tous les problèmes de coordonnées
 */

const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

async function diagnoseAllCoordinates() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    // 1. Récupérer TOUS les événements
    const allEvents = await Event.find({}).sort({ createdAt: -1 });
    console.log(`\n📊 ${allEvents.length} événements trouvés au total`);

    // 2. Analyser chaque type de coordonnées
    let validGeoJSON = 0;
    let invalidGeoJSON = 0;
    let noCoordinates = 0;
    let corruptedEvents = [];

    console.log('\n🔍 Analyse détaillée:');
    console.log('=' .repeat(80));

    allEvents.forEach((event, index) => {
      const coords = event.location?.coordinates;
      
      console.log(`\n${index + 1}. ${event.title}`);
      console.log(`   📍 Adresse: ${event.location?.address || 'Non définie'}`);
      console.log(`   🔧 Coordonnées brutes: ${JSON.stringify(coords)}`);
      
      if (!coords) {
        console.log('   ❌ Aucune coordonnée');
        noCoordinates++;
      } else if (coords.type === 'Point') {
        if (Array.isArray(coords.coordinates) && coords.coordinates.length === 2) {
          const [lng, lat] = coords.coordinates;
          if (typeof lng === 'number' && typeof lat === 'number') {
            console.log(`   ✅ GeoJSON valide: [${lng}, ${lat}]`);
            validGeoJSON++;
          } else {
            console.log(`   🚫 GeoJSON invalide: coordonnées non numériques`);
            invalidGeoJSON++;
            corruptedEvents.push(event);
          }
        } else {
          console.log(`   🚫 GeoJSON invalide: pas de tableau coordinates ou longueur incorrecte`);
          invalidGeoJSON++;
          corruptedEvents.push(event);
        }
      } else {
        console.log(`   ⚠️ Format inconnu`);
        invalidGeoJSON++;
        corruptedEvents.push(event);
      }
    });

    console.log('\n📈 Résumé:');
    console.log(`   ✅ GeoJSON valide: ${validGeoJSON}`);
    console.log(`   🚫 GeoJSON invalide: ${invalidGeoJSON}`);
    console.log(`   ❌ Sans coordonnées: ${noCoordinates}`);

    // 3. Corriger les événements corrompus
    if (corruptedEvents.length > 0) {
      console.log(`\n🛠️ Correction de ${corruptedEvents.length} événements corrompus...`);
      
      for (const event of corruptedEvents) {
        try {
          await Event.updateOne(
            { _id: event._id },
            { $unset: { 'location.coordinates': 1 } }
          );
          console.log(`   ✅ Coordonnées corrompues supprimées pour: ${event.title}`);
        } catch (error) {
          console.log(`   ❌ Erreur pour ${event.title}: ${error.message}`);
        }
      }
    }

    // 4. Recréer l'index géospatial
    console.log('\n🔧 Recréation de l\'index géospatial...');
    try {
      await Event.collection.dropIndex('location.coordinates_2dsphere');
      console.log('   ✅ Ancien index supprimé');
    } catch (error) {
      console.log('   ⚠️ Ancien index non trouvé (normal)');
    }

    try {
      await Event.collection.createIndex({ 'location.coordinates': '2dsphere' });
      console.log('   ✅ Nouvel index créé');
    } catch (error) {
      console.log(`   ❌ Erreur création index: ${error.message}`);
    }

    // 5. Test de l'API de proximité
    console.log('\n🧪 Test de l\'API de proximité...');
    try {
      const testEvents = await Event.findWithDistance(2.453889, 48.92306, 50000);
      console.log(`   ✅ ${testEvents.length} événements trouvés par recherche de proximité`);
      
      testEvents.forEach(event => {
        console.log(`      - ${event.title} (${event.distanceKm}km)`);
      });
    } catch (error) {
      console.log(`   ❌ Erreur test proximité: ${error.message}`);
    }

    // 6. Statistiques finales
    const finalStats = await Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withValidCoords: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$location.coordinates.type', 'Point'] },
                    { $isArray: '$location.coordinates.coordinates' },
                    { $eq: [{ $size: '$location.coordinates.coordinates' }, 2] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    if (finalStats.length > 0) {
      const stats = finalStats[0];
      console.log('\n📊 Statistiques finales:');
      console.log(`   📈 Total événements: ${stats.total}`);
      console.log(`   ✅ Avec coordonnées valides: ${stats.withValidCoords}`);
      console.log(`   📉 Sans coordonnées: ${stats.total - stats.withValidCoords}`);
      console.log(`   📊 Pourcentage avec coordonnées: ${Math.round((stats.withValidCoords / stats.total) * 100)}%`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Diagnostic terminé');
  }
}

// Exécuter le diagnostic
if (require.main === module) {
  console.log('🔍 Diagnostic complet des coordonnées');
  console.log('=' .repeat(50));
  
  diagnoseAllCoordinates().catch(console.error);
}

module.exports = { diagnoseAllCoordinates };

