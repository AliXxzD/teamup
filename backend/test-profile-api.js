const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api/auth';

// Variables pour stocker les tokens de test
let testUserToken = null;
let testUserId = null;

// Fonction utilitaire pour les logs colorés
const log = {
  info: (msg) => console.log(`🔵 ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  test: (msg) => console.log(`🧪 ${msg}`)
};

// Fonction pour créer un utilisateur de test et récupérer son token
async function createTestUser() {
  try {
    log.test('Création d\'un utilisateur de test...');
    
    const testUser = {
      name: 'Alex Martin Test',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      rememberMe: false
    };

    const response = await axios.post(`${BASE_URL}/register`, testUser);
    
    if (response.data.success) {
      testUserToken = response.data.accessToken;
      // Décoder le token pour récupérer l'ID utilisateur
      const tokenPayload = JSON.parse(Buffer.from(testUserToken.split('.')[1], 'base64').toString());
      testUserId = tokenPayload.userId;
      
      log.success(`Utilisateur créé: ${testUser.name} (ID: ${testUserId})`);
      return true;
    }
  } catch (error) {
    log.error(`Erreur lors de la création de l'utilisateur: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test de récupération du profil
async function testGetProfile() {
  try {
    log.test('Test GET /profile...');
    
    const response = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${testUserToken}` }
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
      headers: { Authorization: `Bearer ${testUserToken}` }
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
      headers: { Authorization: `Bearer ${testUserToken}` }
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

// Test de récupération du profil d'un autre utilisateur
async function testGetOtherUserProfile() {
  try {
    log.test('Test GET /profile/:userId...');
    
    const response = await axios.get(`${BASE_URL}/profile/${testUserId}`, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    
    if (response.data.success) {
      log.success('Profil d\'autre utilisateur récupéré');
      console.log('👤 Profil autre utilisateur:', JSON.stringify(response.data.profile, null, 2));
      return response.data.profile;
    }
  } catch (error) {
    log.error(`Erreur GET /profile/:userId: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Fonction principale pour exécuter tous les tests
async function runTests() {
  log.info('🚀 Démarrage des tests des APIs de profil...');
  log.info('===============================================');
  
  // Créer un utilisateur de test
  const userCreated = await createTestUser();
  if (!userCreated) {
    log.error('Impossible de créer un utilisateur de test. Arrêt des tests.');
    return;
  }
  
  log.info('');
  
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
  
  // Test 5: Récupérer le profil comme autre utilisateur
  await testGetOtherUserProfile();
  log.info('');
  
  log.success('🎉 Tous les tests terminés !');
  log.info('===============================================');
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(error => {
    log.error('Erreur globale lors des tests:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests }; 