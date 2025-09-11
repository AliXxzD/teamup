const fetch = require('node-fetch');

async function testRegisterEndpoint() {
  try {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      rememberMe: false
    };
    
    console.log('🔍 Test de l\'endpoint d\'inscription...');
    console.log('📊 Données envoyées:', testUser);
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', response.headers.raw());
    
    const data = await response.json();
    console.log('📊 Réponse:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Inscription réussie !');
    } else {
      console.log('❌ Erreur d\'inscription:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testRegisterEndpoint();
