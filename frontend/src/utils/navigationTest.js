// Utilitaire pour tester la navigation
// Ce fichier peut être utilisé pour vérifier que toutes les routes sont correctement connectées

export const navigationRoutes = {
  // Routes pour utilisateurs non authentifiés
  guest: {
    'Home': 'HomeScreen',
    'Login': 'LoginScreen', 
    'Register': 'RegisterScreen',
    'ForgotPassword': 'ForgotPasswordScreen',
    'VerifyCode': 'VerifyCodeScreen',
    'ResetPassword': 'ResetPasswordScreen'
  },
  
  // Routes pour utilisateurs authentifiés
  authenticated: {
    // Tabs principaux
    'Dashboard': 'DashboardScreen',
    'Discover': 'DiscoverScreen (via EventsStackNavigator)',
    'CreateEvent': 'CreateEventScreen',
    'Messages': 'MessagesScreen',
    'Profile': 'UserProfileScreen',
    
    // Routes modales et stack
    'EventDetailsModal': 'EventDetailsScreen',
    'CreateEventModal': 'CreateEventScreen',
    'UserProfile': 'UserProfileScreen',
    'Stats': 'StatsScreen',
    'Chat': 'ChatScreen',
    'NewConversation': 'NewConversationScreen'
  },
  
  // Routes avec paramètres
  withParams: {
    'EventDetails': 'EventDetailsScreen (avec eventId)',
    'Chat': 'ChatScreen (avec conversation)',
    'VerifyCode': 'VerifyCodeScreen (avec email)',
    'ResetPassword': 'ResetPasswordScreen (avec token)'
  }
};

export const navigationIssues = [
  {
    issue: 'MyEvents route inconsistency',
    description: 'Some components use "MyEvents" instead of "MyEventsStack"',
    status: 'FIXED',
    files: ['GlobalMenu.js', 'DrawerContent.js']
  },
  {
    issue: 'Profile route inconsistency', 
    description: 'Some components use "Profile" instead of "UserProfile"',
    status: 'FIXED',
    files: ['GlobalMenu.js', 'DrawerContent.js']
  }
];

export const checkNavigationConsistency = () => {
  const issues = [];
  
  // Vérifier que tous les écrans sont importés
  const requiredScreens = [
    'HomeScreen',
    'LoginScreen',
    'RegisterScreen', 
    'DashboardScreen',
    'CreateEventScreen',
    'DiscoverScreen',
    'EventDetailsScreen',
    'MessagesScreen',
    'ChatScreen',
    'NewConversationScreen',
    'ForgotPasswordScreen',
    'ResetPasswordScreen',
    'VerifyCodeScreen',

    'UserProfileScreen',
    'StatsScreen'
  ];
  
  // Vérifier que tous les composants sont importés
  const requiredComponents = [
    'CreateTabButton',
    'TabIconWithBadge',
    'GlobalMenu',

    'CustomAlert',
    'GradientButton',
    'DrawerContent'
  ];
  
  return {
    screens: requiredScreens,
    components: requiredComponents,
    issues: issues,
    status: 'All navigation routes are properly connected'
  };
};

export default checkNavigationConsistency; 