import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../../../lib/supabase';
import { useTheme } from '../../../context/ThemeContext';
import LoadingState from '../../../components/UI/LoadingState';
import ErrorBoundary from '../../../components/UI/ErrorBoundary';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  content: string;
  created_at: string;
  read: boolean;
  actor: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  post?: {
    id: string;
    content: string;
    image_url?: string;
  };
}

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          post:post_id (
            id,
            content,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error.message);
      Alert.alert('Error', 'Could not fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Ionicons name="heart" size={24} color={theme.colors.error} />;
      case 'comment':
        return <Ionicons name="chatbubble" size={24} color={theme.colors.primary} />;
      case 'follow':
        return <Ionicons name="person-add" size={24} color={theme.colors.success} />;
      case 'mention':
        return <Ionicons name="at" size={24} color={theme.colors.info} />;
      default:
        return <Ionicons name="notifications" size={24} color={theme.colors.text} />;
    }
  };

  const renderItem = ({ item: notification }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { 
          backgroundColor: notification.read ? theme.colors.background : theme.colors.surface,
        }
      ]}
      onPress={() => markAsRead(notification.id)}
    >
      <Image
        source={
          notification.actor?.avatar_url
            ? { uri: notification.actor.avatar_url }
            : require('../../../assets/default-avatar.png')
        }
        style={styles.avatar}
      />
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationText, { color: theme.colors.text }]}>
          <Text style={styles.username}>{notification.actor?.username}</Text>
          {' '}{notification.content}
        </Text>
        <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </Text>
      </View>
      {renderNotificationIcon(notification.type)}
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingState message="Loading notifications..." fullscreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ErrorBoundary>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="notifications-off-outline" 
                size={48} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                When you get notifications, they'll show up here
              </Text>
            </View>
          )}
        />
      </ErrorBoundary>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  username: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
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
});

export default NotificationsScreen; 