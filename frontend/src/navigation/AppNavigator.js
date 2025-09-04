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
import MyEventsScreen from '../screens/MyEventsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import NewConversationScreen from '../screens/NewConversationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';

import UserProfileScreen from '../screens/UserProfileScreen';
import StatsScreen from '../screens/StatsScreen';
import EventParticipantsScreen from '../screens/EventParticipantsScreen';

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
    <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
  </Stack.Navigator>
);

// Stack Navigator pour Mes Événements
const MyEventsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background }
    }}
  >
    <Stack.Screen name="MyEventsMain" component={MyEventsScreen} />
    <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
    <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
  </Stack.Navigator>
);

// Navigateur pour les utilisateurs authentifiés
const AuthenticatedNavigator = () => (
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

// Navigateur principal avec Stack pour gérer les modales et navigations spéciales
const RootStackNavigator = () => {
  const { isAuthenticated } = useAuth();

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
            name="EventDetails" 
            component={EventDetailsScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="EventDetailsModal" 
            component={EventDetailsScreen}
            options={{
              presentation: 'modal',
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
            name="Stats" 
            component={StatsScreen}
            options={{
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="MyEventsStack" 
            component={MyEventsStackNavigator}
            options={{
              presentation: 'card',
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
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator; 