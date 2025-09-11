# Déploiement TeamUp Backend sur Render

## Instructions de déploiement

### 1. Préparation du repository
- Assurez-vous que votre code est pushé sur GitHub
- Le backend doit être dans le dossier `backend/`

### 2. Création du service sur Render

1. **Connecter GitHub** :
   - Allez sur [render.com](https://render.com)
   - Connectez votre compte GitHub
   - Sélectionnez votre repository

2. **Créer un nouveau Web Service** :
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre repository GitHub
   - Sélectionnez le repository `teamup`

3. **Configuration du service** :
   - **Name** : `teamup-backend`
   - **Environment** : `Node`
   - **Region** : `Oregon (US West)`
   - **Branch** : `main` (ou votre branche principale)
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`

### 3. Variables d'environnement

Ajoutez ces variables dans la section "Environment Variables" :

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

### 4. Configuration avancée

- **Auto-Deploy** : Activé (déploie automatiquement à chaque push)
- **Health Check Path** : `/api/health`

### 5. Déploiement

1. Cliquez sur "Create Web Service"
2. Render va automatiquement :
   - Cloner votre repository
   - Installer les dépendances
   - Démarrer votre application
3. Votre API sera disponible à l'URL : `https://teamup-backend.onrender.com`

### 6. Vérification

Une fois déployé, testez ces endpoints :
- `GET https://teamup-backend.onrender.com/` - Page d'accueil
- `GET https://teamup-backend.onrender.com/api/health` - Health check
- `POST https://teamup-backend.onrender.com/api/auth/register` - Test d'inscription

### 7. Mise à jour de l'URL dans le frontend

Mettez à jour le fichier `frontend/eas.json` avec votre nouvelle URL Render :

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://teamup-backend.onrender.com"
      }
    }
  }
}
```

## Notes importantes

- **Plan gratuit** : Le service peut s'endormir après 15 minutes d'inactivité
- **Cold start** : Le premier appel après l'endormissement peut prendre 30-60 secondes
- **Logs** : Consultez les logs dans le dashboard Render pour le debugging
- **MongoDB** : Assurez-vous que votre cluster MongoDB Atlas accepte les connexions depuis Render

## Troubleshooting

### Erreur de connexion MongoDB
- Vérifiez que l'IP de Render est autorisée dans MongoDB Atlas
- Ou utilisez `0.0.0.0/0` pour autoriser toutes les IPs (moins sécurisé)

### Erreur CORS
- Vérifiez que `FRONTEND_URLS` contient les bonnes URLs
- Le backend est configuré pour être permissif en production

### Timeout
- Le plan gratuit a des limitations de temps
- Considérez passer au plan payant pour de meilleures performances
