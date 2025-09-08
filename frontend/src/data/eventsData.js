// Sample events data for the app
export const eventsData = {
  1: {
    id: 1,
    title: 'Session Football',
    sport: 'Football',
    date: '2025-01-31',
    time: '18:00',
    duration: '2h',
    location: {
      address: 'Stade Municipal',
      city: 'Paris 15ème',
      fullAddress: 'Stade Municipal, Paris 15ème'
    },
    coordinates: {
      latitude: 48.8426,
      longitude: 2.2964,
    },
    participants: 8,
    maxParticipants: 11,
    level: 'Intermédiaire',
    isFree: true,
    status: 'active',
    description: 'Match de football amical dans une ambiance détendue. Tous les niveaux sont les bienvenus pour passer un bon moment ensemble ! Nous fournirons les ballons et les chasubles.',
    organizer: {
      id: 'alex_martin',
      name: 'Alex Martin',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      eventsCount: 23
    },
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    participantsList: [
      {
        id: 'sophie_l',
        name: 'Sophie L.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 'marc_d',
        name: 'Marc D.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 'julie_r',
        name: 'Julie R.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 'tom_b',
        name: 'Tom B.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      }
    ]
  },
  2: {
    id: 2,
    title: 'Tournoi Basketball',
    sport: 'Basketball',
    date: '2025-01-15',
    time: '19:30',
    duration: '3h',
    location: {
      address: 'Gymnase Jean Jaurès',
      city: 'Paris 12ème',
      fullAddress: 'Gymnase Jean Jaurès, Paris 12ème'
    },
    coordinates: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
    participants: 12,
    maxParticipants: 16,
    level: 'Avancé',
    isFree: false,
    price: { amount: '€15', isFree: false },
    status: 'active',
    description: 'Tournoi de basketball streetball dans un gymnase couvert. Inscription obligatoire, niveau avancé requis. Récompenses pour les 3 premières équipes !',
    organizer: {
      id: 'sophie_laurent',
      name: 'Sophie Laurent',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      eventsCount: 18
    },
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    participantsList: [
      {
        id: 'kevin_m',
        name: 'Kevin M.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 'laura_p',
        name: 'Laura P.',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 'david_r',
        name: 'David R.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 'marie_t',
        name: 'Marie T.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      }
    ]
  },
  3: {
    id: 3,
    title: 'Session Tennis',
    sport: 'Tennis',
    date: '2025-01-25',
    time: '14:00',
    duration: '2h',
    location: {
      address: 'Courts de Tennis Municipal',
      city: 'Paris 16ème',
      fullAddress: 'Courts de Tennis Municipal, Paris 16ème'
    },
    coordinates: {
      latitude: 48.8647,
      longitude: 2.2736,
    },
    participants: 6,
    maxParticipants: 8,
    level: 'Débutant',
    isFree: true,
    status: 'active',
    description: 'Session de tennis en double pour débutants. Raquettes disponibles sur place. Ambiance conviviale et apprentissage dans la bonne humeur !',
    organizer: {
      id: 'pierre_martin',
      name: 'Pierre Martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.7,
      eventsCount: 15
    },
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    participantsList: [
      {
        id: 'emma_l',
        name: 'Emma L.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 'lucas_b',
        name: 'Lucas B.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 'clara_m',
        name: 'Clara M.',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      }
    ]
  }
};

export const getAllEvents = () => {
  return Object.values(eventsData);
};

export const getEventById = (eventId) => {
  return eventsData[eventId] || null;
};

export const getEventsByOrganizer = (organizerId) => {
  return Object.values(eventsData).filter(event => (event.organizer._id || event.organizer.id) === organizerId);
};

export const getEventsBySport = (sport) => {
  return Object.values(eventsData).filter(event => 
    event.sport.toLowerCase() === sport.toLowerCase()
  );
};


