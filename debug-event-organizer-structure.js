/**
 * Debug de la structure des données d'événement et organisateur
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function debugEventOrganizerStructure() {
  console.log('🔍 Debug de la structure des données d\'événement et organisateur');
  console.log('=' .repeat(70));

  try {
    // 1. Test de l'endpoint /api/events (liste)
    console.log('\n📋 Test GET /api/events (liste):');
    
    try {
      const eventsResponse = await axios.get(`${API_BASE_URL}/api/events`);
      
      if (eventsResponse.data.success && eventsResponse.data.data?.events?.length > 0) {
        const firstEvent = eventsResponse.data.data.events[0];
        console.log('✅ Structure événement dans la liste:');
        console.log('- ID:', firstEvent._id);
        console.log('- Titre:', firstEvent.title);
        console.log('- Organizer keys:', Object.keys(firstEvent.organizer || {}));
        console.log('- Organizer structure:', JSON.stringify(firstEvent.organizer, null, 2));
        
        // Test de l'endpoint détails avec cet événement
        const eventId = firstEvent._id;
        
        console.log(`\n📄 Test GET /api/events/${eventId} (détails):`);
        
        const detailResponse = await axios.get(`${API_BASE_URL}/api/events/${eventId}`);
        
        if (detailResponse.data.success) {
          const eventDetails = detailResponse.data.data;
          console.log('✅ Structure événement dans les détails:');
          console.log('- ID:', eventDetails._id);
          console.log('- Titre:', eventDetails.title);
          console.log('- Organizer keys:', Object.keys(eventDetails.organizer || {}));
          console.log('- Organizer structure:', JSON.stringify(eventDetails.organizer, null, 2));
          
          // Analyser la différence entre liste et détails
          console.log('\n🔍 Comparaison liste vs détails:');
          console.log('Liste organizer:', JSON.stringify(firstEvent.organizer, null, 2));
          console.log('Détails organizer:', JSON.stringify(eventDetails.organizer, null, 2));
          
          // Test des propriétés problématiques
          console.log('\n🧪 Test des propriétés:');
          console.log('- organizer._id:', eventDetails.organizer?._id);
          console.log('- organizer.id:', eventDetails.organizer?.id);
          console.log('- organizer.name:', eventDetails.organizer?.name);
          console.log('- organizer.type:', eventDetails.organizer?.type); // ← Propriété problématique ?
          
          // Simuler l'accès qui cause l'erreur
          console.log('\n⚠️ Test des accès potentiellement problématiques:');
          
          try {
            const testOrganizer = eventDetails.organizer;
            console.log('✅ eventDetails.organizer existe');
            
            if (testOrganizer) {
              console.log('✅ organizer est truthy');
              console.log('- Type de organizer:', typeof testOrganizer);
              console.log('- Est un objet:', testOrganizer && typeof testOrganizer === 'object');
              
              // Test accès aux propriétés
              console.log('- _id:', testOrganizer._id);
              console.log('- type:', testOrganizer.type); // ← Ça pourrait être le problème
              console.log('- name:', testOrganizer.name);
            } else {
              console.log('❌ organizer est falsy');
            }
          } catch (accessError) {
            console.log('❌ Erreur d\'accès aux propriétés:', accessError.message);
          }
          
        } else {
          console.log('❌ Erreur API détails:', detailResponse.data);
        }
        
      } else {
        console.log('❌ Pas d\'événements trouvés dans la liste');
      }
      
    } catch (apiError) {
      console.log('❌ Erreur API:', apiError.response?.data || apiError.message);
    }

    console.log('\n🎯 Recommandations:');
    console.log('1. Vérifier la structure de organizer dans l\'API');
    console.log('2. S\'assurer que organizer est populé correctement');
    console.log('3. Ajouter des vérifications pour organizer.type');
    console.log('4. Utiliser optional chaining (?.) partout');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Serveur accessible');
    return true;
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    return false;
  }
}

// Exécution
async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await debugEventOrganizerStructure();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

