// ========================================
// IMPORTS ET DÉPENDANCES
// ========================================

// React pour la création des composants
import React from 'react';
// Composants de base React Native pour l'interface utilisateur
import { View, Text } from 'react-native';
// NavigationContainer : conteneur principal de la navigation React Navigation
import { NavigationContainer } from '@react-navigation/native';
// createStackNavigator : pour créer des navigateurs en pile (écrans empilés)
import { createStackNavigator } from '@react-navigation/stack';
// createBottomTabNavigator : pour créer des onglets en bas d'écran
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Ionicons : bibliothèque d'icônes pour React Native
import { Ionicons } from '@expo/vector-icons';
// Couleurs globales de l'application
import { colors } from '../styles/globalStyles';

// ========================================
// IMPORTATION DU CONTEXTE D'AUTHENTIFICATION
// ========================================

// Hook pour accéder au contexte d'authentification
import { useAuth } from '../contexts/AuthContext';

// ========================================
// IMPORTATION DES ÉCRANS DE L'APPLICATION
// ========================================

// Écrans d'authentification (utilisateurs non connectés)
import HomeScreen from '../screens/HomeScreen';                    // Page d'accueil publique
import LoginScreen from '../screens/LoginScreen';                  // Connexion
import RegisterScreen from '../screens/RegisterScreen';            // Inscription
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'; // Mot de passe oublié
import ResetPasswordScreen from '../screens/ResetPasswordScreen';   // Réinitialisation mot de passe
import VerifyCodeScreen from '../screens/VerifyCodeScreen';         // Vérification code

// Écrans principaux (utilisateurs connectés)
import DashboardScreen from '../screens/DashboardScreen';          // Tableau de bord principal
import CreateEventScreen from '../screens/CreateEventScreen';      // Création d'événement
import DiscoverScreen from '../screens/DiscoverScreen';            // Découverte d'événements
import EventDetailsScreen from '../screens/EventDetailsScreen';    // Détails d'un événement
import EventParticipantsScreen from '../screens/EventParticipantsScreen'; // Participants d'un événement

// Écrans de messagerie
import MessagesScreen from '../screens/MessagesScreen';            // Liste des conversations
import ChatScreen from '../screens/ChatScreen';                    // Chat individuel
import NewConversationScreen from '../screens/NewConversationScreen'; // Nouvelle conversation

// Écrans de profil et paramètres
import UserProfileScreen from '../screens/UserProfileScreen';      // Profil utilisateur
import EditProfileScreen from '../screens/EditProfileScreen';      // Modification du profil
import UserReviewsScreen from '../screens/UserReviewsScreen';      // Avis sur l'utilisateur
import StatsScreen from '../screens/StatsScreen';                  // Statistiques
import SettingsScreen from '../screens/SettingsScreen';            // Paramètres
import AboutScreen from '../screens/AboutScreen';                  // À propos
import PrivacyScreen from '../screens/PrivacyScreen';              // Politique de confidentialité
import TermsScreen from '../screens/TermsScreen';                  // Conditions d'utilisation
import NotificationsScreen from '../screens/NotificationsScreen';  // Notifications
import RankingScreen from '../screens/RankingScreen';              // Classement

// ========================================
// IMPORTATION DES COMPOSANTS PERSONNALISÉS
// ========================================

// Composants personnalisés pour la navigation
import CreateTabButton from '../components/CreateTabButton';       // Bouton de création personnalisé
import TabIconWithBadge from '../components/TabIconWithBadge';     // Icône d'onglet avec badge
import CustomTabBar from '../components/CustomTabBar';             // Barre d'onglets personnalisée

// ========================================
// CRÉATION DES NAVIGATEURS
// ========================================

// Créer les instances des navigateurs
const Stack = createStackNavigator();  // Navigateur en pile pour les écrans empilés
const Tab = createBottomTabNavigator(); // Navigateur à onglets pour la navigation principale

// ========================================
// NAVIGATEUR POUR UTILISATEURS NON AUTHENTIFIÉS
// ========================================

// Navigateur pour les utilisateurs non connectés (invités)
// Affiche les écrans d'authentification et la page d'accueil publique
const GuestNavigator = () => (
  <Stack.Navigator 
    screenOptions={{
      headerShown: false,                                    // Masquer l'en-tête par défaut
      cardStyle: { backgroundColor: colors.background }     // Couleur de fond des écrans
    }}
  >
    {/* Page d'accueil publique - premier écran affiché */}
    <Stack.Screen name="Home" component={HomeScreen} />
    
    {/* Écrans d'authentification */}
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
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator; 