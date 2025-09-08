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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlobalMenu from '../components/GlobalMenu';
import EventCard from '../components/EventCard';
import LoginPromptModal from '../components/LoginPromptModal';
import { getAllEvents } from '../data/eventsData';
import { getEventAddress, getEventTitle, getEventPrice, getEventParticipants, getEventTime, getOrganizerName } from '../utils/eventUtils';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  // Get events from database - each with unique details
  const sampleEvents = getAllEvents().slice(0, 3); // Show first 3 events

  // Handle event click for non-authenticated users
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setSelectedEvent(null);
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

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

            {/* Call to Action Banner */}
            <TouchableOpacity
              onPress={() => setShowLoginModal(true)}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#334155',
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={{
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16
                  }}
                >
                  <Ionicons name="star" size={20} color="#ffffff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text className="text-white text-lg font-bold mb-1">
                    Découvrez plus d'événements
                  </Text>
                  <Text className="text-slate-400 text-sm">
                    Créez un compte pour accéder à tous les événements
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#3b82f6',
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ionicons name="chevron-forward" size={14} color="#ffffff" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Enhanced Event Cards */}
            <View style={{ gap: 16 }}>
              {sampleEvents.map((event) => (
                <TouchableOpacity
                  key={event._id || event.id}
                  onPress={() => handleEventClick(event)}
                  activeOpacity={0.9}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <View className="rounded-2xl overflow-hidden">
                    <View style={{ height: 160, position: 'relative' }}>
                      <ImageBackground
                        source={{ uri: event.image }}
                        style={{ flex: 1, justifyContent: 'space-between', padding: 16 }}
                        imageStyle={{ borderRadius: 16 }}
                      >
                        <LinearGradient
                          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                          style={{ position: 'absolute', inset: 0, borderRadius: 16 }}
                        />
                        
                        {/* Top Section - Badge */}
                        <View style={{ zIndex: 1 }}>
                          {event.isFree ? (
                            <View className="bg-teal-500 rounded-full px-3 py-1 self-start">
                              <Text className="text-white text-xs font-bold">Gratuit</Text>
                            </View>
                          ) : (
                            <View className="bg-orange-500 rounded-full px-3 py-1 self-start">
                              <Text className="text-white text-xs font-bold">€{String(event.price?.amount || 10)}</Text>
                            </View>
                          )}
                        </View>

                        {/* Middle Section - Title */}
                        <View style={{ zIndex: 1, flex: 1, justifyContent: 'center' }}>
                          <Text className="text-white text-2xl font-bold mb-2">
                            {getEventTitle(event)}
                          </Text>
                        </View>

                        {/* Bottom Section - Info and Organizer */}
                        <View style={{ zIndex: 1 }}>
                          <View className="flex-row items-center justify-between mb-3">
                            {/* Left side - Time and Participants */}
                            <View>
                              <View className="flex-row items-center mb-1">
                                <Ionicons name="time-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                                <Text className="text-white text-sm font-medium">
                                  Aujourd'hui {getEventTime(event)}
                                </Text>
                              </View>
                              
                              <View className="flex-row items-center">
                                <Ionicons name="people-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                                <Text className="text-white text-sm font-medium">
                                  {event.participants || 0}/{event.maxParticipants || 0}
                                </Text>
                              </View>
                            </View>

                            {/* Right side - Join Button */}
                            <TouchableOpacity 
                              className="bg-teal-500 rounded-xl px-4 py-2 flex-row items-center"
                              onPress={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              activeOpacity={0.8}
                            >
                              <Text className="text-white text-sm font-bold mr-2">Rejoindre</Text>
                              <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                            </TouchableOpacity>
                          </View>
                          
                          {/* Location and Organizer */}
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                              <Ionicons name="location-outline" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                              <Text className="text-white text-sm opacity-90" numberOfLines={1}>
                                {getEventAddress(event)}
                              </Text>
                            </View>
                            
                            {/* Clickable Organizer */}
                            <TouchableOpacity
                              className="flex-row items-center ml-2"
                              onPress={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              activeOpacity={0.8}
                            >
                              <Text className="text-white/70 text-xs mr-1">
                                par {String(event.organizer?.name || 'Club FC Local')}
                              </Text>
                              <Ionicons name="person-outline" size={12} color="#ffffff" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Login Required Overlay */}
                        <View style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(59, 130, 246, 0.95)',
                          padding: 12,
                          borderBottomLeftRadius: 16,
                          borderBottomRightRadius: 16,
                          zIndex: 2
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="lock-closed" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                            <Text className="text-white text-sm font-semibold">
                              Connexion requise pour rejoindre
                            </Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
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

      {/* Login Prompt Modal */}
      <LoginPromptModal
        visible={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
        onRegister={handleRegister}
        event={selectedEvent}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;