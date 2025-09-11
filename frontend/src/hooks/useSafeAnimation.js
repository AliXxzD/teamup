import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Hook personnalisé pour gérer les animations de manière sécurisée
 * Évite les conflits avec React 18 et les avertissements Reanimated
 */
export const useSafeAnimation = () => {
  const animationFrameRef = useRef(null);

  const startAnimation = (animation, callback) => {
    // Annuler toute animation en cours
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Utiliser requestAnimationFrame pour s'assurer que l'animation s'exécute après le rendu
    animationFrameRef.current = requestAnimationFrame(() => {
      if (callback) {
        animation.start(callback);
      } else {
        animation.start();
      }
    });
  };

  const startParallelAnimations = (animations, callback) => {
    // Annuler toute animation en cours
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Utiliser requestAnimationFrame pour s'assurer que les animations s'exécutent après le rendu
    animationFrameRef.current = requestAnimationFrame(() => {
      if (callback) {
        Animated.parallel(animations).start(callback);
      } else {
        Animated.parallel(animations).start();
      }
    });
  };

  const startSequenceAnimations = (animations, callback) => {
    // Annuler toute animation en cours
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Utiliser requestAnimationFrame pour s'assurer que les animations s'exécutent après le rendu
    animationFrameRef.current = requestAnimationFrame(() => {
      if (callback) {
        Animated.sequence(animations).start(callback);
      } else {
        Animated.sequence(animations).start();
      }
    });
  };

  // Nettoyer les animations au démontage
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    startAnimation,
    startParallelAnimations,
    startSequenceAnimations,
  };
};
