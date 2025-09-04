import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';
import GradientButton from '../components/GradientButton';


const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions d\'utilisation');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const result = await register(email.trim(), password, confirmPassword, fullName, rememberMe);
    
    if (!result.success) {
      Alert.alert('Erreur d\'inscription', result.error);
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
                <Ionicons name="trophy-outline" size={20} color="#ffffff" />
              </LinearGradient>
              <Text className="text-white text-xl font-bold">TEAMUP</Text>
            </View>
            <GlobalMenu navigation={navigation} />
          </View>

          {/* Register Icon */}
          <View className="items-center mt-10 mb-10">
            <LinearGradient
              colors={['#20B2AA', '#17A2B8', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-20 h-20 rounded-full items-center justify-center mb-3 shadow-lg shadow-primary-500/30"
            >
              <Ionicons name="person-add-outline" size={40} color="#ffffff" />
            </LinearGradient>
          </View>

          {/* Title */}
          <View className="items-center mb-10">
            <Text className="text-white text-3xl font-bold mb-2">Créer un compte</Text>
            <Text className="text-dark-300 text-base text-center">
              Rejoignez la communauté TeamUp
            </Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            {/* Name Fields */}
            <View className="flex-row justify-between mb-5">
              <View className="w-[48%]">
                <Text className="text-dark-300 text-sm font-medium mb-2">Prénom</Text>
                <TextInput
                  className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-base"
                  placeholder="Prénom"
                  placeholderTextColor="#64748b"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              
              <View className="w-[48%]">
                <Text className="text-dark-300 text-sm font-medium mb-2">Nom</Text>
                <TextInput
                  className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-base"
                  placeholder="Nom"
                  placeholderTextColor="#64748b"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="text-dark-300 text-sm font-medium mb-2">Adresse email</Text>
              <View className="flex-row items-center bg-dark-800 border border-dark-600 rounded-xl px-4 py-3">
                <Ionicons name="mail-outline" size={20} color="#64748b" />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
                  placeholder="votre@email.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-5">
              <Text className="text-dark-300 text-sm font-medium mb-2">Mot de passe</Text>
              <View className="flex-row items-center bg-dark-800 border border-dark-600 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
                  placeholder="Mot de passe"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
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
                  placeholder="Confirmez le mot de passe"
                  placeholderTextColor="#64748b"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View className="mb-5">
              <TouchableOpacity 
                className="flex-row items-start"
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                  acceptTerms ? 'bg-primary-500 border-primary-500' : 'border-dark-500'
                }`}>
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={12} color="#ffffff" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-dark-300 text-sm leading-5">
                    J'accepte les{' '}
                    <Text className="text-primary-500 font-medium">conditions d'utilisation</Text>
                    {' '}et la{' '}
                    <Text className="text-primary-500 font-medium">politique de confidentialité</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Remember Me */}
            <View className="mb-6">
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                  rememberMe ? 'bg-primary-500 border-primary-500' : 'border-dark-500'
                }`}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={12} color="#ffffff" />
                  )}
                </View>
                <Text className="text-dark-300 text-sm">Se souvenir de moi (30 jours)</Text>
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <GradientButton
              title="Créer un compte"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              variant="primary"
              size="large"
              icon="person-add"
            />

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-dark-600"></View>
              <Text className="text-dark-400 text-sm mx-4">ou</Text>
              <View className="flex-1 h-px bg-dark-600"></View>
            </View>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-dark-400 text-base">Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary-500 text-base font-semibold">Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};



export default RegisterScreen; 