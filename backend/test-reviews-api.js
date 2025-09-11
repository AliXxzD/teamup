const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User');
const Event = require('./models/Event');

// Configuration de la base de données
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

async function testReviewsAPI() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connecté à MongoDB');

    // Test 1: Vérifier les avis existants
    console.log('\n📊 Test 1: Avis existants dans la base de données');
    const allReviews = await Review.find({}).populate('reviewer reviewedUser event', 'name title');
    console.log(`Total des avis: ${allReviews.length}`);
    
    allReviews.forEach((review, index) => {
      console.log(`  ${index + 1}. ${review.reviewer?.name} → ${review.reviewedUser?.name}`);
      console.log(`     Note: ${review.rating}/5, Type: ${review.type}`);
      console.log(`     Événement: ${review.event?.title || 'Aucun'}`);
      console.log(`     Commentaire: ${review.comment?.substring(0, 50) || 'Aucun'}...`);
    });

    // Test 2: Vérifier les statistiques d'un utilisateur spécifique
    console.log('\n📊 Test 2: Statistiques d\'un utilisateur');
    const testUserId = '68c1cc87774207ec38d6f276'; // ID de l'organisateur
    
    const user = await User.findById(testUserId);
    if (user) {
      console.log(`Utilisateur: ${user.name} (${user.email})`);
      
      const stats = await Review.getUserStats(testUserId);
      console.log('Statistiques:', stats);
      
      const reviews = await Review.getUserReviews(testUserId, 1, 5);
      console.log(`Avis reçus: ${reviews.length}`);
      reviews.forEach((review, index) => {
        console.log(`  ${index + 1}. ${review.reviewer?.name}: ${review.rating}/5`);
        console.log(`     ${review.comment?.substring(0, 50) || 'Aucun commentaire'}...`);
      });
    } else {
      console.log('❌ Utilisateur non trouvé');
    }

    // Test 3: Vérifier les avis liés à un événement
    console.log('\n📊 Test 3: Avis liés à un événement');
    const testEventId = '68c1d14c774207ec38d6f31a'; // ID de l'événement
    
    const event = await Event.findById(testEventId);
    if (event) {
      console.log(`Événement: ${event.title}`);
      console.log(`Organisateur: ${event.organizer}`);
      
      const eventReviews = await Review.find({ event: testEventId }).populate('reviewer', 'name');
      console.log(`Avis pour cet événement: ${eventReviews.length}`);
      eventReviews.forEach((review, index) => {
        console.log(`  ${index + 1}. ${review.reviewer?.name}: ${review.rating}/5 (${review.type})`);
      });
    } else {
      console.log('❌ Événement non trouvé');
    }

    // Test 4: Créer un avis de test
    console.log('\n📊 Test 4: Création d\'un avis de test');
    const reviewerId = '68c20d808961dc9135e60f98'; // ID du participant
    const reviewedUserId = '68c1cc87774207ec38d6f276'; // ID de l'organisateur
    
    // Vérifier si l'avis existe déjà
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      reviewedUser: reviewedUserId,
      event: testEventId
    });
    
    if (existingReview) {
      console.log('✅ Avis déjà existant:', existingReview.rating, existingReview.comment);
    } else {
      console.log('ℹ️ Aucun avis existant, création d\'un avis de test...');
      
      const testReview = await Review.createReview({
        reviewer: reviewerId,
        reviewedUser: reviewedUserId,
        event: testEventId,
        rating: 5,
        comment: 'Excellent organisateur ! Événement très bien organisé.',
        type: 'organizer'
      });
      
      console.log('✅ Avis de test créé:', testReview._id);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testReviewsAPI();

