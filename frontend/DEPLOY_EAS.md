# 📱 Déploiement TeamUp Frontend sur Expo EAS

## 📋 Prérequis

- Compte Expo (expo.dev)
- EAS CLI installé : `npm install -g @expo/eas-cli`
- Backend déployé sur Render
- URL du backend Render

## 🔧 Configuration EAS

### 1. Initialiser EAS

```bash
cd frontend
eas login
eas build:configure
```

### 2. Configurer app.json

Vérifiez que votre `app.json` contient :

```json
{
  "expo": {
    "name": "TeamUp",
    "slug": "teamup",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0A0A0A"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "bundleIdentifier": "com.teamup.app"
    },
    "android": {
      "package": "com.teamup.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0A0A0A"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 3. Configurer les Variables d'Environnement

Créez un fichier `.env` dans le dossier `frontend` :

```env
# URL de votre backend sur Render
EXPO_PUBLIC_API_URL=https://teamup-oa5q.onrender.com

# Autres configurations (optionnel)
EXPO_PUBLIC_APP_ENV=production
```

### 4. Configurer eas.json

Créez `eas.json` dans le dossier `frontend` :

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://192.168.1.205:5000"
      }
    },
         "preview": {
       "distribution": "internal",
       "env": {
         "EXPO_PUBLIC_API_URL": "https://teamup-oa5q.onrender.com"
       }
     },
     "production": {
       "env": {
         "EXPO_PUBLIC_API_URL": "https://teamup-oa5q.onrender.com"
       }
     }
  },
  "submit": {
    "production": {}
  }
}
```

## 🚀 Déploiement

### 1. Build de Preview (Test)

```bash
eas build --platform all --profile preview
```

### 2. Build de Production

```bash
eas build --platform all --profile production
```

### 3. Mise à jour OTA (Over-The-Air)

Pour les mises à jour rapides sans rebuild :

```bash
eas update --branch production --message "Nouvelle version"
```

## 📱 Configuration API Backend

Après déploiement de votre backend sur Render, mettez à jour :

### 1. Variable d'environnement

Dans votre `.env` :
```env
EXPO_PUBLIC_API_URL=https://your-actual-render-url.onrender.com
```

### 2. Configuration centralisée

Le fichier `src/config/api.js` gère automatiquement l'URL selon l'environnement.

## 🔧 URLs Backend sur Render

Une fois votre backend déployé sur Render, vous aurez une URL comme :
```
https://teamup-backend-xyz123.onrender.com
```

Utilisez cette URL dans :
- Variables d'environnement Expo (`EXPO_PUBLIC_API_URL`)
- Configuration EAS (`eas.json`)

## 📊 Test de l'Application

### 1. Test Local avec Backend Render

```bash
# Développement local avec backend de production
EXPO_PUBLIC_API_URL=https://your-render-url.onrender.com expo start
```

### 2. Test de l'API

Testez que votre API fonctionne :
```bash
curl https://your-render-url.onrender.com/api/health
```

## 🔒 Sécurité

### 1. Variables d'Environnement

- ✅ `EXPO_PUBLIC_API_URL` - URL du backend
- ✅ Toutes les variables `EXPO_PUBLIC_*` sont exposées côté client
- ❌ Ne mettez JAMAIS de secrets dans les variables `EXPO_PUBLIC_*`

### 2. HTTPS

- ✅ Render fournit HTTPS automatiquement
- ✅ Expo EAS Build fonctionne uniquement avec HTTPS en production

## 📋 Checklist de Déploiement

### Backend (Render)
- [ ] Backend déployé et fonctionnel
- [ ] URL Render notée
- [ ] CORS configuré pour Expo
- [ ] Tests API passent

### Frontend (EAS)
- [ ] `EXPO_PUBLIC_API_URL` configurée
- [ ] `eas.json` configuré
- [ ] Variables d'environnement définies
- [ ] Build EAS réussi
- [ ] Application testée

## 🐛 Dépannage

### Erreurs courantes

1. **CORS Error** : Vérifiez que votre backend accepte les requêtes d'Expo
2. **Network Error** : Vérifiez l'URL du backend
3. **Build Failed** : Vérifiez les dépendances et la configuration

### Logs EAS

```bash
# Voir les logs de build
eas build:list

# Voir les logs d'une build spécifique
eas build:view [build-id]
```

## 🚀 Commandes Utiles

```bash
# Status du projet
eas project:info

# Lister les builds
eas build:list

# Créer une nouvelle build
eas build --platform android --profile production

# Mettre à jour l'app (OTA)
eas update --auto

# Soumettre aux stores
eas submit --platform all
```

---

🎯 **Votre app TeamUp est maintenant prête pour la production avec EAS Build !**

## 📱 Résultat Final

Après déploiement, vous aurez :
- ✅ Backend sur Render (API REST)
- ✅ Frontend sur Expo EAS (Application mobile)
- ✅ Base de données MongoDB Atlas
- ✅ HTTPS et sécurité
- ✅ Mises à jour OTA possibles 