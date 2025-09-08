/**
 * Service de géocodage pour convertir les adresses en coordonnées
 * Utilise plusieurs APIs de géocodage pour plus de fiabilité
 */

const axios = require('axios');

class GeocodingService {
  constructor() {
    this.cache = new Map(); // Cache simple pour éviter les requêtes répétées
  }

  /**
   * Géocode une adresse en utilisant l'API Nominatim (OpenStreetMap)
   * Gratuit et sans clé API requise
   */
  async geocodeWithNominatim(address) {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'TeamUp-App/1.0.0 (contact@teamup.app)' // Requis par Nominatim
        },
        timeout: 10000 // 10 secondes timeout
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name,
          confidence: parseFloat(result.importance || 0.5),
          source: 'nominatim'
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur Nominatim:', error.message);
      return null;
    }
  }

  /**
   * Géocode une adresse en utilisant l'API de géocodage gratuite
   */
  async geocodeWithOpenCage(address) {
    // Note: OpenCage nécessite une clé API gratuite
    // Pour l'instant, on utilise seulement Nominatim
    return null;
  }

  /**
   * Méthode principale de géocodage avec fallback
   */
  async geocode(address) {
    if (!address || typeof address !== 'string') {
      return null;
    }

    // Nettoyer l'adresse
    const cleanAddress = address.trim();
    if (cleanAddress.length < 5) {
      return null;
    }

    // Vérifier le cache
    if (this.cache.has(cleanAddress)) {
      console.log(`📋 Cache hit pour: ${cleanAddress}`);
      return this.cache.get(cleanAddress);
    }

    console.log(`🗺️ Géocodage de: ${cleanAddress}`);

    let result = null;

    // Essayer Nominatim en premier
    result = await this.geocodeWithNominatim(cleanAddress);
    
    // Si Nominatim échoue, on pourrait essayer d'autres services ici
    if (!result) {
      console.log(`❌ Géocodage échoué pour: ${cleanAddress}`);
      return null;
    }

    // Mettre en cache le résultat
    this.cache.set(cleanAddress, result);
    
    console.log(`✅ Géocodage réussi: ${cleanAddress} -> ${result.latitude}, ${result.longitude}`);
    return result;
  }

  /**
   * Géocodage inverse : coordonnées -> adresse
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'TeamUp-App/1.0.0 (contact@teamup.app)'
        },
        timeout: 10000
      });

      if (response.data) {
        return {
          formattedAddress: response.data.display_name,
          city: response.data.address?.city || response.data.address?.town || response.data.address?.village,
          country: response.data.address?.country,
          postcode: response.data.address?.postcode,
          source: 'nominatim'
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur géocodage inverse:', error.message);
      return null;
    }
  }

  /**
   * Valider des coordonnées
   */
  validateCoordinates(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  }

  /**
   * Estimer la qualité d'une adresse pour le géocodage
   */
  estimateAddressQuality(address) {
    if (!address) return 0;
    
    let score = 0;
    const addr = address.toLowerCase();
    
    // Points pour les éléments d'adresse
    if (addr.includes('rue') || addr.includes('avenue') || addr.includes('boulevard')) score += 2;
    if (addr.includes('paris') || addr.includes('lyon') || addr.includes('marseille')) score += 2;
    if (/\d+/.test(addr)) score += 1; // Contient des chiffres
    if (addr.includes('france')) score += 1;
    if (addr.length > 20) score += 1;
    
    return Math.min(score, 5); // Score max 5
  }

  /**
   * Nettoyer le cache (utile pour les tests)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Obtenir des statistiques du cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Instance singleton
const geocodingService = new GeocodingService();

module.exports = geocodingService;


