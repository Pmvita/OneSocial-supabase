import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullscreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'large',
  fullscreen = false 
}) => {
  const { theme } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        fullscreen && styles.fullscreen,
        { backgroundColor: theme.colors.background }
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator 
        size={size} 
        color={theme.colors.primary}
      />
      <Animated.Text 
        style={[
          styles.message, 
          { color: theme.colors.text }
        ]}
      >
        {message}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  fullscreen: {
    flex: 1,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoadingState; 