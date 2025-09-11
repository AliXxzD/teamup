import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TeamupLogo from '../components/TeamupLogo';

const AboutScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 border-b border-slate-700">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center mr-3"
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">À propos</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <Animated.View 
          className="p-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Logo et titre */}
          <View className="items-center mb-8">
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="people" size={40} color="#ffffff" />
            </LinearGradient>
            
            <Text className="text-white text-2xl font-bold mb-2">TeamUp</Text>
            <Text className="text-slate-400 text-base text-center mb-4">
              Connectez-vous au sport local
            </Text>
            <Text className="text-slate-500 text-sm">
              Version 1.0.0 • Build 2024.01
            </Text>
          </View>

          {/* Description */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Notre mission</Text>
            <Text className="text-slate-300 text-base leading-6 mb-4">
              TeamUp est une plateforme qui connecte les passionnés de sport pour créer, 
              rejoindre et partager des événements sportifs locaux. Notre objectif est de 
              faciliter les rencontres sportives et de créer une communauté active et bienveillante.
            </Text>
            <Text className="text-slate-300 text-base leading-6">
              Que vous soyez débutant ou expert, TeamUp vous permet de trouver des partenaires 
              de sport, découvrir de nouvelles activités et vivre votre passion du sport 
              dans une ambiance conviviale.
            </Text>
          </View>

          {/* Fonctionnalités */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Fonctionnalités</Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#06b6d4" />
                <Text className="text-slate-300 text-base ml-3">Création d'événements sportifs</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="people" size={20} color="#06b6d4" />
                <Text className="text-slate-300 text-base ml-3">Rejoindre des événements</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#06b6d4" />
                <Text className="text-slate-300 text-base ml-3">Recherche par proximité</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="chatbubbles" size={20} color="#06b6d4" />
                <Text className="text-slate-300 text-base ml-3">Messagerie intégrée</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="trophy" size={20} color="#06b6d4" />
                <Text className="text-slate-300 text-base ml-3">Système de points et classements</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#06b6d4" />
                <Text className="text-slate-300 text-base ml-3">Système d'avis et évaluations</Text>
              </View>
            </View>
          </View>

          {/* Contact */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Contact</Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="mail" size={20} color="#06b6d4" />
                <Text className="text-slate-300 text-base ml-3">contact@teamup.app</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="globe" size={20} color="#06b6d4" />
                <Text className="text-slate-300 text-base ml-3">www.teamup.app</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="logo-twitter" size={20} color="#06b6d4" />
                <Text className="text-slate-300 text-base ml-3">@TeamUpApp</Text>
              </View>
            </View>
          </View>

          {/* Copyright */}
          <View className="items-center mb-8">
            <Text className="text-slate-500 text-sm text-center">
              © 2024 TeamUp. Tous droits réservés.
            </Text>
            <Text className="text-slate-500 text-sm text-center mt-2">
              Développé avec ❤️ pour la communauté sportive
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;

