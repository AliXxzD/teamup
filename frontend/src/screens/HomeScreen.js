import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlobalMenu from '../components/GlobalMenu';
import GradientButton from '../components/GradientButton';

const { width, height } = Dimensions.get('window');

const HomeScreenTailwind = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: 'calendar',
      title: 'Événements Sportifs',
      description: 'Créez et rejoignez des activités sportives près de chez vous',
      color: '#10B981'
    },
    {
      icon: 'people',
      title: 'Communauté Active',
      description: 'Rencontrez des sportifs passionnés dans votre région',
      color: '#3B82F6'
    },
    {
      icon: 'trophy',
      title: 'Suivi des Performances',
      description: 'Suivez vos statistiques et progressez dans vos sports favoris',
      color: '#F59E0B'
    },
    {
      icon: 'chatbubbles',
      title: 'Messagerie Intégrée',
      description: 'Communiquez facilement avec les autres participants',
      color: '#8B5CF6'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#20B2AA', '#1a9b94', '#0f172a']}
          className="pb-12"
          style={{ minHeight: height * 0.6 }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 pt-4 mb-8">
            <View className="flex-row items-center">
              <LinearGradient
                colors={['#ffffff', '#f1f5f9']}
                className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
              >
                <Text className="text-primary-500 text-xl font-bold">T</Text>
              </LinearGradient>
              <Text className="text-white text-2xl font-bold">TeamUp</Text>
            </View>
            <GlobalMenu navigation={navigation} />
          </View>

          {/* Hero Content */}
          <Animated.View 
            className="flex-1 items-center justify-center px-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="w-32 h-32 bg-white/10 rounded-full items-center justify-center mb-8">
              <Ionicons name="trophy" size={64} color="#ffffff" />
            </View>
            
            <Text className="text-white text-4xl font-bold text-center mb-4">
              Bienvenue sur{'\n'}TeamUp
            </Text>
            
            <Text className="text-white/80 text-lg text-center mb-8 leading-7">
              La plateforme qui connecte les sportifs et facilite l'organisation d'événements sportifs locaux
            </Text>

            {/* CTA Buttons */}
            <View className="w-full">
              <GradientButton
                title="Se connecter"
                onPress={() => navigation.navigate('Login')}
                variant="primary"
                size="large"
                icon="log-in"
                style={{ marginBottom: 16 }}
              />
              
              <TouchableOpacity
                className="bg-white/10 py-4 px-8 rounded-xl flex-row items-center justify-center"
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add" size={20} color="#ffffff" />
                <Text className="text-white text-base font-semibold ml-2">
                  Créer un compte
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Features Section */}
        <View className="px-6 py-8">
          <Text className="text-white text-2xl font-bold text-center mb-8">
            Pourquoi choisir TeamUp ?
          </Text>
          
          <View className="space-y-6">
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                className="bg-dark-800 rounded-2xl p-6 flex-row items-center"
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: [0, index % 2 === 0 ? -100 : 100],
                    })
                  }]
                }}
              >
                <View 
                  className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: feature.color + '20' }}
                >
                  <Ionicons name={feature.icon} size={28} color={feature.color} />
                </View>
                
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold mb-2">
                    {feature.title}
                  </Text>
                  <Text className="text-dark-300 text-sm leading-5">
                    {feature.description}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Footer CTA */}
        <View className="px-6 py-8">
          <View className="bg-dark-800 rounded-2xl p-8 items-center">
            <Text className="text-white text-xl font-bold mb-2 text-center">
              Prêt à commencer ?
            </Text>
            <Text className="text-dark-300 text-center mb-6">
              Rejoignez des milliers de sportifs actifs
            </Text>
            
            <GradientButton
              title="Commencer maintenant"
              onPress={() => navigation.navigate('Register')}
              variant="primary"
              size="large"
              icon="rocket"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreenTailwind;
