import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/globalStyles';
import GlobalMenu from '../components/GlobalMenu';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

const CreateEventScreen = ({ navigation, route }) => {
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

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs pour la navigation automatique entre les champs
  const titleRef = React.useRef(null);
  const descriptionRef = React.useRef(null);
  const locationRef = React.useRef(null);
  const maxParticipantsRef = React.useRef(null);
  const priceRef = React.useRef(null);

  // Hook pour les alertes personnalisées
  const { alertConfig, showSuccessAlert, showErrorAlert } = useCustomAlert();

  // Récupérer les paramètres d'édition
  const { eventId, eventData, isEditing } = route.params || {};

  // Configuration de l'API
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';

  const sports = [
    'Football', 'Basketball', 'Tennis', 'Running', 'Yoga', 'Natation',
    'Volleyball', 'Badminton', 'Cyclisme', 'Fitness', 'Rugby', 'Handball'
  ];

  const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];

  // Pré-remplir le formulaire si on est en mode édition
  React.useEffect(() => {
    if (isEditing && eventData) {
      const eventDate = new Date(eventData.date);
      const eventTime = new Date(`1970-01-01T${eventData.time}:00`);
      
      setFormData({
        title: eventData.title,
        description: eventData.description,
        sport: eventData.sport,
        date: formatDate(eventDate),
        time: eventData.time,
        location: eventData.location.address,
        maxParticipants: eventData.maxParticipants.toString(),
        level: eventData.level,
        price: eventData.price.isFree ? '' : eventData.price.amount.toString(),
        isFree: eventData.price.isFree
      });
      
      setSelectedDate(eventDate);
      setSelectedTime(eventTime);
    }
  }, [isEditing, eventData]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      handleInputChange('date', formatDate(date));
    }
  };

  const onTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      handleInputChange('time', formatTime(time));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Le titre est obligatoire';
    if (!formData.description.trim()) newErrors.description = 'La description est obligatoire';
    if (!formData.sport) newErrors.sport = 'Veuillez sélectionner un sport';
    if (!formData.date) newErrors.date = 'La date est obligatoire';
    if (!formData.time) newErrors.time = 'L\'heure est obligatoire';
    if (!formData.location.trim()) newErrors.location = 'Le lieu est obligatoire';
    if (!formData.maxParticipants) newErrors.maxParticipants = 'Le nombre de participants est obligatoire';
    if (!formData.level) newErrors.level = 'Le niveau est obligatoire';
    if (!formData.isFree && !formData.price) newErrors.price = 'Le prix est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitEvent = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Récupérer le token d'authentification
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        showErrorAlert(
          'Connexion requise',
          'Vous devez être connecté pour créer un événement',
          () => navigation.navigate('Login')
        );
        return;
      }

      // Préparer les données pour l'API
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        sport: formData.sport,
        date: formatDateForAPI(selectedDate),
        time: formData.time,
        location: formData.location.trim(),
        maxParticipants: parseInt(formData.maxParticipants),
        level: formData.level,
        isFree: formData.isFree,
        ...((!formData.isFree && formData.price) && { price: parseFloat(formData.price) })
      };

      console.log('Envoi des données:', eventData);

      const url = isEditing 
        ? `${API_BASE_URL}/api/events/${eventId}`
        : `${API_BASE_URL}/api/events`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      const responseData = await response.json();
      console.log('Réponse du serveur:', responseData);

      if (response.ok && responseData.success) {
        showSuccessAlert(
          'Succès !',
          isEditing ? 'Votre événement a été modifié avec succès.' : 'Votre événement a été créé avec succès.',
          () => {
            if (!isEditing) {
              // Réinitialiser le formulaire seulement en mode création
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
            }
                // Retourner au dashboard ou à la liste des événements
                navigation.goBack();
              }
        );
      } else {
        // Gérer les erreurs de validation du serveur
        if (responseData.errors && Array.isArray(responseData.errors)) {
          const serverErrors = {};
          responseData.errors.forEach(error => {
            if (error.path) {
              serverErrors[error.path] = error.msg;
            }
          });
          setErrors(serverErrors);
        }
        
        showErrorAlert(
          isEditing ? 'Erreur de modification' : 'Erreur de création',
          responseData.message || (isEditing ? 'Une erreur est survenue lors de la modification de l\'événement' : 'Une erreur est survenue lors de la création de l\'événement')
        );
      }

    } catch (error) {
      console.error('Erreur lors de la soumission de l\'événement:', error);
      showErrorAlert(
        'Erreur de connexion',
        'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderSportSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.inputLabel}>Sport *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
        {sports.map((sport, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.chip,
              formData.sport === sport && styles.chipSelected
            ]}
            onPress={() => handleInputChange('sport', sport)}
          >
            <Text style={[
              styles.chipText,
              formData.sport === sport && styles.chipTextSelected
            ]}>
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors.sport && <Text style={styles.errorText}>{errors.sport}</Text>}
    </View>
  );

  const renderLevelSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.inputLabel}>Niveau requis *</Text>
      <View style={styles.levelContainer}>
        {levels.map((level, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.levelButton,
              formData.level === level && styles.levelButtonSelected
            ]}
            onPress={() => handleInputChange('level', level)}
          >
            <Text style={[
              styles.levelButtonText,
              formData.level === level && styles.levelButtonTextSelected
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.level && <Text style={styles.errorText}>{errors.level}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="trophy" size={20} color={colors.white} />
            </View>
            <Text style={styles.appName}>TEAMUP</Text>
          </View>
          <GlobalMenu navigation={navigation} />
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleIconContainer}>
            <Ionicons 
              name={isEditing ? "create" : "add-circle"} 
              size={40} 
              color={colors.primary} 
            />
          </View>
          <Text style={styles.pageTitle}>
            {isEditing ? 'Modifier l\'événement' : 'Créer un événement'}
          </Text>
          <Text style={styles.pageSubtitle}>
            {isEditing ? 'Modifiez les détails de votre événement' : 'Organisez votre prochaine activité sportive'}
          </Text>
        </View>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Event Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Titre de l'événement *</Text>
            <TextInput
              ref={titleRef}
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Ex: Match de football amical"
              placeholderTextColor={colors.textMuted}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              blurOnSubmit={false}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              ref={descriptionRef}
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Décrivez votre événement, les détails importants..."
              placeholderTextColor={colors.textMuted}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => locationRef.current?.focus()}
              blurOnSubmit={false}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Sport Selector */}
          {renderSportSelector()}

          {/* Date and Time */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TouchableOpacity 
                style={[styles.input, styles.dateInput, errors.date && styles.inputError]}
                onPress={() => !isLoading && setShowDatePicker(true)}
                disabled={isLoading}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.dateText, !formData.date && styles.placeholderText]}>
                  {formData.date || 'Sélectionner'}
                </Text>
              </TouchableOpacity>
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Heure *</Text>
              <TouchableOpacity 
                style={[styles.input, styles.dateInput, errors.time && styles.inputError]}
                onPress={() => !isLoading && setShowTimePicker(true)}
                disabled={isLoading}
              >
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.dateText, !formData.time && styles.placeholderText]}>
                  {formData.time || 'Sélectionner'}
                </Text>
              </TouchableOpacity>
              {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
            </View>
          </View>

          {/* Date Time Pickers */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={isEditing ? undefined : new Date()}
              themeVariant="dark"
              accentColor={colors.primary}
              textColor={colors.textPrimary}
              style={styles.dateTimePicker}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              themeVariant="dark"
              accentColor={colors.primary}
              textColor={colors.textPrimary}
              style={styles.dateTimePicker}
            />
          )}

          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Lieu/Adresse *</Text>
            <View style={[styles.locationInputContainer, errors.location && styles.inputError]}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <TextInput
                ref={locationRef}
                style={styles.locationInput}
                placeholder="Adresse ou nom du lieu"
                placeholderTextColor={colors.textMuted}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => maxParticipantsRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Max Participants */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre maximum de participants *</Text>
            <TextInput
              ref={maxParticipantsRef}
              style={[styles.input, errors.maxParticipants && styles.inputError]}
              placeholder="Ex: 20"
              placeholderTextColor={colors.textMuted}
              value={formData.maxParticipants}
              onChangeText={(value) => handleInputChange('maxParticipants', value)}
              keyboardType="numeric"
              editable={!isLoading}
              returnKeyType="done"
              onSubmitEditing={() => !formData.isFree && priceRef.current?.focus()}
              blurOnSubmit={!formData.isFree}
            />
            {errors.maxParticipants && <Text style={styles.errorText}>{errors.maxParticipants}</Text>}
          </View>

          {/* Level Selector */}
          {renderLevelSelector()}

          {/* Price */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Prix</Text>
            <View style={styles.priceContainer}>
              <TouchableOpacity
                style={[styles.priceToggle, formData.isFree && styles.priceToggleSelected]}
                onPress={() => {
                  if (!isLoading) {
                    handleInputChange('isFree', true);
                    handleInputChange('price', '');
                  }
                }}
                disabled={isLoading}
              >
                <Text style={[styles.priceToggleText, formData.isFree && styles.priceToggleTextSelected]}>
                  Gratuit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.priceToggle, !formData.isFree && styles.priceToggleSelected]}
                onPress={() => !isLoading && handleInputChange('isFree', false)}
                disabled={isLoading}
              >
                <Text style={[styles.priceToggleText, !formData.isFree && styles.priceToggleTextSelected]}>
                  Payant
                </Text>
              </TouchableOpacity>
            </View>
            {!formData.isFree && (
              <TextInput
                ref={priceRef}
                style={[styles.input, styles.priceInput, errors.price && styles.inputError]}
                placeholder="Prix en €"
                placeholderTextColor={colors.textMuted}
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                keyboardType="numeric"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={() => {
                  priceRef.current?.blur();
                }}
              />
            )}
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          {/* Create Button */}
          <TouchableOpacity 
            style={[styles.createButton, isLoading && styles.createButtonDisabled]} 
            onPress={handleSubmitEvent}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name={isEditing ? "checkmark" : "add"} size={24} color={colors.white} />
            )}
            <Text style={styles.createButtonText}>
              {isLoading 
                ? (isEditing ? 'Modification en cours...' : 'Création en cours...') 
                : (isEditing ? 'Modifier l\'événement' : 'Créer l\'événement')
              }
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Alerte personnalisée */}
      <CustomAlert {...alertConfig} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  titleIconContainer: {
    marginBottom: 15,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray[700],
    minHeight: 100,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 5,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  chipScrollView: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 10,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  locationInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  levelButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: colors.gray[700],
    flex: 1,
    minWidth: '45%',
  },
  levelButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  levelButtonTextSelected: {
    color: colors.white,
  },
  priceContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  priceToggle: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.gray[700],
    marginHorizontal: 5,
  },
  priceToggleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priceToggleText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  priceToggleTextSelected: {
    color: colors.white,
  },
  priceInput: {
    marginTop: 10,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    backgroundColor: colors.gray[500],
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 10,
  },
  bottomSpacing: {
    height: 50,
  },
  dateTimePicker: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
});

export default CreateEventScreen; 