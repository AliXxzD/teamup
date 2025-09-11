import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TeamupLogo from '../components/TeamupLogo';

// Composant InputField défini à l'extérieur pour éviter les re-renders
const InputField = ({ label, value, onChangeText, placeholder, error, multiline = false, keyboardType = 'default' }) => (
  <View className="mb-4">
    <Text className="text-white text-base font-medium mb-2">{label}</Text>
    <TextInput
      className={`bg-slate-800 border rounded-2xl px-4 py-3 text-white text-base ${
        error ? 'border-red-500' : 'border-slate-600'
      }`}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#64748b"
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      keyboardType={keyboardType}
      style={{
        textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
    {error && <Text className="text-red-400 text-sm mt-1">{error}</Text>}
  </View>
);

// Composant DateField défini à l'extérieur
const DateField = ({ label, value, error, onPress }) => (
  <View className="mb-4">
    <Text className="text-white text-base font-medium mb-2">{label}</Text>
    <TouchableOpacity
      className={`bg-slate-800 border rounded-2xl px-4 py-3 flex-row items-center justify-between ${
        error ? 'border-red-500' : 'border-slate-600'
      }`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text className={`text-base ${value ? 'text-white' : 'text-slate-400'}`}>
        {value ? new Date(value).toLocaleDateString('fr-FR') : 'Sélectionner une date'}
      </Text>
      <Ionicons name="calendar-outline" size={20} color="#64748b" />
    </TouchableOpacity>
    {error && <Text className="text-red-400 text-sm mt-1">{error}</Text>}
  </View>
);

const EditProfileScreen = ({ navigation }) => {
  const { user, setUser } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [phoneText, setPhoneText] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    gender: '',
    favoriteSports: [],
  });

  const [errors, setErrors] = useState({});

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

    // Charger les données utilisateur
    if (user) {
      const userDate = user.dateOfBirth ? new Date(user.dateOfBirth) : new Date();
      setSelectedDate(userDate);
      setPhoneText(user.phone || '');
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        favoriteSports: user.favoriteSports || [],
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Le numéro de téléphone n\'est pas valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour modifier votre profil');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Mettre à jour l'utilisateur dans le contexte
        setUser(data.user);
        
        Alert.alert(
          'Succès',
          'Votre profil a été mis à jour avec succès',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler',
      'Êtes-vous sûr de vouloir annuler ? Vos modifications ne seront pas sauvegardées.',
      [
        { text: 'Continuer l\'édition', style: 'cancel' },
        { text: 'Annuler', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
      setFormData({ ...formData, dateOfBirth: formattedDate });
    }
  };

  // Handlers avec useCallback pour éviter les re-renders
  const handleNameChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, name: text }));
  }, []);

  const handleEmailChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, email: text }));
  }, []);

  const handlePhoneChange = useCallback((text) => {
    setPhoneText(text);
    setFormData(prev => ({ ...prev, phone: text }));
  }, []);

  const handleBioChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, bio: text }));
  }, []);

  const handleLocationChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, location: text }));
  }, []);

  const handleGenderChange = useCallback((gender) => {
    setFormData(prev => ({ ...prev, gender }));
  }, []);

  const handleDatePress = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-slate-900 px-6 pt-6 pb-4 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            {/* Bouton retour */}
            <TouchableOpacity
              className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center mr-3"
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={24} color="#ffffff" />
            </LinearGradient>
            <Text className="text-white text-2xl font-bold">Modifier le profil</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            className="px-6 pt-6 pb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            {/* Informations personnelles */}
            <View className="bg-slate-800/30 border border-slate-700/20 rounded-2xl p-5 mb-6">
              <Text className="text-white text-xl font-bold mb-5 px-1">Informations personnelles</Text>
              
              <InputField
                label="Nom complet *"
                value={formData.name}
                onChangeText={handleNameChange}
                placeholder="Votre nom complet"
                error={errors.name}
              />
              
              <InputField
                label="Email *"
                value={formData.email}
                onChangeText={handleEmailChange}
                placeholder="votre@email.com"
                keyboardType="email-address"
                error={errors.email}
              />
              
              <InputField
                label="Téléphone"
                value={phoneText}
                onChangeText={handlePhoneChange}
                placeholder="06 12 34 56 78"
                keyboardType="phone-pad"
                error={errors.phone}
              />
              
              <DateField
                label="Date de naissance"
                value={formData.dateOfBirth}
                error={errors.dateOfBirth}
                onPress={handleDatePress}
              />
              
              <View className="mb-4">
                <Text className="text-white text-base font-medium mb-2">Genre</Text>
                <View className="flex-row space-x-3">
                  {['Homme', 'Femme', 'Autre'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      className={`flex-1 py-3 px-4 rounded-xl border ${
                        formData.gender === gender
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'bg-slate-800 border-slate-600'
                      }`}
                      onPress={() => handleGenderChange(gender)}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-center font-medium ${
                        formData.gender === gender ? 'text-white' : 'text-slate-300'
                      }`}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Informations supplémentaires */}
            <View className="bg-slate-800/30 border border-slate-700/20 rounded-2xl p-5 mb-6">
              <Text className="text-white text-xl font-bold mb-5 px-1">Informations supplémentaires</Text>
              
              <InputField
                label="Localisation"
                value={formData.location}
                onChangeText={handleLocationChange}
                placeholder="Ville, région"
                error={errors.location}
              />
              
              <InputField
                label="Biographie"
                value={formData.bio}
                onChangeText={handleBioChange}
                placeholder="Parlez-nous de vous..."
                multiline={true}
                error={errors.bio}
              />
            </View>

            {/* Boutons d'action */}
            <View className="space-y-3">
              <TouchableOpacity
                className="bg-cyan-500 rounded-2xl py-4 px-6 flex-row items-center justify-center"
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
                style={{
                  shadowColor: '#06b6d4',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                )}
                <Text className="text-white text-lg font-bold ml-2">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-slate-700 rounded-2xl py-4 px-6 flex-row items-center justify-center"
                onPress={handleCancel}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={20} color="#ffffff" />
                <Text className="text-white text-lg font-bold ml-2">Annuler</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </SafeAreaView>
  );
};

export default EditProfileScreen;
