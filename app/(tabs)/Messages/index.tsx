import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import supabase from '../../../lib/supabase';
// Import Theme
import { useTheme } from '../../../context/ThemeContext';
// Import Components
import CustomButton from '../../../components/UI/CustomButton';
import ToastNotification from '../../../components/UI/ToastNotification';
import Loader from '../../../components/Common/Loader';

const Messages = ({ navigation }) => {
  const { width } = Dimensions.get('window'); // Get screen width
  const { theme } = useTheme(); // Access the theme context
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch authenticated user
  const fetchUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error('Unable to fetch user');
      setUser(data.user);
      await fetchProfile(data.user.id);
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      ToastNotification.show('Error fetching user information.', 'error');
    }
  };

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw new Error('Unable to fetch profile');
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      ToastNotification.show('Error fetching profile information.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error('Unable to fetch messages');
      setMessages(data);
    } catch (error: any) {
      console.error(error.message);
      ToastNotification.show('Error fetching messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to realtime updates
  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          const { eventType, new: newMessage, old: oldMessage } = payload;
          if (eventType === 'INSERT') {
            setMessages((prev) => [newMessage, ...prev]);
          } else if (eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === newMessage.id ? newMessage : msg))
            );
          } else if (eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== oldMessage.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Handle authentication state changes
  const handleAuthStateChange = () => {
    const { subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  };

  // Start new chat
  const startNewChat = () => {
    navigation.navigate('NewChat');
  };

  // Render individual message
  const renderMessageItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.messageItem, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('Chat', { chatId: item.chat_id })}
    >
      <Text style={[styles.messageTitle, { color: theme.colors.text }]}>
        {item.profile?.username}: {item.content}
      </Text>
      <Text style={[styles.messageTimestamp, { color: theme.colors.subtext }]}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </TouchableOpacity>
  ), [theme]);

  useEffect(() => {
    handleAuthStateChange(); // Handle token expiration
    fetchUser(); // Fetch user initially
  }, []);

  useEffect(() => {
    fetchMessages(); // Fetch messages on mount
    const unsubscribe = subscribeToMessages(); // Subscribe to updates
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Messages</Text>
      <CustomButton
        title="Start New Chat"
        onPress={startNewChat}
        style={{ marginBottom: 16 }}
      />
      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  messageItem: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageTimestamp: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Messages;