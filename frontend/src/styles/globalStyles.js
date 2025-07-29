import { StyleSheet } from 'react-native';

export const colors = {
  // Primary colors matching the design
  primary: '#20B2AA', // Teal accent color
  primaryDark: '#1a9b94',
  secondary: '#3B82F6', // Blue accent
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
  
  // Dark theme colors matching the design
  background: '#0F172A', // Dark navy background
  surface: '#1E293B', // Darker surface for cards
  surfaceLight: '#334155', // Lighter surface
  
  // Text colors for dark theme
  textPrimary: '#FFFFFF', // White text for titles
  textSecondary: '#CBD5E1', // Light gray for subtitles
  textMuted: '#64748B', // Muted text
  
  // Legacy colors (keeping for compatibility)
  light: '#F8F9FA',
  dark: '#0F172A', // Updated to match design
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A' // Dark background
  },
  white: '#FFFFFF',
  black: '#000000'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semiBold: '600',
  bold: '700'
};

export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  }
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  // Typography
  h1: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.dark,
  },
  h2: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.dark,
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    color: colors.dark,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    color: colors.gray[700],
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    color: colors.gray[600],
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    color: colors.gray[500],
  },
  // Buttons
  button: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.gray[200],
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
  },
  buttonTextPrimary: {
    color: colors.white,
  },
  buttonTextSecondary: {
    color: colors.dark,
  },
  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.dark,
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  // Form elements
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm + 4,
    fontSize: fontSize.md,
    backgroundColor: colors.gray[50],
    color: colors.dark,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  // Spacing utilities
  mt: spacing.md,
  mb: spacing.md,
  ml: spacing.md,
  mr: spacing.md,
  mx: spacing.md,
  my: spacing.md,
  p: spacing.md,
  px: spacing.md,
  py: spacing.md,
}); 