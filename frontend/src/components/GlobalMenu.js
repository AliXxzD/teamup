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

const GlobalMenuTailwind = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  const toggleMenu = () => {
    if (!menuVisible) {
      setMenuVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setMenuVisible(false));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => {
            logout();
            setMenuVisible(false);
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      title: 'Mon Profil',
      icon: 'person-outline',
      color: '#20B2AA',
      onPress: () => {
        navigation.navigate('Profile');
        toggleMenu();
      }
    },
    {
      title: 'Mes Événements',
      icon: 'calendar-outline',
      color: '#10B981',
      onPress: () => {
        navigation.navigate('MyEventsStack');
        toggleMenu();
      }
    },
    {
      title: 'Statistiques',
      icon: 'stats-chart-outline',
      color: '#3B82F6',
      onPress: () => {
        navigation.navigate('Stats');
        toggleMenu();
      }
    },
    {
      title: 'Messages',
      icon: 'chatbubbles-outline',
      color: '#F59E0B',
      onPress: () => {
        navigation.navigate('Messages');
        toggleMenu();
      }
    },
    {
      title: 'Paramètres',
      icon: 'settings-outline',
      color: '#64748b',
      onPress: () => {
        // navigation.navigate('Settings');
        Alert.alert('Info', 'Page des paramètres en cours de développement');
        toggleMenu();
      }
    },
    {
      title: 'Aide & Support',
      icon: 'help-circle-outline',
      color: '#8B5CF6',
      onPress: () => {
        Alert.alert('Support', 'Contactez-nous à support@teamup.com');
        toggleMenu();
      }
    }
  ];

  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity
        className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
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
            className="absolute top-0 right-0 w-80 h-full bg-dark-800"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }}
          >
            <LinearGradient
              colors={['#20B2AA', '#1a9b94', '#1E293B']}
              className="pt-12 pb-6 px-6"
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-white text-xl font-bold">Menu</Text>
                  <Text className="text-white/80 text-sm">TeamUp</Text>
                </View>
                <TouchableOpacity
                  className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
                  onPress={toggleMenu}
                >
                  <Ionicons name="close" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* User Info */}
              <View className="flex-row items-center bg-white/10 rounded-2xl p-4">
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                  <Text className="text-white text-lg font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base">
                    {user?.name || 'Utilisateur'}
                  </Text>
                  <Text className="text-white/70 text-sm">
                    {user?.email || 'email@example.com'}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Menu Items */}
            <ScrollView className="flex-1 px-6 py-4">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center py-4 px-4 mb-2 rounded-xl bg-dark-700/50"
                  onPress={item.onPress}
                  activeOpacity={0.8}
                >
                  <View 
                    className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text className="text-white text-base font-medium flex-1">
                    {item.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer */}
            <View className="px-6 pb-6">
              <TouchableOpacity
                className="bg-danger/20 py-4 px-4 rounded-xl flex-row items-center justify-center"
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text className="text-danger text-base font-semibold ml-2">
                  Déconnexion
                </Text>
              </TouchableOpacity>

              <Text className="text-dark-400 text-xs text-center mt-4">
                TeamUp v1.0.0
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default GlobalMenuTailwind;
