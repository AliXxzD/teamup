import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const GradientButtonTailwind = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon = null,
  style = {},
  textStyle = {},
  ...props 
}) => {
  
  const variants = {
    primary: {
      colors: ['#20B2AA', '#1a9b94'],
      textColor: 'text-white'
    },
    secondary: {
      colors: ['#3B82F6', '#2563EB'],
      textColor: 'text-white'
    },
    success: {
      colors: ['#10B981', '#059669'],
      textColor: 'text-white'
    },
    danger: {
      colors: ['#EF4444', '#DC2626'],
      textColor: 'text-white'
    },
    warning: {
      colors: ['#F59E0B', '#D97706'],
      textColor: 'text-white'
    }
  };

  const sizes = {
    small: {
      height: 'h-10',
      paddingX: 'px-4',
      fontSize: 'text-sm',
      iconSize: 16
    },
    medium: {
      height: 'h-12',
      paddingX: 'px-6',
      fontSize: 'text-base',
      iconSize: 20
    },
    large: {
      height: 'h-14',
      paddingX: 'px-8',
      fontSize: 'text-lg',
      iconSize: 24
    }
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.medium;

  const baseClasses = `
    ${currentSize.height} 
    ${currentSize.paddingX} 
    rounded-xl 
    flex-row 
    items-center 
    justify-center
    ${disabled ? 'opacity-50' : 'opacity-100'}
  `.replace(/\s+/g, ' ').trim();

  return (
    <TouchableOpacity
      className={baseClasses}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={style}
      {...props}
    >
      <LinearGradient
        colors={disabled ? ['#475569', '#475569'] : currentVariant.colors}
        className="absolute inset-0 rounded-xl"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons 
              name={icon} 
              size={currentSize.iconSize} 
              color="#ffffff"
              className="mr-2"
            />
          )}
          <Text 
            className={`${currentVariant.textColor} ${currentSize.fontSize} font-semibold`}
            style={textStyle}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default GradientButtonTailwind;
