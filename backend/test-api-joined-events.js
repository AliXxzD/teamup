const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'teamup_secret_key_change_in_production';

async function testApiJoinedEvents() {
  try {
    console.log('🧪 Test de l\'API des événements rejoints...');
    
    // 1. Tester l'API de santé d'abord
    console.log('\n1️⃣ Test de l\'API de santé...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API de santé:', healthData.status);
    console.log('📊 Base de données:', healthData.database);

    // 2. Créer un token de test (nous devons d'abord avoir un utilisateur)
    console.log('\n2️⃣ Test de connexion...');
    
    // Essayer de se connecter avec un utilisateur de test
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com', // Remplacer par un email existant
        password: 'password123'     // Remplacer par le mot de passe correspondant
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Impossible de se connecter. Essayons avec un autre utilisateur...');
      
      // Essayer avec un autre email
      const loginResponse2 = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'amar@example.com', // D'après les logs, il y a un utilisateur "Amar"
          password: 'password123'
        })
      });

      if (!loginResponse2.ok) {
        console.log('❌ Impossible de se connecter. Vérifiez les logs du serveur pour voir les utilisateurs disponibles.');
        return;
      }

      const loginData = await loginResponse2.json();
      console.log('✅ Connexion réussie:', loginData.message);
      
      const token = loginData.tokens.accessToken;
      console.log('🔑 Token obtenu:', token.substring(0, 50) + '...');

      // 3. Tester l'API des événements rejoints
      console.log('\n3️⃣ Test de l\'API des événements rejoints...');
      const joinedResponse = await fetch(`${API_BASE_URL}/api/events/my/joined`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📊 Statut de la réponse:', joinedResponse.status);
      
      if (joinedResponse.ok) {
        const joinedData = await joinedResponse.json();
        console.log('✅ Réponse de l\'API:', JSON.stringify(joinedData, null, 2));
        console.log(`📊 Nombre d'événements rejoints: ${joinedData.data?.length || 0}`);
        
        if (joinedData.data && joinedData.data.length > 0) {
          joinedData.data.forEach((event, index) => {
            console.log(`\n  ${index + 1}. ${event.title} (${event._id})`);
            console.log(`     Status: ${event.status}`);
            console.log(`     Date: ${event.date}`);
            console.log(`     Participants: ${event.participants?.length || 0}`);
          });
        } else {
          console.log('ℹ️ Aucun événement rejoint trouvé');
        }
      } else {
        const errorText = await joinedResponse.text();
        console.log('❌ Erreur de l\'API:', joinedResponse.status, errorText);
      }

      // 4. Tester aussi l'API des événements organisés pour comparaison
      console.log('\n4️⃣ Test de l\'API des événements organisés...');
      const organizedResponse = await fetch(`${API_BASE_URL}/api/events/my/organized`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📊 Statut de la réponse organisés:', organizedResponse.status);
      
      if (organizedResponse.ok) {
        const organizedData = await organizedResponse.json();
        console.log(`📊 Nombre d'événements organisés: ${organizedData.data?.length || 0}`);
      } else {
        const errorText = await organizedResponse.text();
        console.log('❌ Erreur de l\'API organisés:', organizedResponse.status, errorText);
      }

    } else {
      const loginData = await loginResponse.json();
      console.log('✅ Connexion réussie:', loginData.message);
      
      const token = loginData.tokens.accessToken;
      console.log('🔑 Token obtenu:', token.substring(0, 50) + '...');

      // Répéter les tests avec le premier token
      // ... (même code que ci-dessus)
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testApiJoinedEvents();
