// Utilitaires pour les requêtes API avec gestion des timeouts et retry

const DEFAULT_TIMEOUT = 30000; // 30 secondes
const DEFAULT_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 seconde

/**
 * Effectue une requête fetch avec timeout et retry
 * @param {string} url - URL de la requête
 * @param {Object} options - Options de la requête
 * @param {number} timeout - Timeout en millisecondes
 * @param {number} retryAttempts - Nombre de tentatives
 * @returns {Promise<Response>}
 */
export const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT, retryAttempts = DEFAULT_RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      lastError = error;
      console.log(`Tentative ${attempt}/${retryAttempts} échouée:`, error.message);
      
      if (attempt < retryAttempts) {
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
  
  throw lastError;
};

/**
 * Effectue une requête API avec gestion d'erreur améliorée
 * @param {string} endpoint - Endpoint de l'API
 * @param {Object} options - Options de la requête
 * @param {string} baseUrl - URL de base de l'API
 * @returns {Promise<Object>}
 */
export const apiRequest = async (endpoint, options = {}, baseUrl = null) => {
  try {
    const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
    const response = await fetchWithTimeout(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Délai d\'attente dépassé. Vérifiez votre connexion internet.');
    }
    throw error;
  }
};

/**
 * Configuration par défaut pour les requêtes d'authentification
 */
export const authRequestConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes pour l'auth
  retryAttempts: 2 // Moins de retry pour l'auth
};

/**
 * Configuration par défaut pour les requêtes générales
 */
export const defaultRequestConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 secondes pour les requêtes générales
  retryAttempts: 3
}; 