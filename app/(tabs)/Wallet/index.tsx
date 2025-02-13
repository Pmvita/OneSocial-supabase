// app/(tabs)/Wallet/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, useNavigation, useRootNavigationState } from 'expo-router';

// Import Navigation
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import the Supabase client
import { supabase } from '../../../utils/supabase';

// Import Theme
import { useTheme } from '../../../context/ThemeContext';

// Import Components
import CustomButton from '../../../components/UI/CustomButton';
import ToastNotification from '../../../components/UI/ToastNotification';
import Loader from '../../../components/Common/Loader';
import LoadingState from '../../../components/UI/LoadingState';
import ErrorBoundary from '../../../components/UI/ErrorBoundary';
import { ThemedText } from '../../../components/Common/ThemedText';

// Import Icons
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../contexts/auth';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  WalletAddress?: string;
}

interface Wallet {
  id: string;
  balance: number;
  currency: string;
  updated_at: string;
  address: string;
  profile_id: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  description: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  recipient_wallet?: {
    profile: {
      username: string;
      full_name: string;
    };
  };
  wallet_id: string;
}

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  price: string;
  change24h: string;
}

type RootStackParamList = {
  SendMoney: undefined;
  AddMoney: undefined;
  Withdraw: undefined;
  TransactionDetails: { transaction: Transaction };
  Auth: undefined;
  Onboarding: undefined;
};

type NavigationProp = any; // We'll use Expo Router's navigation

