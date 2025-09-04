import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const EventManagementMenu = ({ visible, onClose, onModifyEvent, onManageParticipants }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = (action) => {
    onClose();
    setTimeout(() => {
      action();
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center">
        {/* Backdrop */}
        <TouchableOpacity
          className="absolute inset-0 bg-black/50"
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Menu Container */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="bg-dark-800 rounded-2xl p-6 mx-6 w-full max-w-sm shadow-2xl border border-dark-600/30"
        >
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mb-3">
              <Ionicons name="settings" size={24} color="#3B82F6" />
            </View>
            <Text className="text-white text-lg font-bold">Gérer l'événement</Text>
            <Text className="text-dark-300 text-sm text-center mt-1">
              Choisissez une action
            </Text>
          </View>

          {/* Options */}
          <View className="space-y-3">
            {/* Modifier l'événement */}
            <TouchableOpacity
              className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex-row items-center"
              onPress={() => handleOptionPress(onModifyEvent)}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-4">
                <Ionicons name="create" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Modifier l'événement</Text>
                <Text className="text-dark-300 text-sm">Modifier les détails de l'événement</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </TouchableOpacity>

            {/* Gérer les participants */}
            <TouchableOpacity
              className="bg-lime/10 border border-lime/20 rounded-xl p-4 flex-row items-center"
              onPress={() => handleOptionPress(onManageParticipants)}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 bg-lime/20 rounded-lg items-center justify-center mr-4">
                <Ionicons name="people" size={20} color="#84cc16" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Gérer les participants</Text>
                <Text className="text-dark-300 text-sm">Voir et gérer les participants</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            className="bg-dark-700/50 border border-dark-600/30 rounded-xl p-4 mt-4"
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text className="text-dark-300 text-base font-medium text-center">Annuler</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default EventManagementMenu;
