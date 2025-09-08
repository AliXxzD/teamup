/**
 * Test simple de Socket.io
 */

const io = require('socket.io-client');

const API_BASE_URL = 'http://localhost:5000';

async function testSimpleSocket() {
  console.log('🔌 Test simple de Socket.io');
  console.log('=' .repeat(40));

  try {
    // 1. Connexion Socket.io
    console.log('\n🔌 Connexion à Socket.io...');
    
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    // 2. Test de connexion
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout connexion Socket.io'));
      }, 10000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('✅ Connecté à Socket.io:', socket.id);
        resolve();
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Erreur connexion: ${error.message}`));
      });
    });

    // 3. Test d'authentification (sans token valide)
    console.log('\n🔐 Test d\'authentification...');
    
    socket.emit('authenticate', { token: 'invalid_token' });
    
    await new Promise((resolve) => {
      socket.on('auth_error', (data) => {
        console.log('✅ Erreur d\'auth attendue:', data.error);
        resolve();
      });
      
      socket.on('authenticated', (data) => {
        console.log('✅ Authentification réussie:', data.userId);
        resolve();
      });
      
      // Timeout si pas de réponse
      setTimeout(resolve, 3000);
    });

    // 4. Test des événements génériques
    console.log('\n📡 Test des événements Socket.io...');
    
    socket.on('error', (data) => {
      console.log('⚠️ Erreur Socket reçue:', data.error);
    });

    // Émettre un événement de test
    socket.emit('test_event', { message: 'Hello Socket.io!' });

    // 5. Déconnexion
    console.log('\n👋 Déconnexion...');
    socket.disconnect();
    
    console.log('✅ Test Socket.io terminé avec succès !');
    console.log('🎉 Socket.io est opérationnel sur le serveur');

  } catch (error) {
    console.error('❌ Erreur test Socket.io:', error.message);
  }
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const axios = require('axios');
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Serveur accessible');
    return true;
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    console.log('💡 Démarrez le serveur avec: npm start');
    return false;
  }
}

// Exécution
async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await testSimpleSocket();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