const Wallet = () => {
  const router = useRouter();
  const { session } = useAuth();
  const { theme } = useTheme(); // Access theme
  const navigationState = useRootNavigationState();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore,  setHasMore] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (!session) {
          router.replace('/(auth)/sign-in');
          return;
        }

        setLoading(true);
        await fetchUser();
        await fetchWallet();
      } catch (error: any) {
        console.error('Error in loadInitialData:', error);
        if (error?.message?.includes('authentication')) {
          router.replace('/(auth)/sign-in');
        }
      } finally {
        setLoading(false);
      }
    };

    if (navigationState?.key) {
      loadInitialData();
    }
  }, [navigationState?.key, session]);

  // Add effect for fetching transactions when wallet is ready
  useEffect(() => {
    if (wallet?.id) {
      fetchTransactions();
      fetchPortfolio();
    }
  }, [wallet?.id]);

  // Fetch authenticated user
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error.message);

      if (error.message.includes('token is expired')) {
        const { data: session, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Session refresh failed:', refreshError.message);
          Alert.alert('Session expired', 'Please log in again.');
          router.replace('/(auth)/sign-in');
        } else {
          setUser(session.user);
        }
      } else {
        Alert.alert('Error', 'Could not fetch user information.');
      }
    } else {
      setUser(data.user);
      fetchProfile(data.user.id);
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
      if (!wallet?.id) return;
      
      setLoading(true);
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('crypto_portfolio')
        .select('*')
        .eq('wallet_id', wallet.id);

      if (portfolioError) {
        console.error('Error fetching portfolio:', portfolioError);
        return;
      }

      // Sort portfolio items by balance in descending order
      const sortedData = portfolioData?.sort((a, b) => 
        parseFloat(b.balance) - parseFloat(a.balance)
      ) || [];

      setPortfolio(sortedData);
    } catch (error) {
      console.error('Unexpected error fetching portfolio:', error);
      Alert.alert('Error', 'Failed to load portfolio data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user found');
      }

      // First check if wallet exists
      const { data: existingWallet, error: fetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('profile_id', session.user.id)
        .single();

      if (fetchError && fetchError.message !== 'JSON object requested, multiple (or no) rows returned') {
        throw fetchError;
      }

      if (!existingWallet) {
        // Generate a more secure wallet address using crypto
        const generateSecureAddress = () => {
          const array = new Uint8Array(32);
          crypto.getRandomValues(array);
          return '0x' + Array.from(array)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        };

        // Create new wallet with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const { data: newWallet, error: createError } = await supabase
              .from('wallets')
              .insert([
                {
                  profile_id: session.user.id,
                  balance: 0,
                  address: generateSecureAddress(),
                  currency: 'USD', // Default currency
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
              ])
              .select()
              .single();

            if (createError) throw createError;
            setWallet(newWallet);
            break;
          } catch (error) {
            retryCount++;
            if (retryCount === maxRetries) {
              throw new Error('Failed to create wallet after multiple attempts');
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      } else {
        setWallet(existingWallet);
      }
    } catch (error: any) {
      console.error('Error fetching/creating wallet:', error);
      Alert.alert(
        'Wallet Error',
        error?.message || 'Failed to load wallet information. Please try again.',
        [
          { 
            text: 'Retry', 
            onPress: () => fetchWallet() 
          },
          { 
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!wallet?.id) {
        throw new Error('No wallet found');
      }

      setLoading(true);
      const PAGE_SIZE = 10;
      
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*, recipient_wallet:wallets(profile:profiles(username, full_name))', { count: 'exact' })
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (error) throw error;

      setTransactions(data || []);
      setHasMore(count ? count > PAGE_SIZE : false);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      Alert.alert(
        'Transaction Error',
        'Failed to load transaction history. Please try again.',
        [
          { 
            text: 'Retry', 
            onPress: () => fetchTransactions() 
          },
          { 
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (loadingMore || !hasMore || !wallet?.id) return;

    try {
      setLoadingMore(true);
      const currentLength = transactions.length;
      const PAGE_SIZE = 10;

      const { data, error, count } = await supabase
        .from('transactions')
        .select('*, recipient_wallet:wallets(profile:profiles(username, full_name))', { count: 'exact' })
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .range(currentLength, currentLength + PAGE_SIZE - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        setTransactions([...transactions, ...data]);
        setHasMore(count ? count > currentLength + data.length : false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more transactions:', error);
      Alert.alert('Error', 'Failed to load more transactions. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, [wallet?.id]);

  // Handle coin press
  const handleCoinPress = (coin: PortfolioItem) => {
    Alert.alert('Coming Soon', 'Coin details view will be available soon!');
  };

  // Render portfolio item
  const renderPortfolioItem = ({ item }: { item: PortfolioItem }) => (
    <TouchableOpacity 
      onPress={() => handleCoinPress(item)} 
      style={[styles.portfolioItem, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.coinInfo}>
        <ThemedText variant="body" style={styles.coinSymbol}>
          {item.symbol}
        </ThemedText>
        <ThemedText 
          variant="caption" 
          style={styles.coinName} 
          color={theme.colors.textSecondary}
        >
          {item.name}
        </ThemedText>
      </View>
      <View style={styles.coinValues}>
        <ThemedText variant="body" style={styles.coinBalance}>
          ${parseFloat(item.balance).toFixed(2)}
        </ThemedText>
        <ThemedText 
          variant="caption" 
          style={styles.coinChange}
          color={parseFloat(item.change24h) >= 0 ? theme.colors.success : theme.colors.error}
        >
          {parseFloat(item.change24h) >= 0 ? '+' : ''}{item.change24h}%
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'arrow-down-circle';
      case 'withdrawal':
        return 'arrow-up-circle';
      case 'transfer':
        return 'swap-horizontal';
      case 'payment':
        return 'cart';
      default:
        return 'ellipsis-horizontal-circle';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return theme.colors.success;
      case 'withdrawal':
        return theme.colors.error;
      case 'transfer':
        return theme.colors.info;
      case 'payment':
        return theme.colors.warning;
      default:
        return theme.colors.text;
    }
  };

  const formatAmount = (amount: number, type: Transaction['type']) => {
    const prefix = type === 'deposit' ? '+' : '-';
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isPositive = item.type === 'deposit';
    const iconName = isPositive ? 'arrow-down-circle' : 'arrow-up-circle';
    const iconColor = isPositive ? '#4CAF50' : '#F44336';

    return (
      <TouchableOpacity
        style={[styles.transactionItem, { backgroundColor: '#fff' }]}
        onPress={() => router.push(`/transaction/${item.id}`)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}10` }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
            {isPositive ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
          </Text>
          <Text style={[styles.status, { color: item.status === 'completed' ? '#4CAF50' : '#FFA000' }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText variant="body" style={styles.loadingText}>
          Loading wallet information...
        </ThemedText>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ErrorBoundary>
        <ThemedText variant="title" style={styles.title}>
          OneSocial Wallet
        </ThemedText>
        <ThemedText variant="subtitle" style={styles.subtitle} color={theme.colors.textSecondary}>
          Total Balance
        </ThemedText>
        <ThemedText variant="title" style={styles.balance} color={theme.colors.success}>
          ${(wallet?.balance || 0).toFixed(2)}
        </ThemedText>
        <ThemedText variant="caption" style={styles.balanceUpdated} color={theme.colors.textSecondary}>
          {wallet?.updated_at 
            ? `Last updated: ${formatDistanceToNow(new Date(wallet.updated_at), { addSuffix: true })}`
            : 'No transactions yet'}
        </ThemedText>
        {profile?.WalletAddress && (
          <TouchableOpacity 
            onPress={() => {
              console.info('Navigating to CryptoWallets');
              console.info('Wallet Address:', profile.WalletAddress);
              Alert.alert('Coming Soon', 'Crypto wallet features will be available soon!');
            }}
          >
            <ThemedText variant="caption" style={styles.walletAddress} color={theme.colors.textSecondary}>
              <Ionicons name="wallet-outline" size={16} color="#6200EE" />
              {profile.WalletAddress}
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/(app)/send-money')}
          >
            <Ionicons name="send" size={24} color={theme.colors.primary} />
            <ThemedText variant="label" style={styles.actionText} color={theme.colors.text}>
              Send
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/(app)/add-money')}
          >
            <Ionicons name="add-circle" size={24} color={theme.colors.success} />
            <ThemedText variant="label" style={styles.actionText} color={theme.colors.text}>
              Add
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/(app)/withdraw')}
          >
            <Ionicons name="cash" size={24} color={theme.colors.warning} />
            <ThemedText variant="label" style={styles.actionText} color={theme.colors.text}>
              Withdraw
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          <ThemedText variant="subtitle" style={styles.sectionTitle} color={theme.colors.text}>
            Recent Transactions
          </ThemedText>
          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} />
              <ThemedText variant="subtitle" style={styles.emptyText} color={theme.colors.text}>
                No transactions yet
              </ThemedText>
              <ThemedText variant="body" style={styles.emptySubtext} color={theme.colors.textSecondary}>
                Your transaction history will appear here once you start using your wallet.
              </ThemedText>
            </View>
          ) : (
            <>
              {transactions.map((transaction) => (
                <View key={transaction.id}>
                  {renderTransactionItem({ item: transaction })}
                </View>
              ))}
              {loadingMore && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              )}
            </>
          )}
        </View>

        {/* Portfolio Section */}
        <View style={styles.portfolioSection}>
          <ThemedText variant="subtitle" style={styles.portfolioTitle}>
            Your Portfolio
          </ThemedText>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : portfolio.length === 0 ? (
            <View style={styles.emptyPortfolio}>
              <Ionicons 
                name="wallet-outline" 
                size={48} 
                color={theme.colors.textSecondary} 
              />
              <ThemedText 
                variant="subtitle" 
                style={styles.emptyText} 
                color={theme.colors.text}
              >
                No crypto assets yet
              </ThemedText>
              <ThemedText 
                variant="body" 
                style={styles.emptySubtext} 
                color={theme.colors.textSecondary}
              >
                Start building your crypto portfolio by adding some assets.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={portfolio}
              renderItem={renderPortfolioItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.portfolioList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.colors.primary}
                />
              }
            />
          )}
        </View>
      </ErrorBoundary>
    </SafeAreaView>
  );
};

const baseStyles: { emptyState: ViewStyle } = {
  emptyState: {
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  title: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  balance: {
    textAlign: 'center',
    marginVertical: 8,
  },
  balanceUpdated: {
    textAlign: 'center',
    marginBottom: 16,
  },
  walletAddress: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    width: '28%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyContainer: {
    ...baseStyles.emptyState,
  },
  emptyPortfolio: {
    ...baseStyles.emptyState,
    justifyContent: 'center',
    padding: 24,
    marginTop: 32,
  },
  loadingMore: {
    paddingVertical: 16,
  },
  portfolioSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  portfolioTitle: {
    marginBottom: 16,
  },
  portfolioList: {
    paddingBottom: 16,
  },
  portfolioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  coinInfo: {
    flex: 1,
  },
  coinSymbol: {
    fontWeight: '600',
  },
  coinName: {
    marginTop: 4,
  },
  coinValues: {
    alignItems: 'flex-end',
  },
  coinBalance: {
    fontWeight: '600',
  },
  coinChange: {
    marginTop: 4,
  },
});

export default Wallet;