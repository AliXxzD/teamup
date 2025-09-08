import * as Location from 'expo-location';
import { Alert } from 'react-native';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
  }

  /**
   * Demander les permissions de localisation
   */
  async requestLocationPermissions() {
    try {
      // Vérifier si les permissions sont déjà accordées
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        return { granted: true, status: existingStatus };
      }

      // Demander les permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'TeamUp a besoin d\'accéder à votre localisation pour vous proposer des événements près de vous.',
          [{ text: 'OK' }]
        );
        return { granted: false, status };
      }

      return { granted: true, status };
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
      return { granted: false, error };
    }
  }

  /**
   * Obtenir la position actuelle
   */
  async getCurrentLocation() {
    try {
      const { granted } = await this.requestLocationPermissions();
      if (!granted) {
        throw new Error('Permission de localisation refusée');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Erreur lors de l\'obtention de la localisation:', error);
      throw error;
    }
  }

  /**
   * Surveiller les changements de position
   */
  async watchLocation(callback) {
    try {
      const { granted } = await this.requestLocationPermissions();
      if (!granted) {
        throw new Error('Permission de localisation refusée');
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // 30 secondes
          distanceInterval: 100, // 100 mètres
        },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          
          if (callback) {
            callback(this.currentLocation);
          }
        }
      );

      return this.watchId;
    } catch (error) {
      console.error('Erreur lors de la surveillance de la localisation:', error);
      throw error;
    }
  }

  /**
   * Arrêter la surveillance de la position
   */
  stopWatchingLocation() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  /**
   * Calculer la distance entre deux points (en kilomètres)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
  }

  /**
   * Convertir degrés en radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Obtenir l'adresse à partir des coordonnées (géocodage inverse)
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        return {
          formattedAddress: `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim(),
          street: address.street,
          streetNumber: address.streetNumber,
          city: address.city,
          region: address.region,
          postalCode: address.postalCode,
          country: address.country,
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
      return null;
    }
  }

  /**
   * Obtenir les coordonnées à partir d'une adresse (géocodage)
   */
  async geocode(address) {
    try {
      const locations = await Location.geocodeAsync(address);

      if (locations && locations.length > 0) {
        return locations.map(location => ({
          latitude: location.latitude,
          longitude: location.longitude,
        }));
      }

      return [];
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      return [];
    }
  }

  /**
   * Formater la distance pour l'affichage
   */
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km`;
    } else {
      return `${Math.round(distance)} km`;
    }
  }

  /**
   * Vérifier si les services de localisation sont activés
   */
  async isLocationServicesEnabled() {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Erreur lors de la vérification des services de localisation:', error);
      return false;
    }
  }

  /**
   * Obtenir la position actuelle avec gestion d'erreur simplifiée
   */
  async getLocationSafe() {
    try {
      const servicesEnabled = await this.isLocationServicesEnabled();
      if (!servicesEnabled) {
        Alert.alert(
          'Services de localisation désactivés',
          'Veuillez activer les services de localisation dans les paramètres de votre appareil.',
          [{ text: 'OK' }]
        );
        return null;
      }

      return await this.getCurrentLocation();
    } catch (error) {
      console.warn('Impossible d\'obtenir la localisation:', error.message);
      return null;
    }
  }

  /**
   * Obtenir la localisation actuelle en cache
   */
  getCachedLocation() {
    return this.currentLocation;
  }
}

// Instance singleton
const locationService = new LocationService();

export default locationService;

// Export des utilitaires
export {
  locationService as LocationService,
};


