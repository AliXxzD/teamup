import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  calculateLevel, 
  getLevelTier, 
  getLevelProgress, 
  getXPForNextLevel 
} from '../utils/levelingSystem';

export const LevelBadge = ({ xp, size = 'medium', showProgress = false }) => {
  const level = calculateLevel(xp);
  const tier = getLevelTier(level);
  const progress = getLevelProgress(xp);
  const xpToNext = getXPForNextLevel(xp);

  const sizeConfig = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 40, height: 40, fontSize: 14 },
    large: { width: 56, height: 56, fontSize: 18 }
  };

  const config = sizeConfig[size];

  return (
    <View className="items-center">
      <View
        style={{
          width: config.width,
          height: config.height,
          borderRadius: config.width / 2,
          backgroundColor: tier.color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: '#ffffff',
          shadowColor: tier.color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text 
          style={{ 
            color: '#ffffff', 
            fontSize: config.fontSize, 
            fontWeight: 'bold' 
          }}
        >
          {level}
        </Text>
      </View>
      
      {showProgress && (
        <View className="items-center mt-2">
          <Text className="text-slate-400 text-xs">{tier.name}</Text>
          {level < 30 && (
            <Text className="text-slate-500 text-xs">
              {xpToNext} XP pour niveau {level + 1}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export const XPProgressBar = ({ currentXP, showDetails = true }) => {
  const level = calculateLevel(currentXP);
  const progress = getLevelProgress(currentXP);
  const xpToNext = getXPForNextLevel(currentXP);
  const tier = getLevelTier(level);

  return (
    <View className="mb-4">
      {showDetails && (
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white text-base font-bold">
            Niveau {level} • {tier.name}
          </Text>
          <Text className="text-slate-400 text-sm">
            {currentXP} XP {level < 30 && `• ${xpToNext} pour niveau ${level + 1}`}
          </Text>
        </View>
      )}
      
      <View className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
        <LinearGradient
          colors={[tier.color + '80', tier.color]}
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: 6
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    </View>
  );
};

export const AchievementCard = ({ achievement, onPress }) => {
  const tierColors = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    legendary: '#7c3aed'
  };

  const tierColor = tierColors[achievement.tier] || '#64748b';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {achievement.unlocked ? (
        <LinearGradient
          colors={[achievement.color, achievement.color + 'CC']}
          style={{
            borderRadius: 16,
            padding: 20,
            marginBottom: 12,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name={achievement.icon} size={24} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">{achievement.title}</Text>
              <Text className="text-white/90 text-sm">{achievement.description}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View 
                className="px-2 py-1 rounded-lg mr-2"
                style={{ backgroundColor: tierColor }}
              >
                <Text className="text-white text-xs font-bold">
                  {achievement.tier}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" style={{ marginRight: 4 }} />
                <Text className="text-green-400 text-sm font-medium">Débloqué</Text>
              </View>
            </View>
            
            <Text className="text-white/80 text-sm">+{achievement.xpReward} XP</Text>
          </View>
        </LinearGradient>
      ) : (
        <View
          className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5 mb-3"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-slate-700 rounded-xl items-center justify-center mr-4">
              <Ionicons name={achievement.icon} size={24} color="#64748b" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-300 text-lg font-bold">{achievement.title}</Text>
              <Text className="text-slate-400 text-sm">{achievement.description}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between">
            <View 
              className="px-2 py-1 rounded-lg"
              style={{ backgroundColor: '#64748b' }}
            >
              <Text className="text-white text-xs font-bold">
                {achievement.tier}
              </Text>
            </View>
            
            {achievement.progress !== undefined && (
              <View className="flex-1 mx-4">
                <View className="w-full h-2 bg-slate-700 rounded-full">
                  <View 
                    className="h-2 bg-cyan-500 rounded-full"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </View>
                <Text className="text-slate-400 text-xs mt-1 text-center">
                  {Math.round(achievement.progress)}%
                </Text>
              </View>
            )}
            
            <Text className="text-slate-400 text-sm">+{achievement.xpReward} XP</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const RankingCard = ({ rank, user, currentUserId }) => {
  const level = calculateLevel(user.xp || 0);
  const tier = getLevelTier(level);
  const isCurrentUser = (user._id || user.id) === currentUserId;

  const getRankColor = (rank) => {
    if (rank === 1) return '#ffd700'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#64748b'; // Default
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) return 'trophy';
    if (rank <= 10) return 'medal';
    return 'ribbon';
  };

  return (
    <View 
      className={`rounded-2xl p-4 mb-3 border ${
        isCurrentUser 
          ? 'bg-cyan-500/10 border-cyan-500/30' 
          : 'bg-slate-800 border-slate-700/50'
      }`}
    >
      <View className="flex-row items-center">
        {/* Rank */}
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: getRankColor(rank) + '20' }}
        >
          <Text 
            className="text-sm font-bold"
            style={{ color: getRankColor(rank) }}
          >
            #{rank}
          </Text>
        </View>

        {/* User Info */}
        <View className="flex-1 flex-row items-center">
          <View className="w-12 h-12 rounded-full overflow-hidden mr-3">
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" />
            ) : (
              <View 
                className="w-full h-full items-center justify-center"
                style={{ backgroundColor: tier.color + '40' }}
              >
                <Text className="text-white text-lg font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          
          <View className="flex-1">
            <Text className={`text-base font-bold ${
              isCurrentUser ? 'text-cyan-400' : 'text-white'
            }`}>
              {user.name}
              {isCurrentUser && ' (Vous)'}
            </Text>
            <View className="flex-row items-center">
              <LevelBadge xp={user.xp || 0} size="small" />
              <Text className="text-slate-400 text-sm ml-2">
                {user.xp || 0} XP • {tier.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Rank Icon */}
        <Ionicons 
          name={getRankIcon(rank)} 
          size={20} 
          color={getRankColor(rank)} 
        />
      </View>
    </View>
  );
};
