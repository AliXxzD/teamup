const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:5000';

async function testWithExistingUser() {
  try {
    console.log('🧪 Test avec un utilisateur existant...');
    
    // 1. Tester l'API de santé
    console.log('\n1️⃣ Test de l\'API de santé...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API de santé:', healthData.status);
    console.log('📊 Base de données:', healthData.database);

    // 2. Essayer de se connecter avec différents emails possibles
    const testEmails = [
      'amar@example.com',
      'amar@gmail.com',
      'test@example.com',
      'admin@example.com'
    ];

    let token = null;
    let userEmail = null;

    for (const email of testEmails) {
      console.log(`\n🔐 Tentative de connexion avec: ${email}`);
      
      try {
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: 'password123' // Mot de passe par défaut
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log('✅ Connexion réussie avec:', email);
          token = loginData.tokens.accessToken;
          userEmail = email;
          break;
        } else {
          const errorData = await loginResponse.json();
          console.log('❌ Échec de connexion:', errorData.error || 'Erreur inconnue');
        }
      } catch (error) {
        console.log('❌ Erreur de connexion:', error.message);
      }
    }

    if (!token) {
      console.log('\n❌ Impossible de se connecter avec aucun des emails de test.');
      console.log('💡 Vérifiez les logs du serveur pour voir les utilisateurs disponibles.');
      return;
    }

    console.log(`\n🔑 Token obtenu pour ${userEmail}:`, token.substring(0, 50) + '...');

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
      console.log('✅ Réponse de l\'API des événements rejoints:');
      console.log(JSON.stringify(joinedData, null, 2));
      
      if (joinedData.data && joinedData.data.length > 0) {
        console.log(`\n📊 Nombre d'événements rejoints: ${joinedData.data.length}`);
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
      console.log('❌ Erreur de l\'API des événements rejoints:', joinedResponse.status);
      console.log('📄 Détails de l\'erreur:', errorText);
    }

    // 4. Tester l'API des événements organisés pour comparaison
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
      console.log('❌ Erreur de l\'API des événements organisés:', organizedResponse.status, errorText);
    }

    // 5. Tester l'API de tous les événements
    console.log('\n5️⃣ Test de l\'API de tous les événements...');
    const allEventsResponse = await fetch(`${API_BASE_URL}/api/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📊 Statut de la réponse tous les événements:', allEventsResponse.status);
    
    if (allEventsResponse.ok) {
      const allEventsData = await allEventsResponse.json();
      console.log(`📊 Nombre total d'événements: ${allEventsData.data?.events?.length || 0}`);
      
      if (allEventsData.data?.events && allEventsData.data.events.length > 0) {
        console.log('\n📋 Premiers événements:');
        allEventsData.data.events.slice(0, 3).forEach((event, index) => {
          console.log(`  ${index + 1}. ${event.title} - Status: ${event.status}`);
          console.log(`     Participants: ${event.participants?.length || 0}`);
        });
      }
    } else {
      const errorText = await allEventsResponse.text();
      console.log('❌ Erreur de l\'API tous les événements:', organizedResponse.status, errorText);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testWithExistingUser();
