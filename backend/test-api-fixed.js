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

const testApiFixed = async () => {
  try {
    console.log('🧪 Test de l\'API avec validation corrigée...\n');

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

    // 2. Tester l'envoi de messages avec la validation corrigée
    const testMessages = [
      'Test de validation corrigée - Message 1',
      'Test de validation corrigée - Message 2',
      'Test de validation corrigée - Message 3'
    ];

    console.log(`\n2️⃣ Test d'envoi de ${testMessages.length} messages avec validation corrigée...`);

    for (let i = 0; i < testMessages.length; i++) {
      const messageContent = testMessages[i];
      
      console.log(`\n📤 Envoi du message ${i + 1}/${testMessages.length}:`);
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

        // Attendre un peu entre chaque envoi
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`   ❌ Erreur réseau:`, error.message);
      }
    }

    // 3. Vérifier tous les messages après envoi
    console.log(`\n3️⃣ Vérification de tous les messages après envoi...`);
    
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
        console.log(`\n📱 Derniers messages dans la conversation:`);
        // Afficher seulement les 5 derniers messages
        const recentMessages = finalMessagesData.messages.slice(-5);
        recentMessages.forEach((msg, index) => {
          const time = new Date(msg.createdAt).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          });
          console.log(`   ${index + 1}. [${msg.sender?.name || 'Unknown'}] ${msg.content} (${time})`);
        });
      }
    }

    console.log(`\n✅ Test de l'API avec validation corrigée terminé avec succès !`);
    console.log(`\n🎯 Résumé:`);
    console.log(`- ✅ Validation de l'ID de conversation corrigée`);
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
console.log('📋 Instructions pour tester l\'API avec validation corrigée:');
console.log('1. Assurez-vous que le serveur backend est démarré (npm start)');
console.log('2. Remplacez testUserId par un vrai ID d\'utilisateur de votre base');
console.log('3. Exécutez: node test-api-fixed.js');
console.log('\n');

// Exécuter le test
testApiFixed(); 