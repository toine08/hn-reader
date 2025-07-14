import React, { memo, useState } from "react";
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { ListItemProps } from "@/utils/interfaces";
import LinkPreview from "./LinkPreview";
import OfflineReader from "./OfflineReader";
import { useRouter } from "expo-router";
import { Article } from "@/utils/types";
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';

const ListItem: React.FC<ListItemProps> = memo(({
  item,
  type,
  storyType,
  onPressSave,
  onPressTrash,
  onPressComments,
  savedArticles,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [showOfflineReader, setShowOfflineReader] = useState(false);
  const isSaved = savedArticles.includes(item.id);
  const isSelfPost = !item.url && item.text;
  const isOfflineAvailable = (item as Article).isOfflineAvailable;

  const handleToggleSave = () => {
    if (isSaved) {
      onPressTrash?.(item.id); // Removes bookmarked item
    } else {
      onPressSave?.(item);    // Saves new item
    }
  };

  const handleArticlePress = async () => {
    // If it's a saved article with offline content, show option to read offline
    if (isSaved && isOfflineAvailable && storyType === "bookmarks") {
      setShowOfflineReader(true);
      return;
    }

    // If it's a self post, navigate to dedicated post page
    if (isSelfPost) {
      router.push(`/post/${item.id}`);
    }
    // If there's a URL, open it in the browser
    else if (item.url) {
      const options = {
        readerMode: true
      };
      await WebBrowser.openBrowserAsync(item.url, options);
    }
  };

  const handleOfflineRead = () => {
    setShowOfflineReader(true);
  };

  if (!item) return null;

  return (
    <View className="border-b border-zinc-200 dark:border-zinc-800">
      <View className="p-4">
        {/* Title Section */}
        <TouchableOpacity onPress={handleArticlePress}>
          <View className="mb-3">
            <View className="flex-row items-start justify-between">
              <Text 
                className="text-base font-medium text-black dark:text-white flex-1 mr-2"
                numberOfLines={2}
              >
                {(item as Article).title}
              </Text>
              {/* Offline indicator */}
              {isOfflineAvailable && (
                <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                  <FontAwesome name="download" size={12} color="#22c55e" />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
         {/* Buttons Section */}
         <View className="flex-row gap-3 mb-3">
          {storyType === "bookmarks" ? (
            // Bookmarks view - Delete button and Read Offline if available
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => onPressTrash?.(item.id)}
                className="bg-red-600 px-3 py-2 rounded-md"
              >
                <Text className="text-white text-sm">Delete</Text>
              </TouchableOpacity>
              
              {isOfflineAvailable && (
                <TouchableOpacity
                  onPress={handleOfflineRead}
                  className="bg-green-600 px-3 py-2 rounded-md"
                >
                  <Text className="text-white text-sm">Read Offline</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Other views - Toggling Save/Delete
            <TouchableOpacity
              onPress={handleToggleSave}
              className={`px-3 py-2 rounded-md ${
                isSaved ? "bg-red-600" : "bg-orange-600"
              }`}
            >
              <Text className="text-white text-sm">
                {isSaved ? "Delete" : "Save"}
              </Text>
            </TouchableOpacity>
          )}

          {onPressComments && (
            <TouchableOpacity 
              onPress={onPressComments}
              className="bg-zinc-200 dark:bg-zinc-800 px-3 py-2 rounded-md"
            >
              <Text className="text-black dark:text-white text-sm">
                Comments {item.descendants && item.descendants > 0 ? `(${item.descendants})` : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Self Post Preview */}
        {isSelfPost && (
          <TouchableOpacity onPress={handleArticlePress}>
            <View className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-md mt-1">
              <Text 
                className="text-sm text-black dark:text-white" 
                numberOfLines={3}
              >
                {item.text ? item.text.replace(/<[^>]*>/g, '') : ''}
              </Text>
              {item.text && item.text.length > 150 && (
                <Text className="text-blue-500 mt-1">Read more...</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Link Preview Section */}
        {item.url && (
          <TouchableOpacity onPress={handleArticlePress}>
            <View className="pt-2">
              <LinkPreview url={item.url} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Offline Reader Modal */}
      <Modal
        visible={showOfflineReader}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
          <View className="flex-row justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <Text className="text-lg font-semibold text-black dark:text-white">
              Offline Reader
            </Text>
            <TouchableOpacity 
              onPress={() => setShowOfflineReader(false)}
              className="p-3 -mr-1 bg-gray-100 dark:bg-gray-800 rounded-full"
            >
              <FontAwesome name="close" size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          <OfflineReader 
            article={item as Article} 
            onClose={() => setShowOfflineReader(false)}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
});

export default ListItem;

