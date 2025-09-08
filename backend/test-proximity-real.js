/**
 * Test de la recherche par proximité avec les événements réels
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testProximityWithRealEvents() {
  console.log('🗺️ Test de recherche par proximité avec événements réels');
  console.log('=' .repeat(60));

  // Coordonnées de Drancy (où se trouvent nos événements)
  const drancyCoords = {
    latitude: 48.92306,
    longitude: 2.453889
  };

  // Test différents rayons
  const testRadiuses = [
    { radius: 1000, label: '1km' },
    { radius: 5000, label: '5km' },
    { radius: 10000, label: '10km' },
    { radius: 50000, label: '50km' }
  ];

  for (const test of testRadiuses) {
    console.log(`\n🔍 Test avec rayon de ${test.label} autour de Drancy:`);
    
    try {
      const url = `${API_BASE_URL}/api/events/nearby?latitude=${drancyCoords.latitude}&longitude=${drancyCoords.longitude}&radius=${test.radius}`;
      console.log(`📡 URL: ${url}`);
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        const events = response.data.data;
        console.log(`✅ ${events.length} événements trouvés`);
        
        events.forEach(event => {
          console.log(`   - ${event.title}`);
          console.log(`     📍 ${event.location.address}`);
          console.log(`     📏 Distance: ${event.distanceKm}km`);
          console.log('');
        });
        
        if (events.length > 0) {
          console.log(`📊 Informations de recherche:`);
          console.log(`   - Centre: ${response.data.searchInfo.latitude}, ${response.data.searchInfo.longitude}`);
          console.log(`   - Rayon: ${response.data.searchInfo.radiusKm}km`);
        }
      } else {
        console.log(`❌ Erreur API: ${response.data.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur requête: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }

  // Test avec Paris (devrait trouver moins ou pas d'événements)
  console.log(`\n🔍 Test avec Paris (centre-ville):`);
  const parisCoords = { latitude: 48.8566, longitude: 2.3522 };
  
  try {
    const url = `${API_BASE_URL}/api/events/nearby?latitude=${parisCoords.latitude}&longitude=${parisCoords.longitude}&radius=50000`;
    const response = await axios.get(url);
    
    if (response.data.success) {
      const events = response.data.data;
      console.log(`✅ ${events.length} événements trouvés près de Paris`);
      
      events.forEach(event => {
        console.log(`   - ${event.title} (${event.distanceKm}km)`);
      });
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }

  console.log('\n🎉 Tests terminés !');
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Serveur accessible');
    return true;
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    console.log('💡 Démarrez le serveur avec: npm start');
    return false;
  }
}

// Exécution des tests
async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await testProximityWithRealEvents();
  }
}

if (require.main === module) {
  main().catch(console.error);
}


