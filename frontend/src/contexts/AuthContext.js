import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketService from '../services/socketService';

// Configuration de l'API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const tokenExpiry = await AsyncStorage.getItem('tokenExpiry');
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      
      if (userData && accessToken) {
        // Vérifier si le token a expiré
        if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
          console.log('Token expiré, tentative de rafraîchissement...');
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            await logout();
            setIsLoading(false);
            return;
          }
        }
        // Vérifier la validité du token avec l'API
        try {
          // Créer un AbortController pour gérer le timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
          
          const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token invalide, nettoyer le stockage
            await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
          }
        } catch (apiError) {
          console.log('API non accessible, utilisation des données locales');
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshTokenValue) {
        return false;
      }

      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes timeout

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        // Calculer la nouvelle date d'expiration
        const expiryDate = Date.now() + data.tokens.expiresIn;
        
        // Sauvegarder les nouveaux tokens
        await AsyncStorage.multiSet([
          ['accessToken', data.tokens.accessToken],
          ['refreshToken', data.tokens.refreshToken],
          ['tokenExpiry', expiryDate.toString()],
          ['rememberMe', data.rememberMe.toString()]
        ]);
        
        console.log('✅ Token rafraîchi avec succès');
        return true;
      } else {
        console.log('❌ Échec du rafraîchissement du token');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      
      if (error.name === 'AbortError') {
        console.log('Timeout lors du rafraîchissement du token');
      }
      
      return false;
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      setIsLoading(true);
      
      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        // Calculer la date d'expiration
        const expiryDate = Date.now() + data.tokens.expiresIn;
        
        // Stocker les informations utilisateur et les tokens
        await AsyncStorage.multiSet([
          ['user', JSON.stringify(data.user)],
          ['accessToken', data.tokens.accessToken],
          ['refreshToken', data.tokens.refreshToken],
          ['tokenExpiry', expiryDate.toString()],
          ['rememberMe', data.rememberMe.toString()],
          ['sessionDuration', data.sessionInfo.duration]
        ]);
        
        setUser(data.user);
        
        // Connecter Socket.io après la connexion réussie
        setTimeout(async () => {
          try {
            // Déconnecter d'abord si déjà connecté (cas de reconnexion)
            if (socketService.isConnected) {
              socketService.disconnect();
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            await socketService.connect();
            console.log('🔌 Socket.io connecté après login');
          } catch (socketError) {
            console.log('🔄 Socket.io: Reconnexion en cours...', socketError.message);
          }
        }, 1000); // Délai pour laisser le temps à l'UI de se mettre à jour
        
        console.log(`✅ Connexion réussie - Session: ${data.sessionInfo.duration}`);
        return { success: true, message: data.message };
      } else {
        return { 
          success: false, 
          error: data.error || 'Erreur lors de la connexion',
          details: data.details 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
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

  const register = async (email, password, confirmPassword, name, rememberMe = false) => {
    try {
      setIsLoading(true);
      
      // Validation basique côté client
      if (!email || !password || !name) {
        return { success: false, error: 'Tous les champs sont requis' };
      }
      
      if (password !== confirmPassword) {
        return { success: false, error: 'Les mots de passe ne correspondent pas' };
      }
      
      if (password.length < 6) {
        return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
      }
      
      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          rememberMe
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        // Calculer la date d'expiration
        const expiryDate = Date.now() + data.tokens.expiresIn;
        
        // Stocker les informations utilisateur et les tokens
        await AsyncStorage.multiSet([
          ['user', JSON.stringify(data.user)],
          ['accessToken', data.tokens.accessToken],
          ['refreshToken', data.tokens.refreshToken],
          ['tokenExpiry', expiryDate.toString()],
          ['rememberMe', data.rememberMe.toString()],
          ['sessionDuration', data.sessionInfo.duration]
        ]);
        
        setUser(data.user);
        
        // Connecter Socket.io après l'inscription réussie
        setTimeout(async () => {
          try {
            // Déconnecter d'abord si déjà connecté
            if (socketService.isConnected) {
              socketService.disconnect();
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            await socketService.connect();
            console.log('🔌 Socket.io connecté après inscription');
          } catch (socketError) {
            console.log('🔄 Socket.io: Connexion en cours...', socketError.message);
          }
        }, 1000);
        
        console.log(`✅ Inscription réussie - Session: ${data.sessionInfo.duration}`);
        return { success: true, message: data.message };
      } else {
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

  const logout = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      // Tenter de déconnecter via l'API
      if (accessToken) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refreshToken
            })
          });
        } catch (apiError) {
          console.log('Erreur API lors de la déconnexion:', apiError);
        }
      }
      
      // Déconnecter Socket.io
      try {
        socketService.disconnect();
        console.log('🔌 Socket.io déconnecté lors du logout');
      } catch (socketError) {
        console.warn('⚠️ Erreur déconnexion Socket.io:', socketError.message);
      }
      
      // Nettoyer le stockage local
      await AsyncStorage.multiRemove([
        'user', 
        'accessToken', 
        'refreshToken', 
        'tokenExpiry', 
        'rememberMe', 
        'sessionDuration'
      ]);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 