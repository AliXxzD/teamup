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

const GlobalMenu = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(500));
  const [floatAnim] = useState(new Animated.Value(0));

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
      ]).start(() => setMenuVisible(false));
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
      
      // Close menu first
      setMenuVisible(false);
      
      // Use setTimeout to ensure menu is closed before navigation
      setTimeout(() => {
        try {
          if (screenName === 'Profile') {
            console.log('📍 Navigating to Profile tab');
            // For tab navigation, we need to navigate to the tab first
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

  const menuItems = [
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
  ];

  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity
        className="w-12 h-12 bg-dark-800 rounded-2xl items-center justify-center"
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Ionicons name="menu" size={20} color="#ffffff" />
      </TouchableOpacity>

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
            className="absolute bottom-0 left-0 w-full h-full bg-dark-900"
            style={{
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim }
              ]
            }}
          >
            {/* Header with Gradient */}
            <LinearGradient
              colors={['#84cc16', '#22c55e', '#1e293b']}
              className="pt-12 pb-8 px-8"
            >
              {/* Header */}
              <View className="flex-row items-center mb-8">
                <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="people" size={24} color="#ffffff" />
                </View>
                <View>
                  <Text className="text-white text-2xl font-bold">TEAMUP</Text>
                  <Text className="text-white/80 text-base">Menu</Text>
                </View>
              </View>

              {/* User Info */}
              <View className="flex-row items-center bg-dark-800/60 border border-dark-600/30 rounded-3xl p-6 shadow-lg">
                <View className="w-20 h-20 bg-lime/20 rounded-2xl items-center justify-center mr-5">
                  <Text className="text-lime text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xl mb-2">
                    {user?.name || 'Utilisateur'}
                  </Text>
                  <Text className="text-dark-300 text-base mb-2">
                    {user?.email || 'email@example.com'}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color="#84cc16" />
                    <Text className="text-lime text-base font-medium ml-2">
                      {user?.points || 0} points
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  className="w-12 h-12 bg-dark-700/60 rounded-2xl items-center justify-center"
                  onPress={() => navigateToScreen('Profile')}
                >
                  <Ionicons name="chevron-forward" size={18} color="#84cc16" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Menu Items */}
            <ScrollView className="flex-1 px-8 py-6">
              <View className="space-y-4">
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center py-5 px-6 rounded-2xl bg-dark-800/60 border border-dark-600/30 shadow-lg"
                    onPress={item.onPress}
                    activeOpacity={0.8}
                  >
                    <View 
                      className="w-14 h-14 rounded-2xl items-center justify-center mr-5"
                      style={{ backgroundColor: '#84cc16' + '15' }}
                    >
                      <Ionicons name={item.icon} size={24} color="#84cc16" />
                    </View>
                    <Text className="text-white text-lg font-semibold flex-1">
                      {item.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#64748b" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer */}
            <View className="px-8 pb-8 pt-6 border-t border-dark-600/50">
              <TouchableOpacity
                className="bg-red-500/15 border border-red-500/30 py-5 px-6 rounded-2xl flex-row items-center justify-center shadow-lg"
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                <Text className="text-red-500 text-lg font-bold ml-3">
                  Déconnexion
                </Text>
              </TouchableOpacity>

              <Text className="text-dark-400 text-sm text-center mt-6 font-medium">
                TeamUp v1.0.0
              </Text>
            </View>

            {/* Floating Close Button */}
            <Animated.View 
              className="absolute top-16 right-8"
              style={{
                opacity: floatAnim,
                transform: [
                  { 
                    scale: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    })
                  },
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0]
                    })
                  }
                ]
              }}
            >
              <TouchableOpacity
                className="w-14 h-14 bg-red-500 rounded-full items-center justify-center shadow-2xl"
                onPress={toggleMenu}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default GlobalMenu;
