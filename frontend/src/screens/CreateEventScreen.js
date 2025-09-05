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
  Alert,
  Animated,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import GlobalMenu from '../components/GlobalMenu';

const CreateEventScreenTailwind = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    level: '',
    price: '',
    isFree: true
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const { eventId, eventData, isEditing } = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    if (isEditing && eventData) {
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        sport: eventData.sport || '',
        date: eventData.date || '',
        time: eventData.time || '',
        location: eventData.location?.address || '',
        maxParticipants: eventData.maxParticipants?.toString() || '',
        level: eventData.level || '',
        price: eventData.price?.amount?.toString() || '',
        isFree: eventData.price?.isFree ?? true
      });
    }
  }, [isEditing, eventData]);

  const sports = [
    { name: 'Football', icon: 'football', color: '#10B981' },
    { name: 'Basketball', icon: 'basketball', color: '#F59E0B' },
    { name: 'Tennis', icon: 'tennisball', color: '#EF4444' },
    { name: 'Running', icon: 'walk', color: '#3B82F6' },
    { name: 'Yoga', icon: 'leaf', color: '#8B5CF6' },
    { name: 'Natation', icon: 'water', color: '#06B6D4' },
    { name: 'Volleyball', icon: 'radio-button-off', color: '#EC4899' },
    { name: 'Badminton', icon: 'tennisball', color: '#84CC16' },
    { name: 'Cyclisme', icon: 'bicycle', color: '#F97316' },
    { name: 'Fitness', icon: 'fitness', color: '#A855F7' },
    { name: 'Rugby', icon: 'american-football', color: '#059669' },
    { name: 'Handball', icon: 'radio-button-off', color: '#DC2626' }
  ];

  const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Titre requis';
    if (!formData.description.trim()) newErrors.description = 'Description requise';
    if (!formData.sport) newErrors.sport = 'Sport requis';
    if (!formData.date) newErrors.date = 'Date requise';
    if (!formData.time) newErrors.time = 'Heure requise';
    if (!formData.location.trim()) newErrors.location = 'Lieu requis';
    if (!formData.maxParticipants) newErrors.maxParticipants = 'Nombre de participants requis';
    if (!formData.level) newErrors.level = 'Niveau requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        navigation.navigate('Login');
        return;
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        sport: formData.sport,
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        maxParticipants: parseInt(formData.maxParticipants),
        level: formData.level,
        isFree: formData.isFree,
        ...((!formData.isFree && formData.price) && { price: parseFloat(formData.price) })
      };

      const url = isEditing 
        ? `${API_BASE_URL}${API_ENDPOINTS.EVENTS.DETAILS(eventId)}`
        : `${API_BASE_URL}${API_ENDPOINTS.EVENTS.CREATE}`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(eventData)
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        Alert.alert(
          'Succès !',
          isEditing ? 'Événement modifié avec succès.' : 'Événement créé avec succès.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erreur', responseData.message || 'Une erreur est survenue');
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'événement');
    } finally {
      setIsLoading(false);
    }
  };

  const SportSelector = () => (
    <View className="mb-6">
      <Text className="text-dark-300 text-sm font-medium mb-3">Sport *</Text>
      <View className="flex-row flex-wrap">
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport.name}
            className={`flex-row items-center px-4 py-2 rounded-lg mr-2 mb-2 border ${
              formData.sport === sport.name
                ? 'bg-lime border-lime'
                : 'bg-dark-700 border-dark-600'
            }`}
            onPress={() => setFormData({ ...formData, sport: sport.name })}
          >
            <Ionicons 
              name={sport.icon} 
              size={16} 
              color={formData.sport === sport.name ? '#0f172a' : sport.color}
            />
            <Text className={`ml-2 text-sm font-medium ${
              formData.sport === sport.name ? 'text-dark-900' : 'text-dark-300'
            }`}>
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.sport && (
        <Text className="text-danger text-xs mt-1">{errors.sport}</Text>
      )}
    </View>
  );

  const LevelSelector = () => (
    <View className="mb-6">
      <Text className="text-dark-300 text-sm font-medium mb-3">Niveau *</Text>
      <View className="flex-row flex-wrap">
        {levels.map((level) => (
          <TouchableOpacity
            key={level}
            className={`px-4 py-2 rounded-lg mr-2 mb-2 border ${
              formData.level === level
                ? 'bg-lime border-lime'
                : 'bg-dark-700 border-dark-600'
            }`}
            onPress={() => setFormData({ ...formData, level })}
          >
            <Text className={`text-sm font-medium ${
              formData.level === level ? 'text-dark-900' : 'text-dark-300'
            }`}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.level && (
        <Text className="text-danger text-xs mt-1">{errors.level}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="bg-dark-900 border-b border-dark-700">
          <View className="flex-row justify-between items-center px-6 py-4">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">
              {isEditing ? 'Modifier l\'événement' : 'Créer un événement'}
            </Text>
            <View className="w-6" />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Animated.View 
            className="px-6 py-6"
            style={{ opacity: fadeAnim }}
          >
            {/* Title & Description */}
            <View className="bg-dark-800 rounded-2xl p-6 mb-4">
              <Text className="text-white text-lg font-bold mb-4">Informations générales</Text>
              
              {/* Title */}
              <View className="mb-4">
                <Text className="text-dark-300 text-sm font-medium mb-2">Titre de l'événement *</Text>
                <TextInput
                  className={`bg-dark-700 rounded-xl px-4 py-3 text-white text-base border ${
                    errors.title ? 'border-danger' : 'border-dark-600'
                  }`}
                  placeholder="Ex: Match de football amical"
                  placeholderTextColor="#64748b"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  maxLength={100}
                />
                {errors.title && (
                  <Text className="text-danger text-xs mt-1">{errors.title}</Text>
                )}
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-dark-300 text-sm font-medium mb-2">Description *</Text>
                <TextInput
                  className={`bg-dark-700 rounded-xl px-4 py-3 text-white text-base border ${
                    errors.description ? 'border-danger' : 'border-dark-600'
                  }`}
                  placeholder="Décrivez votre événement..."
                  placeholderTextColor="#64748b"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={1000}
                />
                {errors.description && (
                  <Text className="text-danger text-xs mt-1">{errors.description}</Text>
                )}
              </View>

              <SportSelector />
            </View>

            {/* Date & Time */}
            <View className="bg-dark-800 rounded-2xl p-6 mb-4">
              <Text className="text-white text-lg font-bold mb-4">Date et heure</Text>
              
              <View className="flex-row justify-between mb-4">
                {/* Date */}
                <View className="flex-1 mr-2">
                  <Text className="text-dark-300 text-sm font-medium mb-2">Date *</Text>
                  <TouchableOpacity
                    className={`bg-dark-700 rounded-xl px-4 py-3 flex-row items-center border ${
                      errors.date ? 'border-danger' : 'border-dark-600'
                    }`}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#64748b" />
                    <Text className="text-white text-base ml-3">
                      {formData.date || 'Sélectionner'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Time */}
                <View className="flex-1 ml-2">
                  <Text className="text-dark-300 text-sm font-medium mb-2">Heure *</Text>
                  <TouchableOpacity
                    className={`bg-dark-700 rounded-xl px-4 py-3 flex-row items-center border ${
                      errors.time ? 'border-danger' : 'border-dark-600'
                    }`}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={20} color="#64748b" />
                    <Text className="text-white text-base ml-3">
                      {formData.time || 'Sélectionner'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Location & Participants */}
            <View className="bg-dark-800 rounded-2xl p-6 mb-4">
              <Text className="text-white text-lg font-bold mb-4">Lieu et participants</Text>
              
              {/* Location */}
              <View className="mb-4">
                <Text className="text-dark-300 text-sm font-medium mb-2">Lieu *</Text>
                <View className={`flex-row items-center bg-dark-700 rounded-xl px-4 py-3 border ${
                  errors.location ? 'border-danger' : 'border-dark-600'
                }`}>
                  <Ionicons name="location-outline" size={20} color="#64748b" />
                  <TextInput
                    className="flex-1 text-white text-base ml-3"
                    placeholder="Adresse du lieu"
                    placeholderTextColor="#64748b"
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    maxLength={200}
                  />
                </View>
                {errors.location && (
                  <Text className="text-danger text-xs mt-1">{errors.location}</Text>
                )}
              </View>

              {/* Max Participants */}
              <View className="mb-4">
                <Text className="text-dark-300 text-sm font-medium mb-2">Nombre max de participants *</Text>
                <View className={`flex-row items-center bg-dark-700 rounded-xl px-4 py-3 border ${
                  errors.maxParticipants ? 'border-danger' : 'border-dark-600'
                }`}>
                  <Ionicons name="people-outline" size={20} color="#64748b" />
                  <TextInput
                    className="flex-1 text-white text-base ml-3"
                    placeholder="Ex: 20"
                    placeholderTextColor="#64748b"
                    value={formData.maxParticipants}
                    onChangeText={(text) => setFormData({ ...formData, maxParticipants: text })}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                {errors.maxParticipants && (
                  <Text className="text-danger text-xs mt-1">{errors.maxParticipants}</Text>
                )}
              </View>

              <LevelSelector />
            </View>

            {/* Price */}
            <View className="bg-dark-800 rounded-2xl p-6 mb-6">
              <Text className="text-white text-lg font-bold mb-4">Tarification</Text>
              
              {/* Free/Paid Toggle */}
              <View className="flex-row mb-4">
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-l-lg border-r border-dark-600 ${
                    formData.isFree ? 'bg-lime' : 'bg-dark-700'
                  }`}
                  onPress={() => setFormData({ ...formData, isFree: true, price: '' })}
                >
                  <Text className={`text-center font-semibold ${
                    formData.isFree ? 'text-dark-900' : 'text-dark-300'
                  }`}>
                    Gratuit
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-r-lg ${
                    !formData.isFree ? 'bg-lime' : 'bg-dark-700'
                  }`}
                  onPress={() => setFormData({ ...formData, isFree: false })}
                >
                  <Text className={`text-center font-semibold ${
                    !formData.isFree ? 'text-dark-900' : 'text-dark-300'
                  }`}>
                    Payant
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Price Input */}
              {!formData.isFree && (
                <View>
                  <Text className="text-dark-300 text-sm font-medium mb-2">Prix (€)</Text>
                  <View className="flex-row items-center bg-dark-700 rounded-xl px-4 py-3 border border-dark-600">
                    <Ionicons name="card-outline" size={20} color="#64748b" />
                    <TextInput
                      className="flex-1 text-white text-base ml-3"
                      placeholder="Ex: 15"
                      placeholderTextColor="#64748b"
                      value={formData.price}
                      onChangeText={(text) => setFormData({ ...formData, price: text })}
                      keyboardType="numeric"
                    />
                    <Text className="text-dark-400 text-sm">€</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-lime rounded-lg py-4 px-6 flex-row items-center justify-center"
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#0f172a" />
              ) : (
                <>
                  <Ionicons 
                    name={isEditing ? "checkmark" : "add"} 
                    size={20} 
                    color="#0f172a" 
                  />
                  <Text className="text-dark-900 font-bold text-lg ml-2">
                    {isEditing ? 'Modifier l\'événement' : 'Créer l\'événement'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                setSelectedDate(date);
                setFormData({ 
                  ...formData, 
                  date: date.toISOString().split('T')[0] 
                });
              }
            }}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) {
                setSelectedTime(time);
                const hours = time.getHours().toString().padStart(2, '0');
                const minutes = time.getMinutes().toString().padStart(2, '0');
                setFormData({ 
                  ...formData, 
                  time: `${hours}:${minutes}` 
                });
              }
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateEventScreenTailwind;
