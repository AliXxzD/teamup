// Leveling System for TeamUp
export const LEVEL_SYSTEM = {
  // XP required for each level (cumulative)
  LEVEL_THRESHOLDS: [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    450,    // Level 4
    700,    // Level 5
    1000,   // Level 6
    1350,   // Level 7
    1750,   // Level 8
    2200,   // Level 9
    2700,   // Level 10
    3250,   // Level 11
    3850,   // Level 12
    4500,   // Level 13
    5200,   // Level 14
    5950,   // Level 15
    6750,   // Level 16
    7600,   // Level 17
    8500,   // Level 18
    9450,   // Level 19
    10500,  // Level 20
    12000,  // Level 21
    14000,  // Level 22
    16500,  // Level 23
    19500,  // Level 24
    23000,  // Level 25
    27000,  // Level 26
    31500,  // Level 27
    36500,  // Level 28
    42000,  // Level 29
    48000,  // Level 30
  ],

  // XP rewards for different actions
  XP_REWARDS: {
    CREATE_EVENT: 50,
    JOIN_EVENT: 25,
    COMPLETE_EVENT_ORGANIZER: 100,
    COMPLETE_EVENT_PARTICIPANT: 50,
    FIRST_EVENT: 100,
    RECEIVE_5_STAR_REVIEW: 75,
    RECEIVE_REVIEW: 25,
    INVITE_FRIEND: 30,
    WEEKLY_ACTIVE: 50,
    MONTHLY_ACTIVE: 200,
  },

  // Level tiers with colors and benefits
  LEVEL_TIERS: {
    BRONZE: { min: 1, max: 10, color: '#cd7f32', name: 'Bronze' },
    SILVER: { min: 11, max: 20, color: '#c0c0c0', name: 'Argent' },
    GOLD: { min: 21, max: 30, color: '#ffd700', name: 'Or' },
    DIAMOND: { min: 31, max: 50, color: '#b9f2ff', name: 'Diamant' },
  }
};

// Achievements system
export const ACHIEVEMENTS = {
  // Organizer achievements
  FIRST_ORGANIZER: {
    id: 'first_organizer',
    title: 'Premier Organisateur',
    description: 'Créer votre premier événement',
    icon: 'trophy',
    color: '#f59e0b',
    tier: 'bronze',
    xpReward: 100,
    condition: (stats) => stats.eventsOrganized >= 1
  },
  
  REGULAR_ORGANIZER: {
    id: 'regular_organizer',
    title: 'Organisateur Régulier',
    description: 'Organiser 5 événements',
    icon: 'calendar',
    color: '#c0c0c0',
    tier: 'silver',
    xpReward: 200,
    condition: (stats) => stats.eventsOrganized >= 5
  },

  PRO_ORGANIZER: {
    id: 'pro_organizer',
    title: 'Organisateur Pro',
    description: 'Organiser 20+ événements',
    icon: 'trophy',
    color: '#ffd700',
    tier: 'gold',
    xpReward: 500,
    condition: (stats) => stats.eventsOrganized >= 20
  },

  // Participant achievements
  FIRST_PARTICIPANT: {
    id: 'first_participant',
    title: 'Premier Pas',
    description: 'Rejoindre votre premier événement',
    icon: 'people',
    color: '#f59e0b',
    tier: 'bronze',
    xpReward: 50,
    condition: (stats) => stats.eventsJoined >= 1
  },

  REGULAR_PARTICIPANT: {
    id: 'regular_participant',
    title: 'Régulier',
    description: 'Rejoindre 10 événements',
    icon: 'refresh-circle',
    color: '#c0c0c0',
    tier: 'silver',
    xpReward: 150,
    condition: (stats) => stats.eventsJoined >= 10
  },

  SUPER_PARTICIPANT: {
    id: 'super_participant',
    title: 'Super Participant',
    description: 'Rejoindre 50+ événements',
    icon: 'star',
    color: '#ffd700',
    tier: 'gold',
    xpReward: 300,
    condition: (stats) => stats.eventsJoined >= 50
  },

  // Social achievements
  MENTOR: {
    id: 'mentor',
    title: 'Mentor',
    description: 'Maintenir une note moyenne > 4.5',
    icon: 'ribbon',
    color: '#ffd700',
    tier: 'gold',
    xpReward: 250,
    condition: (stats) => stats.averageRating >= 4.5 && stats.totalReviews >= 5
  },

  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    title: 'Papillon Social',
    description: 'Avoir 50+ abonnés',
    icon: 'people-circle',
    color: '#8b5cf6',
    tier: 'gold',
    xpReward: 200,
    condition: (stats) => stats.followers >= 50
  },

  // Sport-specific achievements
  FOOTBALL_MASTER: {
    id: 'football_master',
    title: 'Maître du Football',
    description: 'Participer à 20 événements de football',
    icon: 'football',
    color: '#22c55e',
    tier: 'gold',
    xpReward: 300,
    condition: (stats) => stats.sportEvents?.football >= 20
  },

  BASKETBALL_LEGEND: {
    id: 'basketball_legend',
    title: 'Légende du Basketball',
    description: 'Participer à 20 événements de basketball',
    icon: 'basketball',
    color: '#f59e0b',
    tier: 'gold',
    xpReward: 300,
    condition: (stats) => stats.sportEvents?.basketball >= 20
  },

  // Special achievements
  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Lève-tôt',
    description: 'Rejoindre 10 événements avant 10h',
    icon: 'sunrise',
    color: '#06b6d4',
    tier: 'silver',
    xpReward: 150,
    condition: (stats) => stats.earlyEvents >= 10
  },

  WEEKEND_WARRIOR: {
    id: 'weekend_warrior',
    title: 'Guerrier du Weekend',
    description: 'Participer à 15 événements le weekend',
    icon: 'calendar-outline',
    color: '#8b5cf6',
    tier: 'silver',
    xpReward: 200,
    condition: (stats) => stats.weekendEvents >= 15
  },

  MONTHLY_CHAMPION: {
    id: 'monthly_champion',
    title: 'Champion du Mois',
    description: 'Être le plus actif du mois',
    icon: 'medal',
    color: '#7c3aed',
    tier: 'legendary',
    xpReward: 500,
    condition: (stats) => stats.monthlyRank === 1
  },

  STREAK_MASTER: {
    id: 'streak_master',
    title: 'Maître des Séries',
    description: 'Participer à des événements 7 jours consécutifs',
    icon: 'flash',
    color: '#ef4444',
    tier: 'gold',
    xpReward: 400,
    condition: (stats) => stats.maxStreak >= 7
  }
};

