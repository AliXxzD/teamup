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
            <View className="bg-dark-800/95 backdrop-blur border border-dark-600/50 rounded-3xl p-8 mb-8 shadow-2xl shadow-primary-500/10">
              {/* Icon */}
              <View className="items-center mb-10">
                <LinearGradient
                  colors={['#20B2AA', '#1a9b94']}
                  className="w-24 h-24 rounded-full items-center justify-center shadow-lg shadow-primary-500/30"
                >
                  <Ionicons name="log-in" size={36} color="#ffffff" />
                </LinearGradient>
              </View>

              {/* Title */}
              <View className="items-center mb-10">
                <Text className="text-white text-4xl font-bold mb-3">Connexion</Text>
                <Text className="text-dark-300 text-lg text-center leading-6">
                  Connectez-vous à votre compte TeamUp
                </Text>
              </View>

              {/* Form */}
              <View className="mb-8">
                {/* Email Input */}
                <View className="mb-6">
                  <Text className="text-dark-200 text-base font-semibold mb-3">Email</Text>
                  <View className={`flex-row items-center bg-dark-700/80 rounded-2xl px-5 py-4 border-2 ${
                    errors.email ? 'border-danger' : 'border-dark-600/50'
                  } shadow-lg`}>
                    <Ionicons name="mail-outline" size={22} color="#64748b" />
                    <TextInput
                      className="flex-1 text-white text-lg ml-4"
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
                    <Text className="text-danger text-sm mt-2 ml-2">{errors.email}</Text>
                  )}
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-dark-200 text-base font-semibold mb-3">Mot de passe</Text>
                  <View className={`flex-row items-center bg-dark-700/80 rounded-2xl px-5 py-4 border-2 ${
                    errors.password ? 'border-danger' : 'border-dark-600/50'
                  } shadow-lg`}>
                    <Ionicons name="lock-closed-outline" size={22} color="#64748b" />
                    <TextInput
                      className="flex-1 text-white text-lg ml-4"
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
                    <TouchableOpacity 
                      className="p-2"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={22} 
                        color="#64748b" 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text className="text-danger text-sm mt-2 ml-2">{errors.password}</Text>
                  )}
                </View>

                {/* Remember Me */}
                <TouchableOpacity 
                  className="flex-row items-center mb-6"
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View className={`w-6 h-6 rounded-lg border-2 items-center justify-center mr-4 ${
                    rememberMe ? 'bg-primary-500 border-primary-500' : 'border-dark-400'
                  }`}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    )}
                  </View>
                  <Text className="text-dark-200 text-base">Se souvenir de moi</Text>
                </TouchableOpacity>

                {/* General Error */}
                {errors.general && (
                  <View className="bg-danger/15 border-2 border-danger/30 rounded-2xl p-4 mb-6">
                    <Text className="text-danger text-base text-center font-medium">{errors.general}</Text>
                  </View>
                )}
              </View>

              {/* Login Button */}
              <View className="mb-6">
                <GradientButton
                  title="Se connecter"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  variant="primary"
                  size="large"
                  icon="log-in"
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                className="items-center py-3"
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text className="text-primary-500 text-base font-semibold">
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="bg-dark-800/60 border border-dark-600/30 rounded-2xl p-6 flex-row justify-center items-center">
              <Text className="text-dark-200 text-lg">Pas de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary-500 text-lg font-bold">S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreenTailwind;
