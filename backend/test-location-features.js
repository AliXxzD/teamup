/**
 * Test des fonctionnalités de localisation pour TeamUp
 * Ce script teste les nouvelles fonctionnalités géospatiales
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'test@location.com',
  password: 'password123',
  name: 'Test Location User'
};

// Coordonnées de test (Paris, France)
const PARIS_COORDS = {
  latitude: 48.8566,
  longitude: 2.3522
};

// Coordonnées de test (Lyon, France)
const LYON_COORDS = {
  latitude: 45.7640,
  longitude: 4.8357
};

let authToken = null;

/**
 * Utilitaire pour faire des requêtes authentifiées
 */
async function apiRequest(method, endpoint, data = null) {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  };
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

/**
 * Test 1: Inscription et connexion
 */
async function testAuth() {
  console.log('\n🔐 Test 1: Authentification');
  
  // Inscription
  const registerResult = await apiRequest('POST', '/api/auth/register', TEST_USER);
  if (registerResult.success || registerResult.status === 400) {
    console.log('✅ Inscription OK (ou utilisateur existant)');
  } else {
    console.log('❌ Erreur inscription:', registerResult.error);
    return false;
  }
  
  // Connexion
  const loginResult = await apiRequest('POST', '/api/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (loginResult.success) {
    authToken = loginResult.data.tokens.accessToken;
    console.log('✅ Connexion réussie');
    return true;
  } else {
    console.log('❌ Erreur connexion:', loginResult.error);
    return false;
  }
}

/**
 * Test 2: Création d'événements avec coordonnées
 */
async function testCreateEventsWithCoordinates() {
  console.log('\n📍 Test 2: Création d\'événements avec coordonnées');
  
  const eventsToCreate = [
    {
      title: 'Football à Paris',
      description: 'Match de football au Parc des Princes',
      sport: 'Football',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
      time: '14:00',
      location: 'Parc des Princes, Paris',
      coordinates: PARIS_COORDS,
      maxParticipants: 22,
      level: 'Intermédiaire',
      isFree: true
    },
    {
      title: 'Tennis à Lyon',
      description: 'Tournoi de tennis au Parc de la Tête d\'Or',
      sport: 'Tennis',
      date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Après-demain
      time: '10:00',
      location: 'Parc de la Tête d\'Or, Lyon',
      coordinates: LYON_COORDS,
      maxParticipants: 8,
      level: 'Avancé',
      isFree: false,
      price: 15
    },
    {
      title: 'Course à Paris',
      description: 'Course matinale dans le Bois de Boulogne',
      sport: 'Running',
      date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // Dans 3 jours
      time: '07:00',
      location: 'Bois de Boulogne, Paris',
      coordinates: {
        latitude: 48.8566 + 0.01, // Légèrement décalé de Paris centre
        longitude: 2.3522 - 0.05
      },
      maxParticipants: 50,
      level: 'Tous niveaux',
      isFree: true
    }
  ];
  
  const createdEvents = [];
  
  for (const eventData of eventsToCreate) {
    const result = await apiRequest('POST', '/api/events', eventData);
    
    if (result.success) {
      console.log(`✅ Événement créé: ${eventData.title}`);
      createdEvents.push(result.data.data);
    } else {
      console.log(`❌ Erreur création ${eventData.title}:`, result.error);
    }
  }
  
  console.log(`📊 ${createdEvents.length}/${eventsToCreate.length} événements créés avec succès`);
  return createdEvents;
}

/**
 * Test 3: Recherche par proximité
 */
async function testProximitySearch() {
  console.log('\n🗺️ Test 3: Recherche par proximité');
  
  // Test 1: Recherche autour de Paris (rayon 10km)
  console.log('\n🔍 Recherche autour de Paris (10km):');
  const parisSearch = await apiRequest('GET', 
    `/api/events/nearby?latitude=${PARIS_COORDS.latitude}&longitude=${PARIS_COORDS.longitude}&radius=10000`
  );
  
  if (parisSearch.success) {
    const events = parisSearch.data.data;
    console.log(`✅ ${events.length} événements trouvés près de Paris`);
    events.forEach(event => {
      console.log(`   - ${event.title} (${event.distanceKm}km)`);
    });
  } else {
    console.log('❌ Erreur recherche Paris:', parisSearch.error);
  }
  
  // Test 2: Recherche autour de Lyon (rayon 50km)
  console.log('\n🔍 Recherche autour de Lyon (50km):');
  const lyonSearch = await apiRequest('GET', 
    `/api/events/nearby?latitude=${LYON_COORDS.latitude}&longitude=${LYON_COORDS.longitude}&radius=50000`
  );
  
  if (lyonSearch.success) {
    const events = lyonSearch.data.data;
    console.log(`✅ ${events.length} événements trouvés près de Lyon`);
    events.forEach(event => {
      console.log(`   - ${event.title} (${event.distanceKm}km)`);
    });
  } else {
    console.log('❌ Erreur recherche Lyon:', lyonSearch.error);
  }
  
  // Test 3: Recherche avec filtres
  console.log('\n🔍 Recherche Football près de Paris:');
  const footballSearch = await apiRequest('GET', 
    `/api/events/nearby?latitude=${PARIS_COORDS.latitude}&longitude=${PARIS_COORDS.longitude}&radius=20000&sport=Football`
  );
  
  if (footballSearch.success) {
    const events = footballSearch.data.data;
    console.log(`✅ ${events.length} événements Football trouvés près de Paris`);
    events.forEach(event => {
      console.log(`   - ${event.title} (${event.distanceKm}km) - ${event.sport}`);
    });
  } else {
    console.log('❌ Erreur recherche Football:', footballSearch.error);
  }
}

/**
 * Test 4: Index géospatiaux
 */
async function testGeospatialIndexes() {
  console.log('\n📊 Test 4: Vérification des index géospatiaux');
  
  // Ce test nécessiterait une connexion directe à MongoDB
  // Pour l'instant, on peut vérifier que les recherches sont rapides
  const startTime = Date.now();
  
  const result = await apiRequest('GET', 
    `/api/events/nearby?latitude=${PARIS_COORDS.latitude}&longitude=${PARIS_COORDS.longitude}&radius=100000`
  );
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  if (result.success) {
    console.log(`✅ Recherche géospatiale effectuée en ${duration}ms`);
    if (duration < 1000) {
      console.log('✅ Performance acceptable (< 1s)');
    } else {
      console.log('⚠️ Performance lente (> 1s) - vérifier les index');
    }
  } else {
    console.log('❌ Erreur test performance:', result.error);
  }
}

/**
 * Test 5: Validation des coordonnées
 */
async function testCoordinateValidation() {
  console.log('\n✅ Test 5: Validation des coordonnées');
  
  const invalidTests = [
    {
      name: 'Latitude invalide (> 90)',
      coordinates: { latitude: 91, longitude: 2.3522 }
    },
    {
      name: 'Latitude invalide (< -90)',
      coordinates: { latitude: -91, longitude: 2.3522 }
    },
    {
      name: 'Longitude invalide (> 180)',
      coordinates: { latitude: 48.8566, longitude: 181 }
    },
    {
      name: 'Longitude invalide (< -180)',
      coordinates: { latitude: 48.8566, longitude: -181 }
    }
  ];
  
  for (const test of invalidTests) {
    const result = await apiRequest('GET', 
      `/api/events/nearby?latitude=${test.coordinates.latitude}&longitude=${test.coordinates.longitude}&radius=10000`
    );
    
    if (!result.success) {
      console.log(`✅ ${test.name}: Correctement rejetée`);
    } else {
      console.log(`❌ ${test.name}: Devrait être rejetée`);
    }
  }
}

/**
 * Fonction principale de test
 */
async function runLocationTests() {
  console.log('🚀 Tests des fonctionnalités de localisation TeamUp');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Authentification
    const authSuccess = await testAuth();
    if (!authSuccess) {
      console.log('❌ Tests interrompus: échec de l\'authentification');
      return;
    }
    
    // Test 2: Création d'événements avec coordonnées
    const createdEvents = await testCreateEventsWithCoordinates();
    
    // Attendre un peu pour que les index soient mis à jour
    console.log('\n⏳ Attente de 2 secondes pour la mise à jour des index...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Recherche par proximité
    await testProximitySearch();
    
    // Test 4: Performance des index géospatiaux
    await testGeospatialIndexes();
    
    // Test 5: Validation des coordonnées
    await testCoordinateValidation();
    
    console.log('\n🎉 Tests terminés!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Vérification que le serveur est accessible
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Serveur accessible');
    return true;
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    console.log('💡 Assurez-vous que le serveur backend est démarré sur', API_BASE_URL);
    return false;
  }
}

// Exécution des tests
async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await runLocationTests();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runLocationTests,
  testAuth,
  testCreateEventsWithCoordinates,
  testProximitySearch,
  testGeospatialIndexes,
  testCoordinateValidation
};


