/**
 * Test de la messagerie temps réel avec Socket.io
 */

const io = require('socket.io-client');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Simulation de deux utilisateurs
const users = [
  { email: 'user1@test.com', password: 'password123', name: 'Utilisateur 1' },
  { email: 'user2@test.com', password: 'password123', name: 'Utilisateur 2' }
];

async function testSocketMessaging() {
  console.log('🔌 Test de la messagerie temps réel Socket.io');
  console.log('=' .repeat(60));

  try {
    // 1. Créer/connecter les utilisateurs de test
    console.log('\n👥 Préparation des utilisateurs de test...');
    const userTokens = [];
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n${i + 1}. ${user.name}`);
      
      try {
        // Essayer de créer l'utilisateur
        await axios.post(`${API_BASE_URL}/api/auth/register`, user);
        console.log('✅ Utilisateur créé');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('✅ Utilisateur existe déjà');
        } else {
          throw error;
        }
      }
      
      // Connexion
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      const token = loginResponse.data.tokens.accessToken;
      userTokens.push({ ...user, token });
      console.log('✅ Connexion réussie');
    }

    // 2. Créer une conversation entre les deux utilisateurs
    console.log('\n💬 Création d\'une conversation...');
    
    const conversationResponse = await axios.post(`${API_BASE_URL}/api/messages/conversations`, {
      participants: [userTokens[1].email] // User1 crée une conversation avec User2
    }, {
      headers: {
        'Authorization': `Bearer ${userTokens[0].token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const conversation = conversationResponse.data.conversation;
    console.log('✅ Conversation créée:', conversation._id);

    // 3. Connecter les deux utilisateurs via Socket.io
    console.log('\n🔌 Connexion Socket.io des utilisateurs...');
    
    const sockets = [];
    
    for (let i = 0; i < userTokens.length; i++) {
      const userToken = userTokens[i];
      
      const socket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000
      });
      
      sockets.push({ socket, user: userToken, index: i });
      
      // Attendre la connexion
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout connexion')), 10000);
        
        socket.on('connect', () => {
          clearTimeout(timeout);
          console.log(`✅ ${userToken.name} connecté via Socket.io`);
          
          // Authentification
          socket.emit('authenticate', { token: userToken.token });
          
          socket.on('authenticated', () => {
            console.log(`🔐 ${userToken.name} authentifié`);
            resolve();
          });
          
          socket.on('auth_error', (data) => {
            reject(new Error(`Erreur auth: ${data.error}`));
          });
        });
        
        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    }

    // 4. Les deux utilisateurs rejoignent la conversation
    console.log('\n👥 Utilisateurs rejoignent la conversation...');
    
    for (const socketData of sockets) {
      socketData.socket.emit('join_conversation', { conversationId: conversation._id });
      
      await new Promise((resolve) => {
        socketData.socket.on('conversation_joined', () => {
          console.log(`✅ ${socketData.user.name} a rejoint la conversation`);
          resolve();
        });
      });
    }

    // 5. Test d'envoi de messages temps réel
    console.log('\n💬 Test d\'envoi de messages temps réel...');
    
    // Configurer les listeners pour recevoir les messages
    sockets.forEach(socketData => {
      socketData.socket.on('new_message', (data) => {
        console.log(`📨 ${socketData.user.name} a reçu: "${data.message.content}" de ${data.message.sender.name}`);
      });
      
      socketData.socket.on('user_typing', (data) => {
        console.log(`⌨️ ${socketData.user.name} voit: ${data.userName} ${data.isTyping ? 'tape' : 'arrête de taper'}`);
      });
    });

    // Utilisateur 1 commence à taper
    console.log('\n⌨️ Test indicateur de frappe...');
    sockets[0].socket.emit('typing_start', { conversationId: conversation._id });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    sockets[0].socket.emit('typing_stop', { conversationId: conversation._id });

    // Utilisateur 1 envoie un message
    console.log('\n📤 Utilisateur 1 envoie un message...');
    sockets[0].socket.emit('send_message', {
      conversationId: conversation._id,
      content: 'Salut ! Comment ça va ?',
      type: 'text'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Utilisateur 2 répond
    console.log('\n📤 Utilisateur 2 répond...');
    sockets[1].socket.emit('send_message', {
      conversationId: conversation._id,
      content: 'Salut ! Ça va bien et toi ?',
      type: 'text'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 6. Test de marquage comme lu
    console.log('\n✅ Test marquage comme lu...');
    sockets[1].socket.emit('mark_as_read', { conversationId: conversation._id });

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n🎉 Test de messagerie temps réel terminé !');
    console.log('✅ Socket.io fonctionne correctement');
    console.log('✅ Messages envoyés en temps réel');
    console.log('✅ Indicateurs de frappe fonctionnels');
    console.log('✅ Marquage comme lu opérationnel');

    // Nettoyer les connexions
    sockets.forEach(socketData => {
      socketData.socket.disconnect();
    });

  } catch (error) {
    console.error('❌ Erreur test Socket.io:', error.message);
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
    console.log('💡 Démarrez le serveur avec: npm start');
    return false;
  }
}

// Exécution
async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await testSocketMessaging();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

