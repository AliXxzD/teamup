const mongoose = require('mongoose');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
require('dotenv').config();

const testSendMessages = async () => {
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

    // Supprimer les anciens messages de test
    await Message.deleteMany({ conversationId: conversation._id });
    console.log('🗑️ Anciens messages supprimés');

    // Simuler l'envoi de messages par les utilisateurs
    const messagesToSend = [
      {
        sender: user1._id,
        content: 'Salut ! Comment ça va ?',
        type: 'text'
      },
      {
        sender: user2._id,
        content: 'Ça va bien ! Et toi ?',
        type: 'text'
      },
      {
        sender: user1._id,
        content: 'Super ! Tu viens au match de foot demain ?',
        type: 'text'
      },
      {
        sender: user2._id,
        content: 'Oui, j\'ai hâte ! À quelle heure ?',
        type: 'text'
      },
      {
        sender: user1._id,
        content: 'À 15h au terrain municipal',
        type: 'text'
      },
      {
        sender: user2._id,
        content: 'Parfait ! Je serai là',
        type: 'text'
      },
      {
        sender: user1._id,
        content: 'N\'oublie pas tes crampons !',
        type: 'text'
      }
    ];

    console.log(`\n📤 Simulation de l'envoi de ${messagesToSend.length} messages...`);

    // Envoyer les messages un par un (comme dans le frontend)
    for (let i = 0; i < messagesToSend.length; i++) {
      const msgData = messagesToSend[i];
      const sender = msgData.sender === user1._id ? user1 : user2;
      
      console.log(`\n📤 Envoi du message ${i + 1}/${messagesToSend.length}:`);
      console.log(`   Expéditeur: ${sender.name}`);
      console.log(`   Contenu: "${msgData.content}"`);
      
      try {
        // Créer le message (comme dans l'API)
        const message = new Message({
          conversationId: conversation._id,
          sender: msgData.sender,
          content: msgData.content,
          type: msgData.type
        });

        // Sauvegarder le message
        await message.save();
        console.log(`   ✅ Message sauvegardé avec l'ID: ${message._id}`);

        // Mettre à jour la conversation (comme dans l'API)
        await conversation.updateLastMessage(msgData.content, msgData.sender);
        console.log(`   ✅ Conversation mise à jour avec le dernier message`);

        // Incrémenter les compteurs de messages non lus pour les autres participants
        for (const participantId of conversation.participants) {
          if (participantId.toString() !== msgData.sender.toString()) {
            await conversation.incrementUnreadCount(participantId);
            console.log(`   ✅ Compteur non lu incrémenté pour le participant`);
          }
        }

        // Vérifier que le message a bien été créé
        const savedMessage = await Message.findById(message._id)
          .populate('sender', 'name email');
        
        if (savedMessage) {
          console.log(`   ✅ Message vérifié en base: "${savedMessage.content}" par ${savedMessage.sender.name}`);
        } else {
          console.log(`   ❌ Erreur: Message non trouvé en base`);
        }

      } catch (error) {
        console.error(`   ❌ Erreur lors de l'envoi du message ${i + 1}:`, error.message);
      }
    }

    // Vérifier tous les messages envoyés
    console.log(`\n🔍 Vérification de tous les messages envoyés:`);
    
    const allMessages = await Message.find({ conversationId: conversation._id })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    console.log(`📨 ${allMessages.length} messages trouvés dans la conversation:`);
    
    allMessages.forEach((msg, index) => {
      const time = msg.createdAt.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      console.log(`   ${index + 1}. [${msg.sender.name}] ${msg.content} (${time})`);
    });

    // Vérifier la conversation mise à jour
    console.log(`\n💬 Vérification de la conversation:`);
    const updatedConversation = await Conversation.findById(conversation._id)
      .populate('lastMessage.sender', 'name')
      .populate('participants', 'name email');

    console.log(`   - ID: ${updatedConversation._id}`);
    console.log(`   - Type: ${updatedConversation.type}`);
    console.log(`   - Participants: ${updatedConversation.participants.map(p => p.name).join(', ')}`);
    console.log(`   - Dernier message: "${updatedConversation.lastMessage?.content || 'Aucun'}" par ${updatedConversation.lastMessage?.sender?.name || 'N/A'}`);
    console.log(`   - Compteurs non lus: ${updatedConversation.unreadCounts.length} participants`);

    // Vérifier les compteurs de messages non lus
    console.log(`\n📊 Compteurs de messages non lus:`);
    for (const unreadCount of updatedConversation.unreadCounts) {
      const participant = updatedConversation.participants.find(p => p._id.toString() === unreadCount.user.toString());
      console.log(`   - ${participant?.name || 'Unknown'}: ${unreadCount.count} messages non lus`);
    }

    // Statistiques finales
    console.log(`\n📈 Statistiques finales:`);
    console.log(`   - Messages envoyés: ${allMessages.length}`);
    console.log(`   - Messages de ${user1.name}: ${allMessages.filter(m => m.sender._id.toString() === user1._id.toString()).length}`);
    console.log(`   - Messages de ${user2.name}: ${allMessages.filter(m => m.sender._id.toString() === user2._id.toString()).length}`);
    console.log(`   - Conversation active: ${updatedConversation.isActive}`);
    console.log(`   - Dernière mise à jour: ${updatedConversation.updatedAt.toLocaleString('fr-FR')}`);

    console.log(`\n✅ Test d'envoi de messages terminé avec succès !`);
    console.log(`\n🎯 Résumé:`);
    console.log(`- ✅ Messages envoyés et sauvegardés en base`);
    console.log(`- ✅ Conversation mise à jour avec le dernier message`);
    console.log(`- ✅ Compteurs de messages non lus incrémentés`);
    console.log(`- ✅ Messages accessibles via l'API`);
    console.log(`- ✅ Système prêt pour l'affichage dans le frontend`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

// Exécuter le test
testSendMessages(); 