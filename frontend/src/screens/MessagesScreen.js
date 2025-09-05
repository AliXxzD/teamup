import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import GlobalMenu from '../components/GlobalMenu';

const MessagesScreenTailwind = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadConversations();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des conversations...');
      
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('❌ Aucun token d\'accès trouvé');
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        navigation.navigate('Login');
        return;
      }

      console.log('📡 URL:', `${API_BASE_URL}${API_ENDPOINTS.MESSAGES.CONVERSATIONS}`);
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MESSAGES.CONVERSATIONS}`, {
        headers: getAuthHeaders(accessToken)
      });

      console.log('📊 Statut de la réponse:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conversations reçues:', data.conversations?.length || 0);
        
        if (data.conversations && data.conversations.length > 0) {
          const formattedConversations = data.conversations.map(conv => ({
            ...conv,
            displayName: getDisplayName(conv, user),
            displayAvatar: getDisplayAvatar(conv, user)
          }));
          
          setConversations(formattedConversations);
        } else {
          setConversations([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur API:', response.status, errorData);
        Alert.alert('Erreur', `Impossible de charger les conversations (${response.status})`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des conversations:', error);
      Alert.alert('Erreur', 'Impossible de charger les conversations. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const getDisplayName = (conversation, currentUser) => {
    if (conversation.type === 'group' || conversation.type === 'event') {
      return conversation.name || 'Groupe';
    }
    
    const otherParticipant = conversation.participants?.find(
      p => p._id !== currentUser?.id && p._id !== currentUser?._id
    );
    
    return otherParticipant?.name || 'Utilisateur inconnu';
  };

  const getDisplayAvatar = (conversation, currentUser) => {
    if (conversation.avatar) {
      return conversation.avatar;
    }
    
    if (conversation.type === 'private') {
      const otherParticipant = conversation.participants?.find(
        p => p._id !== currentUser?.id && p._id !== currentUser?._id
      );
      return otherParticipant?.profile?.avatar;
    }
    
    return null;
  };

  const handleConversationPress = (conversation) => {
    console.log('🔍 Navigation vers Chat:', {
      conversationId: conversation.id,
      conversationType: conversation.type,
      participants: conversation.participants?.length
    });
    navigation.navigate('Chat', { conversation });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const ConversationItem = ({ conversation }) => {
    const displayName = conversation.displayName || conversation.name || 'Conversation';
    const lastMessage = conversation.lastMessage?.content || 'Aucun message';
    const unreadCount = conversation.unreadCount || 0;
    const avatar = conversation.displayAvatar || conversation.avatar;
    const isGroup = conversation.type === 'group' || conversation.type === 'event';
    const memberCount = conversation.participants?.length || 0;
    
    return (
      <TouchableOpacity 
        className="bg-dark-800 rounded-2xl p-4 mb-3 flex-row items-center"
        onPress={() => handleConversationPress(conversation)}
        activeOpacity={0.8}
      >
        {/* Avatar with Online Indicator */}
        <View className="relative mr-4">
          <View className="w-14 h-14 rounded-full items-center justify-center bg-dark-600">
            {isGroup ? (
              <View className="w-14 h-14 rounded-full items-center justify-center bg-lime/20">
                <Ionicons name="people" size={24} color="#84cc16" />
              </View>
            ) : (
              <View className="w-14 h-14 rounded-full items-center justify-center bg-primary-500">
                <Text className="text-white font-bold text-lg">
                  {displayName.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          
          {/* Online Indicator for individual chats */}
          {!isGroup && (
            <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-800" />
          )}
          
          {/* Group Indicator */}
          {isGroup && (
            <View className="absolute bottom-0 right-0 w-5 h-5 bg-lime rounded-full items-center justify-center border-2 border-dark-800">
              <Ionicons name="people" size={10} color="#ffffff" />
            </View>
          )}
        </View>
        
        {/* Content */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-white text-base font-bold">
              {displayName}
            </Text>
            <Text className="text-dark-400 text-sm">
              {formatTime(conversation.lastMessage?.timestamp)}
            </Text>
          </View>
          
          <Text 
            className="text-dark-300 text-sm mb-1"
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
          
          {/* Member count for groups */}
          {isGroup && memberCount > 0 && (
            <Text className="text-dark-400 text-xs">
              {memberCount} membre{memberCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <View className="w-6 h-6 bg-lime rounded-full items-center justify-center ml-2">
            <Text className="text-white text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-dark-900 px-6 pt-4 pb-4">
        {/* Top Bar with Logo and Icons */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gradient-to-br from-lime to-green-500 rounded-2xl items-center justify-center mr-3">
              <Ionicons name="people" size={20} color="#ffffff" />
            </View>
            <Text className="text-white text-2xl font-bold">TEAMUP</Text>
          </View>
          
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="w-10 h-10 bg-dark-800 rounded-2xl items-center justify-center">
              <Ionicons name="search" size={20} color="#ffffff" />
            </TouchableOpacity>
            <GlobalMenu navigation={navigation} currentRoute="Messages" />
          </View>
        </View>

        {/* Messages Title with Back Button */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            className="w-10 h-10 bg-dark-800 rounded-2xl items-center justify-center mr-4"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Messages</Text>
        </View>

        {/* Search Bar */}
        <View className="bg-dark-800 rounded-2xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            className="text-white text-base ml-3 flex-1"
            placeholder="Rechercher une conversation..."
            placeholderTextColor="#64748b"
            style={{ fontSize: 16 }}
          />
        </View>
      </View>

      {/* Content */}
      <Animated.View className="flex-1 px-6" style={{ opacity: fadeAnim }}>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#20B2AA" />
            <Text className="text-dark-300 text-base mt-3">Chargement des conversations...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-24 h-24 bg-dark-700 rounded-full items-center justify-center mb-6">
              <Ionicons name="chatbubbles-outline" size={40} color="#64748b" />
            </View>
            <Text className="text-white text-xl font-bold mb-2 text-center">
              Aucune conversation
            </Text>
            <Text className="text-dark-300 text-center text-base mb-8 leading-6">
              Commencez à échanger avec d'autres sportifs en rejoignant des événements
            </Text>
            <TouchableOpacity
              className="bg-primary-500 px-6 py-3 rounded-xl flex-row items-center"
              onPress={() => navigation.navigate('Discover')}
            >
              <Ionicons name="search" size={20} color="#ffffff" />
              <Text className="text-white font-semibold ml-2">Découvrir des événements</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id || item._id}
            renderItem={({ item }) => <ConversationItem conversation={item} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                tintColor="#20B2AA"
              />
            }
            className="pt-4"
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

export default MessagesScreenTailwind;
