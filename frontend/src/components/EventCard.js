import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EventCard = ({ event, onPress, showManageButton = false, onManage, navigation }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'full': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#64748b';
      default: return '#22c55e';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'full': return 'Complet';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return 'Actif';
    }
  };

  const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'football': return 'football';
      case 'basketball': return 'basketball';
      case 'tennis': return 'tennisball';
      case 'volleyball': return 'american-football';
      case 'running': return 'walk';
      default: return 'trophy';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const getEventImage = (sport) => {
    const images = {
      football: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      running: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    };
    return images[sport?.toLowerCase()] || images.football;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 16,
      }}
    >
      <View className="bg-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Event Image Header */}
        <View style={{ height: 160, position: 'relative' }}>
          <ImageBackground
            source={{ uri: event.image || getEventImage(event.sport) }}
            style={{ flex: 1 }}
            imageStyle={{ opacity: 0.9 }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
              style={{ flex: 1, justifyContent: 'space-between', padding: 16 }}
            >
              {/* Top Badges */}
              <View className="flex-row justify-between items-start">
                <View style={{ gap: 8 }}>
                  {/* Free/Price Badge */}
                  {event.isFree || event.price?.isFree ? (
                    <View className="bg-cyan-500 rounded-full px-3 py-1">
                      <Text className="text-white text-xs font-bold">GRATUIT</Text>
                    </View>
                  ) : (
                    <View className="bg-orange-500 rounded-full px-3 py-1">
                      <Text className="text-white text-xs font-bold">{event.price?.amount || '€10'}</Text>
                    </View>
                  )}

                  {/* Sport Badge */}
                  <View className="bg-black/50 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-medium">{event.sport || 'Football'}</Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View 
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: getStatusColor(event.status) + '20' }}
                >
                  <Text 
                    className="text-xs font-bold"
                    style={{ color: getStatusColor(event.status) }}
                  >
                    {getStatusText(event.status)}
                  </Text>
                </View>
              </View>

              {/* Event Title */}
              <View>
                <Text 
                  className="text-white text-xl font-bold mb-2"
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2
                  }}
                  numberOfLines={2}
                >
                  {event.title || 'Match de Football'}
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Event Information */}
        <View className="p-4">
          {/* Date and Time */}
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-cyan-500/20 rounded-lg items-center justify-center mr-3">
              <Ionicons name="calendar-outline" size={16} color="#22d3ee" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-medium">
                {event.date ? formatDate(event.date) : 'Lundi 20 jan'}
              </Text>
              <Text className="text-slate-400 text-sm">
                {event.time || '18:00'} • {event.duration || '2h'}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-cyan-500/20 rounded-lg items-center justify-center mr-3">
              <Ionicons name="location-outline" size={16} color="#22d3ee" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-medium" numberOfLines={1}>
                {event.location?.address || event.location?.fullAddress || (typeof event.location === 'string' ? event.location : 'Stade Municipal')}
              </Text>
              <Text className="text-slate-400 text-sm">
                {event.location?.city || 'Paris 15ème'}
              </Text>
            </View>
          </View>

          {/* Participants and Level */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-cyan-500/20 rounded-lg items-center justify-center mr-3">
                <Ionicons name="people-outline" size={16} color="#22d3ee" />
              </View>
              <View>
                <Text className="text-white text-base font-medium">
                  {event.participants || event.currentParticipants || 8}/{event.maxParticipants || 11}
                </Text>
                <Text className="text-slate-400 text-sm">participants</Text>
              </View>
            </View>

            <View className="items-end">
              <Text className="text-slate-400 text-sm">Niveau</Text>
              <Text className="text-white text-base font-medium">
                {event.level || 'Intermédiaire'}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-4">
            <View className="w-full h-2 bg-slate-700 rounded-full">
              <View 
                className="h-2 bg-cyan-500 rounded-full"
                style={{ 
                  width: `${((event.participants || event.currentParticipants || 8) / (event.maxParticipants || 11)) * 100}%` 
                }}
              />
            </View>
          </View>

          {/* Organizer Info */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              className="flex-row items-center flex-1 mr-3"
              onPress={(e) => {
                e.stopPropagation();
                if (navigation && event.organizer) {
                  const userId = event.organizer?._id || event.organizer?.id;
                  if (userId) {
                    console.log('📍 Navigation EventCard vers UserProfile:', userId);
                    navigation.navigate('UserProfile', { userId });
                  } else {
                    console.log('⚠️ Pas d\'ID organisateur dans EventCard');
                    Alert.alert('Info', 'Profil de l\'organisateur non disponible');
                  }
                }
              }}
              activeOpacity={0.8}
            >
              <Image
                source={{ 
                  uri: event.organizer?.avatar || event.organizer?.profile?.avatar || 
                  'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
                }}
                className="w-10 h-10 rounded-full mr-3 border border-slate-600"
              />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-white text-sm font-medium" numberOfLines={1}>
                    {event.organizer?.name || event.organizerName || 'Alex Martin'}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#64748b" style={{ marginLeft: 4 }} />
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={12} color="#f59e0b" style={{ marginRight: 2 }} />
                  <Text className="text-slate-400 text-xs">
                    {event.organizer?.rating || '4.8'} • {event.organizer?.eventsCount || '23'} événements
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View className="flex-row items-center" style={{ gap: 8 }}>
              {/* Message Button */}
              <TouchableOpacity 
                className="w-9 h-9 bg-slate-700 rounded-lg items-center justify-center"
                onPress={(e) => {
                  e.stopPropagation();
                  if (navigation && event.organizer) {
                    const organizerId = event.organizer?._id || event.organizer?.id;
                    const eventId = event._id || event.id;
                    
                    if (organizerId && eventId) {
                      console.log('📍 Navigation EventCard vers Chat:', { organizerId, eventId });
                      navigation.navigate('Chat', { 
                        conversationId: `${organizerId}_${eventId}`,
                        otherUser: {
                          id: organizerId,
                          name: event.organizer.name || 'Organisateur',
                          avatar: event.organizer.profile?.avatar || event.organizer.avatar || null
                        }
                      });
                    } else {
                      console.log('⚠️ IDs manquants pour chat dans EventCard');
                      Alert.alert('Info', 'Impossible de contacter l\'organisateur');
                    }
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#64748b" />
              </TouchableOpacity>

              {/* Join/Manage Button */}
              {showManageButton ? (
                <TouchableOpacity 
                  className="bg-cyan-500 rounded-lg px-3 py-2"
                  onPress={(e) => {
                    e.stopPropagation();
                    onManage && onManage();
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xs font-bold">Gérer</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  className="bg-cyan-500 rounded-lg px-3 py-2"
                  onPress={(e) => {
                    e.stopPropagation();
                    // Handle join event
                    if (onPress) onPress();
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xs font-bold">Rejoindre</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;


