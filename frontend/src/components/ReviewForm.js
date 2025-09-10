import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReviewForm = ({ 
  visible, 
  onClose, 
  onSubmit, 
  review = null, 
  user = null,
  event = null,
  loading = false 
}) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [type, setType] = useState(review?.type || 'general');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner une note');
      return;
    }

    const reviewData = {
      rating,
      comment: comment.trim(),
      type
    };

    onSubmit(reviewData);
  };

  const handleClose = () => {
    setRating(review?.rating || 0);
    setComment(review?.comment || '');
    setType(review?.type || 'general');
    onClose();
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => setRating(star)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={star <= rating ? "star" : "star-outline"}
          size={32}
          color={star <= rating ? "#f59e0b" : "#64748b"}
          style={{ marginHorizontal: 4 }}
        />
      </TouchableOpacity>
    ));
  };

  const getTypeOptions = () => {
    const options = [
      { value: 'general', label: 'Général', icon: 'person-outline' },
      { value: 'organizer', label: 'Organisateur', icon: 'calendar-outline' },
      { value: 'participant', label: 'Participant', icon: 'people-outline' }
    ];

    return options.map((option) => (
      <TouchableOpacity
        key={option.value}
        className={`flex-row items-center p-3 rounded-xl mb-2 ${
          type === option.value ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-slate-700/50'
        }`}
        onPress={() => setType(option.value)}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={option.icon} 
          size={20} 
          color={type === option.value ? '#06b6d4' : '#64748b'} 
        />
        <Text className={`ml-3 font-medium ${
          type === option.value ? 'text-cyan-400' : 'text-slate-300'
        }`}>
          {option.label}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        className="flex-1 bg-slate-900"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 border-b border-slate-700">
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">
            {review ? 'Modifier l\'avis' : 'Donner un avis'}
          </Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-6">
          {/* User Info */}
          {user && (
            <View className="bg-slate-800 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-slate-700 rounded-full items-center justify-center mr-4">
                  <Ionicons name="person" size={24} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {user.name}
                  </Text>
                  <Text className="text-slate-400 text-sm">
                    Avis pour {user.name}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Event Info */}
          {event && (
            <View className="bg-slate-800 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <View className="flex-1 ml-3">
                  <Text className="text-white text-base font-medium">
                    {event.title}
                  </Text>
                  <Text className="text-slate-400 text-sm">
                    {event.sport} • {new Date(event.date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Rating Section */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Note *
            </Text>
            <View className="flex-row items-center justify-center">
              {renderStars()}
            </View>
            <Text className="text-slate-400 text-sm text-center mt-2">
              {rating > 0 ? `${rating}/5 étoiles` : 'Sélectionnez une note'}
            </Text>
          </View>

          {/* Type Section */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Type d'avis
            </Text>
            {getTypeOptions()}
          </View>

          {/* Comment Section */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Commentaire (optionnel)
            </Text>
            <TextInput
              className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white text-base"
              placeholder="Partagez votre expérience..."
              placeholderTextColor="#64748b"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text className="text-slate-500 text-xs mt-2 text-right">
              {comment.length}/500 caractères
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="p-6 border-t border-slate-700">
          <TouchableOpacity
            className={`py-4 rounded-2xl ${
              loading ? 'bg-slate-600' : 'bg-cyan-500'
            }`}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold text-center">
              {loading ? 'Envoi en cours...' : (review ? 'Modifier l\'avis' : 'Publier l\'avis')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReviewForm;
