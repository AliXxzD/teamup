import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import reviewService from '../services/reviewService';
import ReviewCard from '../components/ReviewCard';

const UserReviewsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { userId, userName } = route.params || {};
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (userId) {
      loadReviews();
      loadStats();
    }
  }, [userId]);

  const loadReviews = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await reviewService.getUserReviews(userId, pageNum, 10);
      
      if (result.success) {
        if (pageNum === 1) {
          setReviews(result.data.reviews);
        } else {
          setReviews(prev => [...prev, ...result.data.reviews]);
        }
        setHasMore(result.data.pagination.hasNextPage);
        setPage(pageNum);
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de charger les avis');
      }
    } catch (error) {
      console.error('Erreur loadReviews:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await reviewService.getUserStats(userId);
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Erreur loadStats:', error);
    }
  };

  const handleRefresh = () => {
    loadReviews(1, true);
    loadStats();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadReviews(page + 1);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={20}
          color={i <= rating ? '#fbbf24' : '#6b7280'}
        />
      );
    }
    return stars;
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View className="bg-slate-800 rounded-xl p-6 mb-6">
        <Text className="text-white text-xl font-bold mb-4 text-center">
          Avis reçus
        </Text>
        
        <View className="flex-row items-center justify-center mb-4">
          <View className="flex-row items-center mr-4">
            {renderStars(Math.round(stats.averageRating))}
          </View>
          <Text className="text-white text-2xl font-bold">
            {stats.averageRating.toFixed(1)}/5
          </Text>
        </View>
        
        <Text className="text-slate-400 text-center mb-4">
          Basé sur {stats.totalReviews} avis
        </Text>
        
        {/* Distribution des notes */}
        <View className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <View key={rating} className="flex-row items-center">
              <Text className="text-slate-300 text-sm w-8">{rating}</Text>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <View className="flex-1 bg-slate-700 rounded-full h-2 mx-2">
                <View
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%`
                  }}
                />
              </View>
              <Text className="text-slate-300 text-sm w-8">
                {stats.ratingDistribution[rating]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#84cc16" />
        <Text className="text-slate-400 text-base mt-4">Chargement des avis...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-slate-700">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">
          Avis de {userName || 'l\'utilisateur'}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#84cc16"
          />
        }
        onScrollEndDrag={loadMore}
      >
        {/* Statistiques */}
        {renderStats()}

        {/* Liste des avis */}
        {reviews.length > 0 ? (
          <View className="space-y-4">
            {reviews.map((review, index) => (
              <ReviewCard
                key={review._id || index}
                review={review}
                showEvent={true}
              />
            ))}
            
            {/* Bouton pour charger plus */}
            {hasMore && (
              <TouchableOpacity
                className="bg-slate-800 rounded-xl py-4 px-6 items-center"
                onPress={loadMore}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#84cc16" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Charger plus d'avis
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="star-outline" size={80} color="#64748b" />
            <Text className="text-white text-xl font-bold mt-4 text-center">
              Aucun avis
            </Text>
            <Text className="text-slate-400 text-center mt-2">
              Cet utilisateur n'a pas encore reçu d'avis.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default UserReviewsScreen;

