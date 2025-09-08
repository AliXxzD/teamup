/**
 * Script pour corriger les coordonnées GeoJSON corrompues
 */

const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

async function fixCorruptedCoordinates() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    // Trouver les événements avec des coordonnées corrompues
    console.log('\n🔍 Recherche d\'événements avec coordonnées corrompues...');
    
    // Recherche d'événements avec type "Point" mais sans coordonnées
    const corruptedEvents = await Event.find({
      'location.coordinates.type': 'Point',
      $or: [
        { 'location.coordinates.coordinates': { $exists: false } },
        { 'location.coordinates.coordinates': null },
        { 'location.coordinates.coordinates': [] }
      ]
    });

    console.log(`📊 ${corruptedEvents.length} événements avec coordonnées corrompues trouvés`);

    if (corruptedEvents.length === 0) {
      console.log('✅ Aucun événement corrompu trouvé !');
      return;
    }

    // Afficher les événements corrompus
    corruptedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   📍 Adresse: ${event.location.address}`);
      console.log(`   🚫 Coordonnées: ${JSON.stringify(event.location.coordinates)}`);
      console.log('');
    });

    // Supprimer le champ coordinates corrompu de tous les événements affectés
    console.log('\n🧹 Suppression des coordonnées corrompues...');
    const cleanResult = await Event.updateMany(
      {
        'location.coordinates.type': 'Point',
        $or: [
          { 'location.coordinates.coordinates': { $exists: false } },
          { 'location.coordinates.coordinates': null },
          { 'location.coordinates.coordinates': [] }
        ]
      },
      {
        $unset: {
          'location.coordinates': 1
        }
      }
    );

    console.log(`✅ ${cleanResult.modifiedCount} événements nettoyés`);

    // Recréer l'index géospatial
    console.log('\n🔧 Recréation de l\'index géospatial...');
    try {
      await Event.collection.dropIndex('location.coordinates_2dsphere');
      console.log('✅ Ancien index supprimé');
    } catch (error) {
      console.log('⚠️ Ancien index non trouvé');
    }

    await Event.collection.createIndex({ 'location.coordinates': '2dsphere' });
    console.log('✅ Nouvel index créé');

    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const remainingCorrupted = await Event.find({
      'location.coordinates.type': 'Point',
      $or: [
        { 'location.coordinates.coordinates': { $exists: false } },
        { 'location.coordinates.coordinates': null },
        { 'location.coordinates.coordinates': [] }
      ]
    });

    if (remainingCorrupted.length === 0) {
      console.log('✅ Toutes les coordonnées corrompues ont été supprimées !');
    } else {
      console.log(`⚠️ ${remainingCorrupted.length} événements corrompus restants`);
    }

    // Statistiques finales
    const totalEvents = await Event.countDocuments();
    const eventsWithValidCoords = await Event.countDocuments({
      'location.coordinates.type': 'Point',
      'location.coordinates.coordinates': { $exists: true, $ne: null, $ne: [] }
    });

    console.log('\n📊 Statistiques finales:');
    console.log(`   📈 Total événements: ${totalEvents}`);
    console.log(`   ✅ Avec coordonnées valides: ${eventsWithValidCoords}`);
    console.log(`   📉 Sans coordonnées: ${totalEvents - eventsWithValidCoords}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Correction terminée');
  }
}

// Exécuter la correction
if (require.main === module) {
  console.log('🚀 Correction des coordonnées corrompues');
  console.log('=' .repeat(50));
  
  fixCorruptedCoordinates().catch(console.error);
}

module.exports = { fixCorruptedCoordinates };

