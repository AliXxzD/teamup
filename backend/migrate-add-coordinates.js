/**
 * Script de migration pour ajouter des coordonnées aux événements existants
 */

const mongoose = require('mongoose');
const Event = require('./models/Event');
const geocodingService = require('./services/geocodingService');
require('dotenv').config();

async function migrateEventCoordinates() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    // Trouver tous les événements sans coordonnées
    const eventsWithoutCoords = await Event.find({
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': null },
        { 'location.coordinates.latitude': { $exists: false } },
        { 'location.coordinates.longitude': { $exists: false } }
      ]
    });

    console.log(`\n🔍 ${eventsWithoutCoords.length} événements sans coordonnées trouvés`);

    if (eventsWithoutCoords.length === 0) {
      console.log('✅ Tous les événements ont déjà des coordonnées !');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    console.log('\n🗺️ Début de la migration...');
    console.log('=' .repeat(60));

    for (let i = 0; i < eventsWithoutCoords.length; i++) {
      const event = eventsWithoutCoords[i];
      const address = event.location?.address;
      
      console.log(`\n${i + 1}/${eventsWithoutCoords.length} - ${event.title}`);
      console.log(`📍 Adresse: ${address}`);

      if (!address || address.length < 5) {
        console.log('⏭️ Adresse trop courte, ignoré');
        skippedCount++;
        continue;
      }

      // Estimer la qualité de l'adresse
      const quality = geocodingService.estimateAddressQuality(address);
      console.log(`📊 Qualité adresse: ${quality}/5`);

      if (quality < 2) {
        console.log('⏭️ Adresse de qualité insuffisante, ignoré');
        skippedCount++;
        continue;
      }

      try {
        // Tentative de géocodage
        const geocodeResult = await geocodingService.geocode(address);
        
        if (geocodeResult && geocodeResult.latitude && geocodeResult.longitude) {
          // Mettre à jour l'événement
          await Event.updateOne(
            { _id: event._id },
            {
              $set: {
                'location.coordinates': {
                  latitude: geocodeResult.latitude,
                  longitude: geocodeResult.longitude
                }
              }
            }
          );

          console.log(`✅ Coordonnées ajoutées: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
          successCount++;
        } else {
          console.log('❌ Géocodage échoué');
          failCount++;
        }

        // Pause pour éviter de surcharger l'API de géocodage
        if (i < eventsWithoutCoords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 seconde de pause
        }

      } catch (error) {
        console.log(`❌ Erreur: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n📊 Résultats de la migration:');
    console.log('=' .repeat(60));
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Échecs: ${failCount}`);
    console.log(`⏭️ Ignorés: ${skippedCount}`);
    console.log(`📈 Taux de succès: ${Math.round((successCount / (successCount + failCount + skippedCount)) * 100)}%`);

    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const eventsWithCoords = await Event.countDocuments({
      'location.coordinates.latitude': { $exists: true },
      'location.coordinates.longitude': { $exists: true }
    });
    const totalEvents = await Event.countDocuments();
    
    console.log(`📊 ${eventsWithCoords}/${totalEvents} événements ont maintenant des coordonnées`);
    console.log(`📈 Couverture: ${Math.round((eventsWithCoords / totalEvents) * 100)}%`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Migration terminée');
  }
}

// Options de ligne de commande
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');

if (dryRun) {
  console.log('🔍 Mode DRY RUN - Aucune modification ne sera effectuée');
}

// Exécuter la migration
if (require.main === module) {
  console.log('🚀 Migration des coordonnées d\'événements');
  console.log('=' .repeat(50));
  
  if (!force) {
    console.log('⚠️ Cette opération va modifier la base de données');
    console.log('💡 Utilisez --dry-run pour simuler sans modifications');
    console.log('💡 Utilisez --force pour confirmer l\'exécution');
    console.log('\nExemple: node migrate-add-coordinates.js --force');
    process.exit(0);
  }
  
  migrateEventCoordinates().catch(console.error);
}

module.exports = { migrateEventCoordinates };


