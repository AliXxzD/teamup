const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';

// Simuler un token d'authentification (à remplacer par un vrai token)
const TEST_TOKEN = 'your-test-token-here';

const testApiMessages = async () => {
  try {
    console.log('🧪 Test de l\'API de messagerie...\n');

    // 1. Tester la récupération des conversations
    console.log('1️⃣ Test GET /api/messages/conversations');
    try {
      const conversationsResponse = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        }
      });

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
              'Authorization': `Bearer ${TEST_TOKEN}`,
              'Content-Type': 'application/json',
            }
          });

          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            console.log('✅ Messages récupérés:', messagesData.messages?.length || 0);
            
            messagesData.messages?.forEach((msg, index) => {
              console.log(`   ${index + 1}. [${msg.sender?.name || 'Unknown'}] ${msg.content}`);
            });

            // 3. Tester l'envoi d'un nouveau message
            console.log('\n3️⃣ Test POST /api/messages/conversations/:id/messages');
            const newMessage = {
              content: 'Test message from API - ' + new Date().toLocaleTimeString(),
              type: 'text'
            };

            const sendResponse = await fetch(`${API_BASE_URL}/api/messages/conversations/${conversation.id}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newMessage)
            });

            if (sendResponse.ok) {
              const sendData = await sendResponse.json();
              console.log('✅ Message envoyé:', sendData.message?.content);
            } else {
              const errorData = await sendResponse.json();
              console.log('❌ Erreur envoi:', errorData);
            }
          } else {
            const errorData = await messagesResponse.json();
            console.log('❌ Erreur récupération messages:', errorData);
          }
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
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Utilisateurs récupérés:', usersData.users?.length || 0);
        
        usersData.users?.slice(0, 3).forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.email})`);
        });
      } else {
        const errorData = await usersResponse.json();
        console.log('❌ Erreur récupération utilisateurs:', errorData);
      }
    } catch (error) {
      console.log('❌ Erreur réseau:', error.message);
    }

    console.log('\n✅ Test de l\'API terminé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Instructions pour utiliser ce test
console.log('📋 Instructions pour tester l\'API:');
console.log('1. Assurez-vous que le serveur backend est démarré (npm start)');
console.log('2. Remplacez TEST_TOKEN par un vrai token d\'authentification');
console.log('3. Exécutez: node test-api-messages.js');
console.log('\n');

// Exécuter le test si le serveur est disponible
testApiMessages(); 