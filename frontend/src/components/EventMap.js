import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import locationService from '../services/locationService';
import { extractCoordinates, hasValidCoordinates, createRegionFromEvents, toMapCoordinates } from '../utils/coordinatesUtils';

const { width, height } = Dimensions.get('window');

const EventMap = ({
  events = [],
  onEventPress,
  showUserLocation = true,
  showRadius = true,
  radius = 10000, // 10km par défaut
  initialRegion = null,
  style = {},
  mapType = 'standard'
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState(initialRegion);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      setIsLoading(true);

      if (showUserLocation) {
        const location = await locationService.getLocationSafe();
        if (location) {
          setUserLocation(location);
          
          if (!initialRegion) {
            setRegion({
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05, // ~5km
              longitudeDelta: 0.05,
            });
          }
        }
      }

      // Si pas de région définie et pas de localisation utilisateur, centrer sur les événements
      if (!region && !userLocation && events.length > 0) {
        const eventsRegion = createRegionFromEvents(events);
        if (eventsRegion) {
          setRegion(eventsRegion);
        }
      }

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const centerOnUser = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location && mapRef.current) {
        const newRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        
        mapRef.current.animateToRegion(newRegion, 1000);
        setUserLocation(location);
      }
    } catch (error) {
      Alert.alert(
        'Erreur de localisation',
        'Impossible d\'obtenir votre position actuelle.',
        [{ text: 'OK' }]
      );
    }
  };

  const centerOnEvents = () => {
    const validEvents = events.filter(hasValidCoordinates);
    
    if (validEvents.length === 0) {
      Alert.alert('Aucun événement', 'Aucun événement avec localisation trouvé.');
      return;
    }

    if (mapRef.current) {
      const coordinates = validEvents.map(toMapCoordinates).filter(Boolean);

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
          },
          animated: true,
        });
      }
    }
  };

  const getSportIcon = (sport) => {
    const sportIcons = {
      'Football': 'football',
      'Basketball': 'basketball',
      'Tennis': 'tennisball',
      'Running': 'walk',
      'Yoga': 'body',
      'Natation': 'water',
      'Volleyball': 'american-football',
      'Badminton': 'tennisball',
      'Cyclisme': 'bicycle',
      'Fitness': 'fitness',
      'Rugby': 'american-football',
      'Handball': 'basketball'
    };
    return sportIcons[sport] || 'location';
  };

  const getSportColor = (sport) => {
    const sportColors = {
      'Football': '#22c55e',
      'Basketball': '#f97316',
      'Tennis': '#eab308',
      'Running': '#3b82f6',
      'Yoga': '#8b5cf6',
      'Natation': '#06b6d4',
      'Volleyball': '#ef4444',
      'Badminton': '#84cc16',
      'Cyclisme': '#10b981',
      'Fitness': '#f59e0b',
      'Rugby': '#dc2626',
      'Handball': '#9333ea'
    };
    return sportColors[sport] || '#6b7280';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style, styles.loadingContainer]}>
        <Ionicons name="map" size={48} color="#6b7280" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Ionicons name="location-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Impossible de charger la carte</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeMap}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        mapType={mapType}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={setRegion}
      >
        {/* Cercle de rayon autour de l'utilisateur */}
        {showRadius && userLocation && (
          <Circle
            center={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            radius={radius}
            strokeColor="rgba(59, 130, 246, 0.5)"
            fillColor="rgba(59, 130, 246, 0.1)"
            strokeWidth={2}
          />
        )}

        {/* Marqueurs pour les événements */}
        {events.map((event, index) => {
          const coordinates = toMapCoordinates(event);
          if (!coordinates) {
            return null;
          }

          return (
            <Marker
              key={event._id || index}
              coordinate={coordinates}
              title={event.title}
              description={`${event.sport} - ${event.level}`}
              onPress={() => onEventPress && onEventPress(event)}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: getSportColor(event.sport) }
              ]}>
                <Ionicons
                  name={getSportIcon(event.sport)}
                  size={20}
                  color="white"
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Boutons de contrôle */}
      <View style={styles.controlsContainer}>
        {showUserLocation && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnUser}
          >
            <Ionicons name="locate" size={24} color="#3b82f6" />
          </TouchableOpacity>
        )}
        
        {events.length > 0 && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnEvents}
          >
            <Ionicons name="apps" size={24} color="#3b82f6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Légende */}
      {events.length > 0 && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendText}>
            {events.length} événement{events.length > 1 ? 's' : ''} trouvé{events.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'column',
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default EventMap;
