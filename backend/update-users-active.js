const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateUsersActiveStatus = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://teamup:teamup123@cluster0.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority');
    console.log('✅ Connecté à MongoDB');

    // Trouver tous les utilisateurs qui n'ont pas le champ isActive
    const usersWithoutActiveStatus = await User.find({ isActive: { $exists: false } });
    console.log(`📊 ${usersWithoutActiveStatus.length} utilisateurs trouvés sans statut actif`);

    if (usersWithoutActiveStatus.length > 0) {
      // Mettre à jour tous les utilisateurs pour définir isActive à true
      const result = await User.updateMany(
        { isActive: { $exists: false } },
        { $set: { isActive: true } }
      );
      
      console.log(`✅ ${result.modifiedCount} utilisateurs mis à jour avec isActive: true`);
    } else {
      console.log('✅ Tous les utilisateurs ont déjà le statut actif défini');
    }

    // Vérifier le nombre total d'utilisateurs
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    console.log('\n📈 Statistiques des utilisateurs :');
    console.log(`   Total: ${totalUsers}`);
    console.log(`   Actifs: ${activeUsers}`);
    console.log(`   Inactifs: ${inactiveUsers}`);

    console.log('\n✅ Mise à jour terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

// Exécuter le script
updateUsersActiveStatus(); 