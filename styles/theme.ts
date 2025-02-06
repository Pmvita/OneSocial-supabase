// /styles/theme.ts

const lightTheme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    title: '#000000',
    titleSecondary: '#424242',
    text: '#1A1A1A',
    textSecondary: '#757575',
    primary: '#137DC5',
    primaryDark: '#0D5A8F',
    secondary: '#FFC107',
    secondaryDark: '#FFA000',
    border: '#E0E0E0',
    error: '#F44336',
    success: '#4CAF50',
    info: '#2196F3',
    warning: '#FF9800',
    ripple: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    skeleton: '#E0E0E0',
    skeletonHighlight: '#F5F5F5',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  animation: {
    scale: 1,
    duration: {
      short: 150,
      medium: 250,
      long: 350,
    },
  },
};

const darkTheme = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    card: '#242424',
    title: '#FFFFFF',
    titleSecondary: '#E0E0E0',
    text: '#FFFFFF',
    textSecondary: '#BDBDBD',
    primary: '#64B5F6',
    primaryDark: '#42A5F5',
    secondary: '#FFD54F',
    secondaryDark: '#FFCA28',
    border: '#424242',
    error: '#EF5350',
    success: '#66BB6A',
    info: '#42A5F5',
    warning: '#FFA726',
    ripple: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    skeleton: '#424242',
    skeletonHighlight: '#616161',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  animation: {
    scale: 1,
    duration: {
      short: 150,
      medium: 250,
      long: 350,
    },
  },
};

export type Theme = typeof lightTheme;
export { lightTheme, darkTheme };