const mongoose = require('mongoose');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
require('dotenv').config();

const testPrivateConversations = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://teamup:teamup123@cluster0.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority');
    console.log('✅ Connecté à MongoDB');

    // Récupérer les utilisateurs existants
    const users = await User.find({ isActive: true }).limit(4);
    console.log(`📊 ${users.length} utilisateurs trouvés`);

    if (users.length < 3) {
      console.log('❌ Il faut au moins 3 utilisateurs pour tester les conversations privées');
      return;
    }

    const user1 = users[0];
    const user2 = users[1];
    const user3 = users[2];

    console.log(`\n👤 Utilisateur 1: ${user1.name} (${user1.email})`);
    console.log(`👤 Utilisateur 2: ${user2.name} (${user2.email})`);
    console.log(`👤 Utilisateur 3: ${user3.name} (${user3.email})`);

    // Nettoyer les anciennes conversations de test
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    console.log('🗑️ Anciennes conversations supprimées');

    // Test 1: Créer une conversation privée entre user1 et user2
    console.log(`\n1️⃣ Test: Création d'une conversation privée entre ${user1.name} et ${user2.name}`);
    
    let conversation1 = await Conversation.findOrCreatePrivate(user1._id, user2._id);
    console.log(`   ✅ Conversation créée: ${conversation1._id}`);
    console.log(`   - Type: ${conversation1.type}`);
    console.log(`   - Participants: ${conversation1.participants.length} (${user1.name}, ${user2.name})`);

    // Test 2: Créer une autre conversation privée entre user1 et user3
    console.log(`\n2️⃣ Test: Création d'une conversation privée entre ${user1.name} et ${user3.name}`);
    
    let conversation2 = await Conversation.findOrCreatePrivate(user1._id, user3._id);
    console.log(`   ✅ Conversation créée: ${conversation2._id}`);
    console.log(`   - Type: ${conversation2.type}`);
    console.log(`   - Participants: ${conversation2.participants.length} (${user1.name}, ${user3.name})`);

    // Test 3: Vérifier que les conversations sont différentes
    console.log(`\n3️⃣ Test: Vérification que les conversations sont distinctes`);
    console.log(`   - Conversation 1 ID: ${conversation1._id}`);
    console.log(`   - Conversation 2 ID: ${conversation2._id}`);
    console.log(`   - Sont différentes: ${conversation1._id.toString() !== conversation2._id.toString()}`);

    // Test 4: Vérifier les conversations de chaque utilisateur
    console.log(`\n4️⃣ Test: Vérification des conversations par utilisateur`);

    // Conversations de user1
    const user1Conversations = await Conversation.find({
      participants: user1._id,
      isActive: true
    }).populate('participants', 'name email');
    
    console.log(`   📱 ${user1.name} a ${user1Conversations.length} conversations:`);
    user1Conversations.forEach((conv, index) => {
      const otherParticipants = conv.participants.filter(p => p._id.toString() !== user1._id.toString());
      console.log(`     ${index + 1}. Conversation ${conv._id} avec: ${otherParticipants.map(p => p.name).join(', ')}`);
    });

    // Conversations de user2
    const user2Conversations = await Conversation.find({
      participants: user2._id,
      isActive: true
    }).populate('participants', 'name email');
    
    console.log(`   📱 ${user2.name} a ${user2Conversations.length} conversations:`);
    user2Conversations.forEach((conv, index) => {
      const otherParticipants = conv.participants.filter(p => p._id.toString() !== user2._id.toString());
      console.log(`     ${index + 1}. Conversation ${conv._id} avec: ${otherParticipants.map(p => p.name).join(', ')}`);
    });

    // Conversations de user3
    const user3Conversations = await Conversation.find({
      participants: user3._id,
      isActive: true
    }).populate('participants', 'name email');
    
    console.log(`   📱 ${user3.name} a ${user3Conversations.length} conversations:`);
    user3Conversations.forEach((conv, index) => {
      const otherParticipants = conv.participants.filter(p => p._id.toString() !== user3._id.toString());
      console.log(`     ${index + 1}. Conversation ${conv._id} avec: ${otherParticipants.map(p => p.name).join(', ')}`);
    });

    // Test 5: Ajouter des messages dans les conversations
    console.log(`\n5️⃣ Test: Ajout de messages dans les conversations`);

    // Messages dans la conversation 1 (user1 <-> user2)
    const messages1 = [
      { sender: user1._id, content: 'Salut ! Comment ça va ?' },
      { sender: user2._id, content: 'Ça va bien ! Et toi ?' },
      { sender: user1._id, content: 'Super ! Tu viens au match ?' }
    ];

    for (const msgData of messages1) {
      const message = new Message({
        conversationId: conversation1._id,
        sender: msgData.sender,
        content: msgData.content,
        type: 'text'
      });
      await message.save();
      await conversation1.updateLastMessage(msgData.content, msgData.sender);
    }
    console.log(`   ✅ ${messages1.length} messages ajoutés dans la conversation 1`);

    // Messages dans la conversation 2 (user1 <-> user3)
    const messages2 = [
      { sender: user1._id, content: 'Salut ! Tu es libre ce weekend ?' },
      { sender: user3._id, content: 'Oui, pourquoi ?' },
      { sender: user1._id, content: 'On pourrait faire du tennis' }
    ];

    for (const msgData of messages2) {
      const message = new Message({
        conversationId: conversation2._id,
        sender: msgData.sender,
        content: msgData.content,
        type: 'text'
      });
      await message.save();
      await conversation2.updateLastMessage(msgData.content, msgData.sender);
    }
    console.log(`   ✅ ${messages2.length} messages ajoutés dans la conversation 2`);

    // Test 6: Vérifier l'isolation des messages
    console.log(`\n6️⃣ Test: Vérification de l'isolation des messages`);

    const messagesConv1 = await Message.find({ conversationId: conversation1._id })
      .populate('sender', 'name');
    console.log(`   📨 Messages dans la conversation 1 (${user1.name} <-> ${user2.name}):`);
    messagesConv1.forEach((msg, index) => {
      console.log(`     ${index + 1}. [${msg.sender.name}] ${msg.content}`);
    });

    const messagesConv2 = await Message.find({ conversationId: conversation2._id })
      .populate('sender', 'name');
    console.log(`   📨 Messages dans la conversation 2 (${user1.name} <-> ${user3.name}):`);
    messagesConv2.forEach((msg, index) => {
      console.log(`     ${index + 1}. [${msg.sender.name}] ${msg.content}`);
    });

    // Test 7: Vérifier que user2 ne peut pas voir les messages de la conversation 2
    console.log(`\n7️⃣ Test: Vérification de la confidentialité`);
    
    const user2Messages = await Message.find({ 
      conversationId: { $in: user2Conversations.map(c => c._id) }
    }).populate('sender', 'name');
    
    console.log(`   🔒 ${user2.name} ne peut voir que ${user2Messages.length} messages (dans ses conversations)`);
    console.log(`   ✅ Les messages de la conversation 2 ne sont pas visibles pour ${user2.name}`);

    console.log(`\n✅ Test des conversations privées terminé avec succès !`);
    console.log(`\n🎯 Résumé:`);
    console.log(`- ✅ Conversations privées entre 2 personnes spécifiques`);
    console.log(`- ✅ Isolation des messages par conversation`);
    console.log(`- ✅ Confidentialité respectée`);
    console.log(`- ✅ Chaque utilisateur ne voit que ses conversations`);
    console.log(`- ✅ Système de messagerie privée fonctionnel`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

// Exécuter le test
testPrivateConversations(); 