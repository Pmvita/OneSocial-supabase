import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import supabase from '../lib/supabase';

type RootStackParamList = {
  Chat: { roomId: string; participant: Profile };
  NewMessage: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  last_seen?: string;
  is_online?: boolean;
}

const NewMessageScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, last_seen, is_online')
        .neq('id', currentUser?.id)
        .ilike('username', `%${query}%`)
        .limit(20);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrGetChatRoom = async (otherUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get the chat room IDs where the other user is a participant
      const { data: otherUserRooms, error: otherUserError } = await supabase
        .from('chat_participants')
        .select('chat_room_id')
        .eq('profile_id', otherUserId);

      if (otherUserError) throw otherUserError;
      const roomIds = otherUserRooms.map(room => room.chat_room_id);

      // Then check if the current user is in any of those rooms
      const { data: existingRooms, error: searchError } = await supabase
        .from('chat_participants')
        .select('chat_room_id')
        .eq('profile_id', user.id)
        .in('chat_room_id', roomIds);

      if (searchError) throw searchError;

      let roomId;
      if (existingRooms && existingRooms.length > 0) {
        // Use existing chat room
        roomId = existingRooms[0].chat_room_id;
      } else {
        // Create new chat room
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({})
          .select()
          .single();

        if (createError) throw createError;
        roomId = newRoom.id;

        // Add participants
        const { error: participantsError } = await supabase
          .from('chat_participants')
          .insert([
            { chat_room_id: roomId, profile_id: user.id },
            { chat_room_id: roomId, profile_id: otherUserId }
          ]);

        if (participantsError) throw participantsError;
      }

      // Get the other user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (profileError) throw profileError;

      // Navigate to chat
      navigation.navigate('Chat', {
        roomId,
        participant: profile
      });
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const renderItem = ({ item: user }: { item: Profile }) => (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => createOrGetChatRoom(user.id)}
    >
      <Image
        source={
          user.avatar_url
            ? { uri: user.avatar_url }
            : require('../assets/default-avatar.png')
        }
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user.full_name}
        </Text>
        <Text style={[styles.userHandle, { color: theme.colors.textSecondary }]}>
          @{user.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search users..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
      </View>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.userList}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery
                ? 'No users found'
                : 'Search for users to start a conversation'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
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
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  userList: {
    flexGrow: 1,
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userHandle: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default NewMessageScreen; 