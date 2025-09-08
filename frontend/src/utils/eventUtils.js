/**
 * Utilitaires pour gérer les données d'événements de manière sécurisée
 */

/**
 * Extrait l'adresse d'un événement de manière sécurisée
 */
export function getEventAddress(event) {
  if (!event || !event.location) {
    return 'Adresse non disponible';
  }
  
  if (typeof event.location === 'string') {
    return event.location;
  }
  
  if (typeof event.location === 'object' && event.location !== null) {
    // Priorité : fullAddress > address + city > address seul
    if (event.location.fullAddress) {
      return String(event.location.fullAddress);
    }
    
    if (event.location.address) {
      if (event.location.city) {
        return `${String(event.location.address)}, ${String(event.location.city)}`;
      }
      return String(event.location.address);
    }
    
    if (event.location.city) {
      return String(event.location.city);
    }
  }
  
  return 'Adresse non disponible';
}

/**
 * Extrait le titre d'un événement de manière sécurisée
 */
export function getEventTitle(event) {
  if (!event || !event.title) {
    return 'Événement';
  }
  return String(event.title);
}

/**
 * Extrait la description d'un événement de manière sécurisée
 */
export function getEventDescription(event) {
  if (!event || !event.description) {
    return 'Description non disponible';
  }
  return String(event.description);
}

/**
 * Extrait le nom de l'organisateur de manière sécurisée
 */
export function getOrganizerName(event) {
  if (!event || !event.organizer) {
    return 'Organisateur';
  }
  
  if (typeof event.organizer === 'string') {
    return event.organizer;
  }
  
  if (typeof event.organizer === 'object' && event.organizer !== null) {
    return String(event.organizer.name || 'Organisateur');
  }
  
  return 'Organisateur';
}

/**
 * Extrait le prix d'un événement de manière sécurisée
 */
export function getEventPrice(event) {
  if (!event) {
    return { isFree: true, amount: 0, display: 'Gratuit' };
  }
  
  // Si isFree est défini directement sur l'événement
  if (event.isFree === true) {
    return { isFree: true, amount: 0, display: 'Gratuit' };
  }
  
  // Si isFree est défini directement sur l'événement
  if (event.isFree === false && event.price) {
    const amount = Number(event.price.amount || event.price || 0);
    return { 
      isFree: false, 
      amount, 
      display: `€${amount}` 
    };
  }
  
  // Si price est un objet
  if (event.price && typeof event.price === 'object') {
    if (event.price.isFree === true) {
      return { isFree: true, amount: 0, display: 'Gratuit' };
    }
    
    const amount = Number(event.price.amount || 0);
    return { 
      isFree: false, 
      amount, 
      display: amount > 0 ? `€${amount}` : 'Gratuit' 
    };
  }
  
  // Si price est un nombre
  if (typeof event.price === 'number') {
    return { 
      isFree: event.price === 0, 
      amount: event.price, 
      display: event.price === 0 ? 'Gratuit' : `€${event.price}` 
    };
  }
  
  // Par défaut
  return { isFree: true, amount: 0, display: 'Gratuit' };
}

/**
 * Extrait les participants d'un événement de manière sécurisée
 */
export function getEventParticipants(event) {
  if (!event) {
    return { current: 0, max: 0, display: '0/0' };
  }
  
  const current = Number(event.participants || event.currentParticipants || 0);
  const max = Number(event.maxParticipants || 0);
  
  return {
    current,
    max,
    display: `${current}/${max}`,
    isFull: current >= max
  };
}

/**
 * Extrait l'heure d'un événement de manière sécurisée
 */
export function getEventTime(event) {
  if (!event || !event.time) {
    return '18:00';
  }
  return String(event.time);
}

/**
 * Extrait le sport d'un événement de manière sécurisée
 */
export function getEventSport(event) {
  if (!event || !event.sport) {
    return 'Sport';
  }
  return String(event.sport);
}

/**
 * Extrait le niveau d'un événement de manière sécurisée
 */
export function getEventLevel(event) {
  if (!event || !event.level) {
    return 'Tous niveaux';
  }
  return String(event.level);
}

/**
 * Valide qu'un événement a toutes les données requises
 */
export function isValidEvent(event) {
  return event && 
         event.title && 
         event.sport && 
         (event.location || event.address);
}

/**
 * Nettoie les données d'un événement pour l'affichage
 */
export function sanitizeEvent(event) {
  if (!event) return null;
  
  return {
    ...event,
    title: getEventTitle(event),
    description: getEventDescription(event),
    address: getEventAddress(event),
    sport: getEventSport(event),
    level: getEventLevel(event),
    time: getEventTime(event),
    price: getEventPrice(event),
    participants: getEventParticipants(event),
    organizer: {
      ...event.organizer,
      name: getOrganizerName(event)
    }
  };
}

export default {
  getEventAddress,
  getEventTitle,
  getEventDescription,
  getOrganizerName,
  getEventPrice,
  getEventParticipants,
  getEventTime,
  getEventSport,
  getEventLevel,
  isValidEvent,
  sanitizeEvent
};

