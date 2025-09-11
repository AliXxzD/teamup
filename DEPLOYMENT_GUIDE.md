# Guide de Déploiement TeamUp - Backend sur Render + APK

## 🚀 Vue d'ensemble

Ce guide vous accompagne pour :
1. **Héberger le backend sur Render** (gratuit)
2. **Créer un APK** avec EAS Build
3. **Configurer la communication** entre l'APK et Render

## 📋 Prérequis

- Compte GitHub avec le code pushé
- Compte Render (gratuit)
- Compte Expo (gratuit)
- Node.js installé localement
- EAS CLI installé : `npm install -g @expo/eas-cli`

## 🔧 Étape 1 : Déploiement Backend sur Render

### 1.1 Préparation
Les fichiers de configuration sont déjà créés :
- ✅ `backend/render.yaml` - Configuration Render
- ✅ `backend/Dockerfile` - Image Docker
- ✅ `backend/.dockerignore` - Fichiers à ignorer
- ✅ `backend/RENDER_DEPLOYMENT.md` - Instructions détaillées

### 1.2 Déploiement sur Render

1. **Aller sur [render.com](https://render.com)**
2. **Se connecter avec GitHub**
3. **Créer un nouveau Web Service** :
   - Repository : Votre repo GitHub
   - Name : `teamup-backend`
   - Environment : `Node`
   - Root Directory : `backend`
   - Build Command : `npm install`
   - Start Command : `npm start`

4. **Configurer les variables d'environnement** :
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup
   JWT_SECRET=teamup_secret_key_production_2024_change_this_in_real_production
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_SECRET=teamup_refresh_secret_production_2024_change_this_too
   REFRESH_TOKEN_EXPIRES_IN=7d
   SESSION_SECRET=teamup_session_secret_change_in_production
   FRONTEND_URLS=https://expo.dev,https://exp.host,https://snack.expo.io,exp://localhost:8081
   EMAIL_USER=nassimblm12@gmail.com
   EMAIL_PASSWORD=hepx tyzl phrz cvyj
   ```

5. **Déployer** : Cliquer sur "Create Web Service"

### 1.3 Vérification du déploiement

Une fois déployé, tester ces URLs :
- `https://votre-backend.onrender.com/` - Page d'accueil
- `https://votre-backend.onrender.com/api/health` - Health check

## 📱 Étape 2 : Création de l'APK

### 2.1 Configuration EAS

```bash
cd frontend
eas login
eas build:configure
```

### 2.2 Mise à jour de l'URL API

Modifier `frontend/eas.json` avec votre URL Render :

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://votre-backend.onrender.com"
      }
    }
  }
}
```

### 2.3 Création de l'APK

```bash
# APK de test
eas build --platform android --profile preview

# APK de production
eas build --platform android --profile production
```

### 2.4 Installation de l'APK

1. Télécharger l'APK depuis le lien fourni
2. Activer "Sources inconnues" sur Android
3. Installer l'APK

## 🔗 Étape 3 : Configuration de la communication

### 3.1 Vérification CORS

Le backend est configuré pour accepter les connexions depuis :
- Expo Go (développement)
- EAS Build (production)
- Tous les domaines expo.dev et exp.host

### 3.2 Test de la connexion

Dans l'APK, vérifier que :
- L'inscription fonctionne
- La connexion fonctionne
- Les événements se chargent
- La messagerie fonctionne

## 🛠️ Commandes utiles

### Backend (Render)
```bash
# Voir les logs
# Aller sur render.com → Votre service → Logs

# Redémarrer le service
# Aller sur render.com → Votre service → Manual Deploy
```

### Frontend (EAS)
```bash
# Voir les builds
eas build:list

# Voir les logs d'un build
eas build:logs [BUILD_ID]

# Annuler un build
eas build:cancel [BUILD_ID]
```

## 🐛 Troubleshooting

### Problème de connexion API
1. Vérifier que l'URL Render est correcte
2. Tester l'API dans un navigateur
3. Vérifier les logs Render
4. Vérifier la configuration CORS

### Problème d'installation APK
1. Vérifier que "Sources inconnues" est activé
2. Redémarrer l'appareil
3. Télécharger l'APK à nouveau

### Problème de build EAS
1. Vérifier la configuration `eas.json`
2. Consulter les logs avec `eas build:logs`
3. Vérifier que toutes les dépendances sont installées

## 📊 Monitoring

### Render
- **Logs** : Dashboard Render → Logs
- **Métriques** : Dashboard Render → Metrics
- **Uptime** : Dashboard Render → Status

### EAS
- **Builds** : `eas build:list`
- **Logs** : `eas build:logs [BUILD_ID]`

## 🔄 Mise à jour

### Backend
- Push sur GitHub → Déploiement automatique sur Render

### Frontend
- Modifier le code → `eas build` → Nouvel APK

## 💰 Coûts

- **Render** : Gratuit (avec limitations)
- **EAS Build** : Gratuit (avec limitations)
- **MongoDB Atlas** : Gratuit (avec limitations)

## 🎯 Prochaines étapes

1. **Déployer le backend** sur Render
2. **Créer l'APK** avec EAS
3. **Tester l'application** complète
4. **Optimiser les performances** si nécessaire
5. **Configurer un domaine personnalisé** (optionnel)

---

**Note** : Ce guide utilise les plans gratuits. Pour la production, considérez les plans payants pour de meilleures performances.
