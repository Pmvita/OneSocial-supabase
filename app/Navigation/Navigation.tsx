import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import supabase from '../../lib/supabase';

// Import Screen
import Onboarding from '../(auth)/Onboarding';
import Login from '../(auth)/Login';
import SignUp from '../(auth)/SignUp';
import ForgotPassword from '../(auth)/ForgotPassword';
import TabLayout from './TabLayout';
import Messages from '../(tabs)/Messages/index';
import Settings from '../(tabs)/Settings';
import NewChat from '../(tabs)/Messages/NewChat';
import Chat from '../(tabs)/Messages/Chat';

const Stack = createStackNavigator();

const RootLayout = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Onboarding"
                screenOptions={{
                    headerShown: false,
                    // Apply fade transition
                    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
                    gestureEnabled: true, // Enable gestures for smooth transitions
                }}
            >
                <Stack.Screen name="Onboarding" component={Onboarding} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                <Stack.Screen name="Home" component={TabLayout} />
                <Stack.Screen name="Messages" component={Messages} />
                <Stack.Screen name="NewChat" component={NewChat} />
                <Stack.Screen name="Chat" component={Chat} />
                <Stack.Screen name="Settings" component={Settings} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootLayout;