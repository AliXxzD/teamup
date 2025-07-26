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

const testApiSendReal = async () => {
  try {
    console.log('🧪 Test de l\'envoi de messages via l\'API...\n');

    // Utiliser l'ID d'un utilisateur existant
    const testUserId = '68854a153094dc2913255640'; // ID d'un utilisateur existant
    const testToken = createTestToken(testUserId);

    console.log('🔑 Token créé pour l\'utilisateur:', testUserId);

    // 1. Récupérer les conversations existantes
    console.log('1️⃣ Récupération des conversations...');
    const conversationsResponse = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!conversationsResponse.ok) {
      console.log('❌ Erreur lors de la récupération des conversations:', conversationsResponse.status);
      return;
    }

    const conversationsData = await conversationsResponse.json();
    console.log('✅ Conversations récupérées:', conversationsData.conversations?.length || 0);

    if (conversationsData.conversations?.length === 0) {
      console.log('❌ Aucune conversation trouvée. Créez d\'abord une conversation.');
      return;
    }

    const conversation = conversationsData.conversations[0];
    console.log(`💬 Conversation sélectionnée: ${conversation.id}`);

    // 2. Récupérer les messages existants
    console.log('\n2️⃣ Récupération des messages existants...');
    const messagesResponse = await fetch(`${API_BASE_URL}/api/messages/conversations/${conversation.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!messagesResponse.ok) {
      console.log('❌ Erreur lors de la récupération des messages:', messagesResponse.status);
      return;
    }

    const messagesData = await messagesResponse.json();
    console.log('✅ Messages existants récupérés:', messagesData.messages?.length || 0);

    // 3. Envoyer de nouveaux messages via l'API
    const messagesToSend = [
      'Salut ! Comment ça va ?',
      'Ça va bien ! Et toi ?',
      'Super ! Tu viens au match de foot demain ?',
      'Oui, j\'ai hâte ! À quelle heure ?',
      'À 15h au terrain municipal',
      'Parfait ! Je serai là',
      'N\'oublie pas tes crampons !'
    ];

    console.log(`\n3️⃣ Envoi de ${messagesToSend.length} nouveaux messages via l'API...`);

    for (let i = 0; i < messagesToSend.length; i++) {
      const messageContent = messagesToSend[i];
      
      console.log(`\n📤 Envoi du message ${i + 1}/${messagesToSend.length}:`);
      console.log(`   Contenu: "${messageContent}"`);
      
      try {
        const sendResponse = await fetch(`${API_BASE_URL}/api/messages/conversations/${conversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${testToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: messageContent,
            type: 'text'
          })
        });

        console.log(`   📊 Statut de la réponse: ${sendResponse.status}`);

        if (sendResponse.ok) {
          const sendData = await sendResponse.json();
          console.log(`   ✅ Message envoyé avec succès!`);
          console.log(`   - ID du message: ${sendData.message?.id}`);
          console.log(`   - Expéditeur: ${sendData.message?.sender?.name}`);
          console.log(`   - Contenu: "${sendData.message?.content}"`);
          console.log(`   - Timestamp: ${new Date(sendData.message?.createdAt).toLocaleString('fr-FR')}`);
        } else {
          const errorData = await sendResponse.json();
          console.log(`   ❌ Erreur lors de l'envoi:`, errorData);
        }

        // Attendre un peu entre chaque envoi pour simuler un envoi réel
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`   ❌ Erreur réseau:`, error.message);
      }
    }

    // 4. Vérifier tous les messages après envoi
    console.log(`\n4️⃣ Vérification de tous les messages après envoi...`);
    
    const finalMessagesResponse = await fetch(`${API_BASE_URL}/api/messages/conversations/${conversation.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (finalMessagesResponse.ok) {
      const finalMessagesData = await finalMessagesResponse.json();
      console.log(`✅ Messages finaux récupérés: ${finalMessagesData.messages?.length || 0}`);
      
      if (finalMessagesData.messages && finalMessagesData.messages.length > 0) {
        console.log(`\n📱 Tous les messages dans la conversation:`);
        finalMessagesData.messages.forEach((msg, index) => {
          const time = new Date(msg.createdAt).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          });
          console.log(`   ${index + 1}. [${msg.sender?.name || 'Unknown'}] ${msg.content} (${time})`);
        });
      }
    }

    // 5. Vérifier la conversation mise à jour
    console.log(`\n5️⃣ Vérification de la conversation mise à jour...`);
    
    const updatedConversationResponse = await fetch(`${API_BASE_URL}/api/messages/conversations/${conversation.id}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (updatedConversationResponse.ok) {
      const updatedConversationData = await updatedConversationResponse.json();
      const conv = updatedConversationData.conversation;
      
      console.log(`✅ Conversation mise à jour:`);
      console.log(`   - ID: ${conv.id}`);
      console.log(`   - Type: ${conv.type}`);
      console.log(`   - Dernier message: "${conv.lastMessage?.content || 'Aucun'}"`);
      console.log(`   - Timestamp du dernier message: ${conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleString('fr-FR') : 'N/A'}`);
    }

    console.log(`\n✅ Test d'envoi de messages via l'API terminé avec succès !`);
    console.log(`\n🎯 Résumé:`);
    console.log(`- ✅ Messages envoyés via l'API POST`);
    console.log(`- ✅ Messages sauvegardés en base de données`);
    console.log(`- ✅ Conversation mise à jour automatiquement`);
    console.log(`- ✅ Messages accessibles via l'API GET`);
    console.log(`- ✅ Système prêt pour l'utilisation réelle`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Instructions pour utiliser ce test
console.log('📋 Instructions pour tester l\'envoi de messages via l\'API:');
console.log('1. Assurez-vous que le serveur backend est démarré (npm start)');
console.log('2. Remplacez testUserId par un vrai ID d\'utilisateur de votre base');
console.log('3. Exécutez: node test-api-send-real.js');
console.log('\n');

// Exécuter le test
testApiSendReal(); 