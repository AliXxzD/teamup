// Script de test pour la fonctionnalité "Se souvenir de moi"
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'teamup_secret_key_change_in_production';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

async function testRememberMeFeature() {
  console.log('🔐 Test de la fonctionnalité "Se souvenir de moi"\n');

  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teamup');
    console.log('✅ Connecté à MongoDB');

    // 1. Créer un utilisateur de test
    const testEmail = 'test-remember@example.com';
    await User.deleteOne({ email: testEmail }); // Nettoyer s'il existe

    const testUser = new User({
      name: 'Test RememberMe',
      email: testEmail,
      password: 'TestPass123!',
      isEmailVerified: true
    });
    await testUser.save();
    console.log(`✅ Utilisateur de test créé: ${testUser.email}`);

    // 2. Test connexion SANS "Se souvenir de moi"
    console.log('\n📱 Test connexion STANDARD...');
    const standardLogin = await testLogin(testEmail, 'TestPass123!', false);
    
    if (standardLogin.success) {
      console.log('✅ Connexion standard réussie');
      console.log(`   - Durée access token: ${getTokenDuration(standardLogin.accessToken)}`);
      console.log(`   - Durée refresh token: ${getTokenDuration(standardLogin.refreshToken)}`);
      console.log(`   - RememberMe: ${standardLogin.rememberMe}`);
      console.log(`   - Durée session: ${standardLogin.sessionInfo?.duration || 'Non défini'}`);
    } else {
      console.log('❌ Échec connexion standard:', standardLogin.error);
    }

    // 3. Test connexion AVEC "Se souvenir de moi"
    console.log('\n🔒 Test connexion avec "SE SOUVENIR DE MOI"...');
    const rememberLogin = await testLogin(testEmail, 'TestPass123!', true);
    
    if (rememberLogin.success) {
      console.log('✅ Connexion "Se souvenir de moi" réussie');
      console.log(`   - Durée access token: ${getTokenDuration(rememberLogin.accessToken)}`);
      console.log(`   - Durée refresh token: ${getTokenDuration(rememberLogin.refreshToken)}`);
      console.log(`   - RememberMe: ${rememberLogin.rememberMe}`);
      console.log(`   - Durée session: ${rememberLogin.sessionInfo?.duration || 'Non défini'}`);
      console.log(`   - Auto-refresh: ${rememberLogin.sessionInfo?.autoRefresh || 'Non défini'}`);
    } else {
      console.log('❌ Échec connexion "Se souvenir de moi":', rememberLogin.error);
    }

    // 4. Test refresh token avec rememberMe
    if (rememberLogin.success) {
      console.log('\n🔄 Test refresh token avec rememberMe...');
      const refreshResult = await testRefresh(rememberLogin.refreshToken);
      
      if (refreshResult.success) {
        console.log('✅ Refresh token réussi');
        console.log(`   - Nouveau access token: ${getTokenDuration(refreshResult.accessToken)}`);
        console.log(`   - RememberMe préservé: ${refreshResult.rememberMe}`);
        console.log(`   - Durée session: ${refreshResult.sessionInfo?.duration || 'Non défini'}`);
      } else {
        console.log('❌ Échec refresh token:', refreshResult.error);
      }
    }

    // 5. Test inscription avec rememberMe
    console.log('\n📝 Test inscription avec "Se souvenir de moi"...');
    const registerEmail = 'test-register-remember@example.com';
    await User.deleteOne({ email: registerEmail }); // Nettoyer s'il existe

    const registerResult = await testRegister(
      'Test Register',
      registerEmail,
      'TestPass123!',
      true
    );

    if (registerResult.success) {
      console.log('✅ Inscription avec "Se souvenir de moi" réussie');
      console.log(`   - Durée access token: ${getTokenDuration(registerResult.accessToken)}`);
      console.log(`   - RememberMe: ${registerResult.rememberMe}`);
      console.log(`   - Durée session: ${registerResult.sessionInfo?.duration || 'Non défini'}`);
    } else {
      console.log('❌ Échec inscription:', registerResult.error);
    }

    // 6. Comparaison des durées
    console.log('\n📊 Résumé des durées de session:');
    console.log('┌─────────────────────┬─────────────────┬─────────────────┐');
    console.log('│ Type                │ Access Token    │ Refresh Token   │');
    console.log('├─────────────────────┼─────────────────┼─────────────────┤');
    
    if (standardLogin.success) {
      console.log(`│ Standard            │ ${getTokenDuration(standardLogin.accessToken).padEnd(15)} │ ${getTokenDuration(standardLogin.refreshToken).padEnd(15)} │`);
    }
    
    if (rememberLogin.success) {
      console.log(`│ Se souvenir de moi  │ ${getTokenDuration(rememberLogin.accessToken).padEnd(15)} │ ${getTokenDuration(rememberLogin.refreshToken).padEnd(15)} │`);
    }
    
    console.log('└─────────────────────┴─────────────────┴─────────────────┘');

    // Nettoyage
    await User.deleteMany({ 
      email: { $in: [testEmail, registerEmail] } 
    });
    console.log('\n🧹 Utilisateurs de test supprimés');

    console.log('\n🎉 Tests terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

// Fonction pour tester la connexion
async function testLogin(email, password, rememberMe) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        rememberMe
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        expiresIn: data.tokens.expiresIn,
        rememberMe: data.rememberMe,
        sessionInfo: data.sessionInfo
      };
    } else {
      return {
        success: false,
        error: data.error,
        details: data.details
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erreur de connexion',
      details: error.message
    };
  }
}

// Fonction pour tester le refresh
async function testRefresh(refreshToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        rememberMe: data.rememberMe,
        sessionInfo: data.sessionInfo
      };
    } else {
      return {
        success: false,
        error: data.error,
        details: data.details
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erreur de refresh',
      details: error.message
    };
  }
}

// Fonction pour tester l'inscription
async function testRegister(name, email, password, rememberMe) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword: password,
        rememberMe
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        expiresIn: data.tokens.expiresIn,
        rememberMe: data.rememberMe,
        sessionInfo: data.sessionInfo
      };
    } else {
      return {
        success: false,
        error: data.error,
        details: data.details
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erreur d\'inscription',
      details: error.message
    };
  }
}

// Fonction utilitaire pour décoder la durée du token
function getTokenDuration(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return 'Indéfini';
    
    const now = Math.floor(Date.now() / 1000);
    const duration = decoded.exp - now;
    
    if (duration <= 0) return 'Expiré';
    
    const days = Math.floor(duration / (24 * 60 * 60));
    const hours = Math.floor((duration % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((duration % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days}j ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${Math.max(1, minutes)}m`;
    }
  } catch (error) {
    return 'Erreur';
  }
}

// Vérification du serveur
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Exécution du test
console.log('🧪 Test "Se souvenir de moi" - TeamUp');
console.log('===================================\n');

checkServer().then(isServerRunning => {
  if (!isServerRunning) {
    console.log('❌ Le serveur n\'est pas accessible.');
    console.log(`   Vérifiez que le serveur fonctionne sur ${API_BASE_URL}`);
    console.log('   Démarrez le serveur avec: npm start');
    return;
  }

  testRememberMeFeature();
}); 