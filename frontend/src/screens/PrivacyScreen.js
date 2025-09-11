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

const PrivacyScreen = ({ navigation }) => {
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
          <Text className="text-white text-xl font-bold">Confidentialité</Text>
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
          {/* Introduction */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Notre engagement</Text>
            <Text className="text-slate-300 text-base leading-6">
              Chez TeamUp, nous nous engageons à protéger votre vie privée et vos données personnelles. 
              Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
            </Text>
          </View>

          {/* Données collectées */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Données collectées</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-cyan-400 text-base font-semibold mb-2">Informations de compte</Text>
                <Text className="text-slate-300 text-sm leading-5">
                  • Nom, email, mot de passe (chiffré){'\n'}
                  • Photo de profil (optionnelle){'\n'}
                  • Préférences sportives
                </Text>
              </View>
              
              <View>
                <Text className="text-cyan-400 text-base font-semibold mb-2">Données d'activité</Text>
                <Text className="text-slate-300 text-sm leading-5">
                  • Événements créés et rejoints{'\n'}
                  • Messages échangés{'\n'}
                  • Évaluations et avis
                </Text>
              </View>
              
              <View>
                <Text className="text-cyan-400 text-base font-semibold mb-2">Données techniques</Text>
                <Text className="text-slate-300 text-sm leading-5">
                  • Adresse IP et informations de connexion{'\n'}
                  • Données d'utilisation de l'application{'\n'}
                  • Cookies et technologies similaires
                </Text>
              </View>
            </View>
          </View>

          {/* Utilisation des données */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Utilisation des données</Text>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Fournir et améliorer nos services
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Faciliter les connexions entre utilisateurs
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Envoyer des notifications importantes
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Assurer la sécurité de la plateforme
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Analyser l'utilisation pour améliorer l'expérience
                </Text>
              </View>
            </View>
          </View>

          {/* Partage des données */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Partage des données</Text>
            <Text className="text-slate-300 text-base leading-6 mb-4">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <Ionicons name="shield-checkmark" size={16} color="#06b6d4" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Avec votre consentement explicite
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="shield-checkmark" size={16} color="#06b6d4" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Pour respecter une obligation légale
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="shield-checkmark" size={16} color="#06b6d4" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Avec des prestataires de services de confiance
                </Text>
              </View>
            </View>
          </View>

          {/* Vos droits */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Vos droits</Text>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <Ionicons name="eye" size={16} color="#f59e0b" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Accéder à vos données personnelles
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="create" size={16} color="#f59e0b" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Corriger des informations inexactes
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="trash" size={16} color="#f59e0b" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Supprimer votre compte et vos données
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="download" size={16} color="#f59e0b" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Exporter vos données
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="stop-circle" size={16} color="#f59e0b" style={{ marginTop: 2 }} />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  Vous opposer au traitement de vos données
                </Text>
              </View>
            </View>
          </View>

          {/* Contact */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Contact</Text>
            <Text className="text-slate-300 text-base leading-6 mb-4">
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous :
            </Text>
            
            <View className="space-y-2">
              <Text className="text-cyan-400 text-base">Email : privacy@teamup.app</Text>
              <Text className="text-cyan-400 text-base">Délégué à la protection des données : dpo@teamup.app</Text>
            </View>
          </View>

          {/* Dernière mise à jour */}
          <View className="items-center mb-8">
            <Text className="text-slate-500 text-sm text-center">
              Dernière mise à jour : 1er janvier 2024
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyScreen;

