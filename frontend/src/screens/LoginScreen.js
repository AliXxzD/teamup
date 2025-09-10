import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import GlobalMenu from '../components/GlobalMenu';
import TeamupLogo from '../components/TeamupLogo';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Fixed Header */}
      <View className="bg-slate-900 px-6 pt-6 pb-4 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          {/* Logo and App Name */}
          <TeamupLogo size="medium" textColor="#ffffff" />
          
          {/* Menu Only */}
          <View className="flex-row items-center">
            <GlobalMenu navigation={navigation} currentRoute="Login" />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

          {/* Main Content Container */}
          <View className="flex-1 px-6 pt-8">
            {/* Login Icon */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-cyan-500 rounded-2xl items-center justify-center">
                <Ionicons name="log-in-outline" size={32} color="#ffffff" />
              </View>
            </View>

            {/* Title */}
            <View className="items-center mb-12">
              <Text className="text-white text-3xl font-bold mb-3">Bon retour !</Text>
              <Text className="text-slate-400 text-lg text-center leading-6">
                Connectez-vous à votre compte TeamUp
              </Text>
            </View>

            {/* Form */}
            <View className="mb-8">
              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-white text-base font-medium mb-3">Adresse email</Text>
                <View className="bg-slate-800 rounded-xl">
                  <TextInput
                    className="text-white text-base px-4 py-4"
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
                  <Text className="text-red-400 text-sm mt-2">{errors.email}</Text>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-white text-base font-medium mb-3">Mot de passe</Text>
                <View className="bg-slate-800 rounded-xl flex-row items-center px-4 py-4">
                  <TextInput
                    className="flex-1 text-white text-base"
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
                    className="ml-3"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#64748b" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-red-400 text-sm mt-2">{errors.password}</Text>
                )}
              </View>

              {/* Remember Me */}
              <View className="flex-row items-center mb-8">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View className={`w-5 h-5 rounded mr-3 border-2 items-center justify-center ${
                    rememberMe ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500 bg-transparent'
                  }`}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    )}
                  </View>
                  <Text className="text-slate-300 text-base">Se souvenir de moi</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="ml-auto"
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text className="text-cyan-400 text-base">Mot de passe oublié ?</Text>
                </TouchableOpacity>
              </View>

              {/* General Error */}
              {errors.general && (
                <View className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
                  <Text className="text-red-400 text-base text-center">{errors.general}</Text>
                </View>
              )}
            </View>

            {/* Login Button */}
            <View className="mb-8">
              <TouchableOpacity 
                onPress={handleLogin}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 20,
                    paddingHorizontal: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={{
                        color: '#ffffff',
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginRight: 12
                      }}>Se connecter</Text>
                      <Ionicons name="arrow-forward" size={22} color="#ffffff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="items-center py-6 border-t border-slate-700 mt-4">
              <Text className="text-slate-400 text-base mb-4">Vous n'avez pas de compte ?</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Register')}
                className="w-full"
              >
                <LinearGradient
                  colors={['#334155', '#475569']}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#64748b',
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person-add-outline" size={20} color="#22d3ee" style={{ marginRight: 8 }} />
                  <Text style={{
                    color: '#22d3ee',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>Créer un compte</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;