import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import locationService from './locationService';

class EventsService {
  /**
   * Rechercher des événements par proximité
   */
  async searchNearbyEvents({
    latitude,
    longitude,
    radius = 10000, // 10km par défaut
    sport = null,
    level = null,
    isFree = null,
    dateFrom = null,
    dateTo = null,
    page = 1,
    limit = 10
  }) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Construction des paramètres de requête
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
        page: page.toString(),
        limit: limit.toString()
      });

      // Ajouter les filtres optionnels
      if (sport) params.append('sport', sport);
      if (level) params.append('level', level);
      if (isFree !== null) params.append('isFree', isFree.toString());
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const url = `${API_BASE_URL}${API_ENDPOINTS.EVENTS.NEARBY}?${params}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la recherche');
      }

      const data = await response.json();
      return {
        success: true,
        events: data.data || [],
        pagination: data.pagination || {},
        searchInfo: data.searchInfo || {}
      };

    } catch (error) {
      console.error('Erreur lors de la recherche par proximité:', error);
      return {
        success: false,
        error: error.message,
        events: [],
        pagination: {},
        searchInfo: {}
      };
    }
  }

  /**
   * Rechercher des événements près de la position actuelle
   */
  async searchNearbyEventsFromCurrentLocation(filters = {}) {
    try {
      // Obtenir la position actuelle
      const location = await locationService.getLocationSafe();
      if (!location) {
        throw new Error('Impossible d\'obtenir votre localisation');
      }

      return await this.searchNearbyEvents({
        latitude: location.latitude,
        longitude: location.longitude,
        ...filters
      });

    } catch (error) {
      console.error('Erreur lors de la recherche depuis la position actuelle:', error);
      return {
        success: false,
        error: error.message,
        events: [],
        pagination: {},
        searchInfo: {}
      };
    }
  }

  /**
   * Rechercher tous les événements (méthode existante)
   */
  async searchEvents({
    sport = null,
    level = null,
    isFree = null,
    dateFrom = null,
    dateTo = null,
    page = 1,
    limit = 10
  }) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Construction des paramètres de requête
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Ajouter les filtres optionnels
      if (sport) params.append('sport', sport);
      if (level) params.append('level', level);
      if (isFree !== null) params.append('isFree', isFree.toString());
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const url = `${API_BASE_URL}${API_ENDPOINTS.EVENTS.LIST}?${params}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la recherche');
      }

      const data = await response.json();
      return {
        success: true,
        events: data.data?.events || [],
        pagination: data.data?.pagination || {}
      };

    } catch (error) {
      console.error('Erreur lors de la recherche d\'événements:', error);
      return {
        success: false,
        error: error.message,
        events: [],
        pagination: {}
      };
    }
  }

  /**
   * Créer un nouvel événement avec coordonnées
   */
  async createEvent(eventData) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Si une adresse est fournie, essayer d'obtenir les coordonnées
      let coordinates = null;
      if (eventData.location && !eventData.coordinates) {
        try {
          const locations = await locationService.geocode(eventData.location);
          if (locations.length > 0) {
            coordinates = {
              latitude: locations[0].latitude,
              longitude: locations[0].longitude
            };
          }
        } catch (geoError) {
          console.warn('Impossible de géocoder l\'adresse:', geoError);
        }
      }

      const requestData = {
        ...eventData,
        coordinates: eventData.coordinates || coordinates
      };

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.CREATE}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      const data = await response.json();
      return {
        success: true,
        event: data.data
      };

    } catch (error) {
      console.error('Erreur lors de la création d\'événement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Rejoindre un événement
   */
  async joinEvent(eventId) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.JOIN(eventId)}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message
      };

    } catch (error) {
      console.error('Erreur lors de l\'inscription à l\'événement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Quitter un événement
   */
  async leaveEvent(eventId) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.LEAVE(eventId)}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la désinscription');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message
      };

    } catch (error) {
      console.error('Erreur lors de la désinscription de l\'événement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtenir les détails d'un événement
   */
  async getEventDetails(eventId) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.DETAILS(eventId)}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération');
      }

      const data = await response.json();
      return {
        success: true,
        event: data.data
      };

    } catch (error) {
      console.error('Erreur lors de la récupération de l\'événement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculer la distance entre l'utilisateur et un événement
   */
  async calculateDistanceToEvent(event) {
    try {
      const userLocation = await locationService.getLocationSafe();
      if (!userLocation || !event.location?.coordinates) {
        return null;
      }

      const distance = locationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        event.location.coordinates.latitude,
        event.location.coordinates.longitude
      );

      return {
        distance,
        formattedDistance: locationService.formatDistance(distance)
      };

    } catch (error) {
      console.error('Erreur lors du calcul de distance:', error);
      return null;
    }
  }
}

// Instance singleton
const eventsService = new EventsService();

export default eventsService;

// Export des utilitaires
export {
  eventsService as EventsService,
};


