import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';

const GradientIcon = ({
  name,
  size = 24,
  color = colors.white,
  style,
  gradientColors = ['#20B2AA', '#17A2B8', '#0891B2'],
  gradientStyle,
  ...props
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, gradientStyle, style]}
    >
      <Ionicons 
        name={name} 
        size={size} 
        color={color} 
        {...props}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default GradientIcon; 