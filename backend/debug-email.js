// Script de diagnostic pour la configuration email
require('dotenv').config();

console.log('🔍 Diagnostic Configuration Email TeamUp\n');

// 1. Vérifier les variables d'environnement
console.log('1. Variables d\'environnement :');
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Définie' : '❌ Manquante'}`);
console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Définie' : '❌ Manquante'}`);

if (process.env.EMAIL_USER) {
  console.log(`   EMAIL_USER (masqué): ${process.env.EMAIL_USER.replace(/(.{2}).*(@.*)/, '$1***$2')}`);
}

if (process.env.EMAIL_PASSWORD) {
  const pwd = process.env.EMAIL_PASSWORD;
  console.log(`   EMAIL_PASSWORD longueur: ${pwd.length} caractères`);
  console.log(`   EMAIL_PASSWORD format: ${pwd.includes(' ') ? '⚠️ Contient des espaces' : '✅ Pas d\'espaces'}`);
  console.log(`   EMAIL_PASSWORD début/fin: ${pwd.substring(0, 4)}***${pwd.substring(pwd.length - 4)}`);
}

console.log('');

// 2. Vérifications spécifiques Gmail
console.log('2. Vérifications Gmail :');

if (process.env.EMAIL_USER) {
  const email = process.env.EMAIL_USER;
  console.log(`   ✅ Format email: ${email.includes('@gmail.com') ? 'Gmail détecté' : '⚠️ Non-Gmail'}`);
} else {
  console.log('   ❌ EMAIL_USER non définie');
}

if (process.env.EMAIL_PASSWORD) {
  const pwd = process.env.EMAIL_PASSWORD;
  
  // Vérifications du mot de passe d'application Gmail
  const isGmailAppPassword = pwd.length === 16 && pwd.match(/^[a-z]+$/);
  const hasSpaces = pwd.includes(' ');
  const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(pwd);
  
  console.log(`   Format mot de passe d'app: ${isGmailAppPassword ? '✅ Format correct (16 lettres)' : '⚠️ Format inhabituel'}`);
  console.log(`   Espaces: ${hasSpaces ? '⚠️ Contient des espaces (à supprimer)' : '✅ Aucun espace'}`);
  console.log(`   Caractères spéciaux: ${hasSpecialChars ? '⚠️ Présents' : '✅ Aucun'}`);
} else {
  console.log('   ❌ EMAIL_PASSWORD non définie');
}

console.log('');

// 3. Test de configuration Nodemailer
console.log('3. Test de configuration :');

try {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  console.log('   ✅ Configuration Nodemailer créée');
  
  // Test de vérification (sans envoyer d'email)
  transporter.verify((error, success) => {
    if (error) {
      console.log('   ❌ Échec de vérification:', error.message);
      
      // Diagnostic des erreurs courantes
      if (error.message.includes('Username and Password not accepted')) {
        console.log('\n🔧 Solutions possibles :');
        console.log('   1. Vérifiez que l\'authentification 2FA est ACTIVÉE sur Gmail');
        console.log('   2. Regénérez un nouveau mot de passe d\'application');
        console.log('   3. Supprimez tous les espaces du mot de passe');
        console.log('   4. Vérifiez que l\'email est correct');
        
        if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.includes(' ')) {
          console.log('\n⚠️  PROBLÈME DÉTECTÉ: Votre mot de passe contient des espaces !');
          console.log('   Solution: Supprimez tous les espaces dans EMAIL_PASSWORD');
          const cleanPassword = process.env.EMAIL_PASSWORD.replace(/\s/g, '');
          console.log(`   Exemple: EMAIL_PASSWORD=${cleanPassword}`);
        }
      }
    } else {
      console.log('   ✅ Configuration valide ! Les emails peuvent être envoyés.');
    }
  });
  
} catch (error) {
  console.log('   ❌ Erreur de configuration:', error.message);
}

// 4. Instructions de correction
console.log('\n4. Instructions step-by-step :');
console.log('   a) Allez sur myaccount.google.com');
console.log('   b) Sécurité → Validation en 2 étapes (OBLIGATOIRE)');
console.log('   c) Sécurité → Mots de passe des applications');
console.log('   d) Sélectionnez "Autre" → Tapez "TeamUp"');
console.log('   e) Copiez le mot de passe généré (16 lettres, SANS espaces)');
console.log('   f) Mettez à jour votre .env :');
console.log('      EMAIL_USER=votre-email@gmail.com');
console.log('      EMAIL_PASSWORD=abcdefghijklmnop  ← 16 lettres collées');

console.log('\n💡 Conseil: Après modification du .env, redémarrez le serveur !');
console.log('🧪 Test rapide: node debug-email.js'); 