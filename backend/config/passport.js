const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configuration de la stratégie Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Tentative de connexion Google:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });

    // Vérifier si l'utilisateur existe déjà avec cet ID Google
    let existingUser = await User.findOne({ 
      'oauth.google.id': profile.id 
    });

    if (existingUser) {
      console.log('✅ Utilisateur Google existant trouvé:', existingUser.email);
      
      // Mettre à jour les informations si nécessaire
      existingUser.oauth.google.accessToken = accessToken;
      existingUser.oauth.google.profile = {
        id: profile.id,
        displayName: profile.displayName,
        photos: profile.photos || [],
        emails: profile.emails || []
      };
      await existingUser.save();
      
      return done(null, existingUser);
    }

    // Vérifier si un utilisateur existe avec la même adresse email
    const emailUser = await User.findByEmail(profile.emails?.[0]?.value);
    
    if (emailUser) {
      console.log('🔗 Liaison compte existant avec Google:', emailUser.email);
      
      // Lier le compte Google au compte existant
      emailUser.oauth.google = {
        id: profile.id,
        accessToken: accessToken,
        profile: {
          id: profile.id,
          displayName: profile.displayName,
          photos: profile.photos || [],
          emails: profile.emails || []
        }
      };
      await emailUser.save();
      
      return done(null, emailUser);
    }

    // Créer un nouvel utilisateur
    console.log('🆕 Création nouvel utilisateur Google');
    
    const newUser = new User({
      name: profile.displayName || 'Utilisateur Google',
      email: profile.emails?.[0]?.value || `google.${profile.id}@teamup.local`,
      username: profile.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now().toString().slice(-4),
      // Pas de mot de passe pour les utilisateurs OAuth
      password: null,
      isEmailVerified: true, // Email vérifié par Google
      oauth: {
        google: {
          id: profile.id,
          accessToken: accessToken,
          profile: {
            id: profile.id,
            displayName: profile.displayName,
            photos: profile.photos || [],
            emails: profile.emails || []
          }
        }
      },
      profile: {
        avatar: profile.photos?.[0]?.value || null,
        stats: {
          registrationDate: new Date()
        }
      }
    });

    await newUser.save();
    console.log('✅ Nouvel utilisateur Google créé:', newUser.email);

    // Envoyer email de bienvenue (optionnel)
    try {
      const emailService = require('../services/emailService');
      emailService.sendWelcomeEmail(newUser.email, newUser.name)
        .then(() => console.log(`✅ Email de bienvenue envoyé à ${newUser.email}`))
        .catch(error => console.error('❌ Erreur envoi email bienvenue:', error));
    } catch (error) {
      console.error('Email service non disponible:', error.message);
    }

    return done(null, newUser);

  } catch (error) {
    console.error('❌ Erreur lors de l\'authentification Google:', error);
    return done(error, null);
  }
}));

// Sérialisation pour les sessions
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 