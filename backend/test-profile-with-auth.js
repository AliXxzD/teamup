const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Données de test
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123',
  name: 'Utilisateur Test'
};

// Fonction pour faire une requête HTTP
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Fonction pour créer un utilisateur de test
async function createTestUser() {
  console.log('👤 Création d\'un utilisateur de test...');
  
  try {
    const response = await makeRequest('POST', '/api/auth/register', {
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: TEST_USER.password,
      confirmPassword: TEST_USER.password
    });
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Utilisateur de test créé avec succès');
      return response.data.tokens.accessToken;
    } else {
      console.log('⚠️ Utilisateur existe peut-être déjà, tentative de connexion...');
      return await loginTestUser();
    }
  } catch (error) {
    console.log('⚠️ Erreur création utilisateur, tentative de connexion...');
    return await loginTestUser();
  }
}

// Fonction pour se connecter avec l'utilisateur de test
async function loginTestUser() {
  console.log('🔐 Connexion avec l\'utilisateur de test...');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (response.status === 200) {
      console.log('✅ Connexion réussie');
      return response.data.tokens.accessToken;
    } else {
      console.log('❌ Échec de connexion:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return null;
  }
}

// Fonction pour tester les endpoints de profil avec authentification
async function testProfileEndpoints(token) {
  if (!token) {
    console.log('❌ Pas de token, impossible de tester les profils');
    return;
  }
  
  console.log('\n👤 Test des endpoints de profil avec authentification...');
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Test 1: Récupérer son propre profil
  try {
    const response = await makeRequest('GET', '/api/auth/profile', null, headers);
    console.log(`📡 GET /api/auth/profile: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Profil récupéré avec succès');
      console.log(`   - Nom: ${response.data.profile.name}`);
      console.log(`   - Username: ${response.data.profile.username}`);
      console.log(`   - Email: ${response.data.profile.email}`);
    } else {
      console.log('❌ Erreur profil:', response.data);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test du profil:', error.message);
  }
  
  // Test 2: Récupérer les événements récents
  try {
    const response = await makeRequest('GET', '/api/auth/profile/events/recent?limit=3', null, headers);
    console.log(`📡 GET /api/auth/profile/events/recent: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Événements récents récupérés');
      console.log(`   - Nombre d'événements: ${response.data.events?.length || 0}`);
    } else {
      console.log('❌ Erreur événements:', response.data);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test des événements:', error.message);
  }
  
  // Test 3: Mettre à jour le profil
  try {
    const updateData = {
      bio: 'Bio de test mise à jour',
      location: {
        city: 'Paris',
        country: 'France'
      }
    };
    
    const response = await makeRequest('PUT', '/api/auth/profile', updateData, headers);
    console.log(`📡 PUT /api/auth/profile: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Profil mis à jour avec succès');
      console.log(`   - Bio: ${response.data.profile.bio}`);
    } else {
      console.log('❌ Erreur mise à jour profil:', response.data);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error.message);
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Test des endpoints de profil avec authentification');
  console.log('==================================================');
  
  // Étape 1: Créer/se connecter avec un utilisateur de test
  const token = await createTestUser();
  
  if (!token) {
    console.log('❌ Impossible d\'obtenir un token d\'authentification');
    console.log('   Vérifiez que le serveur backend est démarré et accessible');
    return;
  }
  
  console.log('✅ Token d\'authentification obtenu');
  
  // Étape 2: Tester les endpoints de profil
  await testProfileEndpoints(token);
  
  console.log('\n🎉 Tests terminés !');
  console.log('==================================================');
}

// Exécuter les tests
runTests().catch(console.error); 