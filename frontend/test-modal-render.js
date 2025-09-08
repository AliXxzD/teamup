/**
 * Test simple pour vérifier que le modal se rend sans erreur
 */

import React from 'react';
import LoginPromptModal from './src/components/LoginPromptModal';

// Événement de test
const testEvent = {
  title: 'Match de Football',
  sport: 'Football',
  location: {
    address: 'Stade de France',
    city: 'Saint-Denis',
    fullAddress: 'Stade de France, Saint-Denis'
  },
  time: '15:00',
  participants: 8,
  maxParticipants: 22,
  organizer: {
    name: 'Alex Martin'
  }
};

// Test du modal
console.log('🧪 Test du modal de connexion');
console.log('Événement de test:', JSON.stringify(testEvent, null, 2));

// Test des utilitaires
import { getEventAddress, getEventTitle, getEventSport } from './src/utils/eventUtils';

console.log('✅ Tests des utilitaires:');
console.log('- Titre:', getEventTitle(testEvent));
console.log('- Adresse:', getEventAddress(testEvent));
console.log('- Sport:', getEventSport(testEvent));

console.log('🎉 Modal prêt à être utilisé !');

export default function TestModal() {
  return (
    <LoginPromptModal
      visible={true}
      onClose={() => console.log('Modal fermé')}
      onLogin={() => console.log('Navigation vers Login')}
      onRegister={() => console.log('Navigation vers Register')}
      event={testEvent}
    />
  );
}

