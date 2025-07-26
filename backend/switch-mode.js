#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, 'routes');
const AUTH_FILE = path.join(ROUTES_DIR, 'auth.js');
const AUTH_TEMP_FILE = path.join(ROUTES_DIR, 'auth-temp.js');
const AUTH_ORIGINAL_FILE = path.join(ROUTES_DIR, 'auth-original.js');

function showHelp() {
  console.log(`
🔄 Script de Basculement - Mode Email TeamUp

Usage:
  node switch-mode.js test    → Active le mode test (liens dans les logs)
  node switch-mode.js email   → Active le mode email (envoi Gmail)
  node switch-mode.js status  → Affiche le mode actuel
  node switch-mode.js help    → Affiche cette aide

Modes disponibles:
  📧 EMAIL : Envoie de vrais emails (nécessite configuration Gmail)
  🧪 TEST  : Affiche les liens dans les logs du serveur
`);
}

function getCurrentMode() {
  try {
    const authContent = fs.readFileSync(AUTH_FILE, 'utf8');
    
    if (authContent.includes('MODE TEST') || authContent.includes('SOLUTION TEMPORAIRE')) {
      return 'TEST';
    } else if (authContent.includes('emailService.sendPasswordResetEmail')) {
      return 'EMAIL';
    } else {
      return 'UNKNOWN';
    }
  } catch (error) {
    return 'ERROR';
  }
}

function switchToTestMode() {
  try {
    // Sauvegarder l'actuel comme original si ce n'est pas déjà fait
    if (!fs.existsSync(AUTH_ORIGINAL_FILE)) {
      fs.copyFileSync(AUTH_FILE, AUTH_ORIGINAL_FILE);
      console.log('💾 Sauvegarde créée: auth-original.js');
    }
    
    // Vérifier que le fichier temp existe
    if (!fs.existsSync(AUTH_TEMP_FILE)) {
      console.log('❌ Erreur: auth-temp.js introuvable');
      console.log('   Assurez-vous que le fichier auth-temp.js existe');
      return false;
    }
    
    // Basculer vers le mode test
    fs.copyFileSync(AUTH_TEMP_FILE, AUTH_FILE);
    console.log('✅ Mode TEST activé !');
    console.log('');
    console.log('🧪 Comment tester :');
    console.log('1. Allez sur "Mot de passe oublié"');
    console.log('2. Entrez un email d\'utilisateur existant');
    console.log('3. Regardez les logs du serveur pour le lien');
    console.log('4. Copiez le lien dans votre navigateur');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors du basculement vers le mode test:', error.message);
    return false;
  }
}

function switchToEmailMode() {
  try {
    // Vérifier que le fichier original existe
    if (!fs.existsSync(AUTH_ORIGINAL_FILE)) {
      console.log('❌ Erreur: auth-original.js introuvable');
      console.log('   Impossible de restaurer le mode email');
      return false;
    }
    
    // Basculer vers le mode email
    fs.copyFileSync(AUTH_ORIGINAL_FILE, AUTH_FILE);
    console.log('✅ Mode EMAIL activé !');
    console.log('');
    console.log('📧 Configuration requise :');
    console.log('1. Créez le fichier .env avec EMAIL_USER et EMAIL_PASSWORD');
    console.log('2. Consultez GUIDE_GMAIL.md pour la configuration Gmail');
    console.log('3. Testez avec: node test-email.js votre-email@gmail.com');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors du basculement vers le mode email:', error.message);
    return false;
  }
}

function showStatus() {
  const mode = getCurrentMode();
  const modeEmoji = mode === 'TEST' ? '🧪' : mode === 'EMAIL' ? '📧' : '❓';
  
  console.log(`\n${modeEmoji} Mode actuel: ${mode}\n`);
  
  switch (mode) {
    case 'TEST':
      console.log('🧪 Mode TEST activé');
      console.log('   → Les liens de réinitialisation s\'affichent dans les logs');
      console.log('   → Aucune configuration email requise');
      console.log('   → Parfait pour le développement');
      break;
      
    case 'EMAIL':
      console.log('📧 Mode EMAIL activé');
      console.log('   → Les emails sont envoyés via Gmail');
      console.log('   → Configuration EMAIL_USER et EMAIL_PASSWORD requise');
      console.log('   → Solution professionnelle pour la production');
      break;
      
    case 'UNKNOWN':
      console.log('❓ Mode non reconnu');
      console.log('   → Le fichier auth.js pourrait être corrompu');
      break;
      
    case 'ERROR':
      console.log('❌ Impossible de lire le fichier auth.js');
      break;
  }
  
  console.log('\nFichiers disponibles:');
  console.log(`   auth.js: ${fs.existsSync(AUTH_FILE) ? '✅' : '❌'}`);
  console.log(`   auth-temp.js: ${fs.existsSync(AUTH_TEMP_FILE) ? '✅' : '❌'}`);
  console.log(`   auth-original.js: ${fs.existsSync(AUTH_ORIGINAL_FILE) ? '✅' : '❌'}`);
}

// Script principal
const command = process.argv[2];

console.log('🔄 TeamUp - Switch Mode Email\n');

switch (command) {
  case 'test':
    switchToTestMode();
    break;
    
  case 'email':
    switchToEmailMode();
    break;
    
  case 'status':
    showStatus();
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
    
  default:
    console.log('❌ Commande inconnue\n');
    showHelp();
    process.exit(1);
} 