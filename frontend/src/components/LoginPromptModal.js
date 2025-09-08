import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getEventAddress, getEventTitle, getEventSport } from '../utils/eventUtils';

const { width, height } = Dimensions.get('window');

const LoginPromptModal = ({ 
  visible, 
  onClose, 
  onLogin, 
  onRegister, 
  event = null 
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getSportIcon = (sport) => {
    const sportIcons = {
      'Football': 'football',
      'Basketball': 'basketball',
      'Tennis': 'tennisball',
      'Running': 'walk',
      'Yoga': 'body',
      'Natation': 'water',
      'Volleyball': 'american-football',
      'Badminton': 'tennisball',
      'Cyclisme': 'bicycle',
      'Fitness': 'fitness',
      'Rugby': 'american-football',
      'Handball': 'basketball'
    };
    return sportIcons[sport] || 'calendar';
  };

  const getSportColor = (sport) => {
    const sportColors = {
      'Football': ['#22c55e', '#16a34a'],
      'Basketball': ['#f97316', '#ea580c'],
      'Tennis': ['#eab308', '#ca8a04'],
      'Running': ['#3b82f6', '#2563eb'],
      'Yoga': ['#8b5cf6', '#7c3aed'],
      'Natation': ['#06b6d4', '#0891b2'],
      'Volleyball': ['#ef4444', '#dc2626'],
      'Badminton': ['#84cc16', '#65a30d'],
      'Cyclisme': ['#10b981', '#059669'],
      'Fitness': ['#f59e0b', '#d97706'],
      'Rugby': ['#dc2626', '#b91c1c'],
      'Handball': ['#9333ea', '#7c3aed']
    };
    return sportColors[sport] || ['#6b7280', '#4b5563'];
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
      
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: fadeAnim }
        ]}
      >
        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              width: width - 40,
              maxWidth: 400,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Header with Event Info */}
          {event && (
            <View style={styles.eventHeader}>
              <View style={styles.eventHeaderContent}>
                <LinearGradient
                  colors={getSportColor(getEventSport(event))}
                  style={styles.sportIcon}
                >
                  <Ionicons 
                    name={getSportIcon(getEventSport(event))} 
                    size={24} 
                    color="#ffffff" 
                  />
                </LinearGradient>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>
                    {getEventTitle(event)}
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color="#94a3b8" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {getEventAddress(event)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.centerSection}>
              <LinearGradient
                colors={['#06b6d4', '#0891b2']}
                style={styles.mainIcon}
              >
                <Ionicons name="people" size={36} color="#ffffff" />
              </LinearGradient>
              
              <Text style={styles.mainTitle}>
                Rejoignez TeamUp !
              </Text>
              
              <Text style={styles.mainDescription}>
                {event 
                  ? `Participez à "${getEventTitle(event)}" et découvrez des milliers d'autres événements sportifs !`
                  : 'Découvrez des milliers d\'événements sportifs près de chez vous !'
                }
              </Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <BenefitItem 
                icon="location" 
                text="Événements près de chez vous"
                color="#22c55e"
              />
              <BenefitItem 
                icon="people" 
                text="Rencontrez des sportifs passionnés"
                color="#06b6d4"
              />
              <BenefitItem 
                icon="calendar" 
                text="Organisez vos propres événements"
                color="#f59e0b"
              />
              <BenefitItem 
                icon="trophy" 
                text="Système de niveaux et récompenses"
                color="#8b5cf6"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              {/* Create Account Button */}
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onRegister();
                }}
                style={styles.primaryButtonShadow}
              >
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  style={styles.primaryButton}
                >
                  <Ionicons name="person-add" size={20} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>
                    Créer un compte gratuit
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onLogin();
                }}
                style={styles.secondaryButton}
              >
                <Ionicons name="log-in" size={20} color="#ffffff" />
                <Text style={styles.secondaryButtonText}>
                  J'ai déjà un compte
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Composant pour les avantages
const BenefitItem = ({ icon, text, color }) => (
  <View style={styles.benefitItem}>
    <View style={[styles.benefitIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={16} color="#ffffff" />
    </View>
    <Text style={styles.benefitText}>
      {text}
    </Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventHeader: {
    backgroundColor: '#334155', // slate-700
    padding: 20,
    paddingTop: 24,
  },
  eventHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  mainContent: {
    padding: 24,
  },
  centerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  mainTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainDescription: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    color: '#e2e8f0',
    fontSize: 15,
    flex: 1,
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButtonShadow: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#374151', // slate-700
    borderWidth: 1,
    borderColor: '#4b5563', // slate-600
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LoginPromptModal;
