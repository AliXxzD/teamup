const mongoose = require('mongoose');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

// Configuration de la base de données
require('dotenv').config();

async function testMessagingSystem() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Test 1: Vérifier les modèles
    console.log('\n📊 Test 1: Vérification des modèles...');
    
    // Compter les utilisateurs
    const userCount = await User.countDocuments();
    console.log(`👥 Utilisateurs: ${userCount}`);
    
    // Compter les conversations
    const conversationCount = await Conversation.countDocuments();
    console.log(`💬 Conversations: ${conversationCount}`);
    
    // Compter les messages
    const messageCount = await Message.countDocuments();
    console.log(`📝 Messages: ${messageCount}`);

    // Test 2: Créer une conversation de test si aucune n'existe
    if (conversationCount === 0 && userCount >= 2) {
      console.log('\n🆕 Test 2: Création d\'une conversation de test...');
      
      const users = await User.find().limit(2);
      if (users.length >= 2) {
        const conversation = new Conversation({
          type: 'private',
          participants: [users[0]._id, users[1]._id],
          unreadCounts: [
            { user: users[0]._id, count: 0 },
            { user: users[1]._id, count: 0 }
          ]
        });
        
        await conversation.save();
        console.log('✅ Conversation de test créée:', conversation._id);
        
        // Créer un message de test
        const message = new Message({
          conversationId: conversation._id,
          sender: users[0]._id,
          content: 'Message de test du système de messagerie',
          type: 'text'
        });
        
        await message.save();
        await conversation.updateLastMessage(message.content, users[0]._id);
        console.log('✅ Message de test créé:', message._id);
      }
    }

    // Test 3: Vérifier les méthodes des modèles
    console.log('\n🔧 Test 3: Vérification des méthodes...');
    
    const testConversation = await Conversation.findOne();
    if (testConversation) {
      console.log('✅ Méthode getPublicInfo:', typeof testConversation.getPublicInfo === 'function');
      console.log('✅ Méthode updateLastMessage:', typeof testConversation.updateLastMessage === 'function');
      console.log('✅ Méthode incrementUnreadCount:', typeof testConversation.incrementUnreadCount === 'function');
    }
    
    const testMessage = await Message.findOne();
    if (testMessage) {
      console.log('✅ Méthode getPublicInfo:', typeof testMessage.getPublicInfo === 'function');
      console.log('✅ Méthode markAsRead:', typeof testMessage.markAsRead === 'function');
    }

    // Test 4: Test des requêtes de base
    console.log('\n🔍 Test 4: Test des requêtes...');
    
    // Récupérer les conversations avec populate
    const conversations = await Conversation.find({ isActive: true })
      .populate('participants', 'name email')
      .limit(5);
    
    console.log(`✅ Conversations récupérées: ${conversations.length}`);
    
    if (conversations.length > 0) {
      const conv = conversations[0];
      console.log(`   - ID: ${conv._id}`);
      console.log(`   - Type: ${conv.type}`);
      console.log(`   - Participants: ${conv.participants.length}`);
      
      // Récupérer les messages de cette conversation
      const messages = await Message.find({ conversationId: conv._id })
        .populate('sender', 'name')
        .limit(5);
      
      console.log(`   - Messages: ${messages.length}`);
    }

    console.log('\n✅ Tests terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter les tests
testMessagingSystem();
