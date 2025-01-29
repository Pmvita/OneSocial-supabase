// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import supabase from '../../../lib/supabase'; // Adjust the import as necessary

// Import Theme
import { useTheme } from '../../../context/ThemeContext'; // Adjust the path as needed

// Import Icons
import { Ionicons } from '@expo/vector-icons';

// Import Components
import Feed from '../../../components/UI/Feed';
import CustomButton from '../../../components/UI/CustomButton';


// Screen Dimensions
const { width } = Dimensions.get('window');
const profilePicSize = width * 0.25; // 25% of the screen width for profile picture

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme(); // Access theme
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch authenticated user
  const fetchUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw new Error(error.message);
      }
      setUser(data.user);
      fetchProfile(data.user.id);
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      Alert.alert('Error', 'Could not fetch user information.');
    }
  };

  // Fetch user profile from the "profiles" table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      setProfile(data);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      Alert.alert('Error', 'Could not fetch profile information.');
    }
  };

  // Handle token expiration and refresh
  const handleAuthStateChange = () => {
    const { subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  };
  useEffect(() => {
    handleAuthStateChange(); // Listen for auth state changes
    fetchUser(); // Fetch user initially
  }, []);
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.info}>Loading user and profile information...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: 20 }]}>
      {/* Header */}
      <Text style={[styles.title, { color: theme.colors.title }]}>OneSocial</Text>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('Notifications')}
        accessibilityLabel="Go to Notifications"
        accessible
        importantForAccessibility="yes"
      >
        <Ionicons name="notifications" size={30} color={theme.colors.text} />
      </TouchableOpacity>

      {user ? (
        <View style={styles.header}>
          {profile ? (
            <>
              <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
                <Image
                  source={profile.profilePic ? { uri: profile.profilePic } : require('../../../assets/splash-icon.png')}
                  style={styles.profilePic}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View style={styles.profileDetails}>
                <Text style={[styles.name, { color: theme.colors.text }]}>Name: {profile.name}</Text>
                <Text style={[styles.username, { color: theme.colors.text }]}>Username: {profile.username}</Text>
                <Text style={[styles.bio, { color: theme.colors.text }]}>Bio: {profile.bio}</Text>
              </View>
            </>
          ) : (
            <Text style={[styles.info, { color: theme.colors.text }]}>Profile not found.</Text>
          )}
        </View>
      ) : (
        <Text style={[styles.info, { color: theme.colors.text }]}>Loading user information...</Text>
      )}
      {/* User Specific Feed */}
      <Feed user={user} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginLeft: 10,
    marginBottom: 10,
    fontWeight: '900',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginHorizontal: 5,
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
  },
  profilePic: {
    width: profilePicSize,
    height: profilePicSize,
    borderRadius: profilePicSize / 2,
    borderColor: '#E0E0E0',
    borderWidth: 2,
  },
  profileDetails: {
    marginLeft: 20,
  },
  iconButton: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 60 : 30,
    backgroundColor: '#E0E0E0',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Times New Roman',
  },
  bio: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
  },
  info: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default HomeScreen;