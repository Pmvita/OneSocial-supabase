import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ariozxarvrcjajevcwjn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyaW96eGFydnJjamFqZXZjd2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NTAyOTIsImV4cCI6MjA1MjIyNjI5Mn0.ifdrG8yZqJDq96k8vSCU9B-t3XJuuiaivPs5_lmNINQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,   // Ensure auto-refresh token is enabled
    persistSession: true,     // Persist session so it's available on app restart
    detectSessionInUrl: false, // Detect session in URL (for deep linking purposes)
  },
});

// Tells Supabase Auth to continuously refresh the session when the app is in the foreground
// and stop it when the app is in the background
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();  // Start token refresh when the app is active
  } else {
    supabase.auth.stopAutoRefresh();   // Stop token refresh when the app goes to background
  }
});

export default supabase;