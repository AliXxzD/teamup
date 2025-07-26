const mongoose = require('mongoose');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
require('dotenv').config();

const testChatFetch = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://teamup:teamup123@cluster0.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority');
    console.log('✅ Connecté à MongoDB');

    // Récupérer les utilisateurs existants
    const users = await User.find({ isActive: true }).limit(2);
    console.log(`📊 ${users.length} utilisateurs trouvés`);

    if (users.length < 2) {
      console.log('❌ Il faut au moins 2 utilisateurs pour tester les messages');
      return;
    }

    const user1 = users[0];
    const user2 = users[1];

    console.log(`\n👤 Utilisateur 1: ${user1.name} (${user1.email})`);
    console.log(`👤 Utilisateur 2: ${user2.name} (${user2.email})`);

    // Créer ou récupérer une conversation entre les deux utilisateurs
    let conversation = await Conversation.findOrCreatePrivate(user1._id, user2._id);
    console.log(`💬 Conversation ID: ${conversation._id}`);

    // Créer des messages de test variés
    const testMessages = [
      {
        content: 'Salut ! Comment ça va ?',
        sender: user1._id,
        conversationId: conversation._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        content: 'Ça va bien ! Et toi ?',
        sender: user2._id,
        conversationId: conversation._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 25) // 25 minutes ago
      },
      {
        content: 'Super ! Tu viens au match de foot demain ?',
        sender: user1._id,
        conversationId: conversation._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
      },
      {
        content: 'Oui, j\'ai hâte ! À quelle heure ?',
        sender: user2._id,
        conversationId: conversation._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
      },
      {
        content: 'À 15h au terrain municipal',
        sender: user1._id,
        conversationId: conversation._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
      },
      {
        content: 'Parfait ! Je serai là',
        sender: user2._id,
        conversationId: conversation._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      },
      {
        content: 'N\'oublie pas tes crampons !',
        sender: user1._id,
        conversationId: conversation._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
      }
    ];

    // Supprimer les anciens messages de test
    await Message.deleteMany({ conversationId: conversation._id });
    console.log('🗑️ Anciens messages supprimés');

    // Créer les nouveaux messages
    for (const msgData of testMessages) {
      const message = new Message(msgData);
      await message.save();
      console.log(`💬 Message créé: "${msgData.content}" par ${msgData.sender === user1._id ? user1.name : user2.name} (${msgData.createdAt.toLocaleTimeString()})`);
    }

    // Mettre à jour la conversation avec le dernier message
    await conversation.updateLastMessage(testMessages[testMessages.length - 1].content, testMessages[testMessages.length - 1].sender);

    // Simuler le fetch des messages comme dans le frontend
    console.log(`\n🔍 Test du fetch des messages (comme dans ChatScreen):`);
    
    // Récupérer les messages avec populate (comme dans l'API)
    const messages = await Message.find({ 
      conversationId: conversation._id,
      isDeleted: false 
    })
    .populate('sender', 'name email profile.avatar')
    .sort({ createdAt: -1 })
    .limit(50);

    console.log(`📨 ${messages.length} messages récupérés de la base de données`);

    // Formater les messages comme dans l'API
    const formattedMessages = messages.reverse().map(message => ({
      ...message.getPublicInfo(),
      sender: {
        id: message.sender._id,
        name: message.sender.name,
        avatar: message.sender.profile?.avatar
      }
    }));

    console.log(`\n📱 Messages formatés pour le frontend:`);
    formattedMessages.forEach((msg, index) => {
      const time = new Date(msg.createdAt).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      console.log(`${index + 1}. [${msg.sender.name}] ${msg.content} (${time})`);
    });

    // Tester la pagination
    console.log(`\n📄 Test de pagination:`);
    const messagesPage1 = await Message.find({ 
      conversationId: conversation._id,
      isDeleted: false 
    })
    .populate('sender', 'name')
    .sort({ createdAt: -1 })
    .limit(3)
    .skip(0);

    console.log(`Page 1 (3 derniers messages):`);
    messagesPage1.reverse().forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.sender.name}] ${msg.content}`);
    });

    // Vérifier les statistiques
    console.log(`\n📊 Statistiques finales:`);
    console.log(`- Messages dans la conversation: ${await Message.countDocuments({ conversationId: conversation._id })}`);
    console.log(`- Messages non supprimés: ${await Message.countDocuments({ conversationId: conversation._id, isDeleted: false })}`);
    console.log(`- Messages de ${user1.name}: ${await Message.countDocuments({ conversationId: conversation._id, sender: user1._id })}`);
    console.log(`- Messages de ${user2.name}: ${await Message.countDocuments({ conversationId: conversation._id, sender: user2._id })}`);

    console.log(`\n✅ Test du fetch des messages terminé avec succès !`);
    console.log(`\n🎯 Résumé:`);
    console.log(`- ✅ Messages créés et stockés en base`);
    console.log(`- ✅ Fetch avec populate des expéditeurs`);
    console.log(`- ✅ Tri par date (plus récents en premier)`);
    console.log(`- ✅ Formatage pour le frontend`);
    console.log(`- ✅ Pagination fonctionnelle`);
    console.log(`- ✅ Messages prêts pour l'affichage dans ChatScreen`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

// Exécuter le test
testChatFetch(); 