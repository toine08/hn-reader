import React, { memo } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { ListItemProps } from "@/utils/interfaces";
import { useColorScheme } from "@/components/useColorScheme";
import LinkPreview from "./LinkPreview";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { Article } from "@/utils/types";

const ListItem: React.FC<ListItemProps> = memo(({
  item,
  type,
  storyType,
  onPressSave,
  onPressTrash,
  onPressComments,
}) => {
  const colorScheme = useColorScheme();

  const handlePress = () => {
    if (type === "trash" && onPressTrash) {
      onPressTrash();
    } else if (onPressSave) {
      onPressSave();
    }
  };

  if (!item) return null;

  return (
    <View className="border-b border-zinc-200 dark:border-zinc-800">
      <View className="p-4">
        {/* Title Section */}
        <View className="mb-3">
          <Text 
            className="text-base font-medium text-black dark:text-white"
            numberOfLines={2}
          >
            {(item as Article).title}
          </Text>
        </View>
        
        {/* Buttons Section */}
        <View className="flex-row gap-3 mb-3">
          {storyType === "bookmarks" ? (
            <TouchableOpacity 
              onPress={onPressTrash}
              className="bg-red-600 px-3 py-2 rounded-md"
            >
              <Text className="text-white text-sm">Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handlePress}
              className="bg-orange-600 px-3 py-2 rounded-md"
            >
              <Text className="text-white text-sm">Save</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={onPressComments}
            className="bg-zinc-200 dark:bg-zinc-800 px-3 py-2 rounded-md"
          >
            <Text className="text-black dark:text-white text-sm">
              Comments
            </Text>
          </TouchableOpacity>
        </View>

        {/* Link Preview Section */}
        {item.url && (
          <View className="border-t pt-3">
            <LinkPreview url={item.url} />
          </View>
        )}
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return prevProps.item.id === nextProps.item.id &&
    prevProps.type === nextProps.type &&
    prevProps.storyType === nextProps.storyType;
});

ListItem.displayName = 'ListItem'; // For debugging

export default ListItem;

