# 🔧 VARIABLES D'ENVIRONNEMENT POUR RENDER

## 📋 Instructions d'installation

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service TeamUp
3. Cliquez sur "Environment" dans le menu
4. Supprimez toutes les variables existantes
5. Ajoutez les variables ci-dessous une par une
6. Redéployez votre service

## 🚨 Variables OBLIGATOIRES

```
MONGODB_URI=mongodb+srv://root:root@teamup.7fqehdy.mongodb.net/teamup?retryWrites=true&w=majority&appName=teamup
```

```
JWT_SECRET=teamup_secret_key_production_2024_change_this_in_real_production
```

```
JWT_EXPIRES_IN=24h
```

```
JWT_REFRESH_SECRET=teamup_refresh_secret_production_2024_change_this_too
```

```
REFRESH_TOKEN_EXPIRES_IN=7d
```

```
SESSION_SECRET=teamup_session_secret_change_in_production
```

```
NODE_ENV=production
```

```
PORT=10000
```

## 🌐 Variables CORS pour Expo

```
FRONTEND_URL=https://your-expo-app-url.expo.dev
```

```
FRONTEND_URLS=https://expo.dev,https://exp.host,https://snack.expo.io,exp://localhost:8081,https://your-expo-app-url.expo.dev
```

## 📧 Variables Email

```
EMAIL_USER=nassimblm12@gmail.com
```

```
EMAIL_PASSWORD=hepx tyzl phrz cvyj
```

## ⚙️ Variables de Configuration Supplémentaires

```
HELMET_CSP_ENABLED=true
```

```
RATE_LIMIT_WINDOW_MS=900000
```

```
RATE_LIMIT_MAX_REQUESTS=100
```

```
AUTH_RATE_LIMIT_MAX_REQUESTS=10
```

```
MONGODB_MAX_POOL_SIZE=10
```

```
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
```

```
MONGODB_SOCKET_TIMEOUT_MS=45000
```

```
LOG_LEVEL=info
```

```
ENABLE_REQUEST_LOGGING=true
```

```
CORS_ORIGINS=https://expo.dev,https://exp.host,https://snack.expo.io,exp://localhost:8081,https://your-expo-app-url.expo.dev
```

```
CORS_CREDENTIALS=true
```

```
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
```

```
CORS_HEADERS=Content-Type,Authorization,X-Requested-With
```

```
SOCKET_PING_TIMEOUT=60000
```

```
SOCKET_PING_INTERVAL=25000
```

```
SOCKET_TRANSPORTS=websocket,polling
```

```
TRUST_PROXY=true
```

```
SECURE_COOKIES=true
```

## ✅ Vérification après installation

1. Redéployez votre service
2. Vérifiez les logs pour s'assurer qu'il démarre correctement
3. Testez l'endpoint: https://teamup-oa5q.onrender.com/api/health
4. L'APK devrait maintenant se connecter correctement

## 🚨 Points importants

- NODE_ENV doit être "production" (pas "development")
- PORT doit être "10000" (Render le gère automatiquement)
- Toutes les URLs CORS doivent inclure les domaines Expo
- Les variables JWT doivent être identiques à celles du frontend
