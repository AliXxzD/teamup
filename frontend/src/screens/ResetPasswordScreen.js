import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1 px-6 pb-10" showsVerticalScrollIndicator={false}>
          {/* Header with Global Menu */}
          <View className="flex-row justify-between items-center pt-4 pb-5">
            <View className="flex-row items-center">
              <LinearGradient
                colors={['#20B2AA', '#17A2B8', '#0891B2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-8 h-8 rounded-2xl items-center justify-center mr-3"
              >
                <Ionicons name="trophy" size={20} color="#ffffff" />
              </LinearGradient>
              <Text className="text-white text-xl font-bold">TEAMUP</Text>
            </View>
            <GlobalMenu navigation={navigation} />
          </View>

          {/* Reset Icon */}
          <View className="items-center mt-10 mb-10">
            <LinearGradient
              colors={['#20B2AA', '#17A2B8', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-20 h-20 rounded-full items-center justify-center mb-3 shadow-lg shadow-primary-500/30"
            >
              <Ionicons name="key" size={32} color="#ffffff" />
            </LinearGradient>
          </View>

          {/* Title */}
          <View className="items-center mb-10">
            <Text className="text-white text-3xl font-bold mb-3 text-center">
              Nouveau mot de passe
            </Text>
            <Text className="text-dark-300 text-base text-center leading-6 px-5">
              Créez un nouveau mot de passe sécurisé pour votre compte TeamUp
            </Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            {/* New Password */}
            <View className="mb-5">
              <Text className="text-dark-300 text-sm font-medium mb-2">Nouveau mot de passe</Text>
              <View className="flex-row items-center bg-dark-800 border border-dark-600 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
                  placeholder="Votre nouveau mot de passe"
                  placeholderTextColor="#64748b"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-5">
              <Text className="text-dark-300 text-sm font-medium mb-2">Confirmer le mot de passe</Text>
              <View className="flex-row items-center bg-dark-800 border border-dark-600 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
                  placeholder="Confirmez votre mot de passe"
                  placeholderTextColor="#64748b"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View className="bg-dark-800 rounded-xl p-4 mb-6">
              <Text className="text-dark-300 text-sm font-medium mb-3">Le mot de passe doit contenir :</Text>
              <View className="flex-row items-center mb-2">
                <Ionicons 
                  name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={newPassword.length >= 6 ? '#10B981' : '#64748b'} 
                />
                <Text className={`text-sm ml-2 ${
                  newPassword.length >= 6 ? 'text-success' : 'text-dark-400'
                }`}>
                  Au moins 6 caractères
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons 
                  name={/[A-Z]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={/[A-Z]/.test(newPassword) ? '#10B981' : '#64748b'} 
                />
                <Text className={`text-sm ml-2 ${
                  /[A-Z]/.test(newPassword) ? 'text-success' : 'text-dark-400'
                }`}>
                  Une lettre majuscule
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons 
                  name={/[a-z]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={/[a-z]/.test(newPassword) ? '#10B981' : '#64748b'} 
                />
                <Text className={`text-sm ml-2 ${
                  /[a-z]/.test(newPassword) ? 'text-success' : 'text-dark-400'
                }`}>
                  Une lettre minuscule
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons 
                  name={/\d/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={/\d/.test(newPassword) ? '#10B981' : '#64748b'} 
                />
                <Text className={`text-sm ml-2 ${
                  /\d/.test(newPassword) ? 'text-success' : 'text-dark-400'
                }`}>
                  Un chiffre
                </Text>
              </View>
            </View>

            {/* Reset Button */}
            <GradientButton
              title="Réinitialiser le mot de passe"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading}
              variant="primary"
              size="large"
              icon="key"
            />

            {/* Back to Login */}
            <TouchableOpacity 
              className="flex-row items-center justify-center py-4 mt-4"
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={16} color="#20B2AA" />
              <Text className="text-primary-500 text-base font-medium ml-2">
                Retour à la connexion
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Custom Alert */}
      <CustomAlert {...alertConfig} />
    </SafeAreaView>
  );
};



export default ResetPasswordScreen; 