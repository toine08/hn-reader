import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { ListItemProps } from "@/utils/interfaces";
import LinkPreview from "./LinkPreview";
import { useRouter } from "expo-router";
import { Article } from "@/utils/types";

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
  const isSaved = savedArticles.includes(item.id);
  const isSelfPost = !item.url && item.text;

  const handleToggleSave = () => {
    if (isSaved) {
      onPressTrash?.(item.id); // Removes bookmarked item
    } else {
      onPressSave?.(item);    // Saves new item
    }
  };

  const handleArticlePress = async () => {
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

  if (!item) return null;

  return (
    <View className="border-b border-zinc-200 dark:border-zinc-800">
      <View className="p-4">
        {/* Title Section */}
        <TouchableOpacity onPress={handleArticlePress}>
          <View className="mb-3">
            <Text 
              className="text-base font-medium text-black dark:text-white"
              numberOfLines={2}
            >
              {(item as Article).title}
            </Text>
          </View>
        </TouchableOpacity>
        
         {/* Buttons Section */}
         <View className="flex-row gap-3 mb-3">
          {storyType === "bookmarks" ? (
            // Only Delete button
            <TouchableOpacity
              onPress={() => onPressTrash?.(item.id)}
              className="bg-red-600 px-3 py-2 rounded-md"
            >
              <Text className="text-white text-sm">Delete</Text>
            </TouchableOpacity>
          ) : (
            // Toggling Save/Delete
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
    </View>
  );
});

export default ListItem;

