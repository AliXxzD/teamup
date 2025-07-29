// Configuration centralisée de l'API pour TeamUp

// URL de base selon l'environnement
export const API_BASE_URL = (() => {
  // En développement (Expo Go)
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';
  }
  
  // En production (EAS Build)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // URL par défaut si aucune variable d'environnement n'est définie
  // Remplacez par votre URL Render une fois déployée
  return 'https://your-teamup-backend.onrender.com';
})();

// Configuration des timeouts
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 seconde
};

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_RESET_CODE: '/api/auth/verify-reset-code',
    PROFILE: '/api/auth/profile',
    GOOGLE: '/api/auth/google',
  },
  
  // Events
  EVENTS: {
    LIST: '/api/events',
    CREATE: '/api/events',
    DETAILS: (id) => `/api/events/${id}`,
    JOIN: (id) => `/api/events/${id}/join`,
    LEAVE: (id) => `/api/events/${id}/leave`,
    MY_ORGANIZED: '/api/events/my/organized',
    MY_JOINED: '/api/events/my/joined',
  },
  
  // Messages
  MESSAGES: {
    CONVERSATIONS: '/api/messages/conversations',
    CONVERSATION_DETAILS: (id) => `/api/messages/conversations/${id}`,
    CONVERSATION_MESSAGES: (id) => `/api/messages/conversations/${id}/messages`,
    SEND_MESSAGE: (id) => `/api/messages/conversations/${id}/messages`,
    USERS: '/api/messages/users',
  },
  
  // Health
  HEALTH: '/api/health',
};

// Helper pour construire l'URL complète
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper pour les headers d'authentification
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// Configuration pour le développement
if (__DEV__) {
  console.log('🔧 TeamUp API Configuration:');
  console.log(`   Environment: ${__DEV__ ? 'Development' : 'Production'}`);
  console.log(`   API Base URL: ${API_BASE_URL}`);
  console.log(`   Timeout: ${API_CONFIG.TIMEOUT}ms`);
}

export default {
  API_BASE_URL,
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
  getAuthHeaders,
}; 