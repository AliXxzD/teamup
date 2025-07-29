# 🚀 Déploiement TeamUp Backend sur Render

## 📋 Prérequis

- Compte Render (render.com)
- Code backend TeamUp
- Base de données MongoDB Atlas configurée
- Variables d'environnement prêtes

## 🔧 Étapes de Déploiement

### 1. Créer un nouveau Web Service sur Render

1. Connectez-vous à [render.com](https://render.com)
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre repository GitHub
4. Sélectionnez le dossier `backend`

### 2. Configuration du Service

**Build & Deploy Settings:**
```
Build Command: npm install
Start Command: npm start
```

**Environment:**
- **Node Version:** 18.x ou plus récent
- **Region:** Choisissez la région la plus proche de vos utilisateurs

### 3. Variables d'Environnement

Ajoutez ces variables dans l'onglet "Environment" de Render :

```env
MONGODB_URI=mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup
JWT_SECRET=teamup_secret_key_production_2024_change_this_in_real_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=teamup_refresh_secret_production_2024_change_this_too
REFRESH_TOKEN_EXPIRES_IN=7d
SESSION_SECRET=teamup_session_secret_change_in_production
NODE_ENV=production
EMAIL_USER=nassimblm12@gmail.com
EMAIL_PASSWORD=wnivttwzatexdyje
FRONTEND_URL=https://your-expo-app-url.expo.dev
FRONTEND_URLS=https://expo.dev,https://exp.host,https://snack.expo.io,exp://localhost:8081
```

⚠️ **Important:** Remplacez `FRONTEND_URL` par l'URL de votre app Expo EAS une fois déployée.

### 4. Déploiement

1. Cliquez sur "Create Web Service"
2. Render va automatiquement :
   - Cloner votre repo
   - Installer les dépendances (`npm install`)
   - Démarrer l'application (`npm start`)

### 5. Vérification

Une fois déployé, votre API sera accessible à :
```
https://your-app-name.onrender.com
```

Testez les endpoints :
- `GET /` - Page d'accueil de l'API
- `GET /api/health` - Vérification de santé
- `POST /api/auth/login` - Test d'authentification

## 🔗 Configuration Frontend Expo

Dans votre app Expo, mettez à jour l'URL de base de l'API :

```javascript
// apiUtils.js ou config
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.205:5000'  // Développement local
  : 'https://your-app-name.onrender.com';  // Production Render
```

## 🔒 Sécurité Production

### Variables d'environnement à changer :

1. **JWT_SECRET** - Générez une clé sécurisée :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **JWT_REFRESH_SECRET** - Générez une autre clé :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

3. **SESSION_SECRET** - Générez une clé pour les sessions :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📱 CORS pour Expo EAS

Le backend est configuré pour accepter :
- ✅ Toutes les URLs `expo.dev`
- ✅ Toutes les URLs `exp.host`
- ✅ URLs Expo Go locales
- ✅ URLs personnalisées dans `FRONTEND_URLS`

## 🐛 Dépannage

### Logs Render
Consultez les logs dans l'onglet "Logs" de votre service Render.

### Erreurs courantes

1. **Port déjà utilisé** - Render gère automatiquement le port
2. **CORS errors** - Vérifiez `FRONTEND_URLS` dans les variables d'env
3. **Database connection** - Vérifiez `MONGODB_URI`

### Test de connexion
```bash
curl https://your-app-name.onrender.com/api/health
```

## 🚀 Mise à jour

Pour mettre à jour l'application :
1. Pushez vos changements sur GitHub
2. Render redéploiera automatiquement
3. Surveillez les logs pour vérifier le déploiement

## 📊 Monitoring

Render fournit :
- ✅ Métriques de performance
- ✅ Logs en temps réel
- ✅ Alertes de santé
- ✅ Auto-scaling (plans payants)

---

🎯 **Votre API TeamUp est maintenant prête pour la production sur Render !** 