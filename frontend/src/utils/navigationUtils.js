import { CommonActions } from '@react-navigation/native';

/**
 * Navigate to EventDetails from any screen
 * @param {Object} navigation - Navigation object
 * @param {string} eventId - Event ID
 */
export const navigateToEventDetails = (navigation, eventId) => {
  try {
    // Essayer d'abord de naviguer dans le navigateur actuel
    navigation.push('EventDetails', { eventId });
  } catch (error) {
    console.log('Navigation push failed, trying navigate...');
    try {
      // Si push échoue, essayer navigate
      navigation.navigate('EventDetailsModal', { eventId });
    } catch (navigateError) {
      console.log('Navigation navigate failed, trying root navigation...');
      // Si navigate échoue, essayer la navigation racine
      navigation.dispatch(
        CommonActions.navigate({
          name: 'EventDetails',
          params: { eventId }
        })
      );
    }
  }
};

/**
 * Navigate to UserProfile from any screen
 * @param {Object} navigation - Navigation object
 * @param {string} userId - User ID (optional)
 */
export const navigateToUserProfile = (navigation, userId = null) => {
  try {
    if (userId) {
      navigation.navigate('UserProfileModal', { userId });
    } else {
      navigation.navigate('UserProfileModal');
    }
  } catch (error) {
    console.log('Navigation to UserProfile failed:', error);
    // Fallback to root navigation
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfile',
        params: userId ? { userId } : {}
      })
    );
  }
};

/**
 * Navigate to CreateEvent from any screen
 * @param {Object} navigation - Navigation object
 */
export const navigateToCreateEvent = (navigation) => {
  try {
    navigation.navigate('CreateEventModal');
  } catch (error) {
    console.log('Navigation to CreateEvent failed:', error);
    // Fallback to root navigation
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CreateEventModal'
      })
    );
  }
};

/**
 * Navigate to Chat from any screen
 * @param {Object} navigation - Navigation object
 * @param {string} conversationId - Conversation ID (optional)
 */
export const navigateToChat = (navigation, conversationId = null) => {
  try {
    if (conversationId) {
      navigation.navigate('Chat', { conversationId });
    } else {
      navigation.navigate('Chat');
    }
  } catch (error) {
    console.log('Navigation to Chat failed:', error);
    // Fallback to root navigation
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Chat',
        params: conversationId ? { conversationId } : {}
      })
    );
  }
}; 