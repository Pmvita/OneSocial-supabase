import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import HomeScreen from '../app/(tabs)/Home';
import ProfileScreen from '../app/(tabs)/Profile';
import NotificationsScreen from '../app/(tabs)/Notifications';
import SettingsScreen from '../app/(tabs)/Settings';
import CreateStoryScreen from '../screens/CreateStory';
import NewMessageScreen from '../screens/NewMessage';
import AuthScreen from '../app/(auth)/Auth';
import WalletScreen from '../app/(tabs)/Wallet';

// Import custom components
import { HapticTab } from '../components/Common/HapticTab';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Feed':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Wallet':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          elevation: 0,
          shadowOpacity: 0,
        },
      })}
    >
      <Tab.Screen 
        name="Feed" 
        component={HomeScreen}
        options={{ 
          headerShown: false,
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ 
          headerShown: false,
          tabBarLabel: 'Wallet'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Profile'
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Notifications'
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Settings'
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="/(auth)/sign-in"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="/(auth)/sign-in" 
        component={AuthScreen}
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="/(app)" 
        component={MainTabs}
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen
        name="/(modals)/create-story"
        component={CreateStoryScreen}
        options={{ 
          presentation: 'modal',
          headerShown: true
        }}
      />
      <Stack.Screen
        name="/(modals)/new-message"
        component={NewMessageScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'New Message',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 