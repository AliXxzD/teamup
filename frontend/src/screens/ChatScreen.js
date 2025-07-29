import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalMenu from '../components/GlobalMenu';

const ChatScreen = ({ route, navigation }) => {
  const { conversation } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';

  useEffect(() => {
    loadMessages();
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
      
      const url = `${API_BASE_URL}/api/messages/conversations/${conversation.id}/messages`;
      console.log('📡 URL de requête:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📊 Statut de la réponse:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Messages récupérés:', data.messages?.length || 0, 'messages');
        
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach((msg, index) => {
            console.log(`   ${index + 1}. [${msg.sender?.name || 'Unknown'}] ${msg.content}`);
          });
        } else {
          console.log('ℹ️ Aucun message trouvé dans cette conversation');
        }
        
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
        console.error('❌ Aucun token d\'accès trouvé');
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      const url = `${API_BASE_URL}/api/messages/conversations/${conversation.id}/messages`;
      console.log('📡 URL de requête:', url);
      
      const requestBody = {
        content: newMessage.trim(),
        type: 'text'
      };
      console.log('📦 Corps de la requête:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📊 Statut de la réponse:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message envoyé avec succès!');
        console.log('   - ID du message:', data.message?.id);
        console.log('   - Expéditeur:', data.message?.sender?.name);
        console.log('   - Contenu:', data.message?.content);
        console.log('   - Timestamp:', data.message?.createdAt);
        
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur API:', response.status, errorData);
        Alert.alert('Erreur', `Impossible d'envoyer le message (${response.status})`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message. Vérifiez votre connexion.');
    } finally {
      setSending(false);
    }
  };

  const handleAttachment = () => {
    Alert.alert('Fonctionnalité à venir', 'L\'envoi de fichiers sera bientôt disponible');
  };

  const handleEmoji = () => {
    Alert.alert('Fonctionnalité à venir', 'Le sélecteur d\'emojis sera bientôt disponible');
  };

  const formatTime = (timestamp) => {
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

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender.id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {item.sender.avatar ? (
                <Text style={styles.avatarText}>👤</Text>
              ) : (
                <Text style={styles.avatarText}>
                  {item.sender.name?.charAt(0) || '?'}
                </Text>
              )}
            </View>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.sender.name}</Text>
          )}
          
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          
          <View style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            <Text style={[
              styles.timeText,
              isOwnMessage ? styles.ownTimeText : styles.otherTimeText
            ]}>
              {formatTime(item.createdAt)}
            </Text>
            {isOwnMessage && (
              <Ionicons 
                name={item.status === 'read' ? 'checkmark-done' : 'checkmark'} 
                size={12} 
                color={item.status === 'read' ? colors.white : colors.textMuted} 
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.conversationInfo}>
            <Text style={styles.conversationName}>
              {conversation.displayName || conversation.name || 'Chat'}
            </Text>
            <Text style={styles.conversationStatus}>
              {messages.length > 0 ? `${messages.length} messages` : 'Nouvelle conversation'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              Alert.alert(
                'Options de conversation',
                'Que souhaitez-vous faire ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer la conversation', style: 'destructive', onPress: () => {
                    Alert.alert('Fonctionnalité à venir', 'La suppression de conversation sera bientôt disponible');
                  }},
                  { text: 'Marquer comme lu', onPress: () => {
                    Alert.alert('Fonctionnalité à venir', 'Le marquage comme lu sera bientôt disponible');
                  }},
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <GlobalMenu navigation={navigation} />
        </View>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyContent
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Aucun message</Text>
              <Text style={styles.emptySubtitle}>
                Commencez la conversation en envoyant un message !
              </Text>
            </View>
          )}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachmentButton} onPress={handleAttachment}>
              <Ionicons name="attach" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Tapez votre message..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
            />
            
            <TouchableOpacity style={styles.emojiButton} onPress={handleEmoji}>
              <Ionicons name="happy-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[800],
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    conversationInfo: {
      flex: 1,
    },
    conversationName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    conversationStatus: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    headerButton: {
      padding: 8,
      marginHorizontal: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: 16,
      fontSize: 16,
    },
    keyboardView: {
      flex: 1,
    },
    messagesList: {
      flex: 1,
    },
    messagesContent: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    emptyContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    messageContainer: {
      flexDirection: 'row',
      marginVertical: 6,
      alignItems: 'flex-end',
    },
    ownMessage: {
      justifyContent: 'flex-end',
    },
    otherMessage: {
      justifyContent: 'flex-start',
    },
    avatarContainer: {
      marginRight: 10,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.gray[600],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.gray[700],
    },
    avatarText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    messageBubble: {
      maxWidth: '70%',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    ownBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 6,
      marginLeft: 40,
    },
    otherBubble: {
      backgroundColor: colors.gray[700],
      borderBottomLeftRadius: 6,
      marginRight: 40,
    },
    senderName: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 4,
      fontWeight: '500',
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '400',
    },
    ownMessageText: {
      color: colors.white,
    },
    otherMessageText: {
      color: colors.textPrimary,
    },
    messageTime: {
      fontSize: 11,
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    ownMessageTime: {
      color: colors.white,
      opacity: 0.8,
    },
    otherMessageTime: {
      color: colors.textMuted,
    },
    timeText: {
      fontSize: 11,
      fontWeight: '400',
    },
    ownTimeText: {
      color: colors.white,
      opacity: 0.8,
    },
    otherTimeText: {
      color: colors.textMuted,
    },
    inputContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.gray[800],
      backgroundColor: colors.background,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: colors.gray[700],
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 8,
      paddingTop: 8,
      paddingBottom: 8,
    },
    textInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 16,
      maxHeight: 100,
      marginRight: 12,
      paddingVertical: 8,
      paddingHorizontal: 0,
      lineHeight: 20,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    sendButtonDisabled: {
      backgroundColor: colors.gray[600],
      shadowOpacity: 0,
      elevation: 0,
    },
    attachmentButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    emojiButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
  });

export default ChatScreen; 