# 🚀 Guide de Déploiement Production TeamUp

## 📋 Vue d'Ensemble

Ce guide vous accompagne pour déployer votre application TeamUp en production avec :
- **Backend** sur Render (API Node.js)
- **Frontend** sur Expo EAS (Application mobile)
- **Base de données** MongoDB Atlas

## 🎯 Architecture de Production

```
📱 Expo EAS Build (Frontend)
    ↓ HTTPS API Calls
🌐 Render (Backend API)
    ↓ MongoDB Connection
💾 MongoDB Atlas (Database)
```

---

## 🔧 ÉTAPE 1 : Backend sur Render

### 1. Préparer le Backend

Les modifications suivantes ont été apportées pour Render :

✅ **CORS configuré** pour Expo EAS
✅ **Server.js** écoute sur `0.0.0.0`
✅ **Routes de santé** pour monitoring
✅ **Variables d'environnement** documentées

### 2. Variables d'Environnement Render

Dans l'interface Render, ajoutez ces variables :

```env
MONGODB_URI=mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup
JWT_SECRET=votre_secret_jwt_securise
JWT_REFRESH_SECRET=votre_secret_refresh_securise
NODE_ENV=production
EMAIL_USER=nassimblm12@gmail.com
EMAIL_PASSWORD=wnivttwzatexdyje
FRONTEND_URL=https://expo.dev
FRONTEND_URLS=https://expo.dev,https://exp.host,https://snack.expo.io
```

### 3. Configuration Render

```
Service Type: Web Service
Build Command: npm install
Start Command: npm start
Environment: Node 18.x
```

### 4. Vérification

Testez votre API déployée :
```bash
curl https://your-app.onrender.com/api/health
```

---

## 📱 ÉTAPE 2 : Frontend sur Expo EAS

### 1. Installer EAS CLI

```bash
npm install -g @expo/eas-cli
cd frontend
eas login
```

### 2. Configuration des Variables

Créez `frontend/.env` :
```env
EXPO_PUBLIC_API_URL=https://your-app.onrender.com
```

### 3. Configuration EAS

Créez `frontend/eas.json` :
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://192.168.1.205:5000"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-app.onrender.com"
      }
    }
  }
}
```

### 4. Build de Production

```bash
eas build:configure
eas build --platform all --profile production
```

---

## 🔒 ÉTAPE 3 : Sécurité Production

### 1. Secrets JWT

Générez des secrets sécurisés :
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Refresh Secret  
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. CORS Sécurisé

Le backend est configuré pour accepter :
- ✅ Toutes les URLs Expo (`expo.dev`, `exp.host`)
- ✅ URLs personnalisées dans `FRONTEND_URLS`
- ✅ Mode permissif en production pour Expo

### 3. Rate Limiting

Configuration actuelle :
- 500 requêtes/15min (général)
- 20 requêtes/15min (authentification)

---

## 📊 ÉTAPE 4 : Tests & Validation

### 1. Tests Backend

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Test auth
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Tests Frontend

```bash
# Test local avec backend production
EXPO_PUBLIC_API_URL=https://your-app.onrender.com expo start

# Build de test
eas build --platform android --profile preview
```

---

## 🚀 ÉTAPE 5 : Déploiement Final

### 1. Checklist Backend
- [ ] Backend déployé sur Render
- [ ] URL notée et fonctionnelle
- [ ] Variables d'environnement configurées
- [ ] Tests API passent
- [ ] CORS fonctionne

### 2. Checklist Frontend
- [ ] `EXPO_PUBLIC_API_URL` configurée
- [ ] `eas.json` configuré correctement
- [ ] Build EAS réussie
- [ ] App testée avec backend production
- [ ] Stores submission (optionnel)

---

## 🔧 Configuration Actuelle

### Backend (Render)
```javascript
// CORS configuré pour Expo
const allowedOrigins = [
  'https://expo.dev',
  'https://exp.host', 
  'https://snack.expo.io',
  'exp://localhost:8081',
  // + URLs personnalisées
];

// Server binding
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 TeamUp API démarré sur Render!');
});
```

### Frontend (Expo)
```javascript
// Configuration API centralisée
export const API_BASE_URL = (() => {
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';
  }
  return process.env.EXPO_PUBLIC_API_URL || 'https://your-app.onrender.com';
})();
```

---

## 🐛 Dépannage Production

### Erreurs Courantes

1. **CORS Error**
   - Vérifiez `FRONTEND_URLS` dans Render
   - Le backend accepte toutes les URLs Expo en production

2. **Network Timeout**
   - Render peut avoir des délais de démarrage
   - Configurez des timeouts plus longs côté client

3. **Environment Variables**
   - Utilisez `EXPO_PUBLIC_*` pour les variables exposées
   - Vérifiez les variables dans l'interface Render

### Monitoring

```bash
# Logs Render
# Consultez l'onglet "Logs" dans l'interface Render

# Logs EAS
eas build:list
eas build:view [build-id]
```

---

## 🎯 Résultat Final

Après déploiement complet, vous aurez :

✅ **Backend Production** : `https://your-app.onrender.com`
✅ **API Endpoints** : Tous fonctionnels avec HTTPS
✅ **Frontend Mobile** : Application native via EAS Build
✅ **Base de Données** : MongoDB Atlas sécurisée
✅ **CORS** : Configuré pour Expo EAS
✅ **SSL/HTTPS** : Fourni automatiquement par Render
✅ **Monitoring** : Logs disponibles sur les deux plateformes

---

## 📞 Support

### Documentation
- [Render Docs](https://render.com/docs)
- [Expo EAS Docs](https://docs.expo.dev/build/introduction/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

### URLs Importantes
- **Backend** : Voir l'interface Render
- **Frontend** : Voir l'interface Expo EAS
- **Database** : MongoDB Atlas Console

🎉 **Votre application TeamUp est maintenant en production !** 