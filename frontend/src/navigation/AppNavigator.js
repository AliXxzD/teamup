import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';

// Auth Context
import { useAuth } from '../contexts/AuthContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import NewConversationScreen from '../screens/NewConversationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';

import UserProfileScreen from '../screens/UserProfileScreen';
import StatsScreen from '../screens/StatsScreen';
import EventParticipantsScreen from '../screens/EventParticipantsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RankingScreen from '../screens/RankingScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UserReviewsScreen from '../screens/UserReviewsScreen';

// Custom Components
import CreateTabButton from '../components/CreateTabButton';
import TabIconWithBadge from '../components/TabIconWithBadge';
import CustomTabBar from '../components/CustomTabBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navigateur pour les utilisateurs non authentifiés
const GuestNavigator = () => (
  <Stack.Navigator 
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background }
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

  </Stack.Navigator>
);

// Placeholder pour les écrans non encore développés
const PlaceholderScreen = ({ navigation, route }) => {
  const screenName = route.name;
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <Ionicons name="construct" size={64} color={colors.primary} />
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center'
      }}>
        {screenName}
      </Text>
      <Text style={{
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22
      }}>
        Cette page sera bientôt disponible.
      </Text>
    </View>
  );
};

// Stack Navigator pour les événements
const EventsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background }
    }}
  >
    <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
    <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
    <Stack.Screen name="CreateEventFromDiscover" component={CreateEventScreen} />
  </Stack.Navigator>
);



// Navigateur pour les utilisateurs authentifiés
const AuthenticatedNavigator = () => {
  console.log('🔍 AuthenticatedNavigator - RENDU DU COMPOSANT');
  
  // Vérification de sécurité pour éviter l'erreur NavigationContainer
  try {
    return (
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ 
        tabBarLabel: 'Accueil',
      }}
    />
    <Tab.Screen 
      name="Discover" 
      component={EventsStackNavigator}
      options={{ 
        tabBarLabel: 'Découvrir',
      }}
    />
    <Tab.Screen 
      name="CreateEvent" 
      component={CreateEventScreen}
      options={{
        tabBarLabel: 'Créer',
      }}
    />
    <Tab.Screen 
      name="Messages" 
      component={MessagesScreen}
      options={{ 
        tabBarLabel: 'Messages',
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={UserProfileScreen}
      options={{ 
        tabBarLabel: 'Profil',
      }}
    />
  </Tab.Navigator>
    );
  } catch (error) {
    console.error('🔍 AuthenticatedNavigator - Erreur:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <Text style={{ color: '#e2e8f0' }}>Erreur de navigation</Text>
      </View>
    );
  }
};

// Écran de chargement
const LoadingScreen = () => (
  <View style={{
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <Ionicons name="football" size={64} color={colors.primary} />
    <Text style={{
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginTop: 16
    }}>
      TeamUp
    </Text>
    <Text style={{
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 8
    }}>
      Chargement...
    </Text>
  </View>
);

// Navigateur principal avec Stack pour gérer les modales et navigations spéciales
const RootStackNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Afficher l'écran de chargement pendant l'initialisation
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      {isAuthenticated ? (
        // Écrans pour utilisateurs authentifiés
        <>
          <Stack.Screen name="AuthenticatedApp" component={AuthenticatedNavigator} />
          <Stack.Screen 
            name="EventDetailsModal" 
            component={EventDetailsScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="UserProfileModal" 
            component={UserProfileScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="CreateEventModal" 
            component={CreateEventScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="UserReviews" 
            component={UserReviewsScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Stats" 
            component={StatsScreen}
            options={{
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="NewConversation" 
            component={NewConversationScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="EventParticipants" 
            component={EventParticipantsScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="About" 
            component={AboutScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Privacy" 
            component={PrivacyScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Terms" 
            component={TermsScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Ranking" 
            component={RankingScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
        </>
      ) : (
        // Écrans pour utilisateurs non authentifiés
        <Stack.Screen name="GuestApp" component={GuestNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Navigateur principal de l'application
const AppNavigator = () => {
  console.log('🔍 AppNavigator - RENDU DU COMPOSANT');
  
  return (
    <NavigationContainer
      onReady={() => {
        console.log('✅ NavigationContainer is ready');
        console.log('✅ NavigationContainer - Contexte de navigation disponible');
      }}
      onStateChange={(state) => {
        console.log('🔄 Navigation state changed:', state);
      }}
    >
      <RootStackNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator; 