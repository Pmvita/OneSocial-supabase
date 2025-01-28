import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';

// Indicators
import { 
  BallIndicator,
  PacmanIndicator,
  BarIndicator,
  DotIndicator,
  MaterialIndicator,
  PulseIndicator,
  SkypeIndicator,
  WaveIndicator,
  UIActivityIndicator,
} from 'react-native-indicators';

/**
 * Loader Component
 * @param {object} props
 * @param {string} [props.color] - Color of the loading spinner (default: "#847BFF").
 * @param {string|number} [props.size] - Size of the spinner (default: "large"). 
 *                                       Accepts "small", "medium", "large", or a numeric value.
 * @param {string} [props.message] - Optional message displayed below the spinner.
 * @param {object} [props.style] - Additional style for the container.
 * @returns {JSX.Element}
 */
const Loader = ({ color = '#847BFF', size = 'small', message, style }) => {
  const sizeMapping = {
    small: 30,
    medium: 50,
    large: 70,
  };

  const indicatorSize = typeof size === 'string' ? sizeMapping[size] || 70 : size;

  return (
    <View style={[styles.container, style]}>
      <BarIndicator
        key="bar"
        size={indicatorSize}
        color={color}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slight overlay effect
  },
  message: {
    marginTop: 50,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default Loader;