const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://172.20.10.2:5000/api/auth';

// Fonction utilitaire pour les logs colorés
const log = {
  info: (msg) => console.log(`🔵 ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  test: (msg) => console.log(`🧪 ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`)
};

// Instructions pour l'utilisateur
log.info('🔐 INSTRUCTIONS POUR TESTER LE PROFIL :');
log.info('1. Connectez-vous dans l\'app mobile');
log.info('2. Ouvrez les DevTools (F12)');
log.info('3. Allez dans Application > Storage > AsyncStorage');
log.info('4. Copiez votre "accessToken"');
log.info('5. Collez-le ci-dessous quand demandé');
log.info('');

// Simulation d'une entrée utilisateur (vous pouvez modifier cette ligne)
const TEST_TOKEN = 'VOTRE_TOKEN_JWT_ICI'; // Remplacez par votre token

if (TEST_TOKEN === 'VOTRE_TOKEN_JWT_ICI') {
  log.warn('⚠️  Veuillez remplacer TEST_TOKEN par votre vrai token JWT');
  log.info('Vous pouvez modifier la ligne 15 dans ce fichier');
  process.exit(1);
}

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
    if (error.response?.status === 401) {
      log.warn('Token invalide ou expiré. Veuillez vous reconnecter.');
    }
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
async function runManualTests() {
  log.info('🚀 Tests manuels des APIs de profil...');
  log.info('===============================================');
  
  // Test 1: Récupérer le profil
  const profile = await testGetProfile();
  if (!profile) {
    log.error('❌ Impossible de récupérer le profil. Arrêt des tests.');
    return;
  }
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
  log.info('✅ Si tous les tests passent, votre profil fonctionne parfaitement !');
}

// Exécuter les tests
runManualTests().catch(error => {
  log.error('Erreur globale:', error.message);
  process.exit(1);
}); 