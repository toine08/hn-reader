import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from "react";
import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/components/useColorScheme';
import FirstTimeNewsletterModal from '@/components/FirstTimeNewsletterModal';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Ignore specific warnings
LogBox.ignoreLogs([
  'Support for defaultProps will be removed from function components in a future major release.',
]);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [hasCheckedFirstTime, setHasCheckedFirstTime] = useState(false);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const hasSeenModal = await AsyncStorage.getItem('hasSeenNewsletterModal');
        if (!hasSeenModal) {
          // Small delay to ensure app is fully loaded
          setTimeout(() => {
            setShowNewsletterModal(true);
          }, 1500);
        }
        setHasCheckedFirstTime(true);
      } catch (error) {
        console.error('Error checking first time newsletter modal:', error);
        setHasCheckedFirstTime(true);
      }
    };

    checkFirstTime();
  }, []);

  const handleNewsletterAccept = async () => {
    try {
      await AsyncStorage.setItem('hasSeenNewsletterModal', 'true');
      setShowNewsletterModal(false);
      // Navigate to settings page
      router.push('/(tabs)/settings');
    } catch (error) {
      console.error('Error saving newsletter modal preference:', error);
    }
  };

  const handleNewsletterDecline = async () => {
    try {
      await AsyncStorage.setItem('hasSeenNewsletterModal', 'true');
      setShowNewsletterModal(false);
    } catch (error) {
      console.error('Error saving newsletter modal preference:', error);
    }
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <>
        <Stack screenOptions={{
          headerBackTitle: "Back",  // This sets the default back button text for all screens
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="post/[id]" options={{ 
            headerTitle: 'Post',
            animation: 'slide_from_right',
            headerBackTitle: "Home"  // This specifically sets the back button text for this screen
          }} />
        </Stack>
        
        {/* First-time newsletter modal */}
        {hasCheckedFirstTime && (
          <FirstTimeNewsletterModal
            visible={showNewsletterModal}
            onAccept={handleNewsletterAccept}
            onDecline={handleNewsletterDecline}
          />
        )}
      </>
    </ThemeProvider>
  );
}
