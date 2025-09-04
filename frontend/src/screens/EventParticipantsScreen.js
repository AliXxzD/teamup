import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventParticipantsScreen = ({ route, navigation }) => {
  const { eventId, eventData } = route.params;
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les participants');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = async (participantId) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/participants/${participantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Succès', 'Participant retiré de l\'événement');
        loadParticipants(); // Recharger la liste
      } else {
        Alert.alert('Erreur', 'Impossible de retirer le participant');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const confirmRemoveParticipant = (participant) => {
    Alert.alert(
      'Retirer le participant',
      `Êtes-vous sûr de vouloir retirer ${participant.name} de cet événement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Retirer', 
          style: 'destructive',
          onPress: () => removeParticipant(participant._id)
        }
      ]
    );
  };

  const renderParticipant = (participant) => (
    <View key={participant._id} className="bg-dark-800 rounded-lg p-4 mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        {/* Avatar */}
        <View className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center mr-3">
          <Text className="text-white text-lg font-bold">
            {participant.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        
        {/* Info participant */}
        <View className="flex-1">
          <Text className="text-white text-base font-semibold">{participant.name}</Text>
          <Text className="text-dark-300 text-sm">{participant.email}</Text>
          {participant.phone && (
            <Text className="text-dark-400 text-xs">{participant.phone}</Text>
          )}
        </View>
      </View>

      {/* Bouton retirer */}
      <TouchableOpacity
        className="bg-red-500/20 border border-red-500/30 rounded-lg p-2"
        onPress={() => confirmRemoveParticipant(participant)}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-dark-700">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Gérer les participants</Text>
        <View className="w-6" />
      </View>

      {/* Event Info */}
      <View className="px-6 py-4 bg-dark-800/50">
        <Text className="text-white text-xl font-bold mb-2">{eventData?.title}</Text>
        <View className="flex-row items-center">
          <Ionicons name="people" size={16} color="#84cc16" />
          <Text className="text-dark-300 text-sm ml-2">
            {participants.length} participant{participants.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Participants List */}
      <ScrollView className="flex-1 px-6 py-4">
        {loading ? (
          <View className="items-center py-8">
            <Text className="text-white text-base">Chargement des participants...</Text>
          </View>
        ) : participants.length > 0 ? (
          participants.map(renderParticipant)
        ) : (
          <View className="items-center py-8">
            <Ionicons name="people-outline" size={48} color="#64748b" />
            <Text className="text-dark-300 text-base mt-4 text-center">
              Aucun participant pour le moment
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventParticipantsScreen;
