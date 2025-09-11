import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import reviewService from '../services/reviewService';

const ReviewForm = ({ 
  visible, 
  onClose, 
  organizerId, 
  organizerName, 
  eventId, 
  eventTitle,
  onReviewSubmitted 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(true);
  const [checkingCanReview, setCheckingCanReview] = useState(true);

  useEffect(() => {
    if (visible && organizerId) {
      checkCanReview();
    }
  }, [visible, organizerId, eventId]);

  const checkCanReview = async () => {
    try {
      setCheckingCanReview(true);
      const result = await reviewService.canReview(organizerId, eventId);
      
      if (result.success) {
        setCanReview(result.data.canReview);
        if (!result.data.canReview) {
          Alert.alert(
            'Avis déjà donné',
            'Vous avez déjà donné un avis pour cet organisateur concernant cet événement.'
          );
        }
      } else {
        console.error('Erreur vérification avis:', result.message);
        setCanReview(false);
      }
    } catch (error) {
      console.error('Erreur checkCanReview:', error);
      setCanReview(false);
    } finally {
      setCheckingCanReview(false);
    }
  };

  const handleRatingPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner une note');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Erreur', 'Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    try {
      setLoading(true);
      
      const reviewData = {
        reviewedUserId: organizerId,
        eventId: eventId,
        rating: rating,
        comment: comment.trim(),
        type: 'organizer'
      };

      const result = await reviewService.createReview(reviewData);

      if (result.success) {
        Alert.alert(
          'Succès',
          'Votre avis a été enregistré avec succès !',
          [
            {
              text: 'OK',
              onPress: () => {
                onReviewSubmitted && onReviewSubmitted(result.data);
                handleClose();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', result.message || 'Impossible d\'enregistrer l\'avis');
      }
    } catch (error) {
      console.error('Erreur soumission avis:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setCanReview(true);
    setCheckingCanReview(true);
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRatingPress(i)}
          className="mr-2"
          disabled={!canReview}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? '#fbbf24' : '#6b7280'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-slate-900">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-slate-700">
          <TouchableOpacity onPress={handleClose} disabled={loading}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Donner un avis</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-4">
          {checkingCanReview ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#84cc16" />
              <Text className="text-slate-400 text-base mt-4">Vérification...</Text>
            </View>
          ) : !canReview ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="checkmark-circle" size={80} color="#84cc16" />
              <Text className="text-white text-xl font-bold mt-4 text-center">
                Avis déjà donné
              </Text>
              <Text className="text-slate-400 text-center mt-2">
                Vous avez déjà donné un avis pour cet organisateur concernant cet événement.
              </Text>
            </View>
          ) : (
            <>
              {/* Informations sur l'organisateur et l'événement */}
              <View className="bg-slate-800 rounded-xl p-4 mb-6">
                <Text className="text-white text-lg font-bold mb-2">
                  Événement : {eventTitle}
                </Text>
                <Text className="text-slate-300 text-base">
                  Organisateur : {organizerName}
                </Text>
              </View>

              {/* Note */}
              <View className="mb-6">
                <Text className="text-white text-lg font-bold mb-4">
                  Note (obligatoire)
                </Text>
                <View className="flex-row items-center justify-center">
                  {renderStars()}
                </View>
                <Text className="text-slate-400 text-center mt-2">
                  {rating === 0 ? 'Sélectionnez une note' : 
                   rating === 1 ? 'Très décevant' :
                   rating === 2 ? 'Décevant' :
                   rating === 3 ? 'Correct' :
                   rating === 4 ? 'Bien' : 'Excellent'}
                </Text>
              </View>

              {/* Commentaire */}
              <View className="mb-6">
                <Text className="text-white text-lg font-bold mb-4">
                  Commentaire (obligatoire)
                </Text>
                <TextInput
                  className="bg-slate-800 text-white rounded-xl p-4 min-h-[120px] text-base"
                  placeholder="Décrivez votre expérience avec cet organisateur..."
                  placeholderTextColor="#64748b"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text className="text-slate-400 text-sm mt-2 text-right">
                  {comment.length}/500 caractères
                </Text>
              </View>

              {/* Bouton de soumission */}
              <TouchableOpacity
                className={`rounded-xl py-4 px-8 mb-6 ${
                  rating > 0 && comment.trim().length >= 10 && !loading
                    ? 'bg-lime'
                    : 'bg-slate-700'
                }`}
                onPress={handleSubmit}
                disabled={rating === 0 || comment.trim().length < 10 || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white text-lg font-bold ml-2">
                      Enregistrement...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-lg font-bold text-center">
                    Enregistrer l'avis
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ReviewForm;