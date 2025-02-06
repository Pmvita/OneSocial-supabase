import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { ThemedText } from '../../components/Common/ThemedText';
import CustomButton from '../../components/UI/CustomButton';
import { useTheme } from '../../context/ThemeContext';

export default function SignIn() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const signInWithEmail = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com', // Replace with actual email input
        password: 'password123', // Replace with actual password input
      });

      if (error) throw error;
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ThemedText variant="title" style={styles.title}>
        Welcome Back
      </ThemedText>
      <CustomButton
        title="Sign In"
        onPress={signInWithEmail}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
}); 