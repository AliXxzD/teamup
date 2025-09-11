const fetch = require('node-fetch');

async function testReviewsEndpoint() {
  try {
    const userId = '68c1cc87774207ec38d6f276';
    const url = `http://localhost:5000/api/reviews/user/${userId}`;
    
    console.log('🔍 Test de l\'endpoint:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: Pas d'authentification pour ce test simple
      }
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', response.headers.raw());
    
    const data = await response.json();
    console.log('📊 Réponse:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testReviewsEndpoint();
