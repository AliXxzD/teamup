import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';
import GradientButton from '../components/GradientButton';

const LoginScreenTailwind = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!password) {
      newErrors.password = 'Mot de passe requis';
    } else if (password.length < 6) {
      newErrors.password = 'Mot de passe trop court (min 6 caractères)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await login(email.trim().toLowerCase(), password, rememberMe);
      
      if (result.success) {
        console.log('✅ Connexion réussie');
      } else {
        setErrors({ general: result.error || 'Erreur de connexion' });
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setErrors({ general: 'Erreur de connexion. Vérifiez votre réseau.' });
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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={['#20B2AA', '#1a9b94', '#0f172a']}
            className="pb-8"
          >
            <View className="flex-row justify-between items-center px-6 pt-4">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={['#ffffff', '#f1f5f9']}
                  className="w-8 h-8 rounded-2xl items-center justify-center mr-3"
                >
                  <Text className="text-primary-500 text-lg font-bold">T</Text>
                </LinearGradient>
                <Text className="text-white text-xl font-bold">TEAMUP</Text>
              </View>
              <GlobalMenu navigation={navigation} />
            </View>
          </LinearGradient>

          {/* Main Content */}
          <Animated.View 
            className="px-6 -mt-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            {/* Login Card */}
            <View className="bg-dark-800 rounded-3xl p-6 mb-6">
              {/* Icon */}
              <View className="items-center mb-8">
                <LinearGradient
                  colors={['#20B2AA', '#1a9b94']}
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                >
                  <Ionicons name="log-in" size={32} color="#ffffff" />
                </LinearGradient>
              </View>

              {/* Title */}
              <View className="items-center mb-8">
                <Text className="text-white text-3xl font-bold mb-2">Connexion</Text>
                <Text className="text-dark-300 text-base text-center">
                  Connectez-vous à votre compte TeamUp
                </Text>
              </View>

              {/* Form */}
              <View className="mb-6">
                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-dark-300 text-sm font-medium mb-2">Email</Text>
                  <View className={`flex-row items-center bg-dark-700 rounded-xl px-4 py-3 border ${
                    errors.email ? 'border-danger' : 'border-dark-600'
                  }`}>
                    <Ionicons name="mail-outline" size={20} color="#64748b" />
                    <TextInput
                      className="flex-1 text-white text-base ml-3"
                      placeholder="votre@email.com"
                      placeholderTextColor="#64748b"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.email && (
                    <Text className="text-danger text-xs mt-1">{errors.email}</Text>
                  )}
                </View>

                {/* Password Input */}
                <View className="mb-4">
                  <Text className="text-dark-300 text-sm font-medium mb-2">Mot de passe</Text>
                  <View className={`flex-row items-center bg-dark-700 rounded-xl px-4 py-3 border ${
                    errors.password ? 'border-danger' : 'border-dark-600'
                  }`}>
                    <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                    <TextInput
                      className="flex-1 text-white text-base ml-3"
                      placeholder="Votre mot de passe"
                      placeholderTextColor="#64748b"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#64748b" 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text className="text-danger text-xs mt-1">{errors.password}</Text>
                  )}
                </View>

                {/* Remember Me */}
                <TouchableOpacity 
                  className="flex-row items-center mb-4"
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                    rememberMe ? 'bg-primary-500 border-primary-500' : 'border-dark-500'
                  }`}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    )}
                  </View>
                  <Text className="text-dark-300 text-sm">Se souvenir de moi</Text>
                </TouchableOpacity>

                {/* General Error */}
                {errors.general && (
                  <View className="bg-danger/10 border border-danger/20 rounded-xl p-3 mb-4">
                    <Text className="text-danger text-sm text-center">{errors.general}</Text>
                  </View>
                )}
              </View>

              {/* Login Button */}
              <GradientButton
                title="Se connecter"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
                size="large"
                icon="log-in"
              />

              {/* Forgot Password */}
              <TouchableOpacity 
                className="items-center mt-4"
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text className="text-primary-500 text-sm font-medium">
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-dark-300 text-base">Pas de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary-500 text-base font-semibold">S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreenTailwind;
