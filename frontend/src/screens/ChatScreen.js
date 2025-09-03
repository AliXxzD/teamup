import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

const ChatScreenTailwind = ({ route, navigation }) => {
  const { conversation } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadMessages();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [conversation.id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des messages pour la conversation:', conversation.id);
      
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('❌ Aucun token d\'accès trouvé');
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      const url = `${API_BASE_URL}${API_ENDPOINTS.MESSAGES.CONVERSATION_MESSAGES(conversation.id)}`;
      console.log('📡 URL de requête:', url);
      
      const response = await fetch(url, {
        headers: getAuthHeaders(accessToken)
      });

      console.log('📊 Statut de la réponse:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Messages récupérés:', data.messages?.length || 0);
        
        setMessages(data.messages || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur API:', response.status, errorData);
        Alert.alert('Erreur', `Impossible de charger les messages (${response.status})`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
      Alert.alert('Erreur', 'Impossible de charger les messages. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      console.log('📤 Envoi du message:', newMessage.trim());
      
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      const url = `${API_BASE_URL}${API_ENDPOINTS.MESSAGES.SEND_MESSAGE(conversation.id)}`;
      
      const requestBody = {
        content: newMessage.trim(),
        type: 'text'
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message envoyé avec succès!');
        
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Erreur', errorData.message || 'Impossible d\'envoyer le message');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MessageBubble = ({ message, isOwn }) => (
    <Animated.View 
      className={`flex-row mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
      style={{ opacity: fadeAnim }}
    >
      {!isOwn && (
        <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mr-3">
          <Text className="text-white text-xs font-bold">
            {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
      )}
      
      <View className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <View className={`px-4 py-3 rounded-2xl ${
          isOwn 
            ? 'bg-primary-500 rounded-br-md' 
            : 'bg-dark-700 rounded-bl-md'
        }`}>
          <Text className={`text-base ${isOwn ? 'text-white' : 'text-white'}`}>
            {message.content}
          </Text>
        </View>
        
        <View className={`flex-row items-center mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <Text className="text-dark-400 text-xs">
            {formatMessageTime(message.createdAt)}
          </Text>
          {isOwn && (
            <Ionicons 
              name={message.status === 'read' ? "checkmark-done" : "checkmark"} 
              size={12} 
              color={message.status === 'read' ? "#20B2AA" : "#64748b"}
              className="mr-1"
            />
          )}
        </View>
      </View>
    </Animated.View>
  );

  const getDisplayName = () => {
    if (conversation.type === 'group' || conversation.type === 'event') {
      return conversation.name || 'Groupe';
    }
    
    const otherParticipant = conversation.participants?.find(
      p => p._id !== user?.id && p._id !== user?._id
    );
    
    return otherParticipant?.name || 'Chat';
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
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-4"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">
                {getDisplayName()}
              </Text>
              <Text className="text-white/70 text-sm">
                {conversation.participants?.length || 0} participant{(conversation.participants?.length || 0) > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
            <Ionicons name="call" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages List */}
      <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#20B2AA" />
            <Text className="text-dark-300 text-base mt-3">Chargement des messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id || item._id}
            renderItem={({ item }) => (
              <MessageBubble 
                message={item} 
                isOwn={item.sender?.id === user?.id || item.sender?.id === user?._id} 
              />
            )}
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
      </Animated.View>

      {/* Message Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-dark-800 px-4 py-4"
      >
        <View className="flex-row items-end">
          <View className="flex-1 bg-dark-700 rounded-2xl px-4 py-3 mr-3 max-h-24">
            <TextInput
              className="text-white text-base"
              placeholder="Écrivez votre message..."
              placeholderTextColor="#64748b"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              textAlignVertical="center"
            />
          </View>
          
          <TouchableOpacity
            className={`w-12 h-12 rounded-full items-center justify-center ${
              newMessage.trim() ? 'bg-primary-500' : 'bg-dark-600'
            }`}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={newMessage.trim() ? "#ffffff" : "#64748b"} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreenTailwind;
