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
    
    return (
      <TouchableOpacity 
        className="bg-dark-800 rounded-2xl p-4 mb-3 flex-row items-center"
        onPress={() => handleConversationPress(conversation)}
        activeOpacity={0.8}
      >
        {/* Avatar */}
        <View className="relative mr-4">
          <View className={`w-12 h-12 rounded-full items-center justify-center ${
            unreadCount > 0 ? 'bg-primary-500' : 'bg-dark-600'
          }`}>
            <Text className="text-white font-bold text-lg">
              {avatar ? '👤' : displayName.charAt(0)}
            </Text>
          </View>
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 w-6 h-6 bg-danger rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        {/* Content */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`text-base font-semibold ${
              unreadCount > 0 ? 'text-white' : 'text-dark-200'
            }`}>
              {displayName}
            </Text>
            <Text className="text-dark-400 text-xs">
              {formatTime(conversation.lastMessage?.timestamp)}
            </Text>
          </View>
          <Text 
            className={`text-sm ${
              unreadCount > 0 ? 'text-dark-200' : 'text-dark-400'
            }`}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
        </View>
        
        {/* Arrow */}
        <Ionicons name="chevron-forward" size={16} color="#64748b" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <LinearGradient
        colors={['#20B2AA', '#1a9b94', '#0f172a']}
        className="pb-4"
      >
        <View className="flex-row justify-between items-center px-6 pt-4">
          <View className="flex-row items-center">
            <Ionicons name="chatbubbles" size={24} color="#ffffff" />
            <Text className="text-white text-xl font-bold ml-3">Messages</Text>
            {conversations.some(c => c.unreadCount > 0) && (
              <View className="w-6 h-6 bg-danger rounded-full items-center justify-center ml-3">
                <Text className="text-white text-xs font-bold">
                  {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center"
            onPress={() => navigation.navigate('NewConversation')}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
