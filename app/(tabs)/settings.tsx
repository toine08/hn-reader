import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Linking, ScrollView, Alert } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/Colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import NewsletterForm from "@/components/NewsletterForm";
import { getStorySaved, addOfflineContentToSavedArticle, saveArticle, getStoryData, saveArticleWithOfflineContent } from "@/utils/lib";
import { Article } from "@/utils/types";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [defaultPage, setDefaultPage] = useState<string>("index");
  const [offlineStats, setOfflineStats] = useState<{
    total: number;
    offline: number;
    loading: boolean;
  }>({
    total: 0,
    offline: 0,
    loading: false
  });

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

    const loadOfflineStats = async () => {
      try {
        const savedArticles = await getStorySaved();
        const offlineCount = savedArticles.filter(article => article.isOfflineAvailable).length;
        setOfflineStats({
          total: savedArticles.length,
          offline: offlineCount,
          loading: false
        });
      } catch (error) {
        console.error("Error loading offline stats:", error);
      }
    };

    loadDefaultPage();
    loadOfflineStats();
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

  const downloadAllOfflineContent = async () => {
    try {
      setOfflineStats(prev => ({ ...prev, loading: true }));
      
      const savedArticles = await getStorySaved();
      const articlesWithoutOffline = savedArticles.filter(article => !article.isOfflineAvailable);
      
      if (articlesWithoutOffline.length === 0) {
        Alert.alert(
          "All Set!",
          "All your bookmarked articles already have offline content available."
        );
        setOfflineStats(prev => ({ ...prev, loading: false }));
        return;
      }

      Alert.alert(
        "Download Offline Content",
        `Download offline content for ${articlesWithoutOffline.length} articles? This may take a moment.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Download",
            onPress: async () => {
              let successCount = 0;
              
              for (const article of articlesWithoutOffline) {
                try {
                  const success = await addOfflineContentToSavedArticle(article.id);
                  if (success) successCount++;
                } catch (error) {
                  console.error(`Error downloading content for article ${article.id}:`, error);
                }
              }
              
              // Refresh stats
              const updatedArticles = await getStorySaved();
              const updatedOfflineCount = updatedArticles.filter(article => article.isOfflineAvailable).length;
              
              setOfflineStats({
                total: updatedArticles.length,
                offline: updatedOfflineCount,
                loading: false
              });
              
              Alert.alert(
                "Download Complete",
                `Successfully downloaded offline content for ${successCount} out of ${articlesWithoutOffline.length} articles.`
              );
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error downloading offline content:", error);
      setOfflineStats(prev => ({ ...prev, loading: false }));
      Alert.alert("Error", "Failed to download offline content.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold mb-6 text-black dark:text-white">
            Settings
          </Text>

          {/* Newsletter Section */}
          <NewsletterForm />

          {/* Offline Content Management Section */}
          <View className="mb-6 rounded-lg overflow-hidden">
            <Text className="text-lg font-bold mb-2 text-zinc-800 dark:text-zinc-200">
              Offline Reading
            </Text>
            <Text className="mb-4 text-zinc-600 dark:text-zinc-400 text-sm">
              Manage offline content for your bookmarked articles
            </Text>

            <View className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  Bookmarked articles:
                </Text>
                <Text className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {offlineStats.total}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  Available offline:
                </Text>
                <Text className="text-sm font-semibold text-green-600">
                  {offlineStats.offline}
                </Text>
              </View>

              {offlineStats.total > 0 && (
                <View className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-3">
                  <View 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${(offlineStats.offline / offlineStats.total) * 100}%` 
                    }}
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              className={`flex-row items-center justify-center py-3 px-4 rounded-lg ${
                offlineStats.loading 
                  ? "bg-zinc-300 dark:bg-zinc-700" 
                  : "bg-blue-500 dark:bg-blue-600"
              }`}
              onPress={downloadAllOfflineContent}
              disabled={offlineStats.loading}
            >
              <FontAwesome5
                name={offlineStats.loading ? "spinner" : "download"}
                size={16}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold">
                {offlineStats.loading 
                  ? "Downloading..." 
                  : "Download All Offline Content"
                }
              </Text>
            </TouchableOpacity>

            {/* Test Save Article Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center py-3 px-4 rounded-lg bg-green-500 dark:bg-green-600 mt-3"
              onPress={async () => {
                try {
                  // Test with a real HN article
                  const testArticle = await getStoryData(44556684); // Use the article from logs
                  if (testArticle) {
                    const success = await saveArticleWithOfflineContent(testArticle);
                    Alert.alert(
                      success ? "Success" : "Info",
                      success ? "Test article saved successfully with offline content!" : "Article was already saved or updated with offline content"
                    );
                    // Refresh stats
                    const updatedArticles = await getStorySaved();
                    const updatedOfflineCount = updatedArticles.filter(article => article.isOfflineAvailable).length;
                    setOfflineStats({
                      total: updatedArticles.length,
                      offline: updatedOfflineCount,
                      loading: false
                    });
                  }
                } catch (error) {
                  console.error("Error testing save:", error);
                  Alert.alert("Error", "Failed to test save article");
                }
              }}
            >
              <FontAwesome5
                name="plus"
                size={16}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold">
                Test Save Article
              </Text>
            </TouchableOpacity>

            {/* Test HTML Cleaning Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center py-3 px-4 rounded-lg bg-purple-500 dark:bg-purple-600 mt-3"
              onPress={() => {
                // Test HTML content with problematic URLs
                const testHtml = `
                  <div>
                    <p>This is a test article.</p>
                    <img src="about:///blank" alt="problematic">
                    <a href="about:///blank">Bad link</a>
                    <img src="blob:test" alt="blob">
                    <script>alert('bad');</script>
                    <p>This should remain visible.</p>
                    <img src="https://example.com/good.jpg" alt="good">
                  </div>
                `;
                
                // This would show us what our cleaning function does
                console.log('Original HTML:', testHtml);
                
                Alert.alert(
                  "HTML Cleaning Test",
                  "Check console logs to see the HTML cleaning results. The cleaned content should remove all about:, blob:, and script tags while keeping valid content."
                );
              }}
            >
              <FontAwesome5
                name="code"
                size={16}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold">
                Test HTML Cleaning
              </Text>
            </TouchableOpacity>
          </View>

          {/* Default Page Section */}
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
      </ScrollView>
    </SafeAreaView>
  );
}
