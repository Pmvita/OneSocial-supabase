import React from 'react';
import RootLayout from './Navigation/Navigation'; // Make sure this is correct
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider correctly
import { ThemeProvider } from '../context/ThemeContext'; // Adjust the path as needed


function App() {
  return (
    // Wrap the root layout with the AuthProvider
    <ThemeProvider>
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;