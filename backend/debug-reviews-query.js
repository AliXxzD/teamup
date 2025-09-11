const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User');
const Event = require('./models/Event');

// Configuration de la base de données
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

async function debugReviewsQuery() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connecté à MongoDB');

    const testUserId = '68c1cc87774207ec38d6f276'; // ID de l'organisateur
    
    console.log('🔍 Test avec différents formats d\'ID:');
    console.log('ID original:', testUserId);
    console.log('Type:', typeof testUserId);
    
    // Test 1: Recherche avec string
    console.log('\n📊 Test 1: Recherche avec string');
    const reviews1 = await Review.find({
      reviewedUser: testUserId,
      status: 'active'
    });
    console.log(`Résultats avec string: ${reviews1.length}`);
    
    // Test 2: Recherche avec ObjectId
    console.log('\n📊 Test 2: Recherche avec ObjectId');
    const objectId = new mongoose.Types.ObjectId(testUserId);
    const reviews2 = await Review.find({
      reviewedUser: objectId,
      status: 'active'
    });
    console.log(`Résultats avec ObjectId: ${reviews2.length}`);
    
    // Test 3: Recherche sans filtre de statut
    console.log('\n📊 Test 3: Recherche sans filtre de statut');
    const reviews3 = await Review.find({
      reviewedUser: testUserId
    });
    console.log(`Résultats sans filtre statut: ${reviews3.length}`);
    
    // Test 4: Vérifier tous les avis
    console.log('\n📊 Test 4: Tous les avis');
    const allReviews = await Review.find({});
    console.log(`Total des avis: ${allReviews.length}`);
    allReviews.forEach((review, index) => {
      console.log(`  ${index + 1}. reviewedUser: ${review.reviewedUser} (type: ${typeof review.reviewedUser})`);
      console.log(`     Status: ${review.status}`);
      console.log(`     Égal à testUserId: ${review.reviewedUser.toString() === testUserId}`);
    });
    
    // Test 5: Méthode getUserReviews
    console.log('\n📊 Test 5: Méthode getUserReviews');
    const reviews5 = await Review.getUserReviews(testUserId, 10, 0);
    console.log(`Résultats getUserReviews: ${reviews5.length}`);
    
    // Test 6: Méthode getUserStats
    console.log('\n📊 Test 6: Méthode getUserStats');
    const stats = await Review.getUserStats(testUserId);
    console.log('Statistiques:', stats);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

debugReviewsQuery();
