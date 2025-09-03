const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function testEventsAPI() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer un utilisateur pour les tests
    const user = await User.findOne();
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé pour les tests');
      return;
    }

    // Créer un token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('👤 Utilisateur de test:', user.email);

    // Créer l'app Express pour les tests
    const app = express();
    app.use(express.json());
    
    // Importer les routes d'événements
    const eventsRoutes = require('./routes/events');
    app.use('/api/events', eventsRoutes);

    console.log('\n📡 Test 1: GET /api/events (Récupérer tous les événements)');
    
    try {
      const response = await request(app)
        .get('/api/events')
        .expect(200);
      
      console.log('✅ Statut:', response.status);
      console.log('✅ Événements récupérés:', response.body.data?.events?.length || 0);
      
      if (response.body.data?.events && response.body.data.events.length > 0) {
        const event = response.body.data.events[0];
        console.log('   - Premier événement:', event.title);
        console.log('   - Sport:', event.sport);
        console.log('   - Date:', event.date);
        console.log('   - Participants:', event.currentParticipants + '/' + event.maxParticipants);
      }
      
    } catch (apiError) {
      console.error('❌ Erreur API GET /api/events:', apiError.message);
    }

    console.log('\n📡 Test 2: GET /api/events avec filtres');
    
    try {
      const response = await request(app)
        .get('/api/events?sport=Football&isFree=true')
        .expect(200);
      
      console.log('✅ Événements Football gratuits:', response.body.data?.events?.length || 0);
      
    } catch (apiError) {
      console.error('❌ Erreur API filtres:', apiError.message);
    }

    console.log('\n📡 Test 3: POST /api/events (Créer un événement)');
    
    try {
      const newEvent = {
        title: 'Tournoi de Tennis API Test',
        description: 'Un tournoi de tennis créé via l\'API pour tester le système. Tous niveaux bienvenus !',
        sport: 'Tennis',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Dans 10 jours
        time: '10:00',
        location: 'Club de Tennis Municipal, Avenue des Sports',
        maxParticipants: 8,
        level: 'Tous niveaux',
        price: 15,
        isFree: false
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(newEvent)
        .expect(201);
      
      console.log('✅ Événement créé avec succès');
      console.log('   - ID:', response.body.data._id);
      console.log('   - Titre:', response.body.data.title);
      console.log('   - Organisateur:', response.body.data.organizer?.name);
      
      const createdEventId = response.body.data._id;

      // Test 4: GET /api/events/:id (Récupérer un événement spécifique)
      console.log('\n📡 Test 4: GET /api/events/:id');
      
      const detailResponse = await request(app)
        .get(`/api/events/${createdEventId}`)
        .expect(200);
      
      console.log('✅ Détails de l\'événement récupérés');
      console.log('   - Titre:', detailResponse.body.data.title);
      console.log('   - Description:', detailResponse.body.data.description.substring(0, 50) + '...');
      console.log('   - Vues:', detailResponse.body.data.stats.views);

      // Test 5: POST /api/events/:id/join (Rejoindre un événement)
      console.log('\n📡 Test 5: POST /api/events/:id/join');
      
      try {
        const joinResponse = await request(app)
          .post(`/api/events/${createdEventId}/join`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400); // 400 car l'organisateur ne peut pas rejoindre son propre événement
        
        console.log('✅ Test de participation (organisateur):', joinResponse.body.message);
        
      } catch (joinError) {
        console.log('ℹ️ Erreur attendue - organisateur ne peut pas rejoindre:', joinError.message);
      }

      // Test 6: PUT /api/events/:id (Mettre à jour un événement)
      console.log('\n📡 Test 6: PUT /api/events/:id');
      
      const updatedEvent = {
        ...newEvent,
        title: 'Tournoi de Tennis API Test - MODIFIÉ',
        maxParticipants: 12
      };

      const updateResponse = await request(app)
        .put(`/api/events/${createdEventId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedEvent)
        .expect(200);
      
      console.log('✅ Événement mis à jour');
      console.log('   - Nouveau titre:', updateResponse.body.data.title);
      console.log('   - Nouveaux participants max:', updateResponse.body.data.maxParticipants);

    } catch (createError) {
      console.error('❌ Erreur lors de la création:', createError.message);
      if (createError.response) {
        console.error('   - Statut:', createError.response.status);
        console.error('   - Corps:', createError.response.body);
      }
    }

    console.log('\n✅ Tests API des événements terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testEventsAPI();
