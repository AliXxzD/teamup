import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReviewCard = ({ review, showEvent = true, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#fbbf24' : '#6b7280'}
        />
      );
    }
    return stars;
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'organizer':
        return 'Organisateur';
      case 'participant':
        return 'Participant';
      default:
        return 'Général';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'organizer':
        return 'bg-blue-500';
      case 'participant':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <View className="bg-slate-800 rounded-xl p-4 mb-4">
      {/* Header avec nom du reviewer et date */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-slate-700 rounded-full items-center justify-center mr-3">
            {review.reviewer?.profile?.avatar ? (
              <Text className="text-white font-bold">
                {review.reviewer.name?.charAt(0)?.toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={20} color="#64748b" />
            )}
          </View>
          <View>
            <Text className="text-white font-bold text-base">
              {review.reviewer?.name || 'Utilisateur anonyme'}
            </Text>
            <Text className="text-slate-400 text-sm">
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>
        
        {/* Type d'avis */}
        <View className={`px-3 py-1 rounded-full ${getTypeColor(review.type)}`}>
          <Text className="text-white text-xs font-bold">
            {getTypeLabel(review.type)}
          </Text>
        </View>
      </View>

      {/* Note avec étoiles */}
      <View className="flex-row items-center mb-3">
        <View className="flex-row items-center mr-3">
          {renderStars(review.rating)}
        </View>
        <Text className="text-slate-300 text-sm">
          {review.rating}/5
        </Text>
      </View>

      {/* Commentaire */}
      {review.comment && (
        <Text className="text-slate-300 text-base leading-6 mb-3">
          {review.comment}
        </Text>
      )}

      {/* Informations sur l'événement si disponible */}
      {showEvent && review.event && (
        <View className="bg-slate-700 rounded-lg p-3 mb-3">
          <Text className="text-slate-400 text-sm mb-1">Événement concerné :</Text>
          <Text className="text-white font-bold text-base">
            {review.event.title}
          </Text>
          <Text className="text-slate-300 text-sm">
            {review.event.sport} • {formatDate(review.event.date)}
          </Text>
        </View>
      )}

      {/* Actions (si onEdit et onDelete sont fournis) */}
      {(onEdit || onDelete) && (
        <View className="flex-row justify-end space-x-2">
          {onEdit && (
            <TouchableOpacity
              className="bg-blue-600 rounded-lg px-3 py-2"
              onPress={() => onEdit(review)}
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-bold">Modifier</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              className="bg-red-600 rounded-lg px-3 py-2"
              onPress={() => onDelete(review)}
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-bold">Supprimer</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default ReviewCard;