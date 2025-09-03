import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const CustomAlertTailwind = ({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  showCancel = false,
  icon = null,
}) => {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [opacityAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const typeConfig = {
    success: {
      icon: icon || 'checkmark-circle',
      iconColor: '#10B981',
      gradient: ['#10B981', '#059669']
    },
    error: {
      icon: icon || 'close-circle',
      iconColor: '#EF4444',
      gradient: ['#EF4444', '#DC2626']
    },
    warning: {
      icon: icon || 'warning',
      iconColor: '#F59E0B',
      gradient: ['#F59E0B', '#D97706']
    },
    info: {
      icon: icon || 'information-circle',
      iconColor: '#20B2AA',
      gradient: ['#20B2AA', '#1a9b94']
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        className="flex-1 items-center justify-center bg-black/50 px-5"
        style={{ opacity: opacityAnim }}
      >
        <Animated.View
          className="bg-dark-800 rounded-3xl w-full max-w-sm overflow-hidden"
          style={{
            transform: [{ scale: scaleAnim }]
          }}
        >
          {/* Header avec gradient */}
          <LinearGradient
            colors={config.gradient}
            className="px-6 py-6 items-center"
          >
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-4">
              <Ionicons name={config.icon} size={32} color="#ffffff" />
            </View>
            <Text className="text-white text-xl font-bold text-center">
              {title}
            </Text>
          </LinearGradient>

          {/* Content */}
          <View className="px-6 py-6">
            <Text className="text-dark-200 text-base leading-6 text-center mb-6">
              {message}
            </Text>

            {/* Buttons */}
            <View className={`flex-row ${showCancel ? 'justify-between' : 'justify-center'}`}>
              {showCancel && (
                <TouchableOpacity
                  className="flex-1 bg-dark-700 py-3 px-4 rounded-xl mr-3"
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text className="text-dark-300 text-base font-semibold text-center">
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                className={`${showCancel ? 'flex-1' : 'w-full'} py-3 px-4 rounded-xl`}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={config.gradient}
                  className="absolute inset-0 rounded-xl"
                />
                <Text className="text-white text-base font-semibold text-center">
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CustomAlertTailwind;
