# 🛠️ Analyse des technologies utilisées dans TeamUp

## 📱 **Frontend (React Native / Expo)**

### **Framework principal:**
- **React Native** `0.79.5` - Framework de développement mobile cross-platform
- **Expo** `~53.0.20` - Plateforme de développement React Native
- **React** `19.0.0` - Bibliothèque JavaScript pour les interfaces utilisateur

### **Navigation:**
- **@react-navigation/native** `^6.1.18` - Navigation principale
- **@react-navigation/stack** `^6.4.1` - Navigation par pile
- **@react-navigation/bottom-tabs** `^6.6.1` - Navigation par onglets
- **@react-navigation/drawer** `^6.7.2` - Navigation par tiroir

### **UI/UX:**
- **@expo/vector-icons** - Icônes (Ionicons, MaterialIcons)
- **expo-linear-gradient** `~14.1.5` - Dégradés linéaires
- **expo-status-bar** `~2.2.3` - Barre de statut
- **react-native-gesture-handler** `~2.24.0` - Gestion des gestes
- **react-native-reanimated** `~3.17.4` - Animations avancées
- **react-native-safe-area-context** `5.4.0` - Zones sûres
- **react-native-screens** `~4.11.1` - Écrans natifs

### **Stockage local:**
- **@react-native-async-storage/async-storage** `2.1.2` - Stockage asynchrone

### **Composants UI:**
- **@react-native-community/datetimepicker** `^8.4.2` - Sélecteur de date/heure

### **Configuration Expo:**
```json
{
  "expo": {
    "name": "TeamUp",
    "slug": "teamup",
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": true
  }
}
```

## 🖥️ **Backend (Node.js / Express)**

### **Runtime et Framework:**
- **Node.js** - Runtime JavaScript côté serveur
- **Express.js** `^4.19.2` - Framework web minimaliste

### **Base de données:**
- **MongoDB** - Base de données NoSQL
- **Mongoose** `^8.16.4` - ODM (Object Document Mapper) pour MongoDB

### **Authentification et sécurité:**
- **bcryptjs** `^3.0.2` - Hachage des mots de passe
- **jsonwebtoken** `^9.0.2` - JWT (JSON Web Tokens)
- **passport** `^0.7.0` - Middleware d'authentification
- **passport-google-oauth20** `^2.0.0` - Stratégie OAuth Google
- **helmet** `^8.1.0` - Sécurité des en-têtes HTTP

### **Validation et middleware:**
- **express-validator** `^7.2.1` - Validation des données
- **express-rate-limit** `^8.0.1` - Limitation de débit
- **cors** `^2.8.5` - Cross-Origin Resource Sharing

### **Email:**
- **nodemailer** `^7.0.5` - Envoi d'emails

### **Utilitaires:**
- **dotenv** `^17.2.0` - Variables d'environnement
- **node-fetch** `^2.7.0` - Requêtes HTTP (obsolète, remplacé par fetch natif)

## 🗄️ **Base de données (MongoDB)**

### **Modèles de données:**

#### **User (Utilisateur):**
```javascript
{
  name: String,
  email: String (unique),
  username: String (unique),
  password: String (hashé),
  oauth: { google: Object, facebook: Object },
  profile: {
    avatar: String,
    backgroundImage: String,
    location: { city: String, country: String, coordinates: Object },
    bio: String,
    favoritesSports: Array,
    stats: {
      eventsOrganized: Number,
      eventsJoined: Number,
      averageRating: Number,
      totalRatings: Number
    }
  }
}
```

#### **Event (Événement):**
```javascript
{
  title: String,
  description: String,
  sport: String,
  date: Date,
  time: String,
  location: { address: String, coordinates: Object },
  maxParticipants: Number,
  currentParticipants: Number,
  organizer: ObjectId (ref: User),
  participants: [{
    user: ObjectId (ref: User),
    joinedAt: Date,
    status: String
  }],
  status: String,
  price: { amount: Number, isFree: Boolean }
}
```

#### **Conversation & Message:**
```javascript
{
  participants: [ObjectId],
  messages: [{
    sender: ObjectId,
    content: String,
    timestamp: Date
  }]
}
```

## 🔐 **Authentification et autorisation**

### **Stratégies d'authentification:**
1. **Authentification locale** - Email/mot de passe
2. **OAuth Google** - Connexion via Google
3. **JWT** - Tokens d'accès et de rafraîchissement
4. **Sessions** - Support pour les sessions (désactivé)

### **Sécurité:**
- **Rate limiting** - Protection contre les attaques par force brute
- **CORS** - Configuration stricte des origines autorisées
- **Helmet** - En-têtes de sécurité HTTP
- **Validation** - Validation stricte des données d'entrée

## 📡 **API REST**

### **Endpoints principaux:**
- **`/api/auth`** - Authentification et gestion des utilisateurs
- **`/api/events`** - Gestion des événements
- **`/api/messages`** - Système de messagerie

### **Méthodes HTTP:**
- **GET** - Récupération de données
- **POST** - Création de ressources
- **PUT** - Mise à jour de ressources
- **DELETE** - Suppression de ressources

## 🎨 **Architecture de l'application**

### **Frontend (React Native):**
```
frontend/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── contexts/       # Contextes React (AuthContext)
│   ├── hooks/          # Hooks personnalisés
│   ├── navigation/     # Configuration de navigation
│   ├── screens/        # Écrans de l'application
│   ├── styles/         # Styles globaux
│   └── utils/          # Utilitaires
├── assets/             # Images et ressources
└── App.js             # Point d'entrée
```

### **Backend (Node.js/Express):**
```
backend/
├── config/            # Configuration (DB, Passport)
├── middleware/        # Middlewares Express
├── models/           # Modèles Mongoose
├── routes/           # Routes API
├── services/         # Services métier
└── server.js         # Point d'entrée
```

## 🚀 **Fonctionnalités techniques**

### **Gestion d'état:**
- **React Context** - Gestion de l'état global (authentification)
- **useState/useEffect** - Gestion de l'état local

### **Navigation:**
- **Stack Navigator** - Navigation par pile
- **Tab Navigator** - Navigation par onglets
- **Nested Navigation** - Navigation imbriquée

### **Stockage:**
- **AsyncStorage** - Stockage local côté client
- **MongoDB** - Base de données côté serveur

### **Communication:**
- **Fetch API** - Requêtes HTTP côté client
- **Express Routes** - API REST côté serveur

## 🔧 **Outils de développement**

### **Frontend:**
- **Expo CLI** - Outils de développement Expo
- **React Native Debugger** - Débogage
- **Metro Bundler** - Bundler JavaScript

### **Backend:**
- **Nodemon** - Redémarrage automatique en développement
- **MongoDB Compass** - Interface graphique MongoDB

### **Tests et debug:**
- **Scripts de test** - Tests API et base de données
- **Logs détaillés** - Debugging et monitoring

## 📊 **Performance et optimisation**

### **Frontend:**
- **React Native Reanimated** - Animations optimisées
- **React Native Screens** - Écrans natifs
- **Lazy loading** - Chargement à la demande

### **Backend:**
- **Mongoose indexing** - Index de base de données
- **Rate limiting** - Protection contre la surcharge
- **Connection pooling** - Pool de connexions MongoDB

## 🔮 **Technologies futures prévues**

### **Fonctionnalités avancées:**
- **Push Notifications** - Notifications push
- **Real-time messaging** - WebSockets pour la messagerie
- **Image upload** - Upload d'images
- **Geolocation** - Services de localisation
- **Analytics** - Analytics et métriques

### **Améliorations techniques:**
- **TypeScript** - Typage statique
- **GraphQL** - API plus flexible
- **Redis** - Cache et sessions
- **Docker** - Containerisation
- **CI/CD** - Intégration continue

## 📋 **Résumé des technologies principales:**

### **Frontend:**
- ✅ **React Native** - Framework mobile
- ✅ **Expo** - Plateforme de développement
- ✅ **React Navigation** - Navigation
- ✅ **AsyncStorage** - Stockage local

### **Backend:**
- ✅ **Node.js** - Runtime JavaScript
- ✅ **Express.js** - Framework web
- ✅ **MongoDB** - Base de données
- ✅ **Mongoose** - ODM
- ✅ **JWT** - Authentification

### **Sécurité:**
- ✅ **bcryptjs** - Hachage
- ✅ **Helmet** - Sécurité HTTP
- ✅ **Rate limiting** - Protection
- ✅ **CORS** - Cross-origin

### **Développement:**
- ✅ **Nodemon** - Redémarrage automatique
- ✅ **Expo CLI** - Outils de développement
- ✅ **Scripts de test** - Tests et debug 