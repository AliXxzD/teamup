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
import TeamupLogo from '../components/TeamupLogo';

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

  // Écouter les changements de route pour rafraîchir si nécessaire
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Vérifier si on doit rafraîchir (paramètre refresh dans route)
      const routeParams = navigation.getState()?.routes?.find(route => route.name === 'Messages')?.params;
      if (routeParams?.refresh) {
        console.log('🔄 Rafraîchissement automatique des conversations');
        loadConversations();
        // Nettoyer le paramètre refresh
        navigation.setParams({ refresh: undefined });
      }
    });

    return unsubscribe;
  }, [navigation]);

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
    if (!conversation) {
      return 'Conversation';
    }
    
    const conversationType = conversation.type || 'private';
    
    if (conversationType === 'group' || conversationType === 'event') {
      return conversation.name || 'Groupe';
    }
    
    const otherParticipant = conversation.participants?.find(
      p => p._id !== (currentUser?._id || currentUser?.id) && p._id !== (currentUser?._id || currentUser?.id)
    );
    
    return otherParticipant?.name || 'Utilisateur inconnu';
  };

  const getDisplayAvatar = (conversation, currentUser) => {
    if (!conversation) {
      return null;
    }
    
    if (conversation.avatar) {
      return conversation.avatar;
    }
    
    const conversationType = conversation.type || 'private';
    
    if (conversationType === 'private') {
      const otherParticipant = conversation.participants?.find(
        p => p._id !== (currentUser?._id || currentUser?.id) && p._id !== (currentUser?._id || currentUser?.id)
      );
      return otherParticipant?.profile?.avatar;
    }
    
    return null;
  };

  const handleConversationPress = (conversation) => {
    if (!conversation) {
      console.log('❌ Conversation undefined dans handleConversationPress');
      return;
    }
    
    console.log('🔍 Navigation vers Chat:', {
      conversationId: conversation._id || conversation.id,
      conversationType: conversation.type || 'private',
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
    if (!conversation) {
      return null;
    }
    
    const displayName = conversation.displayName || conversation.name || 'Conversation';
    const lastMessage = conversation.lastMessage?.content || 'Aucun message';
    const unreadCount = conversation.unreadCount || 0;
    const avatar = conversation.displayAvatar || conversation.avatar;
    const conversationType = conversation.type || 'private';
    const isGroup = conversationType === 'group' || conversationType === 'event';
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
          <TeamupLogo size="extra-small" textColor="#ffffff" />
          
          <View className="flex-row items-center">
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
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item._id || item.id}
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
