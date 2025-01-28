import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import  supabase  from '../../lib/supabase'; // Import Supabase client

const Onboarding = ({ navigation }) => {
  useEffect(() => {
    // Check if the user is already logged in
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Redirect to Home if a session exists
        navigation.replace('Home');
      }
    };

    checkUserSession();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.headerContainer}>
          {/* <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 200,
              backgroundColor: 'purple',
              left: -100,
              top: -100,
              opacity: 0.5,
            }}
          /> */}
          {/* OneSocial Logo */}
          <Image
            style={{
              width: 300,
              height: 200,
              position: 'absolute',
              zIndex: 1,
              borderRadius: 90,
            }}
            source={require('../../images/OneSocial.png')}
          />
          {/* <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              overflow: 'hidden',
              backgroundColor: 'blue',
              left: 120,
              top: 90,
              opacity: 0.5,
            }}
          /> */}
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome to OneSocial!</Text>
          <Text style={styles.subtitle}>Connect with friends and family.</Text>
          <Button title="Get Started" onPress={() => navigation.navigate('Login')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'absolute',
    alignSelf: 'center',
    bottom: Platform.OS === 'ios' ? 170 : 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
});