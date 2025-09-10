import React from 'react';
import { View, Text } from 'react-native';

const TeamupLogo = ({ 
  size = 'medium', 
  showText = true, 
  textColor = '#000000',
  style = {}
}) => {
  // Définir les tailles
  const sizeConfig = {
    'extra-small': {
      text: 'text-sm',
      dot: { width: 4, height: 4, borderRadius: 2, marginLeft: 3 }
    },
    small: {
      text: 'text-lg',
      dot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 }
    },
    medium: {
      text: 'text-2xl',
      dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 6 }
    },
    large: {
      text: 'text-3xl',
      dot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 }
    }
  };

  const config = sizeConfig[size];

  return (
    <View className="flex-row items-center" style={style}>
      {/* Text */}
      {showText && (
        <Text 
          className={`${config.text} font-bold tracking-tight`}
          style={{ 
            color: textColor,
          }}
        >
          TeamUp
        </Text>
      )}
      
      {/* Point cyan */}
      <View
        style={{
          ...config.dot,
          backgroundColor: '#06b6d4', // Même bleu cyan que l'application
          shadowColor: '#06b6d4',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.6,
          shadowRadius: 4,
          elevation: 4,
        }}
      />
    </View>
  );
};

export default TeamupLogo;
