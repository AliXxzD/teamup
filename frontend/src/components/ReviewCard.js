import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReviewCard = ({ 
  review, 
  showActions = false, 
  onEdit = null, 
  onDelete = null,
  currentUserId = null 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? "star" : "star-outline"}
        size={16}
        color={star <= rating ? "#f59e0b" : "#64748b"}
        style={{ marginRight: 2 }}
      />
    ));
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
        return '#10b981';
      case 'participant':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const canEdit = showActions && currentUserId && review.reviewer._id === currentUserId;

  return (
    <View className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Image
            source={{ 
              uri: review.reviewer?.profile?.avatar || 
                   'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
            }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View className="flex-1">
            <Text className="text-white text-base font-bold">
              {review.reviewer?.name || 'Utilisateur'}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="flex-row items-center mr-3">
                {renderStars(review.rating)}
              </View>
              <Text className="text-slate-400 text-sm">
                {formatDate(review.createdAt)}
              </Text>
            </View>
          </View>
        </View>
        
        {showActions && canEdit && (
          <View className="flex-row items-center">
            {onEdit && (
              <TouchableOpacity
                className="w-8 h-8 bg-slate-700 rounded-lg items-center justify-center mr-2"
                onPress={() => onEdit(review)}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={16} color="#64748b" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                className="w-8 h-8 bg-red-500/20 rounded-lg items-center justify-center"
                onPress={() => onDelete(review)}
                activeOpacity={0.8}
              >
                <Ionicons name="trash" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Type Badge */}
      {review.type && review.type !== 'general' && (
        <View className="mb-3">
          <View 
            className="px-3 py-1 rounded-full self-start"
            style={{ backgroundColor: getTypeColor(review.type) + '20' }}
          >
            <Text 
              className="text-xs font-semibold"
              style={{ color: getTypeColor(review.type) }}
            >
              {getTypeLabel(review.type)}
            </Text>
          </View>
        </View>
      )}

      {/* Event Info */}
      {review.event && (
        <View className="mb-3 p-3 bg-slate-700/50 rounded-xl">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text className="text-slate-300 text-sm ml-2 flex-1">
              {review.event.title}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="football-outline" size={14} color="#64748b" />
            <Text className="text-slate-400 text-xs ml-2">
              {review.event.sport} • {formatDate(review.event.date)}
            </Text>
          </View>
        </View>
      )}

      {/* Comment */}
      {review.comment && (
        <View className="mb-3">
          <Text className="text-slate-300 text-sm leading-6">
            {review.comment}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text className="text-slate-400 text-sm ml-1">
            {review.rating}/5
          </Text>
        </View>
        
        {review.updatedAt && review.updatedAt !== review.createdAt && (
          <Text className="text-slate-500 text-xs">
            Modifié le {formatDate(review.updatedAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ReviewCard;

