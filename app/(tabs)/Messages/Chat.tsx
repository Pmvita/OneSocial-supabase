// /app/(tabs)/Messages/Chat.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import Components
import ChatHeader from '../../../components/UI/ChatHeader';
import MessageBubble from '../../../components/UI/MessageBubble';
import Loader from '../../../components/Common/Loader';

// Import Theme
import { useTheme } from '../../../context/ThemeContext';

// Supabase
import supabase from '../../../lib/supabase';

const Chat = ({ route }: any) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { chatId } = route.params; // Get chatId from navigation
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setCurrentUser(user?.id || null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    const subscribeToMessages = () => {
      const channel = supabase
        .channel('chat-messages-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMessages((prev) => [...prev, payload.new]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchMessages();
    const unsubscribe = subscribeToMessages();

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !currentUser) return;

    const { error } = await supabase.from('messages').insert([
      {
        chat_id: chatId,
        content: newMessage,
        sender: currentUser,
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  const renderMessageBubble = ({ item }: any) => (
    <MessageBubble
      message={item.content}
      timestamp={item.created_at}
      sender={item.sender}
      isCurrentUser={item.sender === currentUser}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color={theme.colors.text} />
      </TouchableOpacity>
      <ChatHeader title="Chat" />
      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessageBubble}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesContainer}
        />
      )}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder="Type your message..."
          placeholderTextColor={theme.colors.subtext}
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginRight: 8,
  },
  sendButton: {
    padding: 12,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Chat;