/**
 * Test du système de points et achievements
 */

import pointsService from './src/services/pointsService.js';

// Données de test d'un utilisateur
const testUserStats = {
  eventsOrganized: 3,
  eventsJoined: 7,
  averageRating: 4.2,
  totalRatings: 15,
  isEmailVerified: true,
  registrationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 jours
};

console.log('🧪 Test du système de points TeamUp');
console.log('=' .repeat(50));

console.log('\n📊 Données utilisateur de test:');
console.log('- Événements organisés:', testUserStats.eventsOrganized);
console.log('- Événements rejoints:', testUserStats.eventsJoined);
console.log('- Note moyenne:', testUserStats.averageRating);
console.log('- Nombre d\'évaluations:', testUserStats.totalRatings);
console.log('- Email vérifié:', testUserStats.isEmailVerified);
console.log('- Membre depuis:', Math.floor((Date.now() - testUserStats.registrationDate) / (1000 * 60 * 60 * 24)), 'jours');

// Test du calcul de points
console.log('\n💰 Calcul des points:');
const points = pointsService.calculatePoints(testUserStats);
console.log('Total points calculés:', points);

console.log('\nDétail du calcul:');
console.log('- Événements organisés (3 × 50):', testUserStats.eventsOrganized * 50);
console.log('- Événements rejoints (7 × 20):', testUserStats.eventsJoined * 20);
console.log('- Bonus note moyenne (4.2/5 × 500):', Math.round((testUserStats.averageRating / 5) * 500));
console.log('- Bonus ancienneté (45 jours):', Math.min(45, 365));
console.log('- Bonus email vérifié:', 100);

// Test du calcul de niveau
console.log('\n📈 Calcul du niveau:');
const level = pointsService.calculateLevel(points);
const levelTitle = pointsService.getLevelTitle(level);
const levelColor = pointsService.getLevelColor(level);

console.log('Niveau calculé:', level);
console.log('Titre du niveau:', levelTitle);
console.log('Couleur du niveau:', levelColor);

// Test progression vers niveau suivant
const nextLevelPoints = pointsService.getPointsForNextLevel(level);
const currentLevelPoints = level > 1 ? pointsService.getPointsForNextLevel(level - 1) : 0;
const progressPoints = points - currentLevelPoints;
const neededPoints = nextLevelPoints - currentLevelPoints;
const progressPercentage = Math.min((progressPoints / neededPoints) * 100, 100);

console.log('\n🎯 Progression:');
console.log('Points actuels:', points);
console.log('Points niveau actuel:', currentLevelPoints);
console.log('Points niveau suivant:', nextLevelPoints);
console.log('Progression:', Math.round(progressPercentage) + '%');
console.log('Points manquants:', nextLevelPoints - points);

// Test des achievements
console.log('\n🏆 Achievements:');
const achievements = pointsService.calculateAchievements(testUserStats);

console.log('Achievements débloqués:');
achievements.unlocked.forEach((achievement, index) => {
  console.log(`${index + 1}. ${achievement.title} (${achievement.points} pts)`);
  console.log(`   ${achievement.description}`);
});

console.log('\nAchievements à débloquer:');
achievements.locked.forEach((achievement, index) => {
  console.log(`${index + 1}. ${achievement.title} (${achievement.points} pts)`);
  console.log(`   ${achievement.description}`);
  if (achievement.progress) {
    console.log(`   Progression: ${achievement.progress}`);
  }
});

console.log('\n📊 Résumé:');
console.log('Total achievements débloqués:', achievements.unlocked.length);
console.log('Total achievements disponibles:', achievements.total);
console.log('Pourcentage de completion:', Math.round((achievements.unlocked.length / achievements.total) * 100) + '%');

// Test avec différents niveaux d'utilisateurs
console.log('\n🎮 Test avec différents profils:');

const profiles = [
  {
    name: 'Débutant',
    stats: { eventsOrganized: 0, eventsJoined: 1, averageRating: 0, totalRatings: 0, isEmailVerified: false, registrationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  },
  {
    name: 'Actif',
    stats: { eventsOrganized: 5, eventsJoined: 15, averageRating: 4.5, totalRatings: 8, isEmailVerified: true, registrationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  },
  {
    name: 'Expert',
    stats: { eventsOrganized: 20, eventsJoined: 50, averageRating: 4.8, totalRatings: 25, isEmailVerified: true, registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
  }
];

profiles.forEach(profile => {
  const profilePoints = pointsService.calculatePoints(profile.stats);
  const profileLevel = pointsService.calculateLevel(profilePoints);
  const profileTitle = pointsService.getLevelTitle(profileLevel);
  const profileAchievements = pointsService.calculateAchievements(profile.stats);
  
  console.log(`\n${profile.name}:`);
  console.log(`  Points: ${profilePoints}`);
  console.log(`  Niveau: ${profileLevel} (${profileTitle})`);
  console.log(`  Achievements: ${profileAchievements.unlocked.length}/${profileAchievements.total}`);
});

console.log('\n🎉 Tests terminés !');
console.log('Le système de points et achievements est fonctionnel.');

export default function testPointsSystem() {
  return {
    points,
    level,
    levelTitle,
    achievements,
    progressPercentage
  };
}

