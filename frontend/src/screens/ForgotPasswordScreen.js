import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/globalStyles';
import GlobalMenu from '../components/GlobalMenu';
import { API_BASE_URL } from '../config/api';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import GradientButton from '../components/GradientButton';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' ou 'success'
  
  const { alertConfig, showSuccessAlert, showErrorAlert } = useCustomAlert();

  // Import API configuration

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      showErrorAlert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      showErrorAlert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'appel API - remplacez par votre endpoint réel
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        // Naviguer vers l'écran de vérification de code
        navigation.navigate('VerifyCode', { email: email.trim() });
      } else {
        showErrorAlert(
          'Erreur',
          data.message || 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      // Pour la démo, on navigue vers l'écran de code même sans backend
      navigation.navigate('VerifyCode', { email: email.trim() });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const renderEmailStep = () => (
    <>
      {/* Forgot Password Icon */}
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#20B2AA', '#17A2B8', '#0891B2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.icon}
        >
          <Ionicons name="lock-closed" size={32} color={colors.white} />
        </LinearGradient>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Mot de passe oublié ?</Text>
        <Text style={styles.subtitle}>
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
        </Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Adresse email</Text>
          <View style={styles.emailInputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.emailInput}
              placeholder="votre@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              returnKeyType="send"
              onSubmitEditing={handleResetPassword}
            />
          </View>
        </View>

        {/* Reset Button */}
        <GradientButton
          title="Envoyer le lien de réinitialisation"
          onPress={handleResetPassword}
          loading={isLoading}
          style={styles.resetButton}
        />

        {/* Back to Login */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToLogin}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={styles.backButtonText}>Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSuccessStep = () => (
    <>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#10B981', '#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.icon}
        >
          <Ionicons name="checkmark" size={32} color={colors.white} />
        </LinearGradient>
      </View>

      {/* Success Message */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Email envoyé !</Text>
        <Text style={styles.subtitle}>
          Nous avons envoyé un lien de réinitialisation à {email}. 
          Vérifiez votre boîte de réception et suivez les instructions.
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.instructionText}>
            Vérifiez votre boîte de réception (et les spams)
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.instructionText}>
            Cliquez sur le lien dans l'email
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.instructionText}>
            Créez votre nouveau mot de passe
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.resendButton}
          onPress={() => setStep('email')}
        >
          <Text style={styles.resendButtonText}>Renvoyer l'email</Text>
        </TouchableOpacity>

        <GradientButton
          title="Retour à la connexion"
          onPress={handleBackToLogin}
          style={styles.backToLoginButton}
        />
      </View>
    </>
  );

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

          {/* Content */}
          {step === 'email' ? renderEmailStep() : renderSuccessStep()}
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
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  emailInput: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 12,
    fontSize: 16,
    color: colors.textPrimary,
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

  // Success Step
  instructionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Actions
  actionsContainer: {
    gap: 16,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  resendButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  backToLoginButton: {
    marginTop: 8,
  },
});

export default ForgotPasswordScreen; 