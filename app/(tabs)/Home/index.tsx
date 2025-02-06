// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import supabase from '../../../lib/supabase';
import { useTheme } from '../../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Feed from '../../../components/UI/Feed';
import LoadingState from '../../../components/UI/LoadingState';
import ErrorBoundary from '../../../components/UI/ErrorBoundary';

const { width } = Dimensions.get('window');
const STORY_SIZE = width * 0.15;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

type RootStackParamList = {
  Story: { storyId: string };
  CreatePost: undefined;
  Notifications: undefined;
  Messages: undefined;
  CreateStory: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  viewed: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  stories?: Story[];
}

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUser = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!authUser) throw new Error('No user found');
      setUser(authUser);
      await fetchProfile(authUser.id);
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      Alert.alert('Error', 'Could not fetch user information.');
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setStories(data || []);
    } catch (error: any) {
      console.error('Error fetching stories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchStories();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUser(), fetchStories()]);
    setRefreshing(false);
  };

  const StoryCircle = ({ story, isOwn = false }: { story: Story; isOwn?: boolean }) => (
    <TouchableOpacity
      style={styles.storyContainer}
      onPress={() => navigation.navigate('Story', { storyId: story.id })}
      accessible={true}
      accessibilityLabel={`View ${isOwn ? 'your' : 'user'} story`}
      accessibilityRole="button"
    >
      <View style={[
        styles.storyRing,
        { borderColor: story.viewed ? theme.colors.border : theme.colors.primary }
      ]}>
        <Image
          source={{ uri: story.image_url }}
          style={styles.storyImage}
        />
      </View>
      <Text style={[styles.storyUsername, { color: theme.colors.text }]} numberOfLines={1}>
        {isOwn ? 'Your Story' : profile?.username}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingState message="Loading your feed..." fullscreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ErrorBoundary>
        {/* User Profile Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => navigation.navigate('Profile')}
              accessible={true}
              accessibilityLabel="View your profile"
              accessibilityRole="button"
            >
              <Image
                source={profile?.avatar_url 
                  ? { uri: profile.avatar_url }
                  : require('../../../assets/default-avatar.png')}
                style={styles.avatar}
              />
              <View style={styles.userTextInfo}>
                <Text style={[styles.userName, { color: theme.colors.text }]}>
                  {profile?.full_name || 'Loading...'}
                </Text>
                <Text style={[styles.userHandle, { color: theme.colors.textSecondary }]}>
                  @{profile?.username || 'username'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('CreatePost')}
              accessibilityLabel="Create new post"
            >
              <Ionicons name="add-circle-outline" size={26} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
              accessibilityLabel="View notifications"
            >
              <Ionicons name="notifications-outline" size={26} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Messages')}
              accessibilityLabel="View messages"
            >
              <Ionicons name="paper-plane-outline" size={26} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stories Section */}
        <View style={styles.storiesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.storiesContainer}
            contentContainerStyle={styles.storiesContent}
          >
            {/* Add Story Button */}
            <TouchableOpacity
              style={styles.addStoryContainer}
              onPress={() => navigation.navigate('CreateStory')}
              accessible={true}
              accessibilityLabel="Create new story"
              accessibilityRole="button"
            >
              <View style={[styles.addStoryButton, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="add" size={24} color="white" />
              </View>
              <Text style={[styles.storyUsername, { color: theme.colors.text }]}>
                Add Story
              </Text>
            </TouchableOpacity>

            {/* Stories List */}
            {stories.map((story) => (
              <StoryCircle
                key={story.id}
                story={story}
                isOwn={story.user_id === user?.id}
              />
            ))}
          </ScrollView>
        </View>

        {/* Feed Section */}
        <View style={styles.feedContainer}>
          <Feed currentUser={user} />
        </View>
      </ErrorBoundary>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userTextInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userHandle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  storiesContainer: {
    height: STORY_SIZE + 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  storiesContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: STORY_SIZE,
  },
  storyRing: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    borderWidth: 2,
    padding: 2,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: (STORY_SIZE - 4) / 2,
  },
  storyUsername: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  addStoryContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: STORY_SIZE,
  },
  addStoryButton: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storiesSection: {
    height: STORY_SIZE + 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  feedContainer: {
    flex: 1,
  },
});

export default HomeScreen;