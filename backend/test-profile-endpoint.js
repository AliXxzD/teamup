/**
 * Test de l'endpoint /api/auth/profile
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testProfileEndpoint() {
  console.log('🧪 Test de l\'endpoint /api/auth/profile');
  console.log('=' .repeat(50));

  try {
    // 1. Connexion pour obtenir un token
    console.log('\n🔐 Connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'nassimblm12@gmail.com',
      password: 'password123'
    });

    if (!loginResponse.data.tokens) {
      console.log('❌ Pas de tokens reçus');
      return;
    }

    const token = loginResponse.data.tokens.accessToken;
    console.log('✅ Token obtenu');

    // 2. Test de l'endpoint /api/auth/me
    console.log('\n📊 Test /api/auth/me:');
    try {
      const meResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ /api/auth/me fonctionne');
      console.log('Structure:', Object.keys(meResponse.data));
      console.log('User keys:', Object.keys(meResponse.data.user || {}));
      console.log('Stats:', meResponse.data.user?.stats);
    } catch (error) {
      console.log('❌ /api/auth/me échoue:', error.response?.data || error.message);
    }

    // 3. Test de l'endpoint /api/auth/profile
    console.log('\n📊 Test /api/auth/profile:');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ /api/auth/profile fonctionne');
      console.log('Structure:', Object.keys(profileResponse.data));
      console.log('Profile keys:', Object.keys(profileResponse.data.profile || {}));
      console.log('Stats:', profileResponse.data.profile?.stats);
    } catch (error) {
      console.log('❌ /api/auth/profile échoue:', error.response?.data || error.message);
    }

    // 4. Comparaison des deux endpoints
    console.log('\n🔍 Recommandation:');
    console.log('- /api/auth/me : Données de base utilisateur');
    console.log('- /api/auth/profile : Profil enrichi avec stats réelles');
    console.log('→ Utiliser /api/auth/me pour le service de points');

  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
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
    await testProfileEndpoint();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

