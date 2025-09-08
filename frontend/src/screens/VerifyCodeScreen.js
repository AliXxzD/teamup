import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/globalStyles';
import GlobalMenu from '../components/GlobalMenu';
import { API_BASE_URL } from '../config/api';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import GradientButton from '../components/GradientButton';

const { width } = Dimensions.get('window');

const VerifyCodeScreen = ({ navigation, route }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes en secondes
  
  const { alertConfig, showSuccessAlert, showErrorAlert } = useCustomAlert();
  
  // Références pour les inputs
  const inputRefs = useRef([]);
  
  // Email depuis les paramètres de navigation
  const email = route.params?.email || '';
  
  // Import API configuration

  // Timer pour le code
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formater le temps restant
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Gérer la saisie du code
  const handleCodeChange = (text, index) => {
    // Ne permettre que les chiffres
    const numericText = text.replace(/[^0-9]/g, '');
    
    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    // Auto-focus sur le champ suivant
    if (numericText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-vérification quand tous les champs sont remplis
    if (index === 5 && numericText && newCode.every(digit => digit)) {
      handleVerifyCode(newCode.join(''));
    }
  };

  // Gérer la suppression
  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Vérifier le code
  const handleVerifyCode = async (codeToVerify = null) => {
    const finalCode = codeToVerify || code.join('');
    
    if (finalCode.length !== 6) {
      showErrorAlert('Code incomplet', 'Veuillez entrer les 6 chiffres du code');
      return;
    }

    if (timeRemaining <= 0) {
      showErrorAlert('Code expiré', 'Ce code a expiré. Demandez un nouveau code.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: finalCode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccessAlert(
          'Code validé !',
          'Vous pouvez maintenant créer votre nouveau mot de passe.',
          () => {
            navigation.navigate('ResetPassword', { 
              token: data.resetToken,
              user: data.user 
            });
          }
        );
      } else {
        showErrorAlert(
          'Code incorrect',
          data.details?.[0] || 'Le code entré est incorrect ou expiré.'
        );
        // Réinitialiser le code
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      showErrorAlert(
        'Erreur de connexion',
        'Impossible de vérifier le code. Vérifiez votre connexion internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoyer un nouveau code
  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTimeRemaining(600); // Reset timer
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        showSuccessAlert(
          'Nouveau code envoyé !',
          'Un nouveau code a été envoyé à votre adresse email.'
        );
      } else {
        showErrorAlert(
          'Erreur',
          'Impossible d\'envoyer un nouveau code. Réessayez plus tard.'
        );
      }
    } catch (error) {
      console.error('Erreur lors du renvoi:', error);
      showErrorAlert(
        'Erreur de connexion',
        'Impossible d\'envoyer un nouveau code. Vérifiez votre connexion internet.'
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
                <Text style={styles.logoText}>T</Text>
              </LinearGradient>
              <Text style={styles.appName}>TEAMUP</Text>
            </View>
            <GlobalMenu navigation={navigation} />
          </View>

          {/* Verification Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#20B2AA', '#17A2B8', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.icon}
            >
              <Ionicons name="shield-checkmark" size={32} color={colors.white} />
            </LinearGradient>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Vérification</Text>
            <Text style={styles.subtitle}>
              Entrez le code à 6 chiffres envoyé à {email}
            </Text>
          </View>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                  isLoading && styles.codeInputDisabled
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                editable={!isLoading}
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={timeRemaining > 60 ? colors.textSecondary : colors.danger} 
            />
            <Text style={[
              styles.timerText,
              timeRemaining <= 60 && styles.timerTextUrgent
            ]}>
              Code expire dans {formatTime(timeRemaining)}
            </Text>
          </View>

          {/* Verify Button */}
          <GradientButton
            title="Vérifier le code"
            onPress={() => handleVerifyCode()}
            loading={isLoading}
            disabled={code.join('').length !== 6 || timeRemaining <= 0}
            style={styles.verifyButton}
          />

          {/* Resend Code */}
          <TouchableOpacity 
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={isLoading || timeRemaining > 540} // Pas de renvoi dans les premières 60s
          >
            <Ionicons name="mail-outline" size={16} color={colors.primary} />
            <Text style={styles.resendButtonText}>
              {timeRemaining > 540 
                ? `Renvoyer dans ${formatTime(timeRemaining - 540)}`
                : 'Renvoyer le code'
              }
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={16} color={colors.primary} />
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
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

  // Code Input
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: (width - 120) / 6,
    height: 56,
    borderWidth: 2,
    borderColor: colors.gray[700],
    borderRadius: 12,
    backgroundColor: colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  codeInputDisabled: {
    opacity: 0.5,
  },

  // Timer
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  timerTextUrgent: {
    color: colors.danger,
    fontWeight: '600',
  },

  // Buttons
  verifyButton: {
    marginBottom: 24,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
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

export default VerifyCodeScreen; 