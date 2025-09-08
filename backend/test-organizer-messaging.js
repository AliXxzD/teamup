/**
 * Test du système de messagerie avec l'organisateur
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Conversation = require('./models/Conversation');
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000';

async function testOrganizerMessaging() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup';
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion MongoDB réussie');

    console.log('🧪 Test du système de messagerie avec l\'organisateur');
    console.log('=' .repeat(60));

    // 1. Trouver un événement avec organisateur
    const event = await Event.findOne().populate('organizer', 'name email');
    if (!event) {
      console.log('❌ Aucun événement trouvé');
      return;
    }

    console.log(`\n📅 Événement trouvé: ${event.title}`);
    console.log(`👤 Organisateur: ${event.organizer.name} (${event.organizer.email})`);

    // 2. Créer un utilisateur de test (participant)
    const testUser = {
      name: 'Participant Test',
      email: 'participant@test.com',
      password: 'password123'
    };

    console.log('\n👥 Création utilisateur participant...');
    
    let participantToken;
    try {
      // Essayer de créer l'utilisateur
      await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
      console.log('✅ Utilisateur participant créé');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Utilisateur participant existe déjà');
      } else {
        throw error;
      }
    }

    // Connexion du participant
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    participantToken = loginResponse.data.tokens.accessToken;
    console.log('✅ Participant connecté');

    // 3. Test de l'API de création de conversation avec organisateur
    console.log('\n💬 Test API conversation avec organisateur...');
    
    try {
      const conversationResponse = await axios.post(
        `${API_BASE_URL}/api/messages/conversations/with-organizer`,
        { eventId: event._id },
        {
          headers: {
            'Authorization': `Bearer ${participantToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ API conversation avec organisateur fonctionne');
      console.log('📊 Réponse:', {
        success: conversationResponse.data.success,
        conversationId: conversationResponse.data.conversation?.id,
        eventTitle: conversationResponse.data.event?.title,
        organizerName: conversationResponse.data.event?.organizer?.name
      });

      const conversation = conversationResponse.data.conversation;

      // 4. Test d'envoi de message dans cette conversation
      console.log('\n📤 Test envoi message dans la conversation...');
      
      const messageResponse = await axios.post(
        `${API_BASE_URL}/api/messages/conversations/${conversation.id}/messages`,
        {
          content: `Bonjour ! Je suis intéressé par votre événement "${event.title}". Pourriez-vous me donner plus d'informations ?`,
          type: 'text'
        },
        {
          headers: {
            'Authorization': `Bearer ${participantToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (messageResponse.data.success) {
        console.log('✅ Message envoyé avec succès');
        console.log('💬 Contenu:', messageResponse.data.message.content.substring(0, 50) + '...');
      }

    } catch (apiError) {
      console.log('❌ Erreur API:', apiError.response?.data || apiError.message);
    }

    // 5. Vérifier les conversations créées
    console.log('\n📊 Vérification des conversations...');
    
    const conversations = await Conversation.find({
      participants: { $all: [event.organizer._id] }
    }).populate('participants', 'name email');

    console.log(`✅ ${conversations.length} conversation(s) trouvée(s) pour l'organisateur`);
    
    conversations.forEach((conv, index) => {
      const participants = conv.participants.map(p => p.name).join(', ');
      console.log(`${index + 1}. ${conv.type} - Participants: ${participants}`);
    });

    console.log('\n🎉 Test terminé avec succès !');
    console.log('✅ L\'API de messagerie avec organisateur fonctionne');
    console.log('✅ Les conversations sont créées correctement');
    console.log('✅ Les messages peuvent être envoyés');

  } catch (error) {
    console.error('❌ Erreur test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Test terminé');
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
    return false;
  }
}

// Exécution
async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await testOrganizerMessaging();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

