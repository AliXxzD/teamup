// Utility functions for handling MongoDB IDs consistently
import { Alert } from 'react-native';

/**
 * Get ID from MongoDB object (handles both _id and id)
 * @param {Object} obj - MongoDB object
 * @returns {string|null} - The ID or null if not found
 */
export const getId = (obj) => {
  if (!obj) return null;
  
  // MongoDB objects have _id
  if (obj._id) return obj._id.toString();
  
  // Some objects might have id
  if (obj.id) return obj.id.toString();
  
  // Fallback for string IDs
  if (typeof obj === 'string') return obj;
  
  return null;
};

/**
 * Get user ID from user object (handles nested user objects)
 * @param {Object} userObj - User object (can be nested in participant.user)
 * @returns {string|null} - The user ID or null if not found
 */
export const getUserId = (userObj) => {
  if (!userObj) return null;
  
  // Nested user object (participant.user) - PRIORITÉ
  if (userObj.user) {
    return getId(userObj.user);
  }
  
  // Direct user object
  if (userObj._id || userObj.id) {
    return getId(userObj);
  }
  
  // Handle case where userObj itself might be an ID
  if (typeof userObj === 'string' && userObj.length === 24) {
    return userObj;
  }
  
  return null;
};

/**
 * Get organizer ID from event data
 * @param {Object} eventData - Event object
 * @returns {string|null} - The organizer ID or null if not found
 */
export const getOrganizerId = (eventData) => {
  if (!eventData?.organizer) return null;
  
  return getId(eventData.organizer);
};

/**
 * Get event ID from event data
 * @param {Object} eventData - Event object
 * @returns {string|null} - The event ID or null if not found
 */
export const getEventId = (eventData) => {
  if (!eventData) return null;
  
  return getId(eventData);
};

/**
 * Safe navigation helper - only navigate if ID exists
 * @param {Object} navigation - Navigation object
 * @param {string} route - Route name
 * @param {Object} params - Navigation parameters
 * @param {string} errorMessage - Error message if ID missing
 */
export const safeNavigate = (navigation, route, params, errorMessage = 'Navigation impossible') => {
  try {
    // Check if required ID exists
    if (params.userId && (!params.userId || params.userId === 'undefined' || params.userId === 'null')) {
      throw new Error('User ID manquant ou invalide');
    }
    
    console.log(`📍 Navigation sécurisée vers ${route}:`, params);
    navigation.navigate(route, params);
  } catch (error) {
    console.error(`❌ Erreur navigation vers ${route}:`, error);
    Alert.alert('Erreur', errorMessage);
  }
};
