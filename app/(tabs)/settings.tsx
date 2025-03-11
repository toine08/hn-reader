import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Linking } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/Colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [defaultPage, setDefaultPage] = useState<string>("index");

  const pages = [
    { id: "index", title: "Best", icon: "star" },
    { id: "topStories", title: "Trending", icon: "fire-alt" },
    { id: "newStories", title: "Latest", icon: "clock" },
    { id: "jobStories", title: "Job board", icon: "briefcase" },
    { id: "bookmarks", title: "Bookmarks", icon: "bookmark" },
  ];

  useEffect(() => {
    const loadDefaultPage = async () => {
      try {
        const storedPage = await AsyncStorage.getItem("defaultPage");
        if (storedPage) {
          setDefaultPage(storedPage);
        }
      } catch (error) {
        console.error("Error loading default page setting:", error);
      }
    };

    loadDefaultPage();
  }, []);

  const selectDefaultPage = async (pageId: string) => {
    try {
      await AsyncStorage.setItem("defaultPage", pageId);
      setDefaultPage(pageId);
    } catch (error) {
      console.error("Error saving default page setting:", error);
    }
  };

  const handleEmailPress = () => {
    const email = 'toto8@duck.com';
    const subject = 'My honest feedback';
    const body = "That's an amazing app dude";
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoLink)
      .catch(err => console.error('An error occurred', err));
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-6 text-black dark:text-white">
          Settings
        </Text>

        <View className="mb-6 rounded-lg overflow-hidden">
          <Text className="text-lg font-bold mb-2 text-zinc-800 dark:text-zinc-200">
            Default Landing Page
          </Text>
          <Text className="mb-4 text-zinc-600 dark:text-zinc-400 text-sm">
            Choose which page to show when you open the app
          </Text>

          {pages.map((page) => (
            <TouchableOpacity
              key={page.id}
              className={`flex-row items-center justify-between py-4 px-4 border-b border-zinc-100 dark:border-zinc-800 
                ${
                  defaultPage === page.id ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
              onPress={() => selectDefaultPage(page.id)}
            >
              <View className="flex-row items-center">
                <FontAwesome5
                  name={page.icon as any}
                  size={18}
                  color={colorScheme === "dark" ? "#d4d4d8" : "#52525b"}
                  style={{ marginRight: 12 }}
                />
                <Text className="text-base text-zinc-700 dark:text-zinc-300">
                  {page.title}
                </Text>
              </View>

              {defaultPage === page.id && (
                <FontAwesome5
                  name="check"
                  size={18}
                  color={Colors[colorScheme ?? "light"].tint}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View>
          <Text className="border-t-2 dark:border-t-orange-600 pt-4 text-lg font-bold mb-2 text-zinc-800 dark:text-zinc-200">
            Thank you !
          </Text>
          <Text className=" mb-4 text-zinc-600 dark:text-zinc-400 text-sm">
            Thank you for having downloading this app. Please if you enjoy it or not. I would be happy to have your feedback on it. You can give it directly from the appstore or you can reach me at{" "}
            <Text 
              className="text-blue-500 underline" 
              onPress={handleEmailPress}
            >
              toto8@duck.com
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
