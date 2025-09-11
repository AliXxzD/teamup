# Instructions pour créer un APK avec EAS Build

## Prérequis

1. **Installation d'EAS CLI** :
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Connexion à Expo** :
   ```bash
   eas login
   ```

3. **Configuration du projet** :
   ```bash
   cd frontend
   eas build:configure
   ```

## Configuration EAS

Le fichier `eas.json` est déjà configuré avec :
- **Development** : Pour le développement local
- **Preview** : Pour créer un APK de test
- **Production** : Pour la production avec l'URL Render

## Création de l'APK

### 1. APK de test (Preview)
```bash
cd frontend
eas build --platform android --profile preview
```

### 2. APK de production
```bash
cd frontend
eas build --platform android --profile production
```

## Variables d'environnement

Les variables sont configurées dans `eas.json` :
- **Development** : `http://192.168.1.205:5000` (local)
- **Preview** : `http://192.168.1.205:5000` (local pour test)
- **Production** : `https://teamup-oa5q.onrender.com` (Render)

## Mise à jour de l'URL de production

Une fois votre backend déployé sur Render, mettez à jour l'URL dans `eas.json` :

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://votre-nouveau-backend.onrender.com"
      }
    }
  }
}
```

## Téléchargement de l'APK

1. Une fois le build terminé, vous recevrez un lien de téléchargement
2. Téléchargez l'APK sur votre appareil Android
3. Activez "Sources inconnues" dans les paramètres Android
4. Installez l'APK

## Commandes utiles

```bash
# Voir les builds en cours
eas build:list

# Voir les détails d'un build
eas build:view [BUILD_ID]

# Annuler un build
eas build:cancel [BUILD_ID]

# Voir les logs d'un build
eas build:logs [BUILD_ID]
```

## Configuration avancée

### Ajout de permissions Android
Si vous avez besoin de permissions supplémentaires, ajoutez-les dans `app.json` :

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### Configuration de l'icône
L'icône de l'application est définie dans `app.json` :
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "android": {
      "icon": "./assets/adaptive-icon.png"
    }
  }
}
```

## Troubleshooting

### Erreur de build
- Vérifiez que toutes les dépendances sont installées
- Assurez-vous que l'URL de l'API est accessible
- Consultez les logs avec `eas build:logs`

### Erreur d'installation APK
- Vérifiez que "Sources inconnues" est activé
- Redémarrez l'appareil si nécessaire
- Vérifiez que l'APK n'est pas corrompu

### Problème de connexion API
- Testez l'URL de l'API dans un navigateur
- Vérifiez les logs du backend sur Render
- Assurez-vous que CORS est configuré correctement
