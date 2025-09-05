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
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlobalMenu from '../components/GlobalMenu';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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

  const EventCard = ({ title, date, isFree = false, image }) => (
    <View className="mb-4 rounded-2xl overflow-hidden">
      <View className="h-48 bg-slate-700 relative">
        <ImageBackground
          source={{ uri: image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3' }}
          className="flex-1 justify-between p-4"
          imageStyle={{ borderRadius: 16 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            className="absolute inset-0 rounded-2xl"
          />
          {isFree && (
            <View className="bg-cyan-500 px-3 py-1 rounded-full self-start">
              <Text className="text-white text-sm font-bold">GRATUIT</Text>
            </View>
          )}
          <View>
            <Text className="text-white text-2xl font-bold mb-2">{title}</Text>
            <Text className="text-white text-base opacity-90">{date}</Text>
          </View>
        </ImageBackground>
      </View>
    </View>
  );

  const StatItem = ({ number, label }) => (
    <View className="items-center">
      <Text className="text-white text-3xl font-bold mb-1">{number}</Text>
      <Text className="text-slate-400 text-sm text-center leading-5">{label}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Fixed Header */}
      <View className="bg-slate-900 border-b border-slate-800/50 px-6 pt-6 pb-5">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
                shadowColor: '#06b6d4',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="border border-white/20 rounded-xl w-full h-full items-center justify-center">
                <Ionicons name="people" size={24} color="#ffffff" />
              </View>
            </LinearGradient>
            <Text className="text-white text-2xl font-bold tracking-tight">TEAMUP</Text>
          </View>
          
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <TouchableOpacity className="w-11 h-11 bg-slate-800 border border-slate-700/50 rounded-xl items-center justify-center">
              <Ionicons name="search" size={20} color="#ffffff" />
            </TouchableOpacity>
            <GlobalMenu navigation={navigation} currentRoute="Home" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View 
          className="px-6 pt-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Hero Section */}
          <View className="mb-6">
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: 'rgba(34, 211, 238, 0.2)',
                shadowColor: '#06b6d4',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              {/* NOUVEAU Badge */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <Ionicons name="flash" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 }}>NOUVEAU</Text>
                </View>
              </View>

              {/* Main Title */}
              <Text style={{
                color: '#ffffff',
                fontSize: 32,
                fontWeight: 'bold',
                marginBottom: 24,
                lineHeight: 38,
                letterSpacing: -0.5
              }}>
                RÉVOLUTIONNEZ{'\n'}VOTRE SPORT LOCAL
              </Text>

              {/* Description */}
              <Text style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 16,
                marginBottom: 40,
                lineHeight: 24,
                maxWidth: 280
              }}>
                Organisez et rejoignez des activités sportives près de chez vous avec la première plateforme dédiée au sport amateur.
              </Text>

              {/* Commencer Button */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Register')}
                style={{
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'flex-start',
                  marginBottom: 24,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name="play" size={18} color="#0891b2" style={{ marginRight: 10 }} />
                <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: 'bold' }}>Commencer</Text>
              </TouchableOpacity>

              {/* Dots Indicator */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <View style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 6
                }} />
                <View style={{
                  width: 8,
                  height: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 4
                }} />
                <View style={{
                  width: 8,
                  height: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 4
                }} />
              </View>
            </LinearGradient>
          </View>

          {/* Découvrez Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-6 px-1">
              <Text className="text-white text-xl font-bold tracking-tight">
                Découvrez quelque chose de nouveau
              </Text>
              <TouchableOpacity className="p-2 rounded-full bg-slate-800/50 border border-slate-700">
                <Ionicons name="arrow-forward" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Sports Cards */}
            <View style={{ gap: 16 }}>
              {/* Football Card */}
              <TouchableOpacity 
                className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5 flex-row items-center justify-between"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="flex-1 pr-4">
                  <Text className="text-slate-400 text-xs font-medium mb-2 tracking-wide uppercase">Sport populaire</Text>
                  <Text className="text-white text-xl font-bold mb-2">Football</Text>
                  <Text className="text-cyan-400 text-base font-medium mb-3">Matchs entre amis</Text>
                  <Text className="text-slate-400 text-sm">2,400+ joueurs</Text>
                </View>
                <View style={{ width: 72, height: 72 }} className="rounded-2xl overflow-hidden border-2 border-slate-700/30">
                  <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3' }}
                    className="w-full h-full"
                    imageStyle={{ borderRadius: 14 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Basketball Card */}
              <TouchableOpacity 
                className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5 flex-row items-center justify-between"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="flex-1 pr-4">
                  <Text className="text-slate-400 text-xs font-medium mb-2 tracking-wide uppercase">Sport populaire</Text>
                  <Text className="text-white text-xl font-bold mb-2">Basketball</Text>
                  <Text className="text-cyan-400 text-base font-medium mb-3">Streetball urbain</Text>
                  <Text className="text-slate-400 text-sm">1,800+ joueurs</Text>
                </View>
                <View style={{ width: 72, height: 72 }} className="rounded-2xl overflow-hidden border-2 border-slate-700/30">
                  <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3' }}
                    className="w-full h-full"
                    imageStyle={{ borderRadius: 14 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Événements Gratuits Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-6 px-1">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="trophy" size={18} color="#ffffff" />
                </LinearGradient>
                <Text className="text-white text-xl font-bold tracking-tight">
                  Événements gratuits
                </Text>
              </View>
              
              <TouchableOpacity className="bg-slate-800 border border-slate-700/50 px-4 py-2 rounded-lg">
                <Text className="text-cyan-400 text-sm font-medium">Voir plus</Text>
              </TouchableOpacity>
            </View>

            {/* Events Cards */}
            <View style={{ gap: 16 }}>
              {/* Session Football Card */}
              <TouchableOpacity 
                className="rounded-2xl overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View style={{ height: 200, position: 'relative' }}>
                  <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
                    style={{ flex: 1, justifyContent: 'space-between', padding: 16 }}
                    imageStyle={{ borderRadius: 16 }}
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                      style={{ position: 'absolute', inset: 0, borderRadius: 16 }}
                    />
                    
                    {/* GRATUIT Badge */}
                    <View style={{
                      backgroundColor: '#06b6d4',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 20,
                      alignSelf: 'flex-start',
                      zIndex: 1
                    }}>
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>GRATUIT</Text>
                    </View>
                    
                    {/* Event Info */}
                    <View style={{ zIndex: 1 }}>
                      <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                        Session Football
                      </Text>
                      <Text style={{ color: '#ffffff', fontSize: 16, opacity: 0.9 }}>
                        Jusqu'au 31 déc.
                      </Text>
                    </View>
                  </ImageBackground>
                </View>
              </TouchableOpacity>

              {/* Tournoi Basketball Card */}
              <TouchableOpacity 
                className="rounded-2xl overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View style={{ height: 200, position: 'relative' }}>
                  <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
                    style={{ flex: 1, justifyContent: 'space-between', padding: 16 }}
                    imageStyle={{ borderRadius: 16 }}
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                      style={{ position: 'absolute', inset: 0, borderRadius: 16 }}
                    />
                    
                    {/* BIENTÔT Badge */}
                    <View style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 20,
                      alignSelf: 'flex-start',
                      zIndex: 1
                    }}>
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>BIENTÔT</Text>
                    </View>
                    
                    {/* Event Info */}
                    <View style={{ zIndex: 1 }}>
                      <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                        Tournoi Basketball
                      </Text>
                      <Text style={{ color: '#ffffff', fontSize: 16, opacity: 0.9 }}>
                        Démarre le 15 jan.
                      </Text>
                    </View>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Section */}
          <View className="mb-6">
            <View 
              className="flex-row justify-between items-center bg-slate-800 border border-slate-700/50 rounded-3xl px-8 py-10"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <StatItem number="2.4K+" label="Joueurs actifs" />
              <View className="w-px h-12 bg-slate-700/50" />
              <StatItem number="150+" label="Événements/mois" />
              <View className="w-px h-12 bg-slate-700/50" />
              <StatItem number="25" label="Sports disponibles" />
            </View>
          </View>

          {/* Call to Action Section */}
          <View className="mb-6">
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(34, 211, 238, 0.2)',
                shadowColor: '#06b6d4',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <View style={{
                width: 80,
                height: 80,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32
              }}>
                <Ionicons name="ribbon" size={36} color="#ffffff" />
              </View>
              
              <Text style={{
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 'bold',
                marginBottom: 16,
                textAlign: 'center',
                letterSpacing: -0.5
              }}>
                Prêt à commencer ?
              </Text>
              
              <Text style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 40,
                lineHeight: 24,
                maxWidth: 240
              }}>
                Rejoignez des milliers de sportifs passionnés
              </Text>

              {/* Create Account Button */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Register')}
                style={{
                  width: '100%',
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <View style={{
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 12,
                  paddingVertical: 20,
                  paddingHorizontal: 32,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: 'bold' }}>Créer un compte</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            className="mb-8"
            onPress={() => navigation.navigate('Login')}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <View className="bg-slate-800 border border-slate-700/70 rounded-xl py-5 px-8 flex-row items-center justify-center">
              <Text className="text-white text-lg font-semibold">Se connecter</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;