import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';

const PlaceholderImage = ({ source, placeholder }) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      {loading && <Image source={placeholder} style={styles.image} />}
      <Image
        source={source}
        style={styles.image}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)} // Show placeholder if loading fails
      />
      {loading && <ActivityIndicator style={styles.loader} size="small" color="#3A3A3A" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
});

export default PlaceholderImage;