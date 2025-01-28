import { Text } from 'react-native';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js'; // Import User type from Supabase
import supabase from '../lib/supabase'; // Your custom supabase client

interface AuthContextType {
  user: User | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  initializing: true,
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (initializing) setInitializing(false);
    });

    // Cleanup using a different approach, remove listener manually by returning the cleanup function
    return () => {
      // Reset user state on unmount
      setUser(null);
    };
  }, [initializing]);

  if (initializing) {
    return <Text>Loading...</Text>; // Optionally show a loading screen
  }

  return (
    <AuthContext.Provider value={{ user, initializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };