/**
 * Test de création d'événements avec géocodage automatique
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testCreateEventWithGeocoding() {
  console.log('🚀 Test de création d\'événement avec géocodage automatique');
  console.log('=' .repeat(60));

  // 1. Créer un utilisateur de test et se connecter
  const testUser = {
    email: 'testgeo@example.com',
    password: 'password123',
    name: 'Test Geo User'
  };

  let authToken = null;

  try {
    // Inscription (ou connexion si existe déjà)
    console.log('\n🔐 Connexion...');
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
      console.log('✅ Inscription réussie');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Utilisateur existe déjà');
      } else {
        throw error;
      }
    }

    // Connexion
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    authToken = loginResponse.data.tokens.accessToken;
    console.log('✅ Connexion réussie');

    // 2. Créer des événements avec différentes adresses
    const testEvents = [
      {
        title: 'Football au Stade de France',
        description: 'Match de football au célèbre Stade de France',
        sport: 'Football',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        time: '15:00',
        location: 'Stade de France, Saint-Denis',
        maxParticipants: 22,
        level: 'Intermédiaire',
        isFree: true
      },
      {
        title: 'Tennis à Roland Garros',
        description: 'Tournoi de tennis sur terre battue',
        sport: 'Tennis',
        date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        time: '14:00',
        location: 'Roland Garros, Paris',
        maxParticipants: 8,
        level: 'Avancé',
        isFree: false,
        price: 25
      },
      {
        title: 'Course au Bois de Boulogne',
        description: 'Course matinale dans le bois',
        sport: 'Running',
        date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        time: '08:00',
        location: 'Bois de Boulogne, Paris',
        maxParticipants: 50,
        level: 'Tous niveaux',
        isFree: true
      }
    ];

    console.log('\n📍 Création d\'événements avec géocodage automatique...');

    for (let i = 0; i < testEvents.length; i++) {
      const eventData = testEvents[i];
      console.log(`\n${i + 1}. ${eventData.title}`);
      console.log(`   📍 Adresse: ${eventData.location}`);

      try {
        const response = await axios.post(`${API_BASE_URL}/api/events`, eventData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const event = response.data.data;
          console.log(`   ✅ Événement créé avec succès`);
          
          if (event.location.coordinates) {
            const coords = event.location.coordinates.coordinates;
            console.log(`   🗺️ Coordonnées: [${coords[0]}, ${coords[1]}] (lng, lat)`);
          } else {
            console.log(`   ⚠️ Pas de coordonnées générées`);
          }
        }

        // Pause entre les créations
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`   ❌ Erreur création: ${error.response?.data?.message || error.message}`);
      }
    }

    // 3. Tester la recherche par proximité avec les nouveaux événements
    console.log('\n🔍 Test de recherche par proximité...');
    
    // Test autour de Paris
    try {
      const proximityResponse = await axios.get(
        `${API_BASE_URL}/api/events/nearby?latitude=48.8566&longitude=2.3522&radius=25000`
      );

      if (proximityResponse.data.success) {
        const events = proximityResponse.data.data;
        console.log(`   ✅ ${events.length} événements trouvés près de Paris:`);
        
        events.forEach(event => {
          console.log(`      - ${event.title} (${event.distanceKm}km)`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Erreur recherche: ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
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
    return false;
  }
}

// Exécution
async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await testCreateEventWithGeocoding();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

