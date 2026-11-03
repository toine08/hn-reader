import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from "react";
import { LogBox } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import FirstLaunchOnboarding from '@/components/FirstLaunchOnboarding';
import { RightHandModeProvider } from '@/contexts/RightHandModeContext';
import { ReaderModeProvider } from '@/contexts/ReaderModeContext';
import { UpdateBanner } from '@/components/UpdateBanner';
import * as Notifications from 'expo-notifications';
import { configureRevenueCat } from '@/utils/revenueCat';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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

  return (
    <>
      <RootLayoutNav />
      
      <FirstLaunchOnboarding ready={loaded} />
    </>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void configureRevenueCat().catch((error) => {
      console.error('RevenueCat initialization failed:', error);
    });
  }, []);

  return (
    <RightHandModeProvider>
      <ReaderModeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <UpdateBanner />
          <Stack screenOptions={{
            headerBackTitle: "Back",
          }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="reading-sprint" options={{
              headerTitle: 'Reading Sprint',
              headerShown: true,
              headerTransparent: false,
              headerStyle: {
                backgroundColor: colorScheme === 'dark' ? '#18181b' : '#ffffff',
              },
              headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#18181b',
            }} />
            <Stack.Screen name="post/[id]" options={{ 
              headerTitle: 'Post',
              animation: 'slide_from_right',
              headerBackTitle: "Home"
            }} />
          </Stack>
        </ThemeProvider>
      </ReaderModeProvider>
    </RightHandModeProvider>
  );
}
