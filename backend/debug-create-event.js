const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000';

const testCreateEvent = async () => {
  try {
    console.log('🔐 Testing authentication first...');
    
    // Test auth first
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'test.events@teamup.com',
      password: 'TestPassword123'
    });

    if (!loginResponse.data.accessToken) {
      console.log('❌ Pas de token d\'auth, essayons de créer un utilisateur...');
      
      // Try to register
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: 'Test User Events',
        email: 'test.events@teamup.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123'
      });

      // Try login again
      const retryLogin = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'test.events@teamup.com',
        password: 'TestPassword123'
      });
      
      if (!retryLogin.data.accessToken) {
        throw new Error('Impossible d\'obtenir un token');
      }
      
      loginResponse.data = retryLogin.data;
    }

    const token = loginResponse.data.accessToken;
    console.log('✅ Token obtenu:', token.substring(0, 20) + '...');

    console.log('\n➕ Testing event creation with exact data from log...');
    
    // Use exact data from the log
    const eventData = {
      "date": "2025-07-28",
      "description": "Match amical entre potes au 18eme Match amical entre potes au 18eme Match amical entre potes au 18eme",
      "isFree": false,
      "level": "Tous niveaux",
      "location": "123 rue sacco et vanzetti",
      "maxParticipants": 22,
      "price": 10,
      "sport": "Football",
      "time": "19:56",
      "title": "Match amical entre potes au 18eme"
    };

    console.log('📤 Sending data:', JSON.stringify(eventData, null, 2));

    const response = await axios.post(`${API_BASE_URL}/api/events`, eventData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Event created successfully!');
    console.log('📦 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Error Message:', error.message);
    
    if (error.response?.data?.errors) {
      console.log('\n🔍 Detailed validation errors:');
      error.response.data.errors.forEach(err => {
        console.log(`  - Field: ${err.path || err.param || 'unknown'}`);
        console.log(`    Message: ${err.msg || err.message}`);
        console.log(`    Value: ${err.value}`);
      });
    }
  }
};

testCreateEvent(); 