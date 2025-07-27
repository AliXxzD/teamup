const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'TestPassword123';

// Fonction pour tester la connexion au serveur
async function testServerConnection() {
  console.log('🔍 Test de connexion au serveur...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });
    
    console.log(`📡 Statut du serveur: ${response.status}`);
    return response.status !== 404; // 404 signifie que le serveur répond mais la route n'existe pas
  } catch (error) {
    console.error('❌ Erreur de connexion au serveur:', error.message);
    return false;
  }
}

// Fonction pour tester l'authentification
async function testAuthentication() {
  console.log('🔐 Test d\'authentification...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      }),
      timeout: 10000
    });
    
    const data = await response.json();
    console.log(`📡 Statut de connexion: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Connexion réussie');
      return data.tokens.accessToken;
    } else {
      console.log('❌ Échec de connexion:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.message);
    return null;
  }
}

// Fonction pour tester les endpoints de profil
async function testProfileEndpoints(token) {
  if (!token) {
    console.log('❌ Pas de token, impossible de tester les profils');
    return;
  }
  
  console.log('👤 Test des endpoints de profil...');
  
  // Test 1: Récupérer son propre profil
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    const data = await response.json();
    console.log(`📡 GET /profile: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Profil récupéré avec succès');
      console.log(`   - Nom: ${data.profile.name}`);
      console.log(`   - Username: ${data.profile.username}`);
      console.log(`   - Email: ${data.profile.email}`);
    } else {
      console.log('❌ Erreur profil:', data.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test du profil:', error.message);
  }
  
  // Test 2: Récupérer les événements récents
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile/events/recent?limit=3`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    const data = await response.json();
    console.log(`📡 GET /profile/events/recent: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Événements récents récupérés');
      console.log(`   - Nombre d'événements: ${data.events?.length || 0}`);
    } else {
      console.log('❌ Erreur événements:', data.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test des événements:', error.message);
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Test de connectivité réseau pour les profils');
  console.log('===============================================');
  
  // Test 1: Connexion au serveur
  const serverConnected = await testServerConnection();
  if (!serverConnected) {
    console.log('❌ Serveur inaccessible. Vérifiez que le serveur backend est démarré.');
    return;
  }
  
  console.log('✅ Serveur accessible');
  console.log('');
  
  // Test 2: Authentification
  const token = await testAuthentication();
  console.log('');
  
  // Test 3: Endpoints de profil
  await testProfileEndpoints(token);
  
  console.log('');
  console.log('🎉 Tests terminés !');
  console.log('===============================================');
}

// Exécuter les tests
runTests().catch(console.error); 