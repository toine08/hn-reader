import React, { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import TabOneScreen from ".";
import StoryTypeModal from "../modal";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
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
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "New stories",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="hacker-news" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="three"
        options={{
          title: "Top stories",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="arrow-up" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="four"
        options={{
          title: "Best stories",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="heart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="five"
        options={{
          title: "Job stories",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="search" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bookmark-o" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
