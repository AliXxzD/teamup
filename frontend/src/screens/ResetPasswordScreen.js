import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/globalStyles';
import GlobalMenu from '../components/GlobalMenu';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import GradientButton from '../components/GradientButton';

const ResetPasswordScreen = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [tokenValidated, setTokenValidated] = useState(false);
  
  const { alertConfig, showSuccessAlert, showErrorAlert } = useCustomAlert();

  // Récupérer le token depuis les paramètres de navigation ou l'URL
  useEffect(() => {
    const getToken = () => {
      // Depuis les paramètres de navigation (React Navigation)
      if (route.params?.token) {
        return route.params.token;
      }
      
      // Depuis l'URL (pour les liens web)
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('token');
      }
      
      return '';
    };

    const token = getToken();
    setResetToken(token);
    
    if (token) {
      validateToken(token);
    } else {
      showErrorAlert(
        'Token manquant',
        'Le lien de réinitialisation est invalide ou incomplet.'
      );
    }
  }, [route.params]);

  // Valider le token au chargement
  const validateToken = async (token) => {
    try {
      // On peut ajouter une vérification côté serveur si nécessaire
      // Pour l'instant, on considère que le token est valide s'il existe
      setTokenValidated(true);
    } catch (error) {
      console.error('Erreur validation token:', error);
      showErrorAlert(
        'Token invalide',
        'Le lien de réinitialisation est invalide ou expiré.'
      );
    }
  };

  // Configuration de l'API
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    return password.length >= 6 && passwordRegex.test(password);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      showErrorAlert('Erreur', 'Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (!validatePassword(newPassword)) {
      showErrorAlert(
        'Mot de passe invalide', 
        'Le mot de passe doit contenir au moins 6 caractères avec une minuscule, une majuscule et un chiffre'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorAlert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (!resetToken) {
      showErrorAlert('Erreur', 'Token de réinitialisation manquant');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: newPassword.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccessAlert(
          'Succès !',
          'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
          () => navigation.navigate('Login')
        );
      } else {
        showErrorAlert(
          'Erreur',
          data.details?.[0] || data.message || 'Une erreur est survenue lors de la réinitialisation'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      showErrorAlert(
        'Erreur de connexion',
        'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header with Global Menu */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#20B2AA', '#17A2B8', '#0891B2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoIcon}
              >
                <Ionicons name="trophy" size={20} color={colors.white} />
              </LinearGradient>
              <Text style={styles.appName}>TEAMUP</Text>
            </View>
            <GlobalMenu navigation={navigation} />
          </View>

          {/* Reset Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#20B2AA', '#17A2B8', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.icon}
            >
              <Ionicons name="key" size={32} color={colors.white} />
            </LinearGradient>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Créez un nouveau mot de passe sécurisé pour votre compte TeamUp
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* New Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Votre nouveau mot de passe"
                  placeholderTextColor={colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  returnKeyType="next"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.textMuted} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirmez votre mot de passe"
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.textMuted} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Le mot de passe doit contenir :</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={newPassword.length >= 6 ? colors.success : colors.textMuted} 
                />
                <Text style={[
                  styles.requirementText,
                  newPassword.length >= 6 && styles.requirementMet
                ]}>
                  Au moins 6 caractères
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[A-Z]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={/[A-Z]/.test(newPassword) ? colors.success : colors.textMuted} 
                />
                <Text style={[
                  styles.requirementText,
                  /[A-Z]/.test(newPassword) && styles.requirementMet
                ]}>
                  Une lettre majuscule
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[a-z]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={/[a-z]/.test(newPassword) ? colors.success : colors.textMuted} 
                />
                <Text style={[
                  styles.requirementText,
                  /[a-z]/.test(newPassword) && styles.requirementMet
                ]}>
                  Une lettre minuscule
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/\d/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={/\d/.test(newPassword) ? colors.success : colors.textMuted} 
                />
                <Text style={[
                  styles.requirementText,
                  /\d/.test(newPassword) && styles.requirementMet
                ]}>
                  Un chiffre
                </Text>
              </View>
            </View>

            {/* Reset Button */}
            <GradientButton
              title="Réinitialiser le mot de passe"
              onPress={handleResetPassword}
              loading={isLoading}
              style={styles.resetButton}
            />

            {/* Back to Login */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={16} color={colors.primary} />
              <Text style={styles.backButtonText}>Retour à la connexion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Custom Alert */}
      <CustomAlert {...alertConfig} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  // Icon
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Title
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  // Form
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: 16,
  },

  // Requirements
  requirementsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 8,
  },
  requirementMet: {
    color: colors.success,
  },
  
  // Buttons
  resetButton: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ResetPasswordScreen; 