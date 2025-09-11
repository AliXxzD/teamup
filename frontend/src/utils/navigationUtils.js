import { CommonActions } from '@react-navigation/native';

/**
 * Safe navigation function that handles NavigationContainer errors
 * @param {Object} navigation - Navigation object
 * @param {string} routeName - Route name to navigate to
 * @param {Object} params - Navigation parameters
 */
export const safeNavigate = (navigation, routeName, params = {}, errorMessage = 'Navigation failed') => {
  console.log('🔍 safeNavigate - Début');
  console.log('🔍 safeNavigate - navigation:', !!navigation);
  console.log('🔍 safeNavigate - routeName:', routeName);
  console.log('🔍 safeNavigate - params:', params);
  
  try {
    if (!navigation) {
      console.warn('🔍 safeNavigate - Navigation object is null or undefined');
      return;
    }

    if (typeof navigation.navigate === 'function') {
      console.log('🔍 safeNavigate - Utilisation de navigation.navigate');
      navigation.navigate(routeName, params);
      console.log('🔍 safeNavigate - navigation.navigate réussi');
    } else if (typeof navigation.push === 'function') {
      console.log('🔍 safeNavigate - Utilisation de navigation.push');
      navigation.push(routeName, params);
      console.log('🔍 safeNavigate - navigation.push réussi');
    } else {
      console.warn('🔍 safeNavigate - Navigation methods not available');
    }
  } catch (error) {
    console.error(`🔍 safeNavigate - ${errorMessage}:`, error);
    // Fallback to CommonActions
    try {
      console.log('🔍 safeNavigate - Tentative CommonActions');
      navigation.dispatch(
        CommonActions.navigate({
          name: routeName,
          params: params
        })
      );
      console.log('🔍 safeNavigate - CommonActions réussi');
    } catch (dispatchError) {
      console.error('🔍 safeNavigate - CommonActions navigation also failed:', dispatchError);
    }
  }
};

/**
 * Navigate to EventDetails from any screen
 * @param {Object} navigation - Navigation object
 * @param {string} eventId - Event ID
 */
export const navigateToEventDetails = (navigation, eventId) => {
  safeNavigate(navigation, 'EventDetailsModal', { eventId }, 'Failed to navigate to event details');
};

/**
 * Navigate to UserProfile from any screen
 * @param {Object} navigation - Navigation object
 * @param {string} userId - User ID (optional)
 */
export const navigateToUserProfile = (navigation, userId = null) => {
  const params = userId ? { userId } : {};
  safeNavigate(navigation, 'UserProfileModal', params, 'Failed to navigate to user profile');
};

/**
 * Navigate to CreateEvent from any screen
 * @param {Object} navigation - Navigation object
 */
export const navigateToCreateEvent = (navigation) => {
  safeNavigate(navigation, 'CreateEventModal', {}, 'Failed to navigate to create event');
};

/**
 * Navigate to Chat from any screen
 * @param {Object} navigation - Navigation object
 * @param {string} conversationId - Conversation ID (optional)
 */
export const navigateToChat = (navigation, conversationId = null) => {
  const params = conversationId ? { conversationId } : {};
  safeNavigate(navigation, 'Chat', params, 'Failed to navigate to chat');
}; 