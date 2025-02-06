import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  Alert, 
  Platform,
  RefreshControl,
  Pressable,
  Animated,
  Easing
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import supabase from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import LoadingState from './LoadingState';
import ErrorBoundary from './ErrorBoundary';

interface User {
  id: string;
  email: string;
  created_at: string;
}

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
  created_at: string;
  updated_at: string;
}

interface FeedProps {
  currentUser: User | null;
}

const FeedItem: React.FC<{ profile: Profile; fadeAnim: Animated.Value }> = ({ profile, fadeAnim }) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.profileContainer,
        { 
          backgroundColor: theme.colors.background,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`Post by ${profile.full_name || 'user'}`}
    >
      <View style={styles.profileHeader}>
        <View 
          style={styles.profileInfo}
          accessible={true}
          accessibilityRole="header"
        >
          <Image
            source={profile.avatar_url 
              ? { uri: profile.avatar_url } 
              : require('../../assets/default-avatar.png')}
            style={styles.profileImage}
            accessible={true}
            accessibilityLabel={`${profile.full_name || 'User'}'s profile picture`}
          />
          <View style={styles.nameContainer}>
            <Text 
              style={[styles.profileName, { color: theme.colors.text }]}
              accessibilityRole="text"
            >
              {profile.full_name || 'Full Name'}
            </Text>
            <Text 
              style={[styles.username, { color: theme.colors.secondary }]}
              accessibilityRole="text"
            >
              @{profile.username || 'user'}
            </Text>
          </View>
        </View>
        <Pressable 
          style={styles.moreButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="More options"
          accessibilityHint="Opens post options menu"
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      {profile.posts && profile.posts.map((post: Post) => (
        <View 
          key={post.id} 
          style={styles.postContainer}
          accessible={true}
          accessibilityRole="none"
          accessibilityLabel={`Post content: ${post.content}`}
        >
          {post.image_url && (
            <Image
              source={{ uri: post.image_url }}
              style={styles.postImage}
              resizeMode="cover"
              accessible={true}
              accessibilityLabel="Post image"
            />
          )}
          <Text 
            style={[styles.postContent, { color: theme.colors.text }]}
            accessible={true}
            accessibilityRole="text"
          >
            {post.content}
          </Text>
          <View 
            style={styles.postActions}
            accessible={true}
            accessibilityRole="menubar"
          >
            <Pressable 
              style={styles.actionButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Like post. ${post.likes || 0} likes`}
            >
              <Ionicons name="heart-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.actionText, { color: theme.colors.secondary }]}>
                {post.likes || 0}
              </Text>
            </Pressable>
            <Pressable 
              style={styles.actionButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Comment on post. ${post.comments || 0} comments`}
            >
              <Ionicons name="chatbubble-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.actionText, { color: theme.colors.secondary }]}>
                {post.comments || 0}
              </Text>
            </Pressable>
            <Pressable 
              style={styles.actionButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Share post"
            >
              <Ionicons name="share-outline" size={24} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

const Feed: React.FC<FeedProps> = ({ currentUser }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [combinedData, setCombinedData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch all profiles
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error.message);
      Alert.alert('Error', 'Could not fetch profiles.');
    }
  };

  // Fetch all posts with user information
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error.message);
      Alert.alert('Error', 'Could not fetch posts.');
    } finally {
      setLoading(false);
    }
  };

  // Like a post
  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      // First, check if user has already liked the post
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingLike) {
        // Unlike the post
        const { error: unlikeError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);

        if (unlikeError) throw unlikeError;
      } else {
        // Like the post
        const { error: likeError } = await supabase
          .from('likes')
          .insert([
            { post_id: postId, user_id: currentUser.id }
          ]);

        if (likeError) throw likeError;
      }

      // Refresh posts to update like count
      fetchPosts();
    } catch (error: any) {
      console.error('Error handling like:', error.message);
      Alert.alert('Error', 'Could not process like.');
    }
  };

  // Combine profiles and posts
  const combineProfilesAndPosts = () => {
    const combined = profiles.map((profile) => {
      const userPosts = posts.filter((post) => post.user_id === profile.id);
      return {
        ...profile,
        posts: userPosts,
      };
    });
    setCombinedData(combined);
  };

  useEffect(() => {
    fetchProfiles();
    fetchPosts();
  }, []);

  useEffect(() => {
    if (profiles.length > 0 && posts.length > 0) {
      combineProfilesAndPosts();
    }
  }, [profiles, posts]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfiles(), fetchPosts()]);
    setRefreshing(false);
  }, []);

  const handleError = (error: any) => {
    console.error('Error:', error);
    Alert.alert('Error', error.message || 'An unexpected error occurred');
  };

  if (loading) {
    return <LoadingState message="Loading your feed..." fullscreen />;
  }

  if (combinedData.length === 0) {
    return (
      <View 
        style={styles.emptyContainer}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel="No posts available"
      >
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

  const renderItem = ({ item, index }: { item: Profile; index: number }) => (
    <FeedItem 
      profile={item} 
      fadeAnim={new Animated.Value(0)} 
    />
  );

  return (
    <ErrorBoundary onRetry={fetchPosts}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <FlatList
          data={combinedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ItemSeparatorComponent={() => (
            <View 
              style={[styles.separator, { backgroundColor: theme.colors.border }]} 
              accessible={false}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </ErrorBoundary>
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
  listContent: {
    paddingVertical: 8,
  },
});

export default Feed;