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
  is_liked?: boolean;
}

interface FeedProps {
  currentUser: User | null;
}

const FeedItem: React.FC<{ 
  profile: Profile; 
  fadeAnim: Animated.Value;
  currentUser: User | null;
  onLike: (postId: string) => Promise<void>;
}> = ({ profile, fadeAnim, currentUser, onLike }) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [likingInProgress, setLikingInProgress] = useState<{ [key: string]: boolean }>({});

  // Animation for like button press
  const handleLikePress = async (postId: string) => {
    if (likingInProgress[postId]) return; // Prevent multiple rapid presses

    try {
      setLikingInProgress(prev => ({ ...prev, [postId]: true }));

      // Animate the button press
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();

      // Toggle like state optimistically
      setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));

      // Call the onLike handler
      await onLike(postId);
    } catch (error) {
      // Revert optimistic update if there's an error
      setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
      console.error('Error liking post:', error);
    } finally {
      setLikingInProgress(prev => ({ ...prev, [postId]: false }));
    }
  };

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
              style={[styles.actionButton, likingInProgress[post.id] && styles.actionButtonDisabled]}
              onPress={() => handleLikePress(post.id)}
              disabled={likingInProgress[post.id] || !currentUser}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${likedPosts[post.id] ? 'Unlike' : 'Like'} post. ${post.likes || 0} likes`}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons 
                  name={likedPosts[post.id] ? "heart" : "heart-outline"} 
                  size={24} 
                  color={likedPosts[post.id] ? theme.colors.error : theme.colors.text} 
                />
              </Animated.View>
              <Text style={[
                styles.actionText, 
                { color: likedPosts[post.id] ? theme.colors.error : theme.colors.secondary }
              ]}>
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

  // Check if user has liked posts
  const checkLikedPosts = async (posts: Post[]) => {
    if (!currentUser) return posts;

    try {
      const { data: likes, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      const likedPostIds = new Set(likes?.map(like => like.post_id));
      
      return posts.map(post => ({
        ...post,
        is_liked: likedPostIds.has(post.id)
      }));
    } catch (error) {
      console.error('Error checking liked posts:', error);
      return posts;
    }
  };

  // Fetch all posts with user information and likes
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
          ),
          likes:likes(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include like count
      const postsWithLikes = data?.map(post => ({
        ...post,
        likes: post.likes[0]?.count || 0
      }));

      // Check which posts are liked by the current user
      const postsWithLikeStatus = await checkLikedPosts(postsWithLikes || []);
      setPosts(postsWithLikeStatus);
    } catch (error: any) {
      console.error('Error fetching posts:', error.message);
      Alert.alert('Error', 'Could not fetch posts.');
    } finally {
      setLoading(false);
    }
  };

  // Handle like/unlike post
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
      await fetchPosts();
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
      currentUser={currentUser}
      onLike={handleLikePost}
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
  actionButtonDisabled: {
    opacity: 0.5,
  },
});

export default Feed;