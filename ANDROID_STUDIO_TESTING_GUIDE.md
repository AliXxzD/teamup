# Guide de Test APK avec Android Studio

## 🎯 Objectif
Tester votre APK TeamUp avec Android Studio en utilisant le backend hébergé sur Render.

## 📋 Prérequis
- ✅ Backend déployé sur Render : `https://teamup-oa5q.onrender.com`
- ✅ APK généré avec EAS Build
- ✅ Android Studio installé
- ✅ Émulateur Android ou appareil physique

## 🚀 Étape 1 : Récupération de l'APK

### 1.1 Vérifier le statut du build
```bash
cd frontend
eas build:list
```

### 1.2 Télécharger l'APK
- Allez sur [expo.dev](https://expo.dev)
- Connectez-vous à votre compte
- Allez dans votre projet TeamUp
- Section "Builds" → Téléchargez l'APK de production

## 📱 Étape 2 : Configuration Android Studio

### 2.1 Ouvrir Android Studio
1. Lancez Android Studio
2. Créez un nouveau projet ou ouvrez un projet existant

### 2.2 Configurer l'émulateur
1. **Tools** → **AVD Manager**
2. **Create Virtual Device**
3. Choisir un appareil (ex: Pixel 6)
4. Télécharger une image système (ex: API 33)
5. **Finish** → **Start**

### 2.3 Alternative : Appareil physique
1. Activez le **Mode développeur** sur votre Android
2. Activez le **Débogage USB**
3. Connectez via USB

## 🔧 Étape 3 : Installation de l'APK

### 3.1 Via Android Studio
1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Ou glissez-déposez l'APK dans l'émulateur

### 3.2 Via ADB (recommandé)
```bash
# Installer l'APK
adb install path/to/teamup.apk

# Vérifier l'installation
adb shell pm list packages | grep teamup
```

### 3.3 Via l'émulateur
1. Glissez l'APK dans l'émulateur
2. Activez "Sources inconnues" si demandé
3. Installez l'APK

## 🧪 Étape 4 : Tests fonctionnels

### 4.1 Test de connexion
1. **Ouvrir l'application**
2. **Vérifier l'écran de connexion**
3. **Tester l'inscription** avec un nouvel utilisateur
4. **Tester la connexion** avec l'utilisateur créé

### 4.2 Test des fonctionnalités principales
- ✅ **Inscription/Connexion** : Créer un compte et se connecter
- ✅ **Événements** : Voir la liste des événements
- ✅ **Création d'événement** : Créer un nouvel événement
- ✅ **Rejoindre un événement** : Participer à un événement
- ✅ **Messagerie** : Envoyer/recevoir des messages
- ✅ **Profil** : Modifier les informations du profil

### 4.3 Test de la géolocalisation
1. **Autoriser la localisation** quand demandé
2. **Vérifier les événements à proximité**
3. **Tester la création d'événement avec localisation**

## 🔍 Étape 5 : Debugging avec Android Studio

### 5.1 Logs de l'application
```bash
# Voir les logs en temps réel
adb logcat | grep -i teamup

# Logs spécifiques à l'app
adb logcat | grep -i "expo\|react"
```

### 5.2 Debugging réseau
1. **Ouvrir Android Studio**
2. **View** → **Tool Windows** → **Logcat**
3. Filtrer par "TeamUp" ou "Expo"
4. Surveiller les erreurs de connexion API

### 5.3 Test de connectivité
```bash
# Tester la connexion au backend
adb shell ping teamup-oa5q.onrender.com

# Tester l'API directement
adb shell curl https://teamup-oa5q.onrender.com/api/health
```

## 🐛 Troubleshooting

### Problème d'installation
- **Erreur "App not installed"** : Vérifiez l'architecture (ARM64/x86)
- **Erreur "Unknown sources"** : Activez l'installation depuis sources inconnues
- **Erreur de signature** : Désinstallez l'ancienne version si elle existe

### Problème de connexion API
- **Vérifiez la connectivité** : `adb shell ping teamup-oa5q.onrender.com`
- **Vérifiez les logs** : Recherchez les erreurs CORS ou de réseau
- **Testez l'API** : Ouvrez `https://teamup-oa5q.onrender.com/api/health` dans un navigateur

### Problème de géolocalisation
- **Autorisez la localisation** dans les paramètres de l'émulateur
- **Vérifiez les permissions** dans les paramètres de l'app
- **Testez avec un appareil physique** si l'émulateur ne fonctionne pas

## 📊 Monitoring des performances

### 5.1 Métriques importantes
- **Temps de démarrage** : < 3 secondes
- **Temps de chargement des événements** : < 2 secondes
- **Temps de réponse de l'API** : < 1 seconde
- **Utilisation mémoire** : < 100MB

### 5.2 Outils de monitoring
- **Android Studio Profiler** : Performance et mémoire
- **Logcat** : Logs et erreurs
- **Network Inspector** : Requêtes réseau

## 🎯 Checklist de test

### Tests obligatoires
- [ ] L'application se lance sans crash
- [ ] L'inscription fonctionne
- [ ] La connexion fonctionne
- [ ] Les événements se chargent
- [ ] La création d'événement fonctionne
- [ ] La géolocalisation fonctionne
- [ ] La messagerie fonctionne
- [ ] Le profil utilisateur fonctionne

### Tests de performance
- [ ] Temps de démarrage acceptable
- [ ] Pas de fuites mémoire
- [ ] Interface fluide
- [ ] Connexion réseau stable

## 🚀 Prochaines étapes

Une fois les tests réussis :
1. **Optimiser les performances** si nécessaire
2. **Corriger les bugs** identifiés
3. **Préparer la distribution** (Google Play Store)
4. **Mettre en place le monitoring** en production

---

**Note** : Ce guide utilise votre backend Render hébergé, donc tous les tests se feront avec de vraies données en production.

