import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  buttons = [], 
  onBackdropPress,
  showIcon = true 
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: colors.success };
      case 'error':
        return { name: 'alert-circle', color: colors.danger };
      case 'warning':
        return { name: 'warning', color: colors.warning };
      default:
        return { name: 'information-circle', color: colors.info };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              {showIcon && (
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={iconConfig.name} 
                    size={48} 
                    color={iconConfig.color} 
                  />
                </View>
              )}
              
              {title && (
                <Text style={styles.title}>{title}</Text>
              )}
              
              {message && (
                <Text style={styles.message}>{message}</Text>
              )}
              
              {buttons.length > 0 && (
                <View style={styles.buttonsContainer}>
                  {buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        button.style === 'cancel' && styles.cancelButton,
                        button.style === 'destructive' && styles.destructiveButton,
                        buttons.length === 1 && styles.singleButton,
                        index === 0 && buttons.length > 1 && styles.firstButton,
                        index === buttons.length - 1 && buttons.length > 1 && styles.lastButton,
                      ]}
                      onPress={button.onPress}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.buttonText,
                        button.style === 'cancel' && styles.cancelButtonText,
                        button.style === 'destructive' && styles.destructiveButtonText,
                      ]}>
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    maxWidth: width - 40,
    minWidth: width * 0.7,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[600],
  },
  destructiveButton: {
    backgroundColor: colors.danger,
  },
  singleButton: {
    minHeight: 48,
  },
  firstButton: {
    // Styles spécifiques pour le premier bouton si nécessaire
  },
  lastButton: {
    // Styles spécifiques pour le dernier bouton si nécessaire
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButtonText: {
    color: colors.white,
  },
  destructiveButtonText: {
    color: colors.white,
  },
});

export default CustomAlert; 