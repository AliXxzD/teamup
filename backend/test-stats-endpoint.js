/**
 * Test de l'endpoint /api/auth/me avec les vraies statistiques
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

async function testStatsEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint /api/auth/me avec stats');
    console.log('=' .repeat(50));

    // 1. Login pour obtenir un token
    console.log('\n🔐 Connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Échec de la connexion');
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
      console.log('Stats disponibles:', Object.keys(meResponse.data.user?.stats || {}));
      console.log('Stats values:', meResponse.data.user?.stats);
      
      // Vérifier les champs importants
      const user = meResponse.data.user;
      console.log('\n📋 Données utilisateur:');
      console.log('- name:', user.name);
      console.log('- points:', user.points);
      console.log('- level:', user.level);
      console.log('- eventsOrganized:', user.stats?.eventsOrganized);
      console.log('- eventsJoined:', user.stats?.eventsJoined);
      console.log('- averageRating:', user.stats?.averageRating);

    } catch (error) {
      console.log('❌ /api/auth/me échoue:', error.response?.data || error.message);
    }

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

// Exécuter le test
async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await testStatsEndpoint();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testStatsEndpoint };
