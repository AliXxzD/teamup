const mongoose = require('mongoose');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

require('dotenv').config();

async function createTestConversation() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer l'utilisateur existant
    const user = await User.findOne();
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    console.log('👤 Utilisateur:', user.email);

    // Créer un deuxième utilisateur fictif pour la conversation
    let user2 = await User.findOne({ email: { $ne: user.email } });
    
    if (!user2) {
      console.log('🆕 Création d\'un deuxième utilisateur fictif...');
      user2 = new User({
        name: 'Utilisateur Test',
        email: 'test@teamup.com',
        password: 'password123',
        isActive: true,
        profile: {
          avatar: null,
          bio: 'Utilisateur de test pour la messagerie'
        }
      });
      await user2.save();
      console.log('✅ Utilisateur test créé:', user2.email);
    }

    // Vérifier s'il existe déjà une conversation entre ces utilisateurs
    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [user._id, user2._id] }
    });

    if (!conversation) {
      console.log('🆕 Création d\'une conversation de test...');
      
      conversation = new Conversation({
        type: 'private',
        participants: [user._id, user2._id],
        unreadCounts: [
          { user: user._id, count: 0 },
          { user: user2._id, count: 0 }
        ],
        isActive: true
      });

      await conversation.save();
      console.log('✅ Conversation créée:', conversation._id);
    } else {
      console.log('✅ Conversation existante trouvée:', conversation._id);
    }

    // Créer quelques messages de test
    const existingMessages = await Message.countDocuments({ conversationId: conversation._id });
    
    if (existingMessages === 0) {
      console.log('📝 Création de messages de test...');
      
      const messages = [
        {
          conversationId: conversation._id,
          sender: user2._id,
          content: 'Salut ! Comment ça va ?',
          type: 'text'
        },
        {
          conversationId: conversation._id,
          sender: user._id,
          content: 'Ça va bien, merci ! Et toi ?',
          type: 'text'
        },
        {
          conversationId: conversation._id,
          sender: user2._id,
          content: 'Super ! Tu veux qu\'on organise un match de foot ce weekend ?',
          type: 'text'
        },
        {
          conversationId: conversation._id,
          sender: user._id,
          content: 'Excellente idée ! Je suis partant 👍',
          type: 'text'
        }
      ];

      for (const msgData of messages) {
        const message = new Message(msgData);
        await message.save();
        console.log('   ✅ Message créé:', message.content.substring(0, 30) + '...');
        
        // Mettre à jour le dernier message de la conversation
        await conversation.updateLastMessage(message.content, message.sender);
      }

      // Incrémenter les compteurs non lus pour l'utilisateur principal
      await conversation.incrementUnreadCount(user._id);
      await conversation.incrementUnreadCount(user._id);
      
      console.log('✅ Messages de test créés');
    } else {
      console.log(`✅ ${existingMessages} messages existants trouvés`);
    }

    // Afficher le résumé
    console.log('\n📊 Résumé:');
    console.log('   - Conversation ID:', conversation._id);
    console.log('   - Participants:', conversation.participants.length);
    console.log('   - Messages:', await Message.countDocuments({ conversationId: conversation._id }));
    console.log('   - Dernier message:', conversation.lastMessage?.content || 'Aucun');

    console.log('\n✅ Conversation de test prête !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

createTestConversation();
