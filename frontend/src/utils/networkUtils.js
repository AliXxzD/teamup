import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../config/api';

/**
 * Vérifie la connectivité réseau et l'état du serveur
 */
export const checkNetworkStatus = async () => {
  const status = {
    serverReachable: false,
    tokenValid: false,
    apiUrl: API_BASE_URL,
    error: null
  };

  try {
    // Test 1: Vérifier si le serveur répond
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });

    status.serverReachable = response.status !== 404;

    // Test 2: Vérifier le token
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      try {
        const tokenResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000
        });

        status.tokenValid = tokenResponse.ok;
      } catch (tokenError) {
        status.error = `Erreur token: ${tokenError.message}`;
      }
    }

  } catch (error) {
    status.error = `Erreur réseau: ${error.message}`;
  }

  return status;
};

/**
 * Teste un endpoint spécifique
 */
export const testEndpoint = async (endpoint, token = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      timeout: 10000
    });

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      url
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url
    };
  }
};

/**
 * Affiche les informations de débogage réseau
 */
export const logNetworkInfo = () => {
  console.log('🌐 Informations réseau:');
  console.log(`   - API_BASE_URL: ${API_BASE_URL}`);
  console.log(`   - EXPO_PUBLIC_API_URL: ${process.env.EXPO_PUBLIC_API_URL || 'Non défini'}`);
  console.log(`   - Environnement: ${process.env.NODE_ENV || 'development'}`);
  
  // Vérifier si on est sur un émulateur
  if (__DEV__) {
    console.log('   - Mode développement activé');
  }
};

/**
 * Génère un rapport de diagnostic réseau
 */
export const generateNetworkReport = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      apiUrl: API_BASE_URL,
      expoApiUrl: process.env.EXPO_PUBLIC_API_URL,
      nodeEnv: process.env.NODE_ENV,
      isDev: __DEV__
    },
    networkStatus: await checkNetworkStatus(),
    endpoints: {}
  };

  // Tester les endpoints principaux
  const token = await AsyncStorage.getItem('accessToken');
  
  const endpoints = [
    '/api/auth/verify',
    '/api/auth/profile',
    '/api/auth/profile/events/recent'
  ];

  for (const endpoint of endpoints) {
    report.endpoints[endpoint] = await testEndpoint(endpoint, token);
  }

  return report;
}; 