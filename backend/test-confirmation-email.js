// Script de test rapide pour l'email de confirmation de changement de mot de passe
require('dotenv').config();
const emailService = require('./services/emailService');

async function testPasswordChangedEmail() {
  console.log('📧 Test Email de Confirmation - Mot de Passe Modifié\n');
  
  // Récupérer l'email de test depuis les arguments
  const testEmail = process.argv[2];
  const testName = process.argv[3] || 'Utilisateur Test';
  
  if (!testEmail) {
    console.log('❌ Usage: node test-confirmation-email.js email@test.com [nom]');
    console.log('   Exemple: node test-confirmation-email.js john@example.com "John Doe"');
    process.exit(1);
  }
  
  // Vérifier la configuration email
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Configuration email manquante !');
    console.log('   Assurez-vous que EMAIL_USER et EMAIL_PASSWORD sont configurés dans .env');
    process.exit(1);
  }
  
  console.log(`📤 Envoi de l'email de confirmation à: ${testEmail}`);
  console.log(`👤 Nom utilisateur: ${testName}`);
  console.log('');
  
  try {
    // Tester la connexion d'abord
    const isConnected = await emailService.testConnection();
    if (!isConnected) {
      console.log('❌ Impossible de se connecter au serveur email');
      process.exit(1);
    }
    console.log('✅ Connexion email valide');
    
    // Envoyer l'email de confirmation
    const result = await emailService.sendPasswordChangedConfirmation(testEmail, testName);
    
    console.log('✅ Email de confirmation envoyé avec succès !');
    console.log(`   MessageID: ${result.messageId}`);
    console.log('');
    console.log('📬 Vérifiez votre boîte de réception !');
    console.log('');
    console.log('🎨 L\'email contient :');
    console.log('   ✅ Icône de succès avec gradient vert');
    console.log('   📋 Détails de la modification (date, email, action)');
    console.log('   🚨 Alerte de sécurité si modification non autorisée');
    console.log('   🛡️ Conseils de sécurité');
    console.log('   📱 Design responsive et professionnel');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n🔑 Problème d\'authentification :');
      console.log('   - Vérifiez EMAIL_USER et EMAIL_PASSWORD');
      console.log('   - Assurez-vous d\'utiliser un mot de passe d\'application Gmail');
    }
  }
}

testPasswordChangedEmail(); 