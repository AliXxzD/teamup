// Charger les variables d'environnement
require('dotenv').config();

const emailService = require('./services/emailService');

async function testEmailConfiguration() {
  console.log('🧪 Test de la configuration email...\n');

  try {
    // Test de la connexion
    console.log('1. Test de la connexion SMTP...');
    const isConnected = await emailService.testConnection();
    
    if (!isConnected) {
      console.log('❌ Configuration email invalide');
      console.log('\n📧 Instructions pour configurer Gmail :');
      console.log('1. Activez l\'authentification à 2 facteurs sur votre compte Gmail');
      console.log('2. Allez dans les paramètres de sécurité Google');
      console.log('3. Générez un "mot de passe d\'application"');
      console.log('4. Créez un fichier .env avec :');
      console.log('   EMAIL_USER=votre-email@gmail.com');
      console.log('   EMAIL_PASSWORD=votre-mot-de-passe-application');
      console.log('\n⚠️  N\'utilisez JAMAIS votre mot de passe Gmail normal !');
      return;
    }

    // Test d'envoi d'email si l'utilisateur est fourni
    const testEmail = process.argv[2];
    if (testEmail) {
      console.log(`2. Test d'envoi à ${testEmail}...`);
      
      // Test email de bienvenue
      await emailService.sendWelcomeEmail(testEmail, 'Utilisateur Test');
      console.log('✅ Email de bienvenue envoyé !');
      
      // Test email de réinitialisation
      const testToken = 'test-token-123';
      await emailService.sendPasswordResetEmail(testEmail, testToken, 'Utilisateur Test');
      console.log('✅ Email de réinitialisation envoyé !');
      
    } else {
      console.log('✅ Configuration email valide !');
      console.log('\n💡 Pour tester l\'envoi d\'emails :');
      console.log('   node test-email.js votre-email@exemple.com');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test :', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n🔑 Problème d\'authentification :');
      console.log('- Vérifiez que EMAIL_USER et EMAIL_PASSWORD sont corrects');
      console.log('- Assurez-vous d\'utiliser un mot de passe d\'application Gmail');
    } else if (error.message.includes('connection')) {
      console.log('\n🌐 Problème de connexion :');
      console.log('- Vérifiez votre connexion internet');
      console.log('- Vérifiez les paramètres SMTP');
    }
  }
}

// Variables d'environnement requises
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Variables d\'environnement manquantes :');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\n📝 Créez un fichier .env avec :');
  console.log('EMAIL_USER=votre-email@gmail.com');
  console.log('EMAIL_PASSWORD=votre-mot-de-passe-application');
  process.exit(1);
}

testEmailConfiguration(); 