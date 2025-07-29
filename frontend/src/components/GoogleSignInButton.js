import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';

const GoogleSignInButton = ({ 
  onPress, 
  style, 
  textStyle, 
  disabled = false,
  text = "Continuer avec Google",
  variant = "default" // "default", "signin", "signup"
}) => {
  
  const handlePress = () => {
    if (disabled) return;
    
    if (onPress) {
      onPress();
    } else {
      // URL par défaut pour l'OAuth Google
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';
      const googleAuthUrl = `${API_BASE_URL}/api/auth/google`;
      
      Linking.openURL(googleAuthUrl).catch(error => {
        console.error('Erreur ouverture URL Google:', error);
      });
    }
  };

  const getButtonText = () => {
    switch (variant) {
      case 'signin':
        return 'Se connecter avec Google';
      case 'signup':
        return 'S\'inscrire avec Google';
      default:
        return text;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {/* Logo Google */}
        <View style={styles.logoContainer}>
          <GoogleLogo />
        </View>
        
        {/* Texte */}
        <Text style={[styles.text, textStyle]}>
          {getButtonText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Composant logo Google (SVG simplifié)
const GoogleLogo = () => (
  <View style={styles.logo}>
    <Text style={styles.logoText}>G</Text>
  </View>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DADCE0',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Product Sans', // Google's font
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3C4043',
    textAlign: 'center',
    flex: 1,
  },
});

export default GoogleSignInButton; 