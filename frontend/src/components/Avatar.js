import React from 'react';
import { View, Text, Image } from 'react-native';
import { getAvatarProps } from '../utils/initialsUtils';

/**
 * Composant Avatar avec initiales ou image
 */
const Avatar = ({ 
  name, 
  firstName, 
  lastName, 
  imageUri, 
  size = 40, 
  backgroundColor, 
  textColor = '#ffffff',
  style = {},
  showBorder = false,
  borderColor = '#ffffff',
  borderWidth = 2
}) => {
  const avatarProps = getAvatarProps({ 
    name, 
    firstName, 
    lastName, 
    size, 
    backgroundColor 
  });

  const avatarStyle = {
    ...avatarProps.style,
    ...style,
    ...(showBorder && {
      borderWidth,
      borderColor
    })
  };

  // Si une image est fournie, l'afficher
  if (imageUri && imageUri.trim() !== '') {
    return (
      <View style={avatarStyle}>
        <Image 
          source={{ uri: imageUri }} 
          style={{
            width: size,
            height: size,
            borderRadius: size / 2
          }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Sinon, afficher les initiales
  return (
    <View style={avatarStyle}>
      <Text 
        style={{
          color: textColor,
          fontSize: size * 0.4, // 40% de la taille
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        {avatarProps.initials}
      </Text>
    </View>
  );
};

export default Avatar;
