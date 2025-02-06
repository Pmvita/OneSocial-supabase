import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  Alert, 
  Platform,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Animated
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import supabase from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  posts: Post[];
}

interface Post {
  id: string;
  content: string;
  image_url?: string;
  likes?: number;
  comments?: number;
  user_id: string;
}

const Feed = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [combinedData, setCombinedData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { theme } = useTheme();

  // Fetch all profiles
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching profiles:', error.message);
        Alert.alert('Error', 'Could not fetch profiles.');
      } else {
        setProfiles(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred while fetching profiles.');
    }
  };

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase.from('posts').select('*');
      if (error) {
        console.error('Error fetching posts:', error.message);
        Alert.alert('Error', 'Could not fetch posts.');
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred while fetching posts.');
    } finally {
      setLoading(false);
    }
  };

  // Combine profiles and posts based on the profile's ID
  const combineProfilesAndPosts = () => {
    const combined = profiles.map((profile) => {
      // Find posts for the current profile
      const userPosts = posts.filter((post) => post.user_id === profile.id); // Adjust this based on your schema
      return {
        ...profile,
        posts: userPosts, // Attach the posts to the profile
      };
    });
    setCombinedData(combined);
  };

  // UseEffect
  useEffect(() => {
    fetchProfiles();
    fetchPosts();
  }, []);

  // Combine profiles and posts
  useEffect(() => {
    if (profiles.length > 0 && posts.length > 0) {
      combineProfilesAndPosts(); // Combine data after both profiles and posts are fetched
    }
  }, [profiles, posts]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfiles(), fetchPosts()]);
    setRefreshing(false);
  }, []);

  const renderPostItem = ({ item: profile }: { item: Profile }) => {
    return (
      <Pressable 
        style={[styles.profileContainer, { backgroundColor: theme.colors.background }]}
        android_ripple={{ color: theme.colors.border }}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Image
              source={profile.avatar_url 
                ? { uri: profile.avatar_url } 
                : require('../../assets/default-avatar.png')}
              style={styles.profileImage}
            />
            <View style={styles.nameContainer}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {profile.full_name || 'Full Name'}
              </Text>
              <Text style={[styles.username, { color: theme.colors.secondary }]}>
                {profile.username || 'user'}
              </Text>
            </View>
          </View>
          <Pressable style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        {profile.posts && profile.posts.map((post: Post) => (
          <View key={post.id} style={styles.postContainer}>
            {post.image_url && (
              <Image
                source={{ uri: post.image_url }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}
            <Text style={[styles.postContent, { color: theme.colors.text }]}>
              {post.content}
            </Text>
            <View style={styles.postActions}>
              <Pressable style={styles.actionButton}>
                <Ionicons name="heart-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.actionText, { color: theme.colors.secondary }]}>
                  {post.likes || 0}
                </Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.actionText, { color: theme.colors.secondary }]}>
                  {post.comments || 0}
                </Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>
        ))}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading your feed...
        </Text>
      </View>
    );
  }

  if (combinedData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="newspaper-outline" size={48} color={theme.colors.secondary} />
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          No posts yet
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.secondary }]}>
          Be the first one to share something!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={combinedData}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    marginTop: 8,
  },
  profileContainer: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
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
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameContainer: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
  },
  postContainer: {
    marginTop: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
  },
  separator: {
    height: 1,
    opacity: 0.1,
  },
});

export default Feed;