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
  Platform,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Navigation
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import the Supabase client
import supabase from '../../../lib/supabase'; // Adjust path as necessary

// Import Theme
import { useTheme } from '../../../context/ThemeContext';

// Import Components
import CustomButton from '../../../components/UI/CustomButton';
import ToastNotification from '../../../components/UI/ToastNotification';
import Loader from '../../../components/Common/Loader';
import LoadingState from '../../../components/UI/LoadingState';

// Import Icons
import { Ionicons } from '@expo/vector-icons';

// Import ImagePicker
import * as ImagePicker from 'expo-image-picker';

type RootStackParamList = {
  Onboarding: undefined;
  ChangePassword: undefined;
  Privacy: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ThemeType {
  colors: {
    background: string;
    surface: string;
    card: string;
    title: string;
    titleSecondary: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryDark: string;
    secondary: string;
    secondaryDark: string;
    border: string;
    error: string;
    success: string;
    info: string;
    warning: string;
    ripple: string;
    overlay: string;
    skeleton: string;
    skeletonHighlight: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  roundness: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  animation: {
    scale: number;
    duration: {
      short: number;
      medium: number;
      long: number;
    };
  };
  isDark: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  private_account?: boolean;
  notification_enabled?: boolean;
}

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, toggleTheme } = useTheme() as { theme: ThemeType; toggleTheme: () => void };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFormData(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle image upload
  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSaving(true);
        const file = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        };

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file as any);

        // Upload to Supabase Storage
        const fileName = `avatar-${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        // Update profile
        await updateProfile({ avatar_url: publicUrl });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setSaving(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setFormData(prev => ({ ...prev, ...updates }));
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
      setEditMode(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return <LoadingState message="Loading settings..." fullscreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
          {!editMode ? (
            <TouchableOpacity onPress={() => setEditMode(true)}>
              <Text style={[styles.editButton, { color: theme.colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => updateProfile(formData)}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <Text style={[styles.editButton, { color: theme.colors.primary }]}>Save</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleImageUpload}
            disabled={!editMode}
          >
            <Image
              source={
                profile?.avatar_url
                  ? { uri: profile.avatar_url }
                  : require('../../../assets/default-avatar.png')
              }
              style={styles.avatar}
            />
            {editMode && (
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.profileFields}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.colors.text, borderColor: theme.colors.border }
                ]}
                value={formData.full_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                editable={editMode}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Username</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.colors.text, borderColor: theme.colors.border }
                ]}
                value={formData.username}
                onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                editable={editMode}
                placeholder="Enter your username"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Bio</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.bioInput,
                  { color: theme.colors.text, borderColor: theme.colors.border }
                ]}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                editable={editMode}
                placeholder="Tell us about yourself"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Website</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.colors.text, borderColor: theme.colors.border }
                ]}
                value={formData.website}
                onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
                editable={editMode}
                placeholder="Enter your website"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="url"
              />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Private Account</Text>
            <Switch
              value={formData.private_account}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, private_account: value }))
              }
              disabled={!editMode}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            <Switch
              value={theme.isDark}
              onValueChange={toggleTheme}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Notifications</Text>
            <Switch
              value={formData.notification_enabled}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, notification_enabled: value }))
              }
              disabled={!editMode}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Privacy')}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              Privacy Settings
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={{ color: theme.colors.error }}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileFields: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceLabel: {
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  actionButtonText: {
    fontSize: 16,
  },
  logoutButton: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 8,
  },
});

export default SettingsScreen;