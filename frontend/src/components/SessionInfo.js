import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/globalStyles';

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
    if (!isActive) return colors.danger;
    return rememberMe ? colors.success : colors.primary;
  };

  const getStatusIcon = (isActive, rememberMe) => {
    if (!isActive) return 'alert-circle';
    return rememberMe ? 'shield-checkmark' : 'time';
  };

  if (!visible || !sessionInfo) return null;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons 
            name={getStatusIcon(sessionInfo.isActive, sessionInfo.rememberMe)} 
            size={16} 
            color={getStatusColor(sessionInfo.isActive, sessionInfo.rememberMe)} 
          />
          <Text style={[
            styles.statusText,
            { color: getStatusColor(sessionInfo.isActive, sessionInfo.rememberMe) }
          ]}>
            {sessionInfo.rememberMe ? 'Session longue' : 'Session standard'}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.timeText}>
            {formatTimeRemaining(sessionInfo.timeRemaining)}
          </Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type de session :</Text>
            <Text style={styles.infoValue}>
              {sessionInfo.rememberMe ? 'Se souvenir de moi' : 'Standard'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Durée totale :</Text>
            <Text style={styles.infoValue}>{sessionInfo.duration}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Temps restant :</Text>
            <Text style={[
              styles.infoValue,
              { color: getStatusColor(sessionInfo.isActive, sessionInfo.rememberMe) }
            ]}>
              {formatTimeRemaining(sessionInfo.timeRemaining)}
            </Text>
          </View>
          
          {sessionInfo.expiresAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expire le :</Text>
              <Text style={styles.infoValue}>
                {new Date(sessionInfo.expiresAt).toLocaleString('fr-FR')}
              </Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Renouvellement :</Text>
            <Text style={styles.infoValue}>
              {sessionInfo.rememberMe ? 'Automatique' : 'Manuel'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  timeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 8,
    fontFamily: 'monospace',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default SessionInfo; 