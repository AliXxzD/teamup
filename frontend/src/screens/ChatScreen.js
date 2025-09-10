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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import socketService from '../services/socketService';
import TeamupLogo from '../components/TeamupLogo';

const ChatScreenTailwind = ({ route, navigation }) => {
  const { conversation, eventContext, autoSendMessage, prefilledMessage } = route.params || {};
  const { user } = useAuth();
  
  // Vérification robuste de conversation
  useEffect(() => {
    if (!conversation) {
      console.log('❌ ChatScreen: conversation undefined dans route.params');
      console.log('🔍 route.params:', route.params);
      // Rediriger automatiquement vers MessagesScreen au lieu d'afficher une erreur
      navigation.navigate('Messages');
    }
  }, [conversation, navigation]);

  if (!conversation) {
    return null;
  }

  // Conversation prête pour l'envoi direct
  console.log('💬 Conversation prête:', conversation.id);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [autoMessageSent, setAutoMessageSent] = useState(false); // Protection contre envoi multiple
  const flatListRef = useRef(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    
    // Pré-remplir le message si fourni
    if (prefilledMessage) {
      setNewMessage(prefilledMessage);
    }
    
    // Envoyer automatiquement un message si fourni (une seule fois)
    if (autoSendMessage && !prefilledMessage && !autoMessageSent) {
      console.log('📤 Envoi automatique du message:', autoSendMessage.substring(0, 50) + '...');
      setAutoMessageSent(true); // Marquer comme envoyé
      setTimeout(() => {
        setNewMessage(autoSendMessage);
        // Envoyer immédiatement sans délai
        if (autoSendMessage.trim()) {
          sendMessage();
        }
      }, 100);
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Cleanup lors du démontage
    return () => {
      cleanupSocketListeners();
    };
  }, [conversation?._id || conversation?.id]);

  // Surveiller l'état de connexion Socket.io
  useEffect(() => {
    const checkSocketConnection = () => {
      const status = socketService.getConnectionStatus();
      setSocketConnected(status.isConnected && status.isAuthenticated);
    };

    checkSocketConnection();
    
    // Vérifier périodiquement l'état de connexion
    const interval = setInterval(checkSocketConnection, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Configuration des listeners Socket.io
  const setupSocketListeners = () => {
    if (!conversation) {
      console.warn('⚠️ Pas de conversation pour configurer Socket.io');
      return;
    }
    
    const conversationId = conversation._id || conversation.id;
    
    // Si c'est une conversation temporaire, ne pas configurer les sockets
    if (conversation.isTemporary || conversationId?.startsWith('temp-')) {
      console.log('🔧 Conversation temporaire - pas de configuration Socket.io');
      return;
    }
    
    if (!conversationId) {
      console.warn('⚠️ ID de conversation manquant pour Socket.io');
      return;
    }
    
    // Attendre que le socket soit authentifié avant de rejoindre
    socketService.joinConversationWhenReady(conversationId)
      .then(() => {
        console.log('✅ Conversation rejointe avec succès');
      })
      .catch((error) => {
        console.warn('⚠️ Impossible de rejoindre la conversation:', error.message);
      });
    
    // Écouter les nouveaux messages
    socketService.onMessage(conversationId, (message) => {
      if (message && message.type === 'messages_read') {
        // Gérer les messages marqués comme lus
        setMessages(prevMessages => 
          prevMessages.map(msg => ({
            ...msg,
            status: msg.sender._id !== user.id ? 'read' : msg.status
          }))
        );
      } else {
        // Nouveau message reçu
        setMessages(prevMessages => {
          // Éviter les doublons
          const messageExists = prevMessages.some(msg => 
            msg._id === message._id || (msg.tempId && msg.tempId === message.tempId)
          );
          
          if (!messageExists) {
            return [...prevMessages, message];
          }
          
          return prevMessages;
        });
        
        // Scroll vers le bas
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });
    
    // Écouter les indicateurs de frappe
    socketService.onTyping(conversationId, (typingData) => {
      const { userId, userName, isTyping } = typingData;
      
      setTypingUsers(prevTyping => {
        if (isTyping) {
          // Ajouter l'utilisateur qui tape
          if (!prevTyping.find(u => u.userId === userId)) {
            return [...prevTyping, { userId, userName }];
          }
        } else {
          // Retirer l'utilisateur qui ne tape plus
          return prevTyping.filter(u => u.userId !== userId);
        }
        return prevTyping;
      });
    });

    console.log(`🔌 Listeners Socket.io configurés pour ${conversationId}`);
  };

  // Nettoyage des listeners Socket.io
  const cleanupSocketListeners = () => {
    if (!conversation) return;
    
    const conversationId = conversation._id || conversation.id;
    
    if (!conversationId) return;
    
    socketService.leaveConversation(conversationId);
    socketService.offMessage(conversationId);
    socketService.offTyping(conversationId);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    console.log(`🧹 Listeners Socket.io nettoyés pour ${conversationId}`);
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      if (!conversation) {
        console.error('❌ Pas de données de conversation');
        setTimeout(() => navigation.navigate('Messages'), 0);
        return;
      }
      
      const conversationId = conversation._id || conversation.id;
      
      // Vérifier si c'est une conversation temporaire
      const isTemporary = conversation.isTemporary || conversationId?.startsWith('temp-');
      
      if (isTemporary) {
        console.log('🔧 Conversation temporaire - pas de chargement de messages via API');
        setMessages([]);
        setLoading(false);
        return;
      }
      
      // Chargement normal pour les conversations réelles
      console.log('📥 Chargement des messages pour conversation réelle');
      
      if (!conversationId) {
        console.error('❌ ID de conversation manquant');
        setTimeout(() => navigation.navigate('Messages'), 0);
        return;
      }
      
      console.log('🔄 Chargement des messages pour la conversation:', conversationId);
      
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('❌ Aucun token d\'accès trouvé');
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      const url = `${API_BASE_URL}${API_ENDPOINTS.MESSAGES.CONVERSATION_MESSAGES(conversationId)}`;
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
        
        // Ne pas afficher d'alerte pour les erreurs 500, juste logger
        if (response.status === 500) {
          console.log('⚠️ Erreur serveur 500 - initialisation avec messages vides');
          setMessages([]);
        } else {
          Alert.alert('Erreur', `Impossible de charger les messages (${response.status})`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
      
      // Ne pas afficher d'alerte pour les erreurs de réseau, juste logger
      console.log('⚠️ Erreur réseau - initialisation avec messages vides');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'indicateur de frappe
  const handleStartTyping = () => {
    if (!isTyping && socketConnected && conversation) {
      const conversationId = conversation._id || conversation.id;
      if (conversationId) {
        setIsTyping(true);
        socketService.startTyping(conversationId);
      }
    }
    
    // Reset du timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Arrêter de taper après 3 secondes d'inactivité
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping && socketConnected && conversation) {
      const conversationId = conversation._id || conversation.id;
      if (conversationId) {
        setIsTyping(false);
        socketService.stopTyping(conversationId);
      }
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    
    if (!conversation) {
      setTimeout(() => navigation.navigate('Messages'), 0);
      return;
    }
    
    const conversationId = conversation._id || conversation.id;
    
    // Envoi direct autorisé pour toutes les conversations
    console.log('📤 Envoi direct autorisé');
    
    if (!conversationId) {
      setTimeout(() => navigation.navigate('Messages'), 0);
      return;
    }
    
    try {
      setSending(true);
      console.log('📤 Envoi du message:', messageContent);
      
      // Arrêter l'indicateur de frappe
      if (isTyping) {
        handleStopTyping();
      }
      
      // Créer un message temporaire pour l'affichage immédiat
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        tempId: `temp_${Date.now()}`,
        content: messageContent,
        type: 'text',
        sender: {
          _id: user.id,
          name: user.name,
          profile: { avatar: user.avatar }
        },
        createdAt: new Date().toISOString(),
        status: 'sending'
      };
      
      // Ajouter immédiatement à l'affichage
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setNewMessage('');
      
      // Scroll vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Vérifier si c'est une conversation temporaire
      const isTemporary = conversation.isTemporary || conversationId?.startsWith('temp-');
      
      if (isTemporary) {
        console.log('🔧 Conversation temporaire - envoi via API HTTP');
        // Pour les conversations temporaires, essayer de créer une vraie conversation
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (!accessToken) {
            throw new Error('Token manquant');
          }

          // Essayer de créer une vraie conversation avec l'organisateur
          const response = await fetch(`${API_BASE_URL}/api/messages/conversations/with-organizer`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              eventId: eventContext?.id,
              message: messageContent 
            }),
          });

          console.log('📡 Réponse création conversation:', response.status);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.conversation) {
              console.log('✅ Vraie conversation créée:', data.conversation.id);
              // Mettre à jour le statut du message
              setMessages(prevMessages => 
                prevMessages.map(msg => 
                  msg.tempId === tempMessage.tempId 
                    ? { ...msg, status: 'sent' }
                    : msg
                )
              );
              
              // Rafraîchir la liste des conversations
              setTimeout(() => navigation.navigate('Messages', { refresh: true }), 0);
              
              setSending(false);
              return;
            } else {
              console.log('❌ Conversation non créée dans la réponse:', data);
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.log('❌ Erreur API création conversation:', response.status, errorData);
          }
        } catch (error) {
          console.log('❌ Erreur création conversation:', error);
        }
        
        // Si échec, afficher le message localement
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.tempId === tempMessage.tempId 
              ? { ...msg, status: 'sent', content: `${messageContent} (Message local)` }
              : msg
          )
        );
        setSending(false);
        return;
      }

      // Pour les conversations normales, essayer Socket.io en premier
      if (socketConnected && socketService.getConnectionStatus().isAuthenticated) {
        console.log('🔌 Envoi via Socket.io');
        const socketSent = socketService.sendMessage(conversationId, messageContent, 'text');
        
        if (socketSent) {
          // Mettre à jour le statut du message temporaire
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.tempId === tempMessage.tempId 
                ? { ...msg, status: 'sent' }
                : msg
            )
          );
          setSending(false);
          return;
        }
      }
      
      // Fallback: Envoi via API HTTP
      console.log('📡 Fallback: Envoi via API HTTP');
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      const url = `${API_BASE_URL}${API_ENDPOINTS.MESSAGES.SEND_MESSAGE(conversationId)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({
          content: messageContent,
          type: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message envoyé via HTTP:', data);
        
        // Remplacer le message temporaire par le message réel
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.tempId === tempMessage.tempId 
              ? { ...data.message, status: 'sent' }
              : msg
          )
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur envoi message:', response.status, errorData);
        
        // Retirer le message temporaire en cas d'erreur
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.tempId !== tempMessage.tempId)
        );
        
        Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      
      // Retirer le message temporaire en cas d'erreur
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.tempId !== tempMessage.tempId)
      );
      
      Alert.alert('Erreur', 'Impossible d\'envoyer le message. Vérifiez votre connexion.');
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
      className={`mb-4 ${isOwn ? 'items-end' : 'items-start'}`}
      style={{ opacity: fadeAnim }}
    >
      <View className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <View className={`px-4 py-3 rounded-2xl ${
          isOwn 
            ? 'bg-lime rounded-br-md' 
            : 'bg-dark-700 rounded-bl-md'
        }`}>
          <Text className="text-white text-base">
            {message.content}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const getDisplayName = () => {
    // Vérification robuste de conversation
    if (!conversation) {
      return 'Chat';
    }
    
    const conversationType = conversation.type || 'private';
    
    if (conversationType === 'group' || conversationType === 'event') {
      return conversation.name || 'Groupe';
    }
    
    const otherParticipant = conversation.participants?.find(
      p => p._id !== (user?._id || user?.id) && p._id !== (user?._id || user?.id)
    );
    
    return otherParticipant?.name || 'Chat';
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
            <TouchableOpacity className="w-10 h-10 bg-dark-800 rounded-2xl items-center justify-center">
              <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Conversation Header */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              className="w-10 h-10 bg-dark-800 rounded-2xl items-center justify-center mr-4"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-lg">
                  {getDisplayName().charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-bold">
                  {getDisplayName()}
                </Text>
                
                {/* Event Context */}
                {eventContext ? (
                  <Text className="text-cyan-400 text-sm mb-1" numberOfLines={1}>
                    📅 {eventContext.title}
                  </Text>
                ) : null}
                
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${
                    socketConnected ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <Text className="text-white/70 text-sm">
                    {socketConnected ? 'Temps réel' : 'Connexion...'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="w-10 h-10 bg-dark-800 rounded-2xl items-center justify-center">
              <Ionicons name="call" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-dark-800 rounded-2xl items-center justify-center">
              <Ionicons name="videocam" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-dark-800 rounded-2xl items-center justify-center">
              <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
            keyExtractor={(item) => item._id || item.id}
            renderItem={({ item }) => (
              <MessageBubble 
                message={item} 
                isOwn={(item.sender?._id || item.sender?.id) === (user?._id || user?.id)} 
              />
            )}
            className="flex-1 px-6 pt-6"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
      </Animated.View>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <View className="px-6 py-2">
          <View className="flex-row items-center">
            <View className="flex-row items-center bg-dark-800 rounded-full px-3 py-2">
              <View className="flex-row items-center mr-2">
                <View className="w-2 h-2 bg-lime rounded-full mr-1 animate-pulse" />
                <View className="w-2 h-2 bg-lime rounded-full mr-1 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <View className="w-2 h-2 bg-lime rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </View>
              <Text className="text-slate-400 text-sm">
                {typingUsers.length === 1 
                  ? `${typingUsers[0].userName} tape...`
                  : `${typingUsers.length} personnes tapent...`
                }
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Message Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-dark-900 px-6 py-4"
      >
        <View className="flex-row items-end">
          <View className="flex-1 bg-dark-800 rounded-2xl px-4 py-3 mr-3 max-h-24">
            <TextInput
              className="text-white text-base"
              placeholder="Écrivez votre message..."
              placeholderTextColor="#64748b"
              value={newMessage}
              onChangeText={(text) => {
                setNewMessage(text);
                if (text.trim()) {
                  handleStartTyping();
                } else {
                  handleStopTyping();
                }
              }}
              onBlur={handleStopTyping}
              multiline
              textAlignVertical="center"
            />
          </View>
          
          <TouchableOpacity
            className={`w-12 h-12 rounded-full items-center justify-center ${
              newMessage.trim() ? 'bg-lime' : 'bg-dark-600'
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
