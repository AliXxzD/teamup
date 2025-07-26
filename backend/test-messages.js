const mongoose = require('mongoose');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
require('dotenv').config();

const testMessages = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://teamup:teamup123@cluster0.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority');
    console.log('✅ Connecté à MongoDB');

    // Récupérer les utilisateurs existants
    const users = await User.find({ isActive: true }).limit(3);
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
    console.log(`💬 Conversation créée/récupérée: ${conversation._id}`);

    // Créer quelques messages de test
    const testMessages = [
      {
        content: 'Salut ! Comment ça va ?',
        sender: user1._id,
        conversationId: conversation._id
      },
      {
        content: 'Ça va bien ! Et toi ?',
        sender: user2._id,
        conversationId: conversation._id
      },
      {
        content: 'Super ! Tu viens au match de foot demain ?',
        sender: user1._id,
        conversationId: conversation._id
      },
      {
        content: 'Oui, j\'ai hâte ! À quelle heure ?',
        sender: user2._id,
        conversationId: conversation._id
      },
      {
        content: 'À 15h au terrain municipal',
        sender: user1._id,
        conversationId: conversation._id
      }
    ];

    // Supprimer les anciens messages de test
    await Message.deleteMany({ conversationId: conversation._id });

    // Créer les nouveaux messages
    for (const msgData of testMessages) {
      const message = new Message(msgData);
      await message.save();
      console.log(`💬 Message créé: "${msgData.content}" par ${msgData.sender === user1._id ? user1.name : user2.name}`);
    }

    // Mettre à jour la conversation avec le dernier message
    await conversation.updateLastMessage(testMessages[testMessages.length - 1].content, testMessages[testMessages.length - 1].sender);

    // Récupérer tous les messages de la conversation
    const messages = await Message.find({ conversationId: conversation._id })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    console.log(`\n📨 Messages dans la conversation:`);
    messages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.sender.name}] ${msg.content} (${msg.createdAt.toLocaleTimeString()})`);
    });

    // Tester la récupération des conversations pour chaque utilisateur
    console.log(`\n🔍 Test des conversations:`);
    
    // Pour l'utilisateur 1
    const conversationsUser1 = await Conversation.find({ participants: user1._id })
      .populate('participants', 'name email')
      .populate('lastMessage.sender', 'name');
    
    console.log(`\nConversations de ${user1.name}:`);
    conversationsUser1.forEach(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== user1._id.toString());
      console.log(`- ${otherParticipant ? otherParticipant.name : 'Groupe'}: "${conv.lastMessage?.content || 'Aucun message'}"`);
    });

    // Pour l'utilisateur 2
    const conversationsUser2 = await Conversation.find({ participants: user2._id })
      .populate('participants', 'name email')
      .populate('lastMessage.sender', 'name');
    
    console.log(`\nConversations de ${user2.name}:`);
    conversationsUser2.forEach(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== user2._id.toString());
      console.log(`- ${otherParticipant ? otherParticipant.name : 'Groupe'}: "${conv.lastMessage?.content || 'Aucun message'}"`);
    });

    // Tester la récupération des messages avec pagination
    console.log(`\n📄 Test de pagination des messages:`);
    const messagesPage1 = await Message.find({ conversationId: conversation._id })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(3)
      .skip(0);
    
    console.log(`Page 1 (3 premiers messages):`);
    messagesPage1.reverse().forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.sender.name}] ${msg.content}`);
    });

    console.log(`\n✅ Test des messages terminé avec succès !`);
    console.log(`\n📊 Statistiques:`);
    console.log(`- Conversations: ${await Conversation.countDocuments()}`);
    console.log(`- Messages: ${await Message.countDocuments()}`);
    console.log(`- Utilisateurs actifs: ${await User.countDocuments({ isActive: true })}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

// Exécuter le test
testMessages(); 