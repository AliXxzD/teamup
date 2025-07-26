// Script de test pour vérifier la configuration OAuth Google
require('dotenv').config();

function testOAuthConfiguration() {
  console.log('🔐 Test de Configuration OAuth Google\n');
  
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_CALLBACK_URL',
    'SESSION_SECRET',
    'JWT_SECRET'
  ];

  const missingVars = [];
  const warnings = [];

  console.log('📋 Vérification des variables d\'environnement :\n');

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
      console.log(`❌ ${varName}: MANQUANT`);
    } else {
      console.log(`✅ ${varName}: Configuré`);
      
      // Vérifications spécifiques
      if (varName === 'GOOGLE_CLIENT_ID' && !value.includes('.apps.googleusercontent.com')) {
        warnings.push('GOOGLE_CLIENT_ID ne semble pas être au bon format');
      }
      
      if (varName === 'GOOGLE_CALLBACK_URL' && !value.includes('/api/auth/google/callback')) {
        warnings.push('GOOGLE_CALLBACK_URL ne semble pas contenir le bon endpoint');
      }
      
      if (varName === 'SESSION_SECRET' && value.length < 32) {
        warnings.push('SESSION_SECRET devrait être plus long (32+ caractères)');
      }
    }
  });

  console.log('\n📊 Résumé :\n');

  if (missingVars.length === 0) {
    console.log('✅ Toutes les variables requises sont configurées !');
  } else {
    console.log(`❌ Variables manquantes (${missingVars.length}) :`);
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Avertissements :');
    warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }

  console.log('\n🔗 URLs de test :');
  console.log(`   OAuth initiation : ${process.env.API_BASE_URL || 'http://localhost:5000'}/api/auth/google`);
  console.log(`   Callback URL : ${process.env.GOOGLE_CALLBACK_URL || 'Non configuré'}`);
  console.log(`   Frontend redirect : ${process.env.FRONTEND_URL || 'http://localhost:19006'}/auth/success`);

  console.log('\n📚 Pour configurer Google OAuth :');
  console.log('   1. Allez sur https://console.cloud.google.com/');
  console.log('   2. Créez un projet ou sélectionnez un projet existant');
  console.log('   3. Activez l\'API Google+ ou People API');
  console.log('   4. Configurez l\'écran de consentement OAuth');
  console.log('   5. Créez des identifiants OAuth 2.0');
  console.log('   6. Ajoutez les URIs de redirection autorisés');

  if (missingVars.length === 0 && warnings.length === 0) {
    console.log('\n🎉 Configuration OAuth prête ! Vous pouvez tester en démarrant le serveur.');
    return true;
  } else {
    console.log('\n🔧 Veuillez corriger la configuration avant de continuer.');
    return false;
  }
}

// Affichage du guide de configuration .env
function showEnvExample() {
  console.log('\n📄 Exemple de fichier .env :');
  console.log('');
  console.log('# Google OAuth');
  console.log('GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com');
  console.log('GOOGLE_CLIENT_SECRET=ABC123-DefGhi456-JklMno789');
  console.log('GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback');
  console.log('');
  console.log('# Session & JWT');
  console.log('SESSION_SECRET=votre_session_secret_change_en_production');
  console.log('JWT_SECRET=votre_jwt_secret_change_en_production');
  console.log('');
  console.log('# URLs');
  console.log('FRONTEND_URL=http://localhost:19006');
  console.log('API_BASE_URL=http://localhost:5000');
  console.log('');
}

// Exécution du test
console.log('👋 Script de Test OAuth TeamUp');
console.log('===============================\n');

const isConfigured = testOAuthConfiguration();

if (!isConfigured) {
  showEnvExample();
}

console.log('\n💡 Pour plus d\'aide, consultez CONFIGURATION_GOOGLE_OAUTH.md');
console.log(''); 