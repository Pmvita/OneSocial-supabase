import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert, Platform } from 'react-native';
import supabase from '../../lib/supabase'; // Adjust the path as necessary

// Import Theme
import { useTheme } from '../../context/ThemeContext'; // Adjust the path as needed
import { ScrollView } from 'react-native-gesture-handler';

const Feed = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { theme } = useTheme(); // Access theme

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

  useEffect(() => {
    if (profiles.length > 0 && posts.length > 0) {
      combineProfilesAndPosts(); // Combine data after both profiles and posts are fetched
    }
  }, [profiles, posts]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  if (combinedData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No profiles available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={combinedData}
        renderItem={({ item }) => (
          <View style={styles.profileContainer}>
            <Image
              source={item.profilePic ? { uri: item.profilePic } : require('../../assets/splash-icon.png')}
              style={styles.profilePic}
            />
            <View>
              <Text style={[styles.username, { color: theme.colors.text }]}>{item.username || 'unknown...'}</Text>
              {item.lastActive && (
                <Text style={styles.lastActive}>
                  {item.lastActive} ago
                </Text>
              )}
              {item.writtenPost && 
              <ScrollView>
                <Text style={styles.writtenPost}>
                  {item.writtenPost}
                  {item.writtenPost.length > 100 ? '...' : ''}
                </Text>
              </ScrollView>
              }
              <Text>
                Post Description: {item.postDescription || 'No description'}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()} // Ensure 'id' is unique for each profile
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No profiles available.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
  },
  profileContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderColor: '#E0E0E0',
    borderWidth: 2,
    marginLeft: 5,
    
  },
  username: {
    position: 'absolute',
    left: 50,
    top: -40,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastActive: {
    position: 'absolute',
    fontSize: 12,
    color: '#888',
    left: 50,
    top: Platform.OS === 'ios' ? -20 : -15,
  },
  writtenPost: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default Feed;