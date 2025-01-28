// /app/(tabs)/Settings/index.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Navigation
import { useNavigation } from '@react-navigation/native';

// Import the Supabase client
import supabase from '../../../lib/supabase'; // Adjust path as necessary

// Import Theme
import { useTheme } from '../../../context/ThemeContext';

// Import Components
import CustomButton from '../../../components/UI/CustomButton';
import ToastNotification from '../../../components/UI/ToastNotification';
import Loader from '../../../components/Common/Loader';

// Import Icons
import { Ionicons } from '@expo/vector-icons';



const Settings = () => {

  
  const { theme } = useTheme(); // Access theme
  const navigation = useNavigation(); // Access navigation

  const [showToast, setShowToast] = useState<boolean>(false); // To handle toast
  const [toastMessage, setToastMessage] = useState<string>(''); // To store toast message


  const [loading, setLoading] = useState<boolean>(true); // To handle loading state
  const [editing, setEditing] = useState<boolean>(false); // To toggle edit mode
  const [user, setUser] = useState<any>(null); // To store user data
  const [profile, setProfile] = useState<any>(null); // To store profile data
  const [email, setEmail] = useState<string>(''); // To store email
  const [name, setName] = useState<string>(''); // To store name
  const [profilePic, setProfilePic] = useState<string>(''); // To store profile picture
  const [username, setUsername] = useState<string>(''); // To store username
  const [bio, setBio] = useState<string>(''); // To store bio
  const [portfolio, setPortfolio] = useState([]); // To store portfolio data



// Fetch authenticated user
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error.message);
      Alert.alert('Error', 'Could not fetch user information.');
      return;
    }
    setUser(data.user);
    fetchProfile(data.user.id);
  };

// Fetch user profile
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      Alert.alert('Error', 'Could not fetch profile information.');
    } else {
      setProfile(data);
      setEmail(data.email);
      setName(data.name);
      setUsername(data.username);
      setBio(data.bio);
      setLoading(false);
    }
  };

  // Fetch Portfolio
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('cryptoPortfolio').select('*');
      if (error) {
        console.error('Error fetching portfolio:', error.message);
        return;
      }
      setPortfolio(data);
    } catch (error) {
      console.error('Unexpected error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };



  // Handle Save
  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ email, name, username, bio, profilePic: profile.profilePic })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error.message);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } else {
      Alert.alert('Success', 'Profile updated successfully.');
      setEditing(false);
      fetchProfile(profile.id); // Refresh profile
    }
    setLoading(false);
  };

// Handle Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error.message);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Loading user and profile information...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        keyboardShouldPersistTaps="handled" 
        contentInsetAdjustmentBehavior="automatic" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
      <View style={styles.profilePicContainer}>
        <Image
          source={profile.profilePic ? { uri: profile.profilePic } : require('../../../assets/splash-icon.png')}
          style={styles.profilePic}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.title}>Settings</Text>
      {user && profile ? (
        <View style={styles.form}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={editing}
            placeholder="Enter your email"
          />
          <Text style={styles.label}>Profile Picture:</Text>
          <TextInput
            style={styles.input}
            value={profile.profilePic}
            onChangeText={setProfilePic}
            editable={editing}
            placeholder="Enter your profile picture URL"
          />
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            editable={editing}
            placeholder="Enter your name"
          />
          <Text style={styles.label}>User Name:</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            editable={editing}
            placeholder="Enter your username"
          />
          <Text style={styles.label}>Bio:</Text>
          <TextInput
            style={styles.textArea}
            value={bio}
            onChangeText={setBio}
            editable={editing}
            placeholder="Enter your bio"
            multiline
          />
          <View style={styles.buttonContainer}>
            {editing ? (
              <Button title="Save Changes" onPress={handleSave} color="#4CAF50" />
            ) : (
              <Button title="Edit Profile" onPress={() => setEditing(true)} color="#2196F3" />
            )}
          </View>
        </View>
      ) : (
        <Text style={styles.info}>Profile not found.</Text>
      )}
      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#ff5c5c" />
      </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'serif',    
    marginBottom: 16,
    textAlign: 'center',
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  buttonContainer: {
    //position: 'absolute',
    //bottom: Platform.OS === 'ios' ? -25 : -30,
    left: 0,
    right: 0,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonContainer: {
    //position: 'absolute',
    //bottom: Platform.OS === 'ios' ? 30 : 80,
    left: 0,
    right: 0,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

});

export default Settings;