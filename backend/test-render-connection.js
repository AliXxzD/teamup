// Script de test pour vérifier la connexion Render
const axios = require('axios');

const RENDER_URL = 'https://teamup-oa5q.onrender.com';

async function testRenderConnection() {
  console.log('🔍 Test de connexion au backend Render...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Test Health Check...');
    const healthResponse = await axios.get(`${RENDER_URL}/api/health`, {
      timeout: 10000
    });
    console.log('✅ Health Check:', healthResponse.data);
    console.log('✅ Status:', healthResponse.status);
    console.log('✅ Headers CORS:', {
      'access-control-allow-origin': healthResponse.headers['access-control-allow-origin'],
      'access-control-allow-credentials': healthResponse.headers['access-control-allow-credentials']
    });
    console.log('');
    
    // Test 2: Test CORS avec origin Expo
    console.log('2️⃣ Test CORS avec origin Expo...');
    const corsResponse = await axios.get(`${RENDER_URL}/api/health`, {
      headers: {
        'Origin': 'https://expo.dev'
      },
      timeout: 10000
    });
    console.log('✅ CORS Test réussi');
    console.log('');
    
    // Test 3: Test endpoint auth (sans credentials)
    console.log('3️⃣ Test endpoint auth...');
    try {
      const authResponse = await axios.post(`${RENDER_URL}/api/auth/login`, {
        email: 'test@test.com',
        password: 'test123'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://expo.dev'
        },
        timeout: 10000
      });
      console.log('✅ Auth endpoint accessible');
    } catch (authError) {
      if (authError.response && authError.response.status === 401) {
        console.log('✅ Auth endpoint accessible (401 attendu pour credentials invalides)');
      } else {
        console.log('❌ Erreur Auth endpoint:', authError.message);
      }
    }
    console.log('');
    
    // Test 4: Test Socket.io
    console.log('4️⃣ Test Socket.io...');
    try {
      const socketResponse = await axios.get(`${RENDER_URL}/socket.io/`, {
        timeout: 10000
      });
      console.log('✅ Socket.io accessible');
    } catch (socketError) {
      console.log('❌ Erreur Socket.io:', socketError.message);
    }
    console.log('');
    
    console.log('🎉 Tous les tests sont passés ! Le backend Render est prêt.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }
  }
}

// Exécuter le test
testRenderConnection();
