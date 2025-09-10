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

const TermsScreen = ({ navigation }) => {
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
          <Text className="text-white text-xl font-bold">Conditions d'utilisation</Text>
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
            <Text className="text-white text-lg font-bold mb-4">Acceptation des conditions</Text>
            <Text className="text-slate-300 text-base leading-6">
              En utilisant TeamUp, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </Text>
          </View>

          {/* Description du service */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Description du service</Text>
            <Text className="text-slate-300 text-base leading-6 mb-4">
              TeamUp est une plateforme qui permet aux utilisateurs de créer, rejoindre et 
              gérer des événements sportifs locaux. Notre service facilite les connexions 
              entre passionnés de sport.
            </Text>
            <Text className="text-slate-300 text-base leading-6">
              Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou 
              partie du service à tout moment.
            </Text>
          </View>

          {/* Compte utilisateur */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Compte utilisateur</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-cyan-400 text-base font-semibold mb-2">Création de compte</Text>
                <Text className="text-slate-300 text-sm leading-5">
                  • Vous devez fournir des informations exactes et à jour{'\n'}
                  • Vous êtes responsable de la sécurité de votre compte{'\n'}
                  • Un seul compte par personne est autorisé
                </Text>
              </View>
              
              <View>
                <Text className="text-cyan-400 text-base font-semibold mb-2">Responsabilités</Text>
                <Text className="text-slate-300 text-sm leading-5">
                  • Maintenir la confidentialité de vos identifiants{'\n'}
                  • Notifier immédiatement toute utilisation non autorisée{'\n'}
                  • Vous assurer que vos informations sont exactes
                </Text>
              </View>
            </View>
          </View>

          {/* Utilisation acceptable */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Utilisation acceptable</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-green-400 text-base font-semibold mb-2">Utilisations autorisées</Text>
                <View className="space-y-2">
                  <View className="flex-row items-start">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginTop: 2 }} />
                    <Text className="text-slate-300 text-sm ml-3 flex-1">
                      Créer et rejoindre des événements sportifs légitimes
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginTop: 2 }} />
                    <Text className="text-slate-300 text-sm ml-3 flex-1">
                      Communiquer de manière respectueuse avec d'autres utilisateurs
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginTop: 2 }} />
                    <Text className="text-slate-300 text-sm ml-3 flex-1">
                      Partager du contenu approprié et légal
                    </Text>
                  </View>
                </View>
              </View>
              
              <View>
                <Text className="text-red-400 text-base font-semibold mb-2">Utilisations interdites</Text>
                <View className="space-y-2">
                  <View className="flex-row items-start">
                    <Ionicons name="close-circle" size={16} color="#ef4444" style={{ marginTop: 2 }} />
                    <Text className="text-slate-300 text-sm ml-3 flex-1">
                      Harcèlement, intimidation ou comportement abusif
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Ionicons name="close-circle" size={16} color="#ef4444" style={{ marginTop: 2 }} />
                    <Text className="text-slate-300 text-sm ml-3 flex-1">
                      Contenu illégal, offensant ou inapproprié
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Ionicons name="close-circle" size={16} color="#ef4444" style={{ marginTop: 2 }} />
                    <Text className="text-slate-300 text-sm ml-3 flex-1">
                      Spam, publicité non sollicitée ou promotion commerciale
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Ionicons name="close-circle" size={16} color="#ef4444" style={{ marginTop: 2 }} />
                    <Text className="text-slate-300 text-sm ml-3 flex-1">
                      Tentative de piratage ou d'accès non autorisé
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Contenu utilisateur */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Contenu utilisateur</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-cyan-400 text-base font-semibold mb-2">Vos droits</Text>
                <Text className="text-slate-300 text-sm leading-5">
                  Vous conservez tous les droits sur le contenu que vous publiez. En publiant 
                  du contenu, vous nous accordez une licence pour l'utiliser dans le cadre 
                  de notre service.
                </Text>
              </View>
              
              <View>
                <Text className="text-cyan-400 text-base font-semibold mb-2">Nos droits</Text>
                <Text className="text-slate-300 text-sm leading-5">
                  Nous nous réservons le droit de modérer, modifier ou supprimer tout contenu 
                  qui viole ces conditions ou qui est inapproprié.
                </Text>
              </View>
            </View>
          </View>

          {/* Limitation de responsabilité */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Limitation de responsabilité</Text>
            <Text className="text-slate-300 text-base leading-6 mb-4">
              TeamUp est fourni "en l'état". Nous ne garantissons pas que le service sera 
              ininterrompu, sécurisé ou exempt d'erreurs.
            </Text>
            <Text className="text-slate-300 text-base leading-6">
              Nous ne sommes pas responsables des dommages directs, indirects, accessoires 
              ou consécutifs résultant de l'utilisation de notre service.
            </Text>
          </View>

          {/* Modifications */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Modifications des conditions</Text>
            <Text className="text-slate-300 text-base leading-6">
              Nous nous réservons le droit de modifier ces conditions à tout moment. 
              Les modifications importantes seront notifiées aux utilisateurs. 
              L'utilisation continue du service après modification constitue une 
              acceptation des nouvelles conditions.
            </Text>
          </View>

          {/* Contact */}
          <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Contact</Text>
            <Text className="text-slate-300 text-base leading-6 mb-4">
              Pour toute question concernant ces conditions d'utilisation :
            </Text>
            
            <View className="space-y-2">
              <Text className="text-cyan-400 text-base">Email : legal@teamup.app</Text>
              <Text className="text-cyan-400 text-base">Support : support@teamup.app</Text>
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

export default TermsScreen;
