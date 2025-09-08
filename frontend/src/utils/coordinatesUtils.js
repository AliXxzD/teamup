/**
 * Utilitaires pour gérer les coordonnées dans différents formats
 */

/**
 * Extrait les coordonnées latitude/longitude d'un événement
 * Supporte les anciens et nouveaux formats
 */
export function extractCoordinates(event) {
  if (!event || !event.location) {
    return null;
  }

  const coords = event.location.coordinates;
  
  if (!coords) {
    return null;
  }

  // Nouveau format GeoJSON: { type: "Point", coordinates: [lng, lat] }
  if (coords.type === 'Point' && Array.isArray(coords.coordinates) && coords.coordinates.length === 2) {
    const [longitude, latitude] = coords.coordinates;
    if (typeof longitude === 'number' && typeof latitude === 'number') {
      return {
        latitude,
        longitude
      };
    }
  }

  // Ancien format: { latitude: number, longitude: number }
  if (typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
  }

  return null;
}

/**
 * Vérifie si un événement a des coordonnées valides
 */
export function hasValidCoordinates(event) {
  const coords = extractCoordinates(event);
  return coords !== null;
}

/**
 * Formate des coordonnées pour l'affichage
 */
export function formatCoordinates(coords, precision = 4) {
  if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
    return 'Coordonnées non disponibles';
  }

  return `${coords.latitude.toFixed(precision)}, ${coords.longitude.toFixed(precision)}`;
}

/**
 * Convertit des coordonnées au format requis par react-native-maps
 */
export function toMapCoordinates(event) {
  const coords = extractCoordinates(event);
  if (!coords) {
    return null;
  }

  return {
    latitude: coords.latitude,
    longitude: coords.longitude
  };
}

/**
 * Calcule la distance entre deux points (en kilomètres)
 * Utilise la formule de Haversine
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
}

/**
 * Convertit des degrés en radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Formate une distance pour l'affichage
 */
export function formatDistance(distance) {
  if (typeof distance !== 'number' || distance < 0) {
    return 'Distance inconnue';
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} km`;
  } else {
    return `${Math.round(distance)} km`;
  }
}

/**
 * Valide des coordonnées
 */
export function validateCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  return !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
}

/**
 * Crée un objet région pour MapView à partir d'événements
 */
export function createRegionFromEvents(events, defaultRegion = null) {
  const eventsWithCoords = events.filter(hasValidCoordinates);
  
  if (eventsWithCoords.length === 0) {
    return defaultRegion || {
      latitude: 48.8566, // Paris par défaut
      longitude: 2.3522,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }

  if (eventsWithCoords.length === 1) {
    const coords = extractCoordinates(eventsWithCoords[0]);
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  // Calculer les limites
  const coordinates = eventsWithCoords.map(extractCoordinates);
  const latitudes = coordinates.map(c => c.latitude);
  const longitudes = coordinates.map(c => c.longitude);
  
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + 0.01, 0.01),
    longitudeDelta: Math.max(maxLng - minLng + 0.01, 0.01),
  };
}

export default {
  extractCoordinates,
  hasValidCoordinates,
  formatCoordinates,
  toMapCoordinates,
  calculateDistance,
  formatDistance,
  validateCoordinates,
  createRegionFromEvents
};