// Calculate level from XP
export const calculateLevel = (xp) => {
  let level = 1;
  for (let i = 0; i < LEVEL_SYSTEM.LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_SYSTEM.LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, 30); // Max level 30
};

// Calculate XP needed for next level
export const getXPForNextLevel = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  if (currentLevel >= 30) return 0; // Max level reached
  
  const nextLevelXP = LEVEL_SYSTEM.LEVEL_THRESHOLDS[currentLevel];
  return nextLevelXP - currentXP;
};

// Get level tier
export const getLevelTier = (level) => {
  for (const [tierName, tierInfo] of Object.entries(LEVEL_SYSTEM.LEVEL_TIERS)) {
    if (level >= tierInfo.min && level <= tierInfo.max) {
      return { ...tierInfo, name: tierInfo.name };
    }
  }
  return LEVEL_SYSTEM.LEVEL_TIERS.DIAMOND; // Default to highest tier
};

// Check which achievements are unlocked
export const checkAchievements = (userStats) => {
  const unlockedAchievements = [];
  
  for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (achievement.condition(userStats)) {
      unlockedAchievements.push({
        ...achievement,
        id: achievementId,
        unlocked: true
      });
    }
  }
  
  return unlockedAchievements;
};

// Get all achievements with unlock status
export const getAllAchievementsWithStatus = (userStats) => {
  return Object.entries(ACHIEVEMENTS).map(([achievementId, achievement]) => ({
    ...achievement,
    id: achievementId,
    unlocked: achievement.condition(userStats),
    progress: calculateAchievementProgress(achievement, userStats)
  }));
};

// Calculate progress towards achievement
export const calculateAchievementProgress = (achievement, userStats) => {
  // This is a simplified progress calculation
  // You can make this more sophisticated based on specific achievement requirements
  if (achievement.condition(userStats)) return 100;
  
  // Example progress calculations for specific achievements
  switch (achievement.id) {
    case 'pro_organizer':
      return Math.min((userStats.eventsOrganized / 20) * 100, 100);
    case 'super_participant':
      return Math.min((userStats.eventsJoined / 50) * 100, 100);
    case 'mentor':
      return Math.min((userStats.averageRating / 4.5) * 100, 100);
    case 'social_butterfly':
      return Math.min((userStats.followers / 50) * 100, 100);
    default:
      return 0;
  }
};

// Award XP for action
export const awardXP = (action, currentXP = 0) => {
  const xpReward = LEVEL_SYSTEM.XP_REWARDS[action] || 0;
  const newXP = currentXP + xpReward;
  const oldLevel = calculateLevel(currentXP);
  const newLevel = calculateLevel(newXP);
  
  return {
    newXP,
    xpGained: xpReward,
    levelUp: newLevel > oldLevel,
    newLevel: newLevel,
    oldLevel: oldLevel
  };
};

// Get level progress percentage
export const getLevelProgress = (xp) => {
  const currentLevel = calculateLevel(xp);
  if (currentLevel >= 30) return 100;
  
  const currentLevelXP = LEVEL_SYSTEM.LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelXP = LEVEL_SYSTEM.LEVEL_THRESHOLDS[currentLevel] || LEVEL_SYSTEM.LEVEL_THRESHOLDS[29];
  
  const progressXP = xp - currentLevelXP;
  const levelXPRange = nextLevelXP - currentLevelXP;
  
  return Math.min((progressXP / levelXPRange) * 100, 100);
};

// Get user rank based on XP
export const getUserRank = (userXP, allUsersXP) => {
  const sortedUsers = allUsersXP.sort((a, b) => b - a);
  const rank = sortedUsers.indexOf(userXP) + 1;
  const totalUsers = sortedUsers.length;
  const percentile = ((totalUsers - rank) / totalUsers) * 100;
  
  return {
    rank,
    totalUsers,
    percentile: Math.round(percentile),
    isTopPercent: percentile >= 90
  };
};

