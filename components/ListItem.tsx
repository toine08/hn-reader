import React, { memo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { ListItemProps } from "@/utils/interfaces";
import LinkPreview from "./LinkPreview";
import OfflineReader from "./OfflineReader";
import { useRouter } from "expo-router";
import { Article } from "@/utils/types";
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useRightHandMode } from '@/contexts/RightHandModeContext';

const ListItem: React.FC<ListItemProps> = memo(({
  item,
  type,
  storyType,
  onPressSave,
  onPressTrash,
  onPressComments,
  onPressDownloadOffline,
  downloadingOfflineIds,
  savedArticles,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isRightHandMode } = useRightHandMode();
  const [showOfflineReader, setShowOfflineReader] = useState(false);
  const isSaved = savedArticles.includes(item.id);
  const isSelfPost = !item.url && item.text;
  const isOfflineAvailable = (item as Article).isOfflineAvailable;
  const isDownloadingOffline = downloadingOfflineIds?.has(item.id) || false;

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
         <View className={`flex-row gap-4 items-center ${isRightHandMode ? 'justify-end' : ''}`}>
          {storyType === "bookmarks" ? (
            // Bookmarks view - Delete icon, Comments icon, and Download icon
            <View className={`flex-row gap-4 items-center ${isRightHandMode ? 'flex-row-reverse' : ''}`}>
              <TouchableOpacity
                onPress={() => onPressTrash?.(item.id)}
                className="p-2"
              >
                <FontAwesome name="trash" size={18} color="#ef4444" />
              </TouchableOpacity>
              
              {onPressComments && (
                <TouchableOpacity 
                  onPress={onPressComments}
                  className="p-2"
                >
                  <FontAwesome name="comment" size={18} color="#3b82f6" />
                </TouchableOpacity>
              )}
              
              {!isOfflineAvailable && (
                <TouchableOpacity
                  onPress={() => onPressDownloadOffline?.(item.id)}
                  disabled={isDownloadingOffline}
                  className="p-2"
                >
                  <FontAwesome 
                    name={isDownloadingOffline ? "spinner" : "download"} 
                    size={18} 
                    color={isDownloadingOffline ? "#71717a" : "#22c55e"}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Other views - Save/Delete toggle with icon-only style
            <TouchableOpacity
              onPress={handleToggleSave}
              className="p-2"
            >
              <FontAwesome 
                name={isSaved ? "trash" : "bookmark"} 
                size={18} 
                color={isSaved ? "#ef4444" : "#f97316"} 
              />
            </TouchableOpacity>
          )}

          {/* Comments button for non-bookmarks tabs */}
          {storyType !== "bookmarks" && onPressComments && (
            <TouchableOpacity 
              onPress={onPressComments}
              className="p-2"
            >
              <FontAwesome name="comment" size={18} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>

        {/* Self Post Preview */}
        {isSelfPost && (
          <TouchableOpacity onPress={handleArticlePress}>
            <View className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-md mt-3">
              <Text 
                className="text-sm text-black dark:text-white" 
                numberOfLines={3}
              >
                {item.text ? item.text.replace(/<[^>]*>/g, '') : ''}
              </Text>
              {item.text && item.text.length > 150 && (
                <Text className="text-orange-500 dark:text-orange-400 mt-1">Read more...</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Link Preview Section */}
        {item.url && (
          <TouchableOpacity onPress={handleArticlePress}>
            <View className={`${isSelfPost ? "pt-2" : "pt-3"}`}>
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
        <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['left', 'right', 'bottom']}>
          <View className="flex-row justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <Text className="text-lg font-semibold text-black dark:text-white">
              Offline Reader
            </Text>
            <TouchableOpacity 
              onPress={() => setShowOfflineReader(false)}
              className="p-3 -mr-1 bg-zinc-100 dark:bg-zinc-700 rounded-full"
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

