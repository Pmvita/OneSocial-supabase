// app/(tabs)/Wallet/index.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Navigation
import { useNavigation } from '@react-navigation/native';

// Import the Supabase client
import supabase from '../../../lib/supabase';

// Import Theme
import { useTheme } from '../../../context/ThemeContext';

// Import Components
import CustomButton from '../../../components/UI/CustomButton';
import ToastNotification from '../../../components/UI/ToastNotification';
import Loader from '../../../components/Common/Loader';

// Import Icons
import { Ionicons } from '@expo/vector-icons';

const Wallet = () => {


  const { theme } = useTheme(); // Access theme
  const navigation = useNavigation(); // To navigate between screens
  const [user, setUser] = useState<any>(null); // To store user data
  const [profile, setProfile] = useState<any>(null); // To store profile data
  const [portfolio, setPortfolio] = useState([]); // To store portfolio data
  const [loading, setLoading] = useState(true); // To handle loading state


// Fetch authenticated user
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
  
        if (error.message.includes('token is expired')) {
          // Attempt to refresh the session
          const { data: session, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Session refresh failed:', refreshError.message);
            Alert.alert('Session expired', 'Please log in again.');
            // Navigate to Onboarding or login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          } else {
            setUser(session.user); // Update user after refreshing the session
          }
        } else {
          Alert.alert('Error', 'Could not fetch user information.');
        }
      } else {
        setUser(data.user); // Set user data
        fetchProfile(data.user.id); // Fetch profile data after user data is available
      }
    };

// Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(); // Assuming each user has a single profile

    if (error) {
      console.error('Error fetching profile:', error.message);
      Alert.alert('Error', 'Could not fetch profile information.');
    } else {
      setProfile(data);
      setLoading(false); 
    }
  };

// Fetch Portfolio
const fetchPortfolio = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase.from('cryptoPortfolio').select('*');
    if (error) {
      console.error('Error fetching portfolio:', error.message);
      return;
    }
    // Sort portfolio items by balance in descending order
    const sortedData = data.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    setPortfolio(sortedData);
  } catch (error) {
    console.error('Unexpected error fetching portfolio:', error);
  } finally {
    setLoading(false);
  }
};

  // Fetch component mount
  useEffect(() => {
    fetchPortfolio();
    fetchUser();
  }, []);

// Handle coin press
  const handleCoinPress = (coin) => {
    console.warn('Remember to create screen & add to Navigation!');
    console.info(`Tapped on ${coin.name} (${coin.symbol})`);
    // Add navigation or action logic here
    navigation.navigate('CoinDetails', { coin });
  };

// Render portfolio item
  const renderPortfolioItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCoinPress(item)} style={styles.portfolioItem}>
      <Image source={{ uri: item.icon }} style={styles.icon} />
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{item.name} ({item.symbol})</Text>
        <Text style={styles.assetSymbol}>{item.symbol}</Text>
      </View>
      <Text style={styles.assetBalance}>$ {item.balance}</Text>
    </TouchableOpacity>
  );


  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading user information...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.title }]}>OneSocial Wallet</Text>
      <Text style={styles.subtitle}>Total Balance</Text>
      <Text style={styles.balance}>
        ${portfolio.reduce((total, item) => total + parseFloat(item.balance || 0), 0).toFixed(2)}
      </Text>
      <TouchableOpacity 
        onPress={() => {
          console.info('Navigating to CryptoWallets');
          console.info('Wallet Address:', profile.WalletAddress);
          console.warn('Remember to create screen & add to Navigation!');
          //navigation.navigate('CryptoWallets');
        }}
      >
        <Text style={styles.walletAddress}>
          <Ionicons name="wallet-outline" size={16} color="#6200EE" />
          {profile.WalletAddress}
        </Text>
      </TouchableOpacity>

      {/* Action Button*/}
      <View style={styles.buttonContainer}>
        {/* Send Tokens Button*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.info('This navigates to the Send screen 📲');
            console.warn('Remember to create screen & add to Navigation!');
            //navigation.navigate('');
          }}
        >
          <Ionicons name="paper-plane" size={24} color="green" />
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        {/* Receive Tokens Button*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Navigating to Receive');
            console.warn('Remember to create screen & add to Navigation!');
            //navigation.navigate('Receive');
          }}
        >
          <Ionicons name="qr-code" size={24} color="blue" />
          <Text style={styles.buttonText}>Receive</Text>
        </TouchableOpacity>
        {/* Buy Tokens Button*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.info('Navigating to Buy');
            console.warn('Remember to create screen & add to Navigation!');
            //navigation.navigate('Buy');
          }}
        >
          <Ionicons name="add" size={24} color="darkblue" />
          <Text style={styles.buttonText}>Buy</Text>
        </TouchableOpacity>
        {/* Swap Tokens Button*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.info('Navigating to Swap');
            console.warn('Remember to create screen & add to Navigation!');
            //navigation.navigate('Swap');
          }}
        >
          <Ionicons name="repeat" size={24} color="orange" />
          <Text style={styles.buttonText}>Swap</Text>
        </TouchableOpacity>
      </View>
      {/* Action Buttons 2nd Row */}
      <View style={styles.buttonContainer}>
        {/* Crypto Markets Button*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Navigating to Markets');
            console.warn('Remember to create screen & add to Navigation!');
            //navigation.navigate('Markets');
          }}
        >
          <Ionicons name="bar-chart" size={24} color="red" />
          <Text style={styles.buttonText}>Markets</Text>
        </TouchableOpacity>
        {/* Explore Button*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Navigating to Explore');
            console.warn('Remember to create screen & add to Navigation!');
            //navigation.navigate('Explore');
          }}
        >
          <Ionicons name="compass" size={24} color="pink" />
          <Text style={styles.buttonText}>Explore</Text>
        </TouchableOpacity>
        {/* Recent Activity Button*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Navigating to RecentActivity');
            console.warn('Remember to create screen & add to Navigation!');
            //navigation.navigate('RecentActivity');
          }}
        >
          <Ionicons name="time" size={24} color="aqua" />
          <Text style={styles.buttonText}>Recent</Text>
        </TouchableOpacity>
        {/* Payments Button*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Navigating to Payments');
            console.warn('Remember to create screen & add to Navigation!');
            //navigation.navigate('Payments');
          }}
        >
          <Ionicons name="cash" size={24} color="violet" />
          <Text style={styles.buttonText}>Pay</Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio*/}
      <Text style={styles.portfolioTitle}>Your Portfolio</Text>
      <FlatList
        data={portfolio}
        renderItem={renderPortfolioItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.portfolioList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: Platform.OS === 'ios' ? 1 : 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'serif',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',    
    fontFamily: 'serif',
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginVertical: 5,
    fontFamily: 'serif',
  },
  walletAddress: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'serif',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    marginHorizontal: 0,
  },
  button: {
    flex: 1,
    marginHorizontal: 15,
    height: 65,
    backgroundColor: '#E7E7F6',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginHorizontal: 10,
    fontFamily: 'serif',
  },
  portfolioList: {
    marginTop: 8,
    //height: Platform.OS === 'ios' ? 'auto' : 'auto',
  },
  portfolioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
    fontFamily: 'serif',
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'serif',
  },
  assetSymbol: {
    fontSize: 12,
    color: '#888',
  },
  assetBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'serif',
  },
});

export default Wallet;