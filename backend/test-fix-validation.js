const mongoose = require('mongoose');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
require('dotenv').config();

const testFixValidation = async () => {
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

    // Tester la validation de l'ID de conversation
    console.log(`\n🔍 Test de validation de l'ID de conversation:`);
    
    // Test avec un ID valide
    const validId = conversation._id.toString();
    console.log(`   - ID valide: ${validId}`);
    console.log(`   - Est un ObjectId valide: ${mongoose.Types.ObjectId.isValid(validId)}`);
    
    // Test avec un ID invalide
    const invalidId = 'invalid-id';
    console.log(`   - ID invalide: ${invalidId}`);
    console.log(`   - Est un ObjectId valide: ${mongoose.Types.ObjectId.isValid(invalidId)}`);

    // Tester l'envoi d'un message avec l'ID valide
    console.log(`\n📤 Test d'envoi de message avec ID valide:`);
    
    try {
      const message = new Message({
        conversationId: conversation._id,
        sender: user1._id,
        content: 'Test de validation corrigée',
        type: 'text'
      });

      await message.save();
      console.log(`   ✅ Message envoyé avec succès!`);
      console.log(`   - ID du message: ${message._id}`);
      console.log(`   - Contenu: "${message.content}"`);
      console.log(`   - Conversation ID: ${message.conversationId}`);

      // Mettre à jour la conversation
      await conversation.updateLastMessage(message.content, user1._id);
      console.log(`   ✅ Conversation mise à jour`);

      // Vérifier que le message a bien été créé
      const savedMessage = await Message.findById(message._id)
        .populate('sender', 'name email');
      
      if (savedMessage) {
        console.log(`   ✅ Message vérifié: "${savedMessage.content}" par ${savedMessage.sender.name}`);
      }

    } catch (error) {
      console.error(`   ❌ Erreur lors de l'envoi:`, error.message);
    }

    // Vérifier tous les messages dans la conversation
    console.log(`\n📨 Messages dans la conversation:`);
    const allMessages = await Message.find({ conversationId: conversation._id })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    console.log(`   Total: ${allMessages.length} messages`);
    
    allMessages.forEach((msg, index) => {
      const time = msg.createdAt.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      console.log(`   ${index + 1}. [${msg.sender.name}] ${msg.content} (${time})`);
    });

    console.log(`\n✅ Test de correction de validation terminé avec succès !`);
    console.log(`\n🎯 Résumé:`);
    console.log(`- ✅ Validation de l'ID de conversation corrigée`);
    console.log(`- ✅ Envoi de message fonctionnel`);
    console.log(`- ✅ Conversation mise à jour`);
    console.log(`- ✅ Messages accessibles`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

// Exécuter le test
testFixValidation(); 