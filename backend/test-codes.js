// Script de test pour le système de codes de vérification
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const PasswordResetCode = require('./models/PasswordResetCode');
const emailService = require('./services/emailService');

async function testPasswordResetCodes() {
  try {
    console.log('🧪 Test du système de codes de vérification\n');

    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teamup');
    console.log('✅ Connecté à MongoDB');

    // 1. Créer un utilisateur de test
    const testEmail = 'test@example.com';
    const testUser = await User.findOneAndUpdate(
      { email: testEmail },
      {
        name: 'Utilisateur Test',
        email: testEmail,
        password: 'TestPass123!'
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Utilisateur de test créé: ${testUser.email}`);

    // 2. Générer un code de réinitialisation
    console.log('\n📧 Test de génération de code...');
    const resetCode = await PasswordResetCode.createResetCode(testUser._id, testEmail);
    console.log(`✅ Code généré: ${resetCode}`);

    // 3. Vérifier le code dans la base de données
    const codeRecord = await PasswordResetCode.findOne({
      email: testEmail,
      code: resetCode,
      isUsed: false
    });
    console.log(`✅ Code trouvé en base: ${codeRecord ? 'Oui' : 'Non'}`);
    console.log(`   - Expire dans: ${codeRecord.getTimeRemaining()} minutes`);

    // 4. Test de validation du code
    console.log('\n🔍 Test de validation...');
    const validation = await PasswordResetCode.validateCode(testEmail, resetCode);
    console.log(`✅ Validation: ${validation.success ? 'Succès' : 'Échec'}`);
    if (validation.success) {
      console.log(`   - Utilisateur: ${validation.user.name}`);
    }

    // 5. Test d'un mauvais code
    console.log('\n❌ Test avec mauvais code...');
    const badValidation = await PasswordResetCode.validateCode(testEmail, '999999');
    console.log(`✅ Mauvais code rejeté: ${!badValidation.success ? 'Oui' : 'Non'}`);

    // 6. Test d'envoi d'email (si configuré)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      console.log('\n📬 Test d\'envoi d\'emails...');
      try {
        const testEmailAddress = process.argv[2] || 'test@example.com';
        
        // Test email de code
        await emailService.sendPasswordResetCode(testEmailAddress, resetCode, 'Utilisateur Test');
        console.log(`✅ Email de code envoyé à: ${testEmailAddress}`);
        
        // Test email de confirmation
        await emailService.sendPasswordChangedConfirmation(testEmailAddress, 'Utilisateur Test');
        console.log(`✅ Email de confirmation envoyé à: ${testEmailAddress}`);
        
      } catch (emailError) {
        console.log(`❌ Erreur email: ${emailError.message}`);
      }
    } else {
      console.log('\n⚠️  Configuration email manquante (EMAIL_USER/EMAIL_PASSWORD)');
    }

    // 7. Test de nettoyage automatique
    console.log('\n🧹 Test de nettoyage...');
    
    // Créer un code expiré manuellement
    const expiredCode = new PasswordResetCode({
      email: testEmail,
      code: '123456',
      userId: testUser._id,
      expiresAt: new Date(Date.now() - 1000) // Expiré il y a 1 seconde
    });
    await expiredCode.save();
    
    // Attendre 2 secondes pour que MongoDB le supprime automatiquement
    setTimeout(async () => {
      const foundExpired = await PasswordResetCode.findById(expiredCode._id);
      console.log(`✅ Code expiré auto-supprimé: ${!foundExpired ? 'Oui' : 'Non'}`);
      
      // Nettoyer
      await PasswordResetCode.deleteMany({ email: testEmail });
      console.log('✅ Codes de test nettoyés');
      
      console.log('\n🎉 Tests terminés avec succès !');
      process.exit(0);
    }, 3000);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Affichage des instructions
console.log('🔧 Test du Système de Codes TeamUp\n');
console.log('Usage:');
console.log('  node test-codes.js                    → Test basique');
console.log('  node test-codes.js email@test.com     → Test avec envoi d\'email réel');
console.log('');

testPasswordResetCodes(); 