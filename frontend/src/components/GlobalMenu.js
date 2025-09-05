import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const GlobalMenu = ({ navigation, currentRoute }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(500));
  const [floatAnim] = useState(new Animated.Value(0));
  const [headerSlideAnim] = useState(new Animated.Value(0));
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Vérifier si on est sur une page spéciale qui doit garder le bouton allumé
  const isSpecialPage = ['Home', 'Dashboard', 'Messages', 'Profile', 'Stats'].includes(currentRoute);

  const toggleMenu = () => {
    if (!menuVisible) {
      setMenuVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(floatAnim, {
          toValue: 1,
          tension: 120,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 500,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMenuVisible(false);
        // Remonter le header après fermeture du menu
        if (isNavigating) {
          Animated.timing(headerSlideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setIsNavigating(false));
        }
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Logging out...');
              await logout();
              setMenuVisible(false);
              console.log('✅ Logout successful');
              // Navigation will be handled automatically by AuthContext
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          }
        }
      ]
    );
  };

  const navigateToScreen = (screenName) => {
    try {
      console.log('🔍 Navigating to:', screenName);
      console.log('🔍 Navigation object:', navigation);
      
      // Animation pour faire descendre le header quand on clique sur une page
      setIsNavigating(true);
      Animated.timing(headerSlideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Close menu first with animation
      toggleMenu();
      
      // Use setTimeout to ensure menu is closed before navigation
      setTimeout(() => {
        try {
          if (isAuthenticated) {
            // Authenticated user navigation
            if (screenName === 'Profile') {
              console.log('📍 Navigating to Profile tab');
              navigation.navigate('Profile');
            } else if (screenName === 'MyEventsStack') {
              console.log('📍 Navigating to MyEventsStack');
              navigation.navigate('MyEventsStack');
            } else if (screenName === 'Stats') {
              console.log('📍 Navigating to Stats');
              navigation.navigate('Stats');
            } else if (screenName === 'Messages') {
              console.log('📍 Navigating to Messages tab');
              navigation.navigate('Messages');
            } else if (screenName === 'Settings') {
              Alert.alert('Info', 'Page des paramètres en cours de développement');
            } else if (screenName === 'Support') {
              Alert.alert('Support', 'Contactez-nous à support@teamup.com');
            } else if (screenName === 'Notifications') {
              Alert.alert('Notifications', 'Page des notifications en cours de développement');
            }
          } else {
            // Guest user navigation
            if (screenName === 'Login') {
              console.log('📍 Navigating to Login');
              navigation.navigate('Login');
            } else if (screenName === 'Register') {
              console.log('📍 Navigating to Register');
              navigation.navigate('Register');
            } else if (screenName === 'Home') {
              console.log('📍 Navigating to Home');
              navigation.navigate('Home');
            } else if (screenName === 'About') {
              Alert.alert('À propos', 'TeamUp - Connectez-vous avec d\'autres sportifs et organisez des événements sportifs ensemble!');
            } else if (screenName === 'Support') {
              Alert.alert('Support', 'Contactez-nous à support@teamup.com');
            }
          }
        } catch (navError) {
          console.error('❌ Navigation error in setTimeout:', navError);
          Alert.alert('Erreur de navigation', 'Impossible d\'accéder à cette page');
        }
      }, 300);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Erreur', 'Impossible de naviguer vers cette page');
    }
  };

  const menuItems = isAuthenticated ? [
    // Authenticated user menu items
    {
      title: 'Mon Profil',
      icon: 'person-outline',
      color: '#20B2AA',
      onPress: () => {
        navigateToScreen('Profile');
      }
    },
    {
      title: 'Mes Événements',
      icon: 'calendar-outline',
      color: '#10B981',
      onPress: () => {
        navigateToScreen('MyEventsStack');
      }
    },
    {
      title: 'Statistiques',
      icon: 'stats-chart-outline',
      color: '#3B82F6',
      onPress: () => {
        navigateToScreen('Stats');
      }
    },
    {
      title: 'Messages',
      icon: 'chatbubbles-outline',
      color: '#F59E0B',
      onPress: () => {
        navigateToScreen('Messages');
      }
    },
    {
      title: 'Paramètres',
      icon: 'settings-outline',
      color: '#64748b',
      onPress: () => {
        navigateToScreen('Settings');
      }
    },
    {
      title: 'Aide & Support',
      icon: 'help-circle-outline',
      color: '#8B5CF6',
      onPress: () => {
        navigateToScreen('Support');
      }
    }
  ] : [
    // Guest user menu items
    {
      title: 'Accueil',
      icon: 'home-outline',
      color: '#20B2AA',
      onPress: () => {
        navigateToScreen('Home');
      }
    },
    {
      title: 'Se connecter',
      icon: 'log-in-outline',
      color: '#10B981',
      onPress: () => {
        navigateToScreen('Login');
      }
    },
    {
      title: 'S\'inscrire',
      icon: 'person-add-outline',
      color: '#3B82F6',
      onPress: () => {
        navigateToScreen('Register');
      }
    },
    {
      title: 'À propos',
      icon: 'information-circle-outline',
      color: '#F59E0B',
      onPress: () => {
        navigateToScreen('About');
      }
    },
    {
      title: 'Aide & Support',
      icon: 'help-circle-outline',
      color: '#8B5CF6',
      onPress: () => {
        navigateToScreen('Support');
      }
    }
  ];

  return (
    <>
      {/* Menu Button */}
      <Animated.View
        style={{
          transform: [{
            translateY: headerSlideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 5]
            })
          }]
        }}
      >
        <TouchableOpacity
          className={`w-11 h-11 rounded-xl items-center justify-center ${
            menuVisible || isNavigating || isSpecialPage
              ? 'bg-cyan-500 border border-cyan-400' 
              : 'bg-slate-800 border border-slate-700/50'
          }`}
          onPress={toggleMenu}
          activeOpacity={0.8}
          style={{
            shadowColor: (menuVisible || isNavigating || isSpecialPage) ? '#06b6d4' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: (menuVisible || isNavigating || isSpecialPage) ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: (menuVisible || isNavigating || isSpecialPage) ? 6 : 2,
          }}
        >
          <Ionicons 
            name="menu" 
            size={20} 
            color="#ffffff"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Menu Modal */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="none"
        statusBarTranslucent
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <Animated.View
            className="absolute bottom-0 left-0 w-full h-full bg-slate-900"
            style={{
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim }
              ]
            }}
          >
            {/* Header */}
            <View className="px-6 pt-16 pb-8">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-2xl font-bold tracking-tight">Menu</Text>
                <TouchableOpacity 
                  className="w-10 h-10 bg-slate-800/50 rounded-xl items-center justify-center"
                  onPress={toggleMenu}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="close" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              {/* App Logo Section */}
              <View className="flex-row items-center mb-6">
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                    shadowColor: '#06b6d4',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="people" size={24} color="#ffffff" />
                </LinearGradient>
                <View>
                  <Text className="text-white text-xl font-bold tracking-tight">TEAMUP</Text>
                  <Text className="text-slate-400 text-sm">Connectez-vous au sport</Text>
                </View>
              </View>
            </View>

            {/* User Profile Section */}
            {isAuthenticated && (
              <View className="mx-6 mb-8">
                <View className="bg-teal-600 rounded-2xl p-4 flex-row items-center">
                  <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-3">
                    <Text className="text-teal-600 text-lg font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white text-lg font-bold">
                      {user?.name || 'Alex Martin'}
                    </Text>
                    <Text className="text-teal-200 text-sm">
                      Niveau 12 • {user?.points || '2,450'} pts
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <ScrollView className="flex-1 px-6">
              {/* Navigation Section */}
              <View className="mb-8">
                <Text className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wide">
                  NAVIGATION
                </Text>
                
                <View style={{ gap: 4 }}>
                  {/* Accueil - Only show for non-authenticated users */}
                  {!isAuthenticated && (
                    <TouchableOpacity
                      className={`rounded-2xl p-4 flex-row items-center ${
                        currentRoute === 'Home' 
                          ? 'bg-teal-600' 
                          : 'bg-slate-800'
                      }`}
                      onPress={() => navigateToScreen('Home')}
                    >
                      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                        currentRoute === 'Home' 
                          ? 'bg-white/20' 
                          : 'bg-slate-700'
                      }`}>
                        <Ionicons 
                          name="home" 
                          size={20} 
                          color={currentRoute === 'Home' ? "#ffffff" : "#64748b"} 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base font-medium">Accueil</Text>
                        <Text className={`text-sm ${
                          currentRoute === 'Home' 
                            ? 'text-teal-200' 
                            : 'text-slate-400'
                        }`}>Page d'accueil</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Dashboard - Only show for authenticated users */}
                  {isAuthenticated && (
                    <TouchableOpacity
                      className={`rounded-2xl p-4 flex-row items-center ${
                        currentRoute === 'Dashboard' 
                          ? 'bg-teal-600' 
                          : 'bg-slate-800'
                      }`}
                      onPress={() => navigateToScreen('Dashboard')}
                    >
                      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                        currentRoute === 'Dashboard' 
                          ? 'bg-white/20' 
                          : 'bg-slate-700'
                      }`}>
                        <Ionicons 
                          name="grid" 
                          size={20} 
                          color={currentRoute === 'Dashboard' ? "#ffffff" : "#64748b"} 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base font-medium">Dashboard</Text>
                        <Text className={`text-sm ${
                          currentRoute === 'Dashboard' 
                            ? 'text-teal-200' 
                            : 'text-slate-400'
                        }`}>Vos événements</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Messages - Only show for authenticated users */}
                  {isAuthenticated && (
                    <TouchableOpacity
                      className={`rounded-2xl p-4 flex-row items-center ${
                        currentRoute === 'Messages' 
                          ? 'bg-teal-600' 
                          : 'bg-slate-800'
                      }`}
                      onPress={() => navigateToScreen('Messages')}
                    >
                      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                        currentRoute === 'Messages' 
                          ? 'bg-white/20' 
                          : 'bg-slate-700'
                      }`}>
                        <Ionicons 
                          name="chatbubble" 
                          size={20} 
                          color={currentRoute === 'Messages' ? "#ffffff" : "#64748b"} 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base font-medium">Messages</Text>
                        <Text className={`text-sm ${
                          currentRoute === 'Messages' 
                            ? 'text-teal-200' 
                            : 'text-slate-400'
                        }`}>Conversations</Text>
                      </View>
                      <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-bold">3</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Profil - Only show for authenticated users */}
                  {isAuthenticated && (
                    <TouchableOpacity
                      className={`rounded-2xl p-4 flex-row items-center ${
                        currentRoute === 'Profile' 
                          ? 'bg-teal-600' 
                          : 'bg-slate-800'
                      }`}
                      onPress={() => navigateToScreen('Profile')}
                    >
                      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                        currentRoute === 'Profile' 
                          ? 'bg-white/20' 
                          : 'bg-slate-700'
                      }`}>
                        <Ionicons 
                          name="person" 
                          size={20} 
                          color={currentRoute === 'Profile' ? "#ffffff" : "#64748b"} 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base font-medium">Profil</Text>
                        <Text className={`text-sm ${
                          currentRoute === 'Profile' 
                            ? 'text-teal-200' 
                            : 'text-slate-400'
                        }`}>Mon profil</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Succès - Only show for authenticated users */}
                  {isAuthenticated && (
                    <TouchableOpacity
                      className={`rounded-2xl p-4 flex-row items-center ${
                        currentRoute === 'Stats' 
                          ? 'bg-teal-600' 
                          : 'bg-slate-800'
                      }`}
                      onPress={() => navigateToScreen('Stats')}
                    >
                      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                        currentRoute === 'Stats' 
                          ? 'bg-white/20' 
                          : 'bg-slate-700'
                      }`}>
                        <Ionicons 
                          name="trophy" 
                          size={20} 
                          color={currentRoute === 'Stats' ? "#ffffff" : "#f59e0b"} 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base font-medium">Succès</Text>
                        <Text className={`text-sm ${
                          currentRoute === 'Stats' 
                            ? 'text-teal-200' 
                            : 'text-slate-400'
                        }`}>Mes récompenses</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Account Section - Only show for non-authenticated users */}
              {!isAuthenticated && (
                <View className="mb-8">
                  <Text className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wide">
                    COMPTE
                  </Text>
                  
                  <View style={{ gap: 4 }}>
                    {/* Connexion */}
                    <TouchableOpacity
                      className="bg-slate-800 rounded-2xl p-4 flex-row items-center"
                      onPress={() => navigateToScreen('Login')}
                    >
                      <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="log-in" size={20} color="#22d3ee" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base font-medium">Connexion</Text>
                        <Text className="text-slate-400 text-sm">Se connecter</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Inscription */}
                    <TouchableOpacity
                      className="bg-slate-800 rounded-2xl p-4 flex-row items-center"
                      onPress={() => navigateToScreen('Register')}
                    >
                      <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="person-add" size={20} color="#64748b" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base font-medium">Inscription</Text>
                        <Text className="text-slate-400 text-sm">Créer un compte</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Parameters Section */}
              <View className="mb-8">
                <Text className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wide">
                  PARAMÈTRES
                </Text>
                
                <View style={{ gap: 4 }}>
                  {/* Notifications */}
                  <TouchableOpacity
                    className="bg-slate-800 rounded-2xl p-4 flex-row items-center"
                    onPress={() => navigateToScreen('Notifications')}
                  >
                    <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="notifications" size={20} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-base font-medium">Notifications</Text>
                      <Text className="text-slate-400 text-sm">Gérer les notifications</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Paramètres */}
                  <TouchableOpacity
                    className="bg-slate-800 rounded-2xl p-4 flex-row items-center"
                    onPress={() => navigateToScreen('Settings')}
                  >
                    <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="settings" size={20} color="#64748b" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-base font-medium">Paramètres</Text>
                      <Text className="text-slate-400 text-sm">Configuration</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Aide */}
                  <TouchableOpacity
                    className="bg-slate-800 rounded-2xl p-4 flex-row items-center"
                    onPress={() => navigateToScreen('Support')}
                  >
                    <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="help-circle" size={20} color="#8b5cf6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-base font-medium">Aide</Text>
                      <Text className="text-slate-400 text-sm">Support et FAQ</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Déconnexion - Only show when authenticated */}
                  {isAuthenticated && (
                    <TouchableOpacity
                      className="bg-slate-800 rounded-2xl p-4 flex-row items-center"
                      onPress={handleLogout}
                    >
                      <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="log-out" size={20} color="#ef4444" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base font-medium">Déconnexion</Text>
                        <Text className="text-slate-400 text-sm">Se déconnecter</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default GlobalMenu;
