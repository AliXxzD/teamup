const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://172.20.10.2:5000/api/auth';

// Token d'un utilisateur existant (à remplacer par votre token)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODgzN2Q4NGQyZTBhMmE5ZThmNjI3YmMiLCJyZW1lbWJlck1lIjpmYWxzZSwiaWF0IjoxNzUzNDQ3ODE0LCJleHAiOjE3NTM1MzQyMTR9.8XA2w2RO-nedYAChvN7zYfXZ3Cikp_qGs3plT3PH7_Y';

// Fonction utilitaire pour les logs colorés
const log = {
  info: (msg) => console.log(`🔵 ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  test: (msg) => console.log(`🧪 ${msg}`)
};

// Test de récupération du profil
async function testGetProfile() {
  try {
    log.test('Test GET /profile...');
    
    const response = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    if (response.data.success) {
      log.success('Profil récupéré avec succès');
      console.log('📋 Données du profil:', JSON.stringify(response.data.profile, null, 2));
      return response.data.profile;
    }
  } catch (error) {
    log.error(`Erreur GET /profile: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Test de mise à jour du profil
async function testUpdateProfile() {
  try {
    log.test('Test PUT /profile...');
    
    const updateData = {
      bio: 'Passionné de sport depuis toujours ! J\'organise régulièrement des matchs de football et j\'adore découvrir de nouveaux sports. Toujours partant pour une bonne session ! ⚽🏀🎾',
      location: {
        city: 'Paris',
        country: 'France'
      },
      favoritesSports: [
        { name: 'Football', icon: 'sports-soccer', color: '#22C55E' },
        { name: 'Basketball', icon: 'sports-basketball', color: '#F97316' },
        { name: 'Tennis', icon: 'sports-tennis', color: '#3B82F6' },
        { name: 'Volleyball', icon: 'sports-volleyball', color: '#A855F7' }
      ],
      skillLevel: 'intermédiaire',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      backgroundImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=400&fit=crop'
    };

    const response = await axios.put(`${BASE_URL}/profile`, updateData, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    if (response.data.success) {
      log.success('Profil mis à jour avec succès');
      console.log('📋 Profil mis à jour:', JSON.stringify(response.data.profile, null, 2));
      return response.data.profile;
    }
  } catch (error) {
    log.error(`Erreur PUT /profile: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Test de récupération des événements récents
async function testGetRecentEvents() {
  try {
    log.test('Test GET /profile/events/recent...');
    
    const response = await axios.get(`${BASE_URL}/profile/events/recent?limit=5`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    if (response.data.success) {
      log.success(`Événements récents récupérés: ${response.data.events.length} événements`);
      console.log('📅 Événements récents:', JSON.stringify(response.data.events, null, 2));
      return response.data.events;
    }
  } catch (error) {
    log.error(`Erreur GET /profile/events/recent: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Fonction principale
async function runSimpleTests() {
  log.info('🚀 Tests simples des APIs de profil...');
  log.info('===============================================');
  
  // Test 1: Récupérer le profil
  await testGetProfile();
  log.info('');
  
  // Test 2: Mettre à jour le profil
  await testUpdateProfile();
  log.info('');
  
  // Test 3: Récupérer le profil mis à jour
  log.test('Vérification du profil mis à jour...');
  await testGetProfile();
  log.info('');
  
  // Test 4: Récupérer les événements récents
  await testGetRecentEvents();
  log.info('');
  
  log.success('🎉 Tests terminés !');
  log.info('===============================================');
}

// Exécuter les tests
runSimpleTests().catch(error => {
  log.error('Erreur globale:', error.message);
  process.exit(1);
}); 