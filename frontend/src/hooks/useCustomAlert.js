import { useState } from 'react';

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    showIcon: true,
  });

  const showAlert = ({
    title,
    message,
    type = 'info',
    buttons = [],
    showIcon = true,
    onBackdropPress,
  }) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          hideAlert();
          if (button.onPress) {
            button.onPress();
          }
        }
      })),
      showIcon,
      onBackdropPress: onBackdropPress || hideAlert,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Méthodes de convenance
  const showSuccessAlert = (title, message, onOkPress) => {
    showAlert({
      title,
      message,
      type: 'success',
      buttons: [
        { text: 'OK', onPress: onOkPress }
      ]
    });
  };

  const showErrorAlert = (title, message, onOkPress) => {
    showAlert({
      title,
      message,
      type: 'error',
      buttons: [
        { text: 'OK', onPress: onOkPress }
      ]
    });
  };

  const showConfirmAlert = (title, message, onConfirm, onCancel) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [
        { text: 'Annuler', style: 'cancel', onPress: onCancel },
        { text: 'Confirmer', style: 'destructive', onPress: onConfirm }
      ]
    });
  };

  const showDeleteConfirm = (title, message, onDelete, onCancel) => {
    showAlert({
      title: title || 'Supprimer',
      message: message || 'Cette action est irréversible.',
      type: 'error',
      buttons: [
        { text: 'Annuler', style: 'cancel', onPress: onCancel },
        { text: 'Supprimer', style: 'destructive', onPress: onDelete }
      ]
    });
  };

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showSuccessAlert,
    showErrorAlert,
    showConfirmAlert,
    showDeleteConfirm,
  };
}; 