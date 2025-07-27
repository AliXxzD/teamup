# 🔧 Guide de résolution des problèmes - Erreurs Profile

## Problème: "TypeError: Network request failed" dans fetchProfile

### 🔍 Diagnostic rapide

1. **Vérifiez que le serveur backend est démarré:**
   ```bash
   cd backend
   npm start
   # ou
   npm run dev
   ```

2. **Vérifiez l'URL de l'API dans le frontend:**
   - Ouvrez `frontend/src/contexts/AuthContext.js`
   - Vérifiez que `API_BASE_URL` pointe vers la bonne adresse
   - Par défaut: `http://192.168.1.205:5000`

3. **Testez la connectivité réseau:**
   ```bash
   cd backend
   node test-server-status.js
   ```

### 🛠️ Solutions par type d'erreur

#### 1. **Erreur "Network request failed"**

**Causes possibles:**
- Serveur backend non démarré
- Mauvaise URL de l'API
- Problème de réseau
- Firewall/antivirus bloquant les connexions

**Solutions:**
```javascript
// Dans UserProfileScreen.js, vérifiez l'URL:
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.205:5000';
```

#### 2. **Erreur "Token non trouvé"**

**Causes possibles:**
- Utilisateur non connecté
- Token expiré
- Problème de stockage local

**Solutions:**
```javascript
// Vérifiez le token dans AsyncStorage
const token = await AsyncStorage.getItem('accessToken');
console.log('Token:', token ? 'Présent' : 'Absent');
```

#### 3. **Erreur "Timeout"**

**Causes possibles:**
- Serveur lent
- Connexion internet lente
- Problème de configuration

**Solutions:**
```javascript
// Augmentez le timeout dans fetchProfile
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes
```

### 🔧 Outils de diagnostic

#### 1. **Bouton de diagnostic (mode développement)**
- Dans `UserProfileScreen`, appuyez sur l'icône 🐛
- Vérifiez les informations affichées

#### 2. **Logs de débogage**
```javascript
// Ajoutez ces logs dans fetchProfile
console.log('🔍 Fetching profile from:', url);
console.log('📡 Profile response status:', response.status);
```

#### 3. **Test manuel des endpoints**
```bash
# Test du serveur
curl http://192.168.1.205:5000/api/auth/verify

# Test avec token (remplacez YOUR_TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://192.168.1.205:5000/api/auth/profile
```

### 📱 Configuration spécifique par plateforme

#### **Android Emulator:**
```javascript
const API_BASE_URL = 'http://10.0.2.2:5000'; // Pour Android Emulator
```

#### **iOS Simulator:**
```javascript
const API_BASE_URL = 'http://localhost:5000'; // Pour iOS Simulator
```

#### **Appareil physique:**
```javascript
const API_BASE_URL = 'http://192.168.1.205:5000'; // IP de votre machine
```

### 🔄 Vérifications à effectuer

1. **Serveur backend:**
   - ✅ Démarré sur le bon port (5000)
   - ✅ Pas d'erreurs dans les logs
   - ✅ Routes `/api/auth/profile` accessibles

2. **Frontend:**
   - ✅ URL API correcte
   - ✅ Token d'authentification présent
   - ✅ Connexion internet active

3. **Réseau:**
   - ✅ Pare-feu désactivé ou configuré
   - ✅ Antivirus ne bloque pas les connexions
   - ✅ Même réseau WiFi (appareil physique)

### 🚨 Erreurs courantes et solutions

#### **"ECONNREFUSED"**
```bash
# Solution: Démarrer le serveur
cd backend
npm start
```

#### **"ENOTFOUND"**
```javascript
// Solution: Vérifier l'URL
const API_BASE_URL = 'http://192.168.1.205:5000'; // IP correcte
```

#### **"401 Unauthorized"**
```javascript
// Solution: Vérifier le token
const token = await AsyncStorage.getItem('accessToken');
if (!token) {
  // Rediriger vers la connexion
  navigation.navigate('Login');
}
```

### 📞 Support

Si les problèmes persistent:

1. **Vérifiez les logs du serveur:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Vérifiez les logs du frontend:**
   - Ouvrez les outils de développement
   - Regardez la console pour les erreurs

3. **Testez avec un outil externe:**
   - Postman ou Insomnia
   - Testez les endpoints directement

### 🔄 Mise à jour récente

Les corrections apportées incluent:
- ✅ Correction de l'URL de l'API
- ✅ Ajout de timeouts appropriés
- ✅ Meilleure gestion des erreurs
- ✅ Outils de diagnostic intégrés
- ✅ Support pour différents environnements 