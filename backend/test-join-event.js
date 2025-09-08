/**
 * Test de l'endpoint join event
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

async function testJoinEvent() {
  try {
    console.log('🧪 Test de l\'endpoint join event');
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

    // 2. Récupérer un événement existant
    console.log('\n📋 Récupération des événements...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/api/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!eventsResponse.data.success || eventsResponse.data.data.length === 0) {
      console.log('❌ Aucun événement trouvé');
      return;
    }

    const event = eventsResponse.data.data[0];
    console.log('✅ Événement trouvé:', event.title);
    console.log('   - ID:', event._id);
    console.log('   - Organisateur:', event.organizer);
    console.log('   - Participants:', event.participants?.length || 0);
    console.log('   - Max participants:', event.maxParticipants);

    // 3. Tester l'endpoint join
    console.log('\n🎯 Test de l\'endpoint join...');
    try {
      const joinResponse = await axios.post(`${API_BASE_URL}/api/events/${event._id}/join`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Join réussi');
      console.log('   - Message:', joinResponse.data.message);
      console.log('   - Données:', joinResponse.data.data);

    } catch (joinError) {
      console.log('❌ Join échoué');
      console.log('   - Status:', joinError.response?.status);
      console.log('   - Message:', joinError.response?.data?.message);
      console.log('   - Erreur complète:', joinError.response?.data);
    }

    // 4. Vérifier l'état de l'événement après join
    console.log('\n🔍 Vérification de l\'état après join...');
    const eventAfterResponse = await axios.get(`${API_BASE_URL}/api/events/${event._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (eventAfterResponse.data.success) {
      const eventAfter = eventAfterResponse.data.data;
      console.log('✅ État après join:');
      console.log('   - Participants:', eventAfter.participants?.length || 0);
      console.log('   - Status:', eventAfter.status);
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
    await testJoinEvent();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testJoinEvent };
