import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionInfo = ({ visible = true, style }) => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadSessionInfo();
  }, []);

  const loadSessionInfo = async () => {
    try {
      const [
        rememberMe,
        sessionDuration,
        tokenExpiry,
        accessToken
      ] = await AsyncStorage.multiGet([
        'rememberMe',
        'sessionDuration', 
        'tokenExpiry',
        'accessToken'
      ]);

      if (accessToken[1]) {
        const expiryTime = tokenExpiry[1] ? parseInt(tokenExpiry[1]) : null;
        const timeRemaining = expiryTime ? Math.max(0, expiryTime - Date.now()) : 0;
        
        setSessionInfo({
          rememberMe: rememberMe[1] === 'true',
          duration: sessionDuration[1] || 'Non défini',
          expiresAt: expiryTime,
          timeRemaining: timeRemaining,
          isActive: timeRemaining > 0
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des infos de session:', error);
    }
  };

  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return 'Expiré';
    
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}j ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusColor = (isActive, rememberMe) => {
    if (!isActive) return '#EF4444';
    return rememberMe ? '#10B981' : '#20B2AA';
  };

  const getStatusIcon = (isActive, rememberMe) => {
    if (!isActive) return 'alert-circle';
    return rememberMe ? 'shield-checkmark' : 'time';
  };

  if (!visible || !sessionInfo) return null;

  return (
    <View className={`bg-dark-800 rounded-xl border border-dark-600 my-2 overflow-hidden ${style || ''}`}>
      <TouchableOpacity 
        className="flex-row justify-between items-center px-4 py-3"
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons 
            name={getStatusIcon(sessionInfo.isActive, sessionInfo.rememberMe)} 
            size={16} 
            color={getStatusColor(sessionInfo.isActive, sessionInfo.rememberMe)} 
          />
          <Text 
            className="text-sm font-semibold ml-2"
            style={{ color: getStatusColor(sessionInfo.isActive, sessionInfo.rememberMe) }}
          >
            {sessionInfo.rememberMe ? 'Session longue' : 'Session standard'}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Text className="text-dark-300 text-xs mr-2 font-mono">
            {formatTimeRemaining(sessionInfo.timeRemaining)}
          </Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#64748b" 
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4 border-t border-dark-600 bg-dark-700/50">
          <View className="flex-row justify-between items-center py-1.5">
            <Text className="text-dark-300 text-xs flex-1">Type de session :</Text>
            <Text className="text-white text-xs font-medium flex-1 text-right">
              {sessionInfo.rememberMe ? 'Se souvenir de moi' : 'Standard'}
            </Text>
          </View>
          
          <View className="flex-row justify-between items-center py-1.5">
            <Text className="text-dark-300 text-xs flex-1">Durée totale :</Text>
            <Text className="text-white text-xs font-medium flex-1 text-right">{sessionInfo.duration}</Text>
          </View>
          
          <View className="flex-row justify-between items-center py-1.5">
            <Text className="text-dark-300 text-xs flex-1">Temps restant :</Text>
            <Text 
              className="text-xs font-medium flex-1 text-right"
              style={{ color: getStatusColor(sessionInfo.isActive, sessionInfo.rememberMe) }}
            >
              {formatTimeRemaining(sessionInfo.timeRemaining)}
            </Text>
          </View>
          
          {sessionInfo.expiresAt && (
            <View className="flex-row justify-between items-center py-1.5">
              <Text className="text-dark-300 text-xs flex-1">Expire le :</Text>
              <Text className="text-white text-xs font-medium flex-1 text-right">
                {new Date(sessionInfo.expiresAt).toLocaleString('fr-FR')}
              </Text>
            </View>
          )}
          
          <View className="flex-row justify-between items-center py-1.5">
            <Text className="text-dark-300 text-xs flex-1">Renouvellement :</Text>
            <Text className="text-white text-xs font-medium flex-1 text-right">
              {sessionInfo.rememberMe ? 'Automatique' : 'Manuel'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};



export default SessionInfo; 