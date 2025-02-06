import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to your error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={() => {
        this.setState({ hasError: false });
        this.props.onRetry?.();
      }} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  const { theme } = useTheme();

  return (
    <View 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel="An error has occurred"
    >
      <Ionicons 
        name="alert-circle-outline" 
        size={48} 
        color={theme.colors.error} 
      />
      <Text 
        style={[styles.title, { color: theme.colors.text }]}
        accessibilityRole="header"
      >
        Oops! Something went wrong
      </Text>
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {error?.message || 'An unexpected error occurred'}
      </Text>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
            pressed && { opacity: 0.8 }
          ]}
          onPress={onRetry}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          accessibilityHint="Attempts to recover from the error"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary; 