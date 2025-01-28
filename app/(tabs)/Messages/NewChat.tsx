// /app/(tabs)/Messages/NewChat.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import supabase from '../../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewChat = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  const createNewChat = async (userId) => {
    const { data, error } = await supabase
      .from('chats')
      .insert([{ participants: [userId] }])
      .select();

    if (error) {
      console.error('Error creating chat:', error);
    } else {
      navigation.navigate('Chat', { chatId: data[0].id });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select a User to Start a Chat</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => createNewChat(item.id)}
          >
            <Text style={styles.userName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userItem: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  userName: {
    fontSize: 16,
  },
});

export default NewChat;