import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

const GlobalMenu = ({ navigation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  // Composant pour les icônes
  const MenuIcon = ({ name, library = 'Ionicons', size = 24, color = colors.textSecondary, danger = false }) => {
    const iconColor = danger ? colors.danger : color;
    
    switch (library) {
      case 'MaterialIcons':
        return <MaterialIcons name={name} size={size} color={iconColor} />;
      case 'Feather':
        return <Feather name={name} size={size} color={iconColor} />;
      default:
        return <Ionicons name={name} size={size} color={iconColor} />;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            setShowMenu(false);
            logout();
          }
        }
      ]
    );
  };

  // Menu items pour les utilisateurs non connectés
  const guestMenuItems = [
    {
      title: 'Accueil',
      icon: { name: 'home-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        if (navigation?.navigate) {
          navigation.navigate('Home');
        }
      }
    },
    {
      title: 'Connexion',
      icon: { name: 'log-in-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        if (navigation?.navigate) {
          navigation.navigate('Login');
        }
      }
    },
    {
      title: 'Inscription',
      icon: { name: 'person-add-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        if (navigation?.navigate) {
          navigation.navigate('Register');
        }
      }
    }
  ];

  // Menu items pour les utilisateurs connectés
  const authenticatedMenuItems = [
    {
      title: 'Dashboard',
      icon: { name: 'grid-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        if (navigation?.navigate) {
          navigation.navigate('Dashboard');
        }
      }
    },
    {
      title: 'Découvrir',
      icon: { name: 'search-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        if (navigation?.navigate) {
          navigation.navigate('Discover');
        }
      }
    },
    {
      title: 'Créer un événement',
      icon: { name: 'add-circle-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        if (navigation?.navigate) {
          navigation.navigate('CreateEvent');
        }
      }
    },
    {
      title: 'Mes événements',
      icon: { name: 'calendar-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        if (navigation?.navigate) {
          navigation.navigate('MyEventsStack');
        }
      }
    },
    {
      title: 'Mon profil',
      icon: { name: 'person-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        if (navigation?.navigate) {
          navigation.navigate('UserProfile');
        }
      }
    },
    'divider',
    {
      title: 'Paramètres',
      icon: { name: 'settings-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        Alert.alert('Info', 'Paramètres à venir');
      }
    },
    {
      title: 'Notifications',
      icon: { name: 'notifications-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        Alert.alert('Info', 'Notifications à venir');
      }
    },
    {
      title: 'Aide & Support',
      icon: { name: 'help-circle-outline', library: 'Ionicons' },
      action: () => {
        setShowMenu(false);
        Alert.alert('Info', 'Aide & Support à venir');
      }
    },
    'divider',
    {
      title: 'Déconnexion',
      icon: { name: 'log-out-outline', library: 'Ionicons' },
      action: handleLogout,
      danger: true
    }
  ];

  // Choisir les items selon l'état d'authentification
  const menuItems = isAuthenticated ? authenticatedMenuItems : guestMenuItems;

  return (
    <View style={styles.container}>
      {/* Burger Menu Button */}
      <TouchableOpacity 
        style={styles.burgerButton} 
        onPress={() => setShowMenu(!showMenu)}
      >
        <Ionicons name="menu" size={28} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Full Screen Modal Menu */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Semi-transparent Background */}
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          
          {/* Full Screen Menu Content */}
          <View style={styles.fullScreenMenu}>
            <SafeAreaView style={styles.safeAreaContainer}>
              {/* Menu Header */}
              <View style={styles.menuHeader}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoIcon}>
                    <Ionicons name="trophy" size={22} color={colors.white} />
                  </View>
                  <Text style={styles.appName}>TeamUp</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowMenu(false)}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* User Info (only when authenticated) */}
              {isAuthenticated && user && (
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    {user?.name ? (
                      <Text style={styles.userAvatarText}>
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    ) : (
                      <Ionicons name="person" size={32} color={colors.white} />
                    )}
                  </View>
                  <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
                  <Text style={styles.userEmail}>{user?.email || 'email@exemple.com'}</Text>
                </View>
              )}

              {/* Menu Items */}
              <ScrollView style={styles.menuItemsContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.menuItems}>
                  {menuItems.map((item, index) => {
                    if (item === 'divider') {
                      return <View key={index} style={styles.menuDivider} />;
                    }

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.menuItem,
                          item.danger && styles.menuItemDanger
                        ]}
                        onPress={() => item.action()}
                      >
                        <View style={styles.menuItemContent}>
                          <View style={styles.menuIconContainer}>
                            <MenuIcon 
                              name={item.icon.name} 
                              library={item.icon.library} 
                              size={24} 
                              color={item.danger ? colors.danger : colors.primary}
                              danger={item.danger}
                            />
                          </View>
                          <Text style={[
                            styles.menuText,
                            item.danger && styles.menuTextDanger
                          ]}>
                            {item.title}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ opacity: 0.6, marginLeft: 10 }} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Footer */}
              <View style={styles.menuFooter}>
                <Text style={styles.footerText}>TeamUp v1.0</Text>
                <Text style={styles.footerSubtext}>Révolutionnez votre sport local</Text>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  burgerButton: {
    padding: 12,
  },
  
  // Modal Overlay (Full Screen)
  modalOverlay: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Plus opaque pour être visible
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Background semi-transparent élégant
  },
  fullScreenMenu: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.98)', // Surface semi-transparente
    marginTop: 80, // Espace en haut pour un effet overlay
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.3)', // Bordure subtile avec couleur primaire
  },
  safeAreaContainer: {
    flex: 1,
    paddingTop: 20,
  },
  
  // Menu Header
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 65, 85, 0.8)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  closeButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(52, 65, 85, 0.8)',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // User Info
  userInfo: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 65, 85, 0.8)',
    backgroundColor: 'rgba(32, 178, 170, 0.05)',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(32, 178, 170, 0.3)',
  },
  userAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 15,
    color: colors.textSecondary,
    opacity: 0.8,
  },
  
  // Menu Items
  menuItemsContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItems: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(52, 65, 85, 0.6)',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  menuTextDanger: {
    color: colors.danger,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(52, 65, 85, 0.8)',
    marginVertical: 20,
    marginHorizontal: 25,
  },

  // Footer
  menuFooter: {
    padding: 25,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 65, 85, 0.8)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  footerText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

export default GlobalMenu; 