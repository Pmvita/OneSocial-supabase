import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const MessageBubble = ({
  message,
  isCurrentUser,
  username,
  profilePic,
}: {
  message: string;
  isCurrentUser: boolean;
  username: string;
  profilePic: string;
}) => {
  return (
    <View style={[styles.container, isCurrentUser ? styles.currentUser : styles.otherUser]}>
      {!isCurrentUser && profilePic && (
        <Image source={{ uri: profilePic }} style={styles.profilePic} />
      )}
      <View style={styles.messageContent}>
        <Text style={[styles.username, isCurrentUser && styles.currentUserUsername]}>
          {username}
        </Text>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
    flexDirection: 'row',
  },
  currentUser: {
    backgroundColor: '#278EFF',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  otherUser: {
    backgroundColor: '#2FCC59',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  messageContent: {
    maxWidth: '70%',
  },
  username: {
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontSize: 14,
  },
  currentUserUsername: {
    color: '#fff',
  },
});

export default MessageBubble;