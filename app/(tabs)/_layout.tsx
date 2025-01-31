import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
      }}
    >
      <Tabs.Screen
        name="topStories"
        options={{
          title: "Top stories",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="arrow-up" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="newStories"
        options={{
          title: "New stories",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="heart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Best stories",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="hacker-news" color={color} />
          ),
        }}
      />
       <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bookmark-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobStories"
        options={{
          title: "Job stories",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="search" color={color} />
          ),
        }}
      />
     
    </Tabs>
  );
}
