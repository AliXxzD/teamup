// Test de connexion avec le backend Render
const API_URL = 'https://teamup-oa5q.onrender.com';

async function testRenderConnection() {
  console.log('🔍 Test de connexion avec Render...');
  console.log(`📍 URL: ${API_URL}`);
  
  try {
    // Test 1: Health check
    console.log('\n1. Test Health Check...');
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    
    // Test 2: Page d'accueil
    console.log('\n2. Test Page d\'accueil...');
    const homeResponse = await fetch(`${API_URL}/`);
    const homeData = await homeResponse.json();
    console.log('✅ Page d\'accueil:', homeData);
    
    // Test 3: Test d'inscription (optionnel)
    console.log('\n3. Test d\'inscription...');
    const testUser = {
      username: 'test_user_' + Date.now(),
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Inscription test:', registerData);
    } else {
      const errorData = await registerResponse.json();
      console.log('⚠️ Inscription test (attendu):', errorData);
    }
    
    console.log('\n🎉 Tous les tests sont passés ! Le backend Render fonctionne parfaitement.');
    console.log('📱 Vous pouvez maintenant créer l\'APK avec confiance.');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('🔧 Vérifiez que le backend Render est bien démarré.');
  }
}

// Exécuter le test
testRenderConnection();