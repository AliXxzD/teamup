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

// Custom Components
import CreateTabButton from '../components/CreateTabButton';
import TabIconWithBadge from '../components/TabIconWithBadge';

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
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          case 'Discover':
            iconName = focused ? 'search' : 'search-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          case 'CreateEvent':
            // Le bouton personnalisé sera géré différemment
            return null;
          case 'Messages':
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            return (
              <TabIconWithBadge 
                iconName={iconName} 
                size={size} 
                color={color}
                badgeCount={3}
                showBadge={true}
              />
            );
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          default:
            return <Ionicons name="circle" size={size} color={color} />;
        }
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopColor: colors.gray[800],
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingTop: 8,
        height: 80,
        shadowColor: colors.black,
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
      },
      headerShown: false,
    })}
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
        tabBarButton: ({ onPress }) => (
          <CreateTabButton onPress={onPress} />
        ),
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
            name="UserProfile" 
            component={UserProfileScreen}
            options={{
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