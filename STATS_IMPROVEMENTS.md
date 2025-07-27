# 📊 Améliorations des statistiques utilisateur

## 🎯 **Objectif:**
Afficher des statistiques réelles et précises basées sur les données de la base de données plutôt que des valeurs statiques.

## ✅ **Améliorations apportées:**

### 1. **🔧 Méthodes de calcul des statistiques réelles**

#### **`calculateRealStats()` - Méthode principale**
```javascript
userSchema.methods.calculateRealStats = async function() {
  const Event = require('./Event');
  
  // Compter les événements organisés
  const eventsOrganized = await Event.countDocuments({ 
    organizer: this._id,
    status: { $ne: 'cancelled' }
  });
  
  // Compter les événements rejoints (participant)
  // CORRECTION: Les participants sont stockés dans un tableau d'objets
  const eventsJoined = await Event.countDocuments({
    'participants.user': this._id,  // ✅ Correction ici
    status: { $ne: 'cancelled' }
  });
  
  // Mettre à jour les statistiques dans le profil
  this.profile.stats.eventsOrganized = eventsOrganized;
  this.profile.stats.eventsJoined = eventsJoined;
  
  return { eventsOrganized, eventsJoined, averageRating: 0, totalRatings: 0 };
};
```

#### **`getPublicProfileWithRealStats()` - Profil avec stats réelles**
```javascript
userSchema.methods.getPublicProfileWithRealStats = async function() {
  const realStats = await this.calculateRealStats();
  
  return {
    // ... autres champs
    stats: realStats
  };
};
```

### 2. **🔄 Mise à jour automatique des statistiques**

#### **Lors de la création d'événement:**
```javascript
// Dans routes/events.js - POST /api/events
const savedEvent = await event.save();

// Mettre à jour les statistiques de l'organisateur
const User = require('../models/User');
const user = await User.findById(req.userId);
if (user) {
  await user.calculateRealStats();
}
```

#### **Lors de l'inscription à un événement:**
```javascript
// Dans routes/events.js - POST /api/events/:id/join
await event.addParticipant(req.userId);

// Mettre à jour les statistiques de l'utilisateur
const User = require('../models/User');
const user = await User.findById(req.userId);
if (user) {
  await user.calculateRealStats();
}
```

#### **Lors de la désinscription d'un événement:**
```javascript
// Dans routes/events.js - DELETE /api/events/:id/leave
await event.removeParticipant(req.userId);

// Mettre à jour les statistiques de l'utilisateur
const User = require('../models/User');
const user = await User.findById(req.userId);
if (user) {
  await user.calculateRealStats();
}
```

### 3. **📱 Interface utilisateur améliorée**

#### **Bouton de rafraîchissement des statistiques:**
```javascript
// Fonction pour rafraîchir les statistiques
const refreshStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile/stats/update`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (response.ok) {
    await loadData(); // Recharger les données
    Alert.alert('Succès', 'Statistiques mises à jour !');
  }
};
```

#### **Affichage détaillé des statistiques:**
```javascript
<View style={styles.statsHeader}>
  <Text style={styles.sectionTitle}>Statistiques détaillées</Text>
  {isOwnProfile && (
    <TouchableOpacity 
      style={styles.refreshStatsButton}
      onPress={refreshStats}
    >
      <Ionicons name="refresh" size={16} color={colors.primary} />
      <Text style={styles.refreshStatsText}>Actualiser</Text>
    </TouchableOpacity>
  )}
</View>
```

### 4. **🛠️ Routes API mises à jour**

#### **Route de mise à jour manuelle des statistiques:**
```javascript
// POST /api/auth/profile/stats/update
router.post('/profile/stats/update', authMiddleware, async (req, res) => {
  const user = req.user;
  const realStats = await user.calculateRealStats();
  
  res.json({
    success: true,
    message: 'Statistiques mises à jour avec succès',
    stats: realStats
  });
});
```

#### **Routes de profil avec statistiques réelles:**
```javascript
// GET /api/auth/profile
const profile = await user.getPublicProfileWithRealStats();

// GET /api/auth/profile/:userId
const profile = await user.getPublicProfileWithRealStats();
```

### 5. **📊 Scripts de test et debug**

#### **Script `debug-events-participants.js`:**
```javascript
// Analyse la structure des participants dans les événements
const events = await Event.find({}).populate('organizer', 'name email');
for (const event of events) {
  console.log(`Événement: "${event.title}"`);
  console.log(`Participants: ${event.participants?.length || 0}`);
  // Affiche la structure détaillée des participants
}
```

#### **Script `test-stats-api.js`:**
```javascript
// Teste les méthodes de calcul des statistiques
const profile = await user.getPublicProfileWithRealStats();
console.log(`Événements organisés: ${profile.stats.eventsOrganized}`);
console.log(`Événements rejoints: ${profile.stats.eventsJoined}`);
```

## 🐛 **Correction du problème des événements rejoints:**

### **Problème identifié:**
- ❌ `participants: this._id` - Recherche incorrecte
- ✅ `'participants.user': this._id` - Recherche correcte

### **Structure des participants:**
```javascript
participants: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  }
}]
```

### **Requête MongoDB corrigée:**
```javascript
// Avant (incorrect)
const eventsJoined = await Event.countDocuments({
  participants: this._id,
  status: { $ne: 'cancelled' }
});

// Après (correct)
const eventsJoined = await Event.countDocuments({
  'participants.user': this._id,
  status: { $ne: 'cancelled' }
});
```

## 📈 **Résultats obtenus:**

### **Avant:**
- ❌ Statistiques statiques (toujours 0)
- ❌ Pas de mise à jour automatique
- ❌ Données non fiables
- ❌ Événements rejoints non comptés correctement

### **Après:**
- ✅ Statistiques réelles basées sur la DB
- ✅ Mise à jour automatique lors des actions
- ✅ Bouton de rafraîchissement manuel
- ✅ Interface utilisateur améliorée
- ✅ Données fiables et précises
- ✅ **Événements rejoints correctement comptés** ✅

## 🔍 **Statistiques calculées:**

1. **Événements organisés** - Nombre d'événements créés par l'utilisateur
2. **Événements rejoints** - Nombre d'événements auxquels l'utilisateur a participé ✅
3. **Note moyenne** - Moyenne des évaluations reçues (préparé pour le futur)
4. **Nombre d'évaluations** - Nombre total d'évaluations reçues (préparé pour le futur)

## 🚀 **Utilisation:**

### **Pour les développeurs:**
```bash
# Mettre à jour les statistiques de tous les utilisateurs
node update-all-user-stats.js

# Debug des événements et participants
node debug-events-participants.js

# Test de l'API des statistiques
node test-stats-api.js
```

### **Pour les utilisateurs:**
1. **Accéder au profil** - Les statistiques se chargent automatiquement
2. **Cliquer sur "Actualiser"** - Pour forcer la mise à jour
3. **Rejoindre/créer des événements** - Les stats se mettent à jour automatiquement

## 🔮 **Futures améliorations:**

1. **Système de ratings** - Implémenter les évaluations entre utilisateurs
2. **Statistiques avancées** - Sports préférés, niveaux, etc.
3. **Graphiques** - Visualisation des statistiques dans le temps
4. **Badges** - Récompenses basées sur les statistiques
5. **Classements** - Comparaison avec d'autres utilisateurs 