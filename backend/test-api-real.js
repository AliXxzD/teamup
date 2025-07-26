const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const API_BASE_URL = 'http://localhost:5000';
const JWT_SECRET = 'teamup_jwt_secret_change_in_production';

// Créer un token de test pour un utilisateur
const createTestToken = (userId) => {
  return jwt.sign(
    { id: userId, email: 'test@example.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const testApiReal = async () => {
  try {
    console.log('🧪 Test de l\'API de messagerie avec token réel...\n');

    // Utiliser l'ID d'un utilisateur existant (remplacez par un vrai ID)
    const testUserId = '68854a153094dc2913255640'; // ID d'un utilisateur existant
    const testToken = createTestToken(testUserId);

    console.log('🔑 Token créé pour l\'utilisateur:', testUserId);

    // 1. Tester la récupération des conversations
    console.log('1️⃣ Test GET /api/messages/conversations');
    try {
      const conversationsResponse = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📊 Statut de la réponse:', conversationsResponse.status);
      
      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        console.log('✅ Conversations récupérées:', conversationsData.conversations?.length || 0);
        
        if (conversationsData.conversations?.length > 0) {
          const conversation = conversationsData.conversations[0];
          console.log(`   - Conversation ID: ${conversation.id}`);
          console.log(`   - Type: ${conversation.type}`);
          console.log(`   - Dernier message: "${conversation.lastMessage?.content || 'Aucun'}"`);
          
          // 2. Tester la récupération des messages
          console.log('\n2️⃣ Test GET /api/messages/conversations/:id/messages');
          const messagesResponse = await fetch(`${API_BASE_URL}/api/messages/conversations/${conversation.id}/messages`, {
            headers: {
              'Authorization': `Bearer ${testToken}`,
              'Content-Type': 'application/json',
            }
          });

          console.log('📊 Statut de la réponse messages:', messagesResponse.status);
          
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            console.log('✅ Messages récupérés:', messagesData.messages?.length || 0);
            
            if (messagesData.messages && messagesData.messages.length > 0) {
              console.log('\n📱 Messages dans la conversation:');
              messagesData.messages.forEach((msg, index) => {
                const time = new Date(msg.createdAt).toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                console.log(`   ${index + 1}. [${msg.sender?.name || 'Unknown'}] ${msg.content} (${time})`);
              });
            } else {
              console.log('ℹ️ Aucun message dans cette conversation');
            }

            // 3. Tester l'envoi d'un nouveau message
            console.log('\n3️⃣ Test POST /api/messages/conversations/:id/messages');
            const newMessage = {
              content: 'Test message from API - ' + new Date().toLocaleTimeString(),
              type: 'text'
            };

            const sendResponse = await fetch(`${API_BASE_URL}/api/messages/conversations/${conversation.id}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${testToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newMessage)
            });

            console.log('📊 Statut de la réponse envoi:', sendResponse.status);
            
            if (sendResponse.ok) {
              const sendData = await sendResponse.json();
              console.log('✅ Message envoyé:', sendData.message?.content);
              console.log('   - ID du message:', sendData.message?.id);
              console.log('   - Expéditeur:', sendData.message?.sender?.name);
            } else {
              const errorData = await sendResponse.json();
              console.log('❌ Erreur envoi:', errorData);
            }
          } else {
            const errorData = await messagesResponse.json();
            console.log('❌ Erreur récupération messages:', errorData);
          }
        } else {
          console.log('ℹ️ Aucune conversation trouvée pour cet utilisateur');
        }
      } else {
        const errorData = await conversationsResponse.json();
        console.log('❌ Erreur récupération conversations:', errorData);
      }
    } catch (error) {
      console.log('❌ Erreur réseau:', error.message);
    }

    // 4. Tester la récupération des utilisateurs
    console.log('\n4️⃣ Test GET /api/messages/users');
    try {
      const usersResponse = await fetch(`${API_BASE_URL}/api/messages/users`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📊 Statut de la réponse utilisateurs:', usersResponse.status);
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Utilisateurs récupérés:', usersData.users?.length || 0);
        
        if (usersData.users && usersData.users.length > 0) {
          console.log('\n👥 Liste des utilisateurs:');
          usersData.users.slice(0, 5).forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} (${user.email})`);
          });
        } else {
          console.log('ℹ️ Aucun utilisateur trouvé');
        }
      } else {
        const errorData = await usersResponse.json();
        console.log('❌ Erreur récupération utilisateurs:', errorData);
      }
    } catch (error) {
      console.log('❌ Erreur réseau:', error.message);
    }

    console.log('\n✅ Test de l\'API avec token réel terminé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Instructions pour utiliser ce test
console.log('📋 Instructions pour tester l\'API avec token réel:');
console.log('1. Assurez-vous que le serveur backend est démarré (npm start)');
console.log('2. Remplacez testUserId par un vrai ID d\'utilisateur de votre base');
console.log('3. Exécutez: node test-api-real.js');
console.log('\n');

// Exécuter le test
testApiReal(); 