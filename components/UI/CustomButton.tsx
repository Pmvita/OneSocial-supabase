import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '../Common/ThemedText';
import { useTheme } from '../../context/ThemeContext';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.button, { backgroundColor: theme.colors.secondary }];
      case 'outline':
        return [
          styles.button,
          {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.primary,
          },
        ];
      default:
        return [styles.button, { backgroundColor: theme.colors.primary }];
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return theme.colors.primary;
    }
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <ThemedText
          variant="body"
          style={styles.text}
          color={getTextColor()}
        >
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  text: {
    fontWeight: '600',
  },
});

export default CustomButton;