const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Fonction pour tester la connexion au serveur
function testServerConnection() {
  return new Promise((resolve) => {
    console.log('🔍 Test de connexion au serveur...');
    console.log(`   URL: ${API_BASE_URL}`);
    
    const url = new URL(API_BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.get(`${API_BASE_URL}/api/auth/verify`, (res) => {
      console.log(`📡 Statut du serveur: ${res.statusCode}`);
      console.log(`   Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ Serveur accessible et répond correctement');
          console.log(`   Réponse: ${JSON.stringify(jsonData, null, 2)}`);
          resolve(true);
        } catch (error) {
          console.log('⚠️ Serveur accessible mais réponse non-JSON');
          console.log(`   Réponse brute: ${data}`);
          resolve(true);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erreur de connexion au serveur:', error.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.error('❌ Timeout de connexion au serveur');
      req.destroy();
      resolve(false);
    });
  });
}

// Fonction pour tester les routes spécifiques
function testProfileRoutes() {
  return new Promise((resolve) => {
    console.log('\n👤 Test des routes de profil...');
    
    const url = new URL(API_BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const routes = [
      '/api/auth/profile',
      '/api/auth/profile/events/recent'
    ];
    
    let completedTests = 0;
    const results = {};
    
    routes.forEach(route => {
      const req = client.get(`${API_BASE_URL}${route}`, (res) => {
        console.log(`📡 ${route}: ${res.statusCode}`);
        results[route] = {
          status: res.statusCode,
          success: res.statusCode < 400
        };
        
        completedTests++;
        if (completedTests === routes.length) {
          console.log('\n📊 Résultats des tests:');
          Object.entries(results).forEach(([route, result]) => {
            const status = result.success ? '✅' : '❌';
            console.log(`   ${status} ${route}: ${result.status}`);
          });
          resolve(results);
        }
      });
      
      req.on('error', (error) => {
        console.error(`❌ Erreur ${route}:`, error.message);
        results[route] = {
          status: 'ERROR',
          success: false,
          error: error.message
        };
        
        completedTests++;
        if (completedTests === routes.length) {
          resolve(results);
        }
      });
      
      req.setTimeout(5000, () => {
        console.error(`❌ Timeout ${route}`);
        results[route] = {
          status: 'TIMEOUT',
          success: false,
          error: 'Timeout'
        };
        req.destroy();
        
        completedTests++;
        if (completedTests === routes.length) {
          resolve(results);
        }
      });
    });
  });
}

// Fonction principale
async function runTests() {
  console.log('🚀 Test de connectivité réseau pour les profils');
  console.log('===============================================');
  
  // Test 1: Connexion au serveur
  const serverConnected = await testServerConnection();
  if (!serverConnected) {
    console.log('\n❌ Serveur inaccessible. Vérifiez que le serveur backend est démarré.');
    console.log('   Commandes utiles:');
    console.log('   - npm start (démarrer le serveur)');
    console.log('   - npm run dev (démarrer en mode développement)');
    return;
  }
  
  console.log('\n✅ Serveur accessible');
  
  // Test 2: Routes de profil
  await testProfileRoutes();
  
  console.log('\n🎉 Tests terminés !');
  console.log('===============================================');
}

// Exécuter les tests
runTests().catch(console.error); 