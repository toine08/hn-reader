import React, { useEffect } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>["name"];
  color: string;
}) {
  return <FontAwesome5 size={28} style={{ marginBottom: -3  }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const checkDefaultPage = async () => {
      try {
        const defaultPage = await AsyncStorage.getItem('defaultPage');
        if (defaultPage) {
          // Use a more type-safe approach to navigation
          switch (defaultPage) {
            case 'topStories':
              router.replace({pathname: "/(tabs)/topStories"});
              break;
            case 'newStories':
              router.replace({pathname: "/(tabs)/newStories"});
              break;
            case 'index':
              router.replace({pathname: "/(tabs)"});
              break;
            case 'jobStories':
              router.replace({pathname: "/(tabs)/jobStories"});
              break;
            case 'bookmarks':
              router.replace({pathname: "/(tabs)/bookmarks"});
              break;
            case 'settings':
              router.replace({pathname: "/(tabs)/settings"});
              break;
            default:
              // Default to index if somehow an invalid value is stored
              router.replace({pathname: "/(tabs)"});
          }
        }
      } catch (error) {
        console.error('Error loading default page:', error);
      }
    };
    
    checkDefaultPage();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#18181b' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#27272a' : '#e4e4e7',
        },
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#71717a' : '#52525b',
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#18181b' : '#ffffff',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        tabBarShowLabel: false
      }}
    >
      <Tabs.Screen
        name="topStories"
        options={{
          title: "Trending",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="fire-alt" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="newStories"
        options={{
          title: "Latest",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="clock" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Best",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="star" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobStories"
        options={{
          title: "Job board",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="briefcase" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bookmark" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
