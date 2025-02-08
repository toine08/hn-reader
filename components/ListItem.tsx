import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { ListItemProps } from "@/utils/interfaces";
import LinkPreview from "./LinkPreview";
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
  const isSaved = savedArticles.includes(item.id);

  const handleToggleSave = () => {
    if (isSaved) {
      onPressTrash?.(item.id); // Removes bookmarked item
    } else {
      onPressSave?.(item);    // Saves new item
    }
  };

  const handleArticlePress = async () => {
    const options = {
      readerMode: true
    };
    if (item.url) {
      await WebBrowser.openBrowserAsync(item.url,options);
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
              <Text className="text-black dark:text-white text-sm">Comments</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Link Preview Section */}
        {item.url && (
          <TouchableOpacity onPress={handleArticlePress}>
            <View className="border-t pt-3">
              <LinkPreview url={item.url} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
)
})
export default ListItem;

