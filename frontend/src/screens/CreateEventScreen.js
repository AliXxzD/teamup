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
  const [dateFieldAnim] = useState(new Animated.Value(1));
  const [timeFieldAnim] = useState(new Animated.Value(1));
  const [pickerSlideAnim] = useState(new Animated.Value(300));

  const { eventId, eventData, isEditing } = route.params || {};

  useEffect(() => {
    // Délayer l'animation pour éviter les conflits avec React 18
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 100);

    if (isEditing && eventData) {
      // Mode édition : remplir avec les données de l'événement
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
    } else {
      // Mode création : réinitialiser le formulaire
      setFormData({
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
      
      // Réinitialiser aussi les dates et les erreurs
      setSelectedDate(new Date());
      setSelectedTime(new Date());
      setErrors({});
    }

    return () => clearTimeout(timer);
  }, [isEditing, eventData]);

  // Réinitialiser le formulaire quand on navigue vers la page (focus)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Si ce n'est pas en mode édition, réinitialiser le formulaire
      if (!isEditing) {
        setFormData({
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
        setSelectedDate(new Date());
        setSelectedTime(new Date());
        setErrors({});
      }
    });

    return unsubscribe;
  }, [navigation, isEditing]);

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

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, date: formattedDate });
      
      // Animation de confirmation du champ avec délai
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dateFieldAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(dateFieldAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }, 50);
    }
    
    // Fermeture du picker avec animation
    setTimeout(() => {
      Animated.timing(pickerSlideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowDatePicker(false));
    }, 100);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      setFormData({ ...formData, time: formattedTime });
      
      // Animation de confirmation du champ avec délai
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(timeFieldAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(timeFieldAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }, 50);
    }
    
    // Fermeture du picker avec animation
    setTimeout(() => {
      Animated.timing(pickerSlideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowTimePicker(false));
    }, 100);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
    // Réinitialiser l'animation avant ouverture
    pickerSlideAnim.setValue(300);
    
    setTimeout(() => {
      Animated.timing(pickerSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 50);
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
    // Réinitialiser l'animation avant ouverture
    pickerSlideAnim.setValue(300);
    
    setTimeout(() => {
      Animated.timing(pickerSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 50);
  };

  const formatDisplayDate = (date) => {
    if (!date) return 'Sélectionner une date';
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };

  const formatDisplayTime = (time) => {
    if (!time) return 'Sélectionner une heure';
    return time;
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
        // Réinitialiser le formulaire après succès
        if (!isEditing) {
          setFormData({
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
          setSelectedDate(new Date());
          setSelectedTime(new Date());
          setErrors({});
        }
        
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
                <Animated.View 
                  className="flex-1 mr-2"
                  style={{
                    transform: [{ scale: dateFieldAnim }]
                  }}
                >
                  <Text className="text-white text-base font-medium mb-3">Date *</Text>
                  <TouchableOpacity
                    className={`bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 flex-row items-center ${
                      errors.date ? 'border-red-500' : formData.date ? 'border-cyan-500/50' : 'border-slate-600'
                    }`}
                    onPress={openDatePicker}
                    activeOpacity={0.8}
                    style={{
                      shadowColor: formData.date ? '#06b6d4' : '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: formData.date ? 0.2 : 0.1,
                      shadowRadius: 8,
                      elevation: formData.date ? 4 : 2,
                    }}
                  >
                    <Animated.View 
                      className="w-8 h-8 bg-cyan-500/20 rounded-lg items-center justify-center mr-3"
                      style={{
                        transform: [{ scale: formData.date ? 1.1 : 1 }]
                      }}
                    >
                      <Ionicons name="calendar" size={16} color="#22d3ee" />
                    </Animated.View>
                    <View className="flex-1">
                      <Text className={`text-sm font-medium ${
                        formData.date ? 'text-white' : 'text-slate-400'
                      }`}>
                        {formatDisplayDate(formData.date)}
                      </Text>
                      {formData.date && (
                        <Animated.View
                          style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0]
                            })}]
                          }}
                        >
                          <Text className="text-slate-400 text-xs mt-1">
                            {new Date(formData.date).toLocaleDateString('fr-FR')}
                          </Text>
                        </Animated.View>
                      )}
                    </View>
                  </TouchableOpacity>
                  {errors.date && (
                    <Animated.View
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0]
                        })}]
                      }}
                    >
                      <Text className="text-red-400 text-sm mt-2">{errors.date}</Text>
                    </Animated.View>
                  )}
                </Animated.View>

                {/* Time */}
                <Animated.View 
                  className="flex-1 ml-2"
                  style={{
                    transform: [{ scale: timeFieldAnim }]
                  }}
                >
                  <Text className="text-white text-base font-medium mb-3">Heure *</Text>
                  <TouchableOpacity
                    className={`bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 flex-row items-center ${
                      errors.time ? 'border-red-500' : formData.time ? 'border-cyan-500/50' : 'border-slate-600'
                    }`}
                    onPress={openTimePicker}
                    activeOpacity={0.8}
                    style={{
                      shadowColor: formData.time ? '#06b6d4' : '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: formData.time ? 0.2 : 0.1,
                      shadowRadius: 8,
                      elevation: formData.time ? 4 : 2,
                    }}
                  >
                    <Animated.View 
                      className="w-8 h-8 bg-cyan-500/20 rounded-lg items-center justify-center mr-3"
                      style={{
                        transform: [{ scale: formData.time ? 1.1 : 1 }]
                      }}
                    >
                      <Ionicons name="time" size={16} color="#22d3ee" />
                    </Animated.View>
                    <View className="flex-1">
                      <Text className={`text-sm font-medium ${
                        formData.time ? 'text-white' : 'text-slate-400'
                      }`}>
                        {formatDisplayTime(formData.time)}
                      </Text>
                      {formData.time && (
                        <Animated.View
                          style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0]
                            })}]
                          }}
                        >
                          <Text className="text-slate-400 text-xs mt-1">
                            Heure de début
                          </Text>
                        </Animated.View>
                      )}
                    </View>
                  </TouchableOpacity>
                  {errors.time && (
                    <Animated.View
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0]
                        })}]
                      }}
                    >
                      <Text className="text-red-400 text-sm mt-2">{errors.time}</Text>
                    </Animated.View>
                  )}
                </Animated.View>
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

        {/* Date Picker with Animation */}
        {showDatePicker && (
          <>
            {/* Backdrop */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                opacity: fadeAnim,
                zIndex: 1000,
              }}
            >
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => handleDateChange(null, null)}
              />
            </Animated.View>

            {/* Date Picker Container */}
            <Animated.View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#1e293b',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                zIndex: 1001,
                transform: [{ translateY: pickerSlideAnim }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 15,
              }}
            >
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-xl font-bold">Sélectionner la date</Text>
                <TouchableOpacity onPress={() => handleDateChange(null, null)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                textColor="#ffffff"
                accentColor="#06b6d4"
                themeVariant="dark"
                style={{ backgroundColor: 'transparent' }}
              />
            </Animated.View>
          </>
        )}

        {/* Time Picker with Animation */}
        {showTimePicker && (
          <>
            {/* Backdrop */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                opacity: fadeAnim,
                zIndex: 1000,
              }}
            >
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => handleTimeChange(null, null)}
              />
            </Animated.View>

            {/* Time Picker Container */}
            <Animated.View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#1e293b',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                zIndex: 1001,
                transform: [{ translateY: pickerSlideAnim }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 15,
              }}
            >
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-xl font-bold">Sélectionner l'heure</Text>
                <TouchableOpacity onPress={() => handleTimeChange(null, null)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor="#ffffff"
                accentColor="#06b6d4"
                themeVariant="dark"
                is24Hour={true}
                style={{ backgroundColor: 'transparent' }}
              />
            </Animated.View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateEventScreenTailwind;
