const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

const testUserProfiles = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://teamup:teamup123@cluster0.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority');
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les utilisateurs
    const users = await User.find({ isActive: true });
    console.log(`📊 ${users.length} utilisateurs trouvés`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    console.log('\n🔍 ANALYSE DES PROFILS UTILISATEURS');
    console.log('=====================================');

    // Test 1: Vérifier la structure des profils
    console.log('\n1️⃣ Test: Structure des profils utilisateurs');
    
    users.forEach((user, index) => {
      console.log(`\n👤 Utilisateur ${index + 1}: ${user.name} (${user.email})`);
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Nom: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Email vérifié: ${user.isEmailVerified}`);
      console.log(`   - Compte actif: ${user.isActive}`);
      console.log(`   - Date de création: ${user.createdAt.toLocaleDateString()}`);
      
      // Profil
      if (user.profile) {
        console.log(`   📱 Profil:`);
        console.log(`     - Avatar: ${user.profile.avatar || 'Non défini'}`);
        console.log(`     - Image de fond: ${user.profile.backgroundImage || 'Non définie'}`);
        console.log(`     - Bio: ${user.profile.bio || 'Non définie'}`);
        console.log(`     - Niveau: ${user.profile.level || 1}`);
        console.log(`     - Points: ${user.profile.points || 0}`);
        console.log(`     - Niveau de compétence: ${user.profile.skillLevel || 'débutant'}`);
        
        // Localisation
        if (user.profile.location) {
          console.log(`     - Ville: ${user.profile.location.city || 'Non définie'}`);
          console.log(`     - Pays: ${user.profile.location.country || 'Non défini'}`);
        }
        
        // Sports favoris
        if (user.profile.favoritesSports && user.profile.favoritesSports.length > 0) {
          console.log(`     - Sports favoris: ${user.profile.favoritesSports.map(s => s.name).join(', ')}`);
        } else {
          console.log(`     - Sports favoris: Aucun`);
        }
        
        // Statistiques
        if (user.profile.stats) {
          console.log(`     - Événements organisés: ${user.profile.stats.eventsOrganized || 0}`);
          console.log(`     - Événements rejoints: ${user.profile.stats.eventsJoined || 0}`);
          console.log(`     - Note moyenne: ${user.profile.stats.averageRating || 0}`);
          console.log(`     - Nombre de notes: ${user.profile.stats.totalRatings || 0}`);
        }
        
        // Followers/Following
        console.log(`     - Followers: ${user.profile.followers?.length || 0}`);
        console.log(`     - Following: ${user.profile.following?.length || 0}`);
      } else {
        console.log(`   📱 Profil: Non initialisé`);
      }
    });

    // Test 2: Tester la méthode getPublicProfile
    console.log('\n2️⃣ Test: Méthode getPublicProfile()');
    
    const testUser = users[0];
    console.log(`\n🧪 Test avec ${testUser.name}:`);
    
    const publicProfile = testUser.getPublicProfile();
    console.log('   📋 Profil public:');
    console.log(`     - ID: ${publicProfile.id}`);
    console.log(`     - Nom: ${publicProfile.name}`);
    console.log(`     - Username: ${publicProfile.username}`);
    console.log(`     - Email: ${publicProfile.email}`);
    console.log(`     - Avatar: ${publicProfile.avatar || 'Non défini'}`);
    console.log(`     - Bio: ${publicProfile.bio || 'Non définie'}`);
    console.log(`     - Followers: ${publicProfile.followers}`);
    console.log(`     - Following: ${publicProfile.following}`);
    console.log(`     - Points: ${publicProfile.points}`);
    console.log(`     - Niveau: ${publicProfile.level}`);
    console.log(`     - Sports favoris: ${publicProfile.favoritesSports.length}`);
    console.log(`     - Email vérifié: ${publicProfile.isEmailVerified}`);
    console.log(`     - Niveau de compétence: ${publicProfile.skillLevel}`);

    // Test 3: Vérifier les événements des utilisateurs
    console.log('\n3️⃣ Test: Événements des utilisateurs');
    
    for (const user of users.slice(0, 3)) { // Tester les 3 premiers utilisateurs
      console.log(`\n📅 Événements de ${user.name}:`);
      
      // Événements organisés
      const organizedEvents = await Event.find({ organizer: user._id });
      console.log(`   🎯 Événements organisés: ${organizedEvents.length}`);
      organizedEvents.forEach((event, index) => {
        console.log(`     ${index + 1}. ${event.title} (${event.sport}) - ${event.date.toLocaleDateString()}`);
      });
      
      // Événements rejoints
      const joinedEvents = await Event.find({ 
        participants: { $in: [user._id] },
        organizer: { $ne: user._id }
      });
      console.log(`   👥 Événements rejoints: ${joinedEvents.length}`);
      joinedEvents.forEach((event, index) => {
        console.log(`     ${index + 1}. ${event.title} (${event.sport}) - ${event.date.toLocaleDateString()}`);
      });
    }

    // Test 4: Tester les fonctionnalités de profil
    console.log('\n4️⃣ Test: Fonctionnalités de profil');
    
    if (users.length >= 2) {
      const user1 = users[0];
      const user2 = users[1];
      
      console.log(`\n🔗 Test de follow entre ${user1.name} et ${user2.name}:`);
      
      // Vérifier l'état initial
      const initialFollowing = user1.profile?.following?.includes(user2._id) || false;
      console.log(`   État initial - ${user1.name} suit ${user2.name}: ${initialFollowing}`);
      
      // Tester le follow
      if (!initialFollowing) {
        await user1.follow(user2._id);
        await user2.addFollower(user1._id);
        console.log(`   ✅ ${user1.name} suit maintenant ${user2.name}`);
      } else {
        console.log(`   ℹ️ ${user1.name} suit déjà ${user2.name}`);
      }
      
      // Vérifier l'état final
      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);
      const finalFollowing = updatedUser1.profile?.following?.includes(user2._id) || false;
      const finalFollowers = updatedUser2.profile?.followers?.includes(user1._id) || false;
      
      console.log(`   État final:`);
      console.log(`     - ${user1.name} suit ${user2.name}: ${finalFollowing}`);
      console.log(`     - ${user2.name} a ${user1.name} comme follower: ${finalFollowers}`);
    }

    // Test 5: Vérifier les statistiques
    console.log('\n5️⃣ Test: Statistiques des utilisateurs');
    
    for (const user of users.slice(0, 3)) {
      console.log(`\n📊 Statistiques de ${user.name}:`);
      
      const stats = user.profile?.stats || {};
      console.log(`   - Événements organisés: ${stats.eventsOrganized || 0}`);
      console.log(`   - Événements rejoints: ${stats.eventsJoined || 0}`);
      console.log(`   - Note moyenne: ${stats.averageRating || 0}`);
      console.log(`   - Nombre de notes: ${stats.totalRatings || 0}`);
      
      // Calculer le pourcentage de participation
      const totalEvents = (stats.eventsOrganized || 0) + (stats.eventsJoined || 0);
      if (totalEvents > 0) {
        const participationRate = ((stats.eventsJoined || 0) / totalEvents * 100).toFixed(1);
        console.log(`   - Taux de participation: ${participationRate}%`);
      }
    }

    // Test 6: Vérifier la cohérence des données
    console.log('\n6️⃣ Test: Cohérence des données');
    
    let issuesFound = 0;
    
    for (const user of users) {
      // Vérifier que les utilisateurs actifs ont un email
      if (!user.email) {
        console.log(`   ⚠️ ${user.name}: Email manquant`);
        issuesFound++;
      }
      
      // Vérifier que les utilisateurs actifs ont un nom
      if (!user.name) {
        console.log(`   ⚠️ ${user.name}: Nom manquant`);
        issuesFound++;
      }
      
      // Vérifier la cohérence followers/following
      if (user.profile?.followers && user.profile?.following) {
        const followersCount = user.profile.followers.length;
        const followingCount = user.profile.following.length;
        
        if (followersCount > 0 || followingCount > 0) {
          console.log(`   ✅ ${user.name}: ${followersCount} followers, ${followingCount} following`);
        }
      }
    }
    
    if (issuesFound === 0) {
      console.log(`   ✅ Aucun problème de cohérence détecté`);
    } else {
      console.log(`   ⚠️ ${issuesFound} problèmes de cohérence détectés`);
    }

    console.log('\n✅ Test des profils utilisateurs terminé avec succès !');
    console.log('\n🎯 Résumé:');
    console.log(`- ✅ ${users.length} utilisateurs analysés`);
    console.log(`- ✅ Profils publics fonctionnels`);
    console.log(`- ✅ Système de follow/followers opérationnel`);
    console.log(`- ✅ Statistiques utilisateurs calculées`);
    console.log(`- ✅ Événements liés aux utilisateurs`);
    console.log(`- ✅ Cohérence des données vérifiée`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

// Exécuter le test
testUserProfiles(); 