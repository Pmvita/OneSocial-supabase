import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import supabase from '../../../lib/supabase';
import LoadingState from '../../../components/UI/LoadingState';
import ErrorBoundary from '../../../components/UI/ErrorBoundary';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  last_seen?: string;
  is_online?: boolean;
}

interface ChatRoom {
  id: string;
  last_message?: string;
  last_message_at: string;
  participant: Profile;
  unread_count: number;
}

interface ChatParticipation {
  chat_room_id: string;
  unread_count: number;
}

interface ChatRoomDetails {
  id: string;
  last_message: string | null;
  last_message_at: string;
}

interface DatabaseParticipant {
  chat_room_id: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    last_seen: string | null;
    is_online: boolean | null;
  }[];
}

type RootStackParamList = {
  Chat: { roomId: string; participant: Profile };
  NewMessage: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MessagesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  const fetchChatRooms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // First, get all chat rooms the user is part of
      const { data: participations, error: participationsError } = await supabase
        .from('chat_participants')
        .select('chat_room_id, unread_count')
        .eq('profile_id', user.id);

      if (participationsError) throw participationsError;
      if (!participations?.length) {
        setChatRooms([]);
        return;
      }

      const chatParticipations = participations as ChatParticipation[];
      const chatRoomIds = chatParticipations.map(p => p.chat_room_id);

      // Get chat room details and other participants
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('id, last_message, last_message_at')
        .in('id', chatRoomIds)
        .order('last_message_at', { ascending: false });

      if (roomsError) throw roomsError;
      const chatRooms = rooms as ChatRoomDetails[];

      // Get other participants' profiles
      const { data: otherParticipants, error: profilesError } = await supabase
        .from('chat_participants')
        .select(`
          chat_room_id,
          profiles!inner (
            id,
            username,
            full_name,
            avatar_url,
            last_seen,
            is_online
          )
        `)
        .in('chat_room_id', chatRoomIds)
        .neq('profile_id', user.id)
        .limit(1, { foreignTable: 'profiles' });

      if (profilesError) throw profilesError;
      const participants = otherParticipants as DatabaseParticipant[];

      // Combine all data
      const formattedData: ChatRoom[] = chatRooms.map(room => {
        const participation = chatParticipations.find(p => p.chat_room_id === room.id);
        const otherParticipant = participants.find(p => p.chat_room_id === room.id);
        
        if (!otherParticipant || !otherParticipant.profiles[0]) {
          throw new Error(`No participant found for chat room ${room.id}`);
        }

        const profile = otherParticipant.profiles[0];
        return {
          id: room.id,
          last_message: room.last_message || undefined,
          last_message_at: room.last_message_at,
          unread_count: participation?.unread_count || 0,
          participant: {
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url || undefined,
            last_seen: profile.last_seen || undefined,
            is_online: profile.is_online || false
          }
        };
      });

      setChatRooms(formattedData);
    } catch (error: any) {
      console.error('Error fetching chat rooms:', error.message);
      Alert.alert('Error', 'Could not fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearching(false);
      return;
    }

    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, last_seen, is_online')
        .ilike('username', `%${query}%`)
        .limit(10);

      if (error) throw error;

      // Transform the data to match the ChatRoom type
      const formattedResults: ChatRoom[] = (data as Profile[]).map(user => ({
        id: crypto.randomUUID(),
        last_message: undefined,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        participant: user
      }));

      setChatRooms(formattedResults);
    } catch (error: any) {
      console.error('Error searching users:', error.message);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery) {
      searchTimeout.current = setTimeout(() => {
        searchUsers(searchQuery);
      }, 500);
    } else {
      fetchChatRooms();
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchChatRooms();

    // Subscribe to chat room updates
    const subscription = supabase
      .channel('chat_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_rooms',
      }, () => {
        fetchChatRooms();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const renderItem = ({ item: room }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={[
        styles.chatRoom,
        { backgroundColor: theme.colors.surface }
      ]}
      onPress={() => navigation.navigate('Chat', {
        roomId: room.id,
        participant: room.participant
      })}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={
            room.participant.avatar_url
              ? { uri: room.participant.avatar_url }
              : require('../../../assets/default-avatar.png')
          }
          style={styles.avatar}
        />
        {room.participant.is_online && (
          <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.success }]} />
        )}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.username, { color: theme.colors.text }]}>
            {room.participant.full_name}
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
            {room.last_message_at ? formatDistanceToNow(new Date(room.last_message_at), { addSuffix: true }) : ''}
          </Text>
        </View>
        <View style={styles.lastMessage}>
          <Text 
            style={[
              styles.messageText,
              { color: room.unread_count > 0 ? theme.colors.text : theme.colors.textSecondary }
            ]}
            numberOfLines={1}
          >
            {room.last_message || 'Start a conversation'}
          </Text>
          {room.unread_count > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.unreadCount}>{room.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingState message="Loading messages..." fullscreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ErrorBoundary>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search messages or users..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searching && <ActivityIndicator size="small" color={theme.colors.primary} />}
          </View>

          <FlatList
            data={chatRooms}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name="chatbubbles-outline" 
                  size={48} 
                  color={theme.colors.textSecondary} 
                />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  No messages yet
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                  Start a conversation with someone
                </Text>
              </View>
            )}
          />

          {/* New Message Button */}
          <TouchableOpacity
            style={[styles.newMessageButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('NewMessage')}
          >
            <Ionicons name="create" size={24} color="white" />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ErrorBoundary>
    </SafeAreaView>
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
  chatList: {
    flexGrow: 1,
  },
  chatRoom: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  lastMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  newMessageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

export default MessagesScreen;