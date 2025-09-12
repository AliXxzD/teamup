// ========================================
// IMPORTS ET DÉPENDANCES
// ========================================

// React hooks pour la gestion d'état et les effets de cycle de vie
import React, { createContext, useContext, useState, useEffect } from 'react';
// AsyncStorage pour le stockage local persistant des données utilisateur
import AsyncStorage from '@react-native-async-storage/async-storage';
// Service Socket.io pour la communication temps réel
import socketService from '../services/socketService';
// URL de base de l'API backend
import { API_BASE_URL } from '../config/api';

// ========================================
// CRÉATION DU CONTEXTE D'AUTHENTIFICATION
// ========================================

// Création du contexte React pour partager l'état d'authentification dans toute l'app
const AuthContext = createContext({});

// Hook personnalisé pour utiliser le contexte d'authentification
// Vérifie que le hook est utilisé dans un composant enfant d'AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ========================================
// COMPOSANT PROVIDER D'AUTHENTIFICATION
// ========================================

// Composant Provider qui encapsule toute l'application et fournit le contexte d'auth
export const AuthProvider = ({ children }) => {
  // État de l'utilisateur connecté (null si non connecté)
  const [user, setUser] = useState(null);
  // État de chargement pour savoir si on vérifie encore l'authentification
  const [isLoading, setIsLoading] = useState(true);

  // Effet qui s'exécute au montage du composant pour vérifier l'état d'authentification
  useEffect(() => {
    checkAuthState();
  }, []);

  // ========================================
  // FONCTION DE VÉRIFICATION DE L'ÉTAT D'AUTHENTIFICATION
  // ========================================
  
  // Fonction qui vérifie si l'utilisateur est déjà connecté au démarrage de l'app
  const checkAuthState = async () => {
    try {
      // Récupérer les données stockées localement
      const userData = await AsyncStorage.getItem('user');           // Données utilisateur
      const accessToken = await AsyncStorage.getItem('accessToken'); // Token d'accès
      const tokenExpiry = await AsyncStorage.getItem('tokenExpiry'); // Date d'expiration
      const rememberMe = await AsyncStorage.getItem('rememberMe');   // Option "Se souvenir de moi"
      
      // Si on a des données utilisateur et un token
      if (userData && accessToken) {
        // Vérifier si le token a expiré en comparant avec l'heure actuelle
        if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
          console.log('Token expiré, tentative de rafraîchissement...');
          // Essayer de rafraîchir le token avec le refresh token
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            // Si le rafraîchissement échoue, déconnecter l'utilisateur
            await logout();
            setIsLoading(false);
            return;
          }
        }
        
        // Vérifier la validité du token en faisant une requête à l'API
        try {
          // Créer un AbortController pour gérer le timeout de la requête
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
          
          // Requête de vérification du token auprès de l'API
          const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`, // Envoyer le token dans l'en-tête
              'Content-Type': 'application/json',
            },
            signal: controller.signal // Utiliser le signal pour le timeout
          });
          
          clearTimeout(timeoutId);

          if (response.ok) {
            // Token valide, récupérer les données utilisateur mises à jour
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token invalide, nettoyer le stockage local
            await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
          }
        } catch (apiError) {
          // Si l'API n'est pas accessible, utiliser les données locales
          console.log('API non accessible, utilisation des données locales');
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      // Marquer la vérification comme terminée
      setIsLoading(false);
    }
  };

  // ========================================
  // FONCTION DE RAFRAÎCHISSEMENT DU TOKEN
  // ========================================
  
  // Fonction pour rafraîchir le token d'accès expiré en utilisant le refresh token
  const refreshToken = async () => {
    try {
      // Récupérer le refresh token stocké localement
      const refreshTokenValue = await AsyncStorage.getItem('refreshToken');
      
      // Si pas de refresh token, impossible de rafraîchir
      if (!refreshTokenValue) {
        return false;
      }

      // Créer un AbortController pour gérer le timeout de la requête
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes timeout

      // Requête de rafraîchissement du token auprès de l'API
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue // Envoyer le refresh token
        }),
        signal: controller.signal // Utiliser le signal pour le timeout
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        // Rafraîchissement réussi, récupérer les nouveaux tokens
        const data = await response.json();
        
        // Calculer la nouvelle date d'expiration en millisecondes
        const expiryDate = Date.now() + data.tokens.expiresIn;
        
        // Sauvegarder les nouveaux tokens dans le stockage local
        await AsyncStorage.multiSet([
          ['accessToken', data.tokens.accessToken],     // Nouveau token d'accès
          ['refreshToken', data.tokens.refreshToken],   // Nouveau refresh token
          ['tokenExpiry', expiryDate.toString()],       // Nouvelle date d'expiration
          ['rememberMe', data.rememberMe.toString()]    // Option "Se souvenir de moi"
        ]);
        
        console.log('✅ Token rafraîchi avec succès');
        return true;
      } else {
        console.log('❌ Échec du rafraîchissement du token');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      
      // Gestion spécifique du timeout
      if (error.name === 'AbortError') {
        console.log('Timeout lors du rafraîchissement du token');
      }
      
      return false;
    }
  };

  // ========================================
  // FONCTION DE CONNEXION
  // ========================================
  
  // Fonction pour connecter un utilisateur avec email et mot de passe
  const login = async (email, password, rememberMe = false) => {
    try {
      // Activer l'état de chargement pendant la connexion
      setIsLoading(true);
      
      // Créer un AbortController pour gérer le timeout de la requête
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout
      
      // Requête de connexion auprès de l'API
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,        // Email de l'utilisateur
          password,     // Mot de passe
          rememberMe    // Option "Se souvenir de moi" pour prolonger la session
        }),
        signal: controller.signal // Utiliser le signal pour le timeout
      });
      
      clearTimeout(timeoutId);

      // Parser la réponse JSON
      const data = await response.json();

      if (response.ok) {
        // Connexion réussie
        // Calculer la date d'expiration du token en millisecondes
        const expiryDate = Date.now() + data.tokens.expiresIn;
        
        // Stocker toutes les informations utilisateur et tokens dans le stockage local
        await AsyncStorage.multiSet([
          ['user', JSON.stringify(data.user)],           // Données utilisateur
          ['accessToken', data.tokens.accessToken],      // Token d'accès
          ['refreshToken', data.tokens.refreshToken],    // Refresh token
          ['tokenExpiry', expiryDate.toString()],        // Date d'expiration
          ['rememberMe', data.rememberMe.toString()],    // Option "Se souvenir de moi"
          ['sessionDuration', data.sessionInfo.duration] // Durée de la session
        ]);
        
        // Mettre à jour l'état utilisateur dans le contexte
        setUser(data.user);
        
        // Connecter Socket.io après la connexion réussie pour la messagerie temps réel
        setTimeout(async () => {
          try {
            // Déconnecter d'abord si déjà connecté (cas de reconnexion)
            if (socketService.isConnected) {
              socketService.disconnect();
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Établir la connexion Socket.io
            await socketService.connect();
            console.log('🔌 Socket.io connecté après login');
          } catch (socketError) {
            console.log('🔄 Socket.io: Reconnexion en cours...', socketError.message);
          }
        }, 1000); // Délai pour laisser le temps à l'UI de se mettre à jour
        
        console.log(`✅ Connexion réussie - Session: ${data.sessionInfo.duration}`);
        return { success: true, message: data.message };
      } else {
        // Connexion échouée, retourner l'erreur
        return { 
          success: false, 
          error: data.error || 'Erreur lors de la connexion',
          details: data.details 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Gestion spécifique du timeout
      if (error.name === 'AbortError') {
        return { 
          success: false, 
          error: 'Délai d\'attente dépassé. Vérifiez votre connexion internet.' 
        };
      }
      
      // Erreur de connexion générale
      return { 
        success: false, 
        error: 'Erreur de connexion au serveur. Vérifiez votre connexion internet.' 
      };
    } finally {
      // Désactiver l'état de chargement
      setIsLoading(false);
    }
  };

  // ========================================
  // FONCTION D'INSCRIPTION
  // ========================================
  
  // Fonction pour inscrire un nouvel utilisateur
  const register = async (email, password, confirmPassword, name, rememberMe = false) => {
    try {
      // Activer l'état de chargement pendant l'inscription
      setIsLoading(true);
      
      // ========================================
      // VALIDATION CÔTÉ CLIENT
      // ========================================
      
      // Vérifier que tous les champs requis sont remplis
      if (!email || !password || !name) {
        return { success: false, error: 'Tous les champs sont requis' };
      }
      
      // Vérifier que les mots de passe correspondent
      if (password !== confirmPassword) {
        return { success: false, error: 'Les mots de passe ne correspondent pas' };
      }
      
      // Vérifier la longueur minimale du mot de passe
      if (password.length < 6) {
        return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
      }
      
      // ========================================
      // REQUÊTE D'INSCRIPTION VERS L'API
      // ========================================
      
      // Créer un AbortController pour gérer le timeout de la requête
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout
      
      // Requête d'inscription auprès de l'API
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,            // Nom de l'utilisateur
          email,           // Email de l'utilisateur
          password,        // Mot de passe
          confirmPassword, // Confirmation du mot de passe
          rememberMe       // Option "Se souvenir de moi"
        }),
        signal: controller.signal // Utiliser le signal pour le timeout
      });
      
      clearTimeout(timeoutId);

      // Parser la réponse JSON
      const data = await response.json();

      if (response.ok) {
        // Inscription réussie
        // Calculer la date d'expiration du token en millisecondes
        const expiryDate = Date.now() + data.tokens.expiresIn;
        
        // Stocker toutes les informations utilisateur et tokens dans le stockage local
        await AsyncStorage.multiSet([
          ['user', JSON.stringify(data.user)],           // Données utilisateur
          ['accessToken', data.tokens.accessToken],      // Token d'accès
          ['refreshToken', data.tokens.refreshToken],    // Refresh token
          ['tokenExpiry', expiryDate.toString()],        // Date d'expiration
          ['rememberMe', data.rememberMe.toString()],    // Option "Se souvenir de moi"
          ['sessionDuration', data.sessionInfo.duration] // Durée de la session
        ]);
        
        // Mettre à jour l'état utilisateur dans le contexte
        setUser(data.user);
        
        // Connecter Socket.io après l'inscription réussie pour la messagerie temps réel
        setTimeout(async () => {
          try {
            // Déconnecter d'abord si déjà connecté
            if (socketService.isConnected) {
              socketService.disconnect();
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Établir la connexion Socket.io
            await socketService.connect();
            console.log('🔌 Socket.io connecté après inscription');
          } catch (socketError) {
            console.log('🔄 Socket.io: Connexion en cours...', socketError.message);
          }
        }, 1000);
        
        console.log(`✅ Inscription réussie - Session: ${data.sessionInfo.duration}`);
        return { success: true, message: data.message };
      } else {
        // Inscription échouée, retourner l'erreur
        return { 
          success: false, 
          error: data.error || 'Erreur lors de l\'inscription',
          details: data.details 
        };
      }
      
    } catch (error) {
      console.error('Register error:', error);
      
      if (error.name === 'AbortError') {
        return { 
          success: false, 
          error: 'Délai d\'attente dépassé. Vérifiez votre connexion internet.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Erreur de connexion au serveur. Vérifiez votre connexion internet.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // FONCTION DE DÉCONNEXION
  // ========================================
  
  // Fonction pour déconnecter l'utilisateur et nettoyer toutes les données
  const logout = async () => {
    try {
      // Récupérer les tokens pour la déconnexion côté serveur
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      // ========================================
      // DÉCONNEXION CÔTÉ SERVEUR
      // ========================================
      
      // Tenter de déconnecter via l'API pour invalider les tokens côté serveur
      if (accessToken) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`, // Envoyer le token d'accès
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refreshToken // Envoyer le refresh token pour l'invalidation
            })
          });
        } catch (apiError) {
          // Si l'API n'est pas accessible, continuer quand même la déconnexion locale
          console.log('Erreur API lors de la déconnexion:', apiError);
        }
      }
      
      // ========================================
      // DÉCONNEXION SOCKET.IO
      // ========================================
      
      // Déconnecter Socket.io pour arrêter la communication temps réel
      try {
        socketService.disconnect();
        console.log('🔌 Socket.io déconnecté lors du logout');
      } catch (socketError) {
        console.warn('⚠️ Erreur déconnexion Socket.io:', socketError.message);
      }
      
      // ========================================
      // NETTOYAGE DU STOCKAGE LOCAL
      // ========================================
      
      // Supprimer toutes les données d'authentification du stockage local
      await AsyncStorage.multiRemove([
        'user',             // Données utilisateur
        'accessToken',      // Token d'accès
        'refreshToken',     // Refresh token
        'tokenExpiry',      // Date d'expiration
        'rememberMe',       // Option "Se souvenir de moi"
        'sessionDuration'   // Durée de la session
      ]);
      
      // Réinitialiser l'état utilisateur dans le contexte
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ========================================
  // VALEUR DU CONTEXTE ET RENDU
  // ========================================
  
  // Objet contenant toutes les valeurs et fonctions à partager via le contexte
  const value = {
    user,                    // Données de l'utilisateur connecté (null si non connecté)
    setUser,                 // Fonction pour modifier l'état utilisateur
    isLoading,               // État de chargement (true pendant les requêtes d'auth)
    login,                   // Fonction de connexion
    register,                // Fonction d'inscription
    logout,                  // Fonction de déconnexion
    refreshToken,            // Fonction de rafraîchissement du token
    isAuthenticated: !!user  // Booléen indiquant si l'utilisateur est connecté
  };

  // Rendu du Provider avec toutes les valeurs du contexte
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 