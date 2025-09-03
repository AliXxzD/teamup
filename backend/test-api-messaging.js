const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');

// Configuration
require('dotenv').config();

async function testMessagingAPI() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer un utilisateur existant pour les tests
    const user = await User.findOne();
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé pour les tests');
      return;
    }

    // Créer un token JWT pour l'utilisateur (format compatible avec authMiddleware)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('👤 Utilisateur de test:', user.email);
    console.log('🔑 Token généré');

    // Créer l'app Express pour les tests
    const app = express();
    app.use(express.json());
    
    // Importer les routes de messagerie
    const messagesRoutes = require('./routes/messages');
    app.use('/api/messages', messagesRoutes);

    console.log('\n📡 Test 1: GET /api/messages/conversations');
    
    // Test direct de l'API
    try {
      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      console.log('✅ Statut:', response.status);
      console.log('✅ Conversations récupérées:', response.body.conversations?.length || 0);
      
      if (response.body.conversations && response.body.conversations.length > 0) {
        const conv = response.body.conversations[0];
        console.log('   - ID de conversation:', conv.id);
        console.log('   - Type:', conv.type);
        console.log('   - Participants:', conv.participants?.length || 0);
        
        // Test 2: Récupérer les messages de cette conversation
        console.log('\n📡 Test 2: GET /api/messages/conversations/:id/messages');
        
        const messagesResponse = await request(app)
          .get(`/api/messages/conversations/${conv.id}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        
        console.log('✅ Messages récupérés:', messagesResponse.body.messages?.length || 0);
        
        if (messagesResponse.body.messages && messagesResponse.body.messages.length > 0) {
          const msg = messagesResponse.body.messages[0];
          console.log('   - Message ID:', msg.id);
          console.log('   - Contenu:', msg.content?.substring(0, 50) + '...');
          console.log('   - Expéditeur:', msg.sender?.name);
        }
        
        // Test 3: Envoyer un nouveau message
        console.log('\n📡 Test 3: POST /api/messages/conversations/:id/messages');
        
        const newMessage = {
          content: `Message de test API - ${new Date().toISOString()}`,
          type: 'text'
        };
        
        const sendResponse = await request(app)
          .post(`/api/messages/conversations/${conv.id}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .send(newMessage)
          .expect(201);
        
        console.log('✅ Message envoyé:', sendResponse.body.success);
        console.log('   - Nouveau message ID:', sendResponse.body.message?.id);
        console.log('   - Contenu:', sendResponse.body.message?.content);
      }
      
    } catch (apiError) {
      console.error('❌ Erreur API:', apiError.message);
      if (apiError.response) {
        console.error('   - Statut:', apiError.response.status);
        console.error('   - Corps:', apiError.response.body);
      }
    }

    console.log('\n✅ Tests API terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter les tests
testMessagingAPI();
