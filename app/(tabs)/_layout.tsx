import React from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs } from "expo-router";
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
     
    </Tabs>
  );
}
