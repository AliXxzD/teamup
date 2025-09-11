const fetch = require('node-fetch');

async function testApiEndpoint() {
  try {
    // Test avec l'ID d'un participant existant
    const userId = '68c2a9deba6f531943142835'; // Hassan Hassnan
    const apiUrl = `http://localhost:3000/api/users/${userId}`;
    
    console.log('🔍 Test de l\'endpoint API:');
    console.log(`   URL: ${apiUrl}`);
    console.log(`   User ID: ${userId}`);
    
    // Simuler un token d'authentification (vous devrez le remplacer par un vrai token)
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE' // Décommentez et ajoutez un vrai token
      }
    });
    
    console.log(`   Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`   Response: ${responseText}`);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Succès:', data);
    } else {
      console.log('❌ Erreur:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testApiEndpoint();
