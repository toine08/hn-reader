import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { getLocalTime } from "@/utils/lib";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useColorScheme } from "@/components/useColorScheme";
import LinkPreview from "./LinkPreview";

export default function ListItem({
  type,
  item,
  onPressSave,
  onPressTrash,
  onPressComments,
}: {
  type: keyof typeof FontAwesome.glyphMap;
  item: any;
  onPressSave?: () => void;
  onPressTrash?: () => Promise<void>;
  onPressComments: () => void;
}) {
  const handlePress = () => {
    if (type === "trash" && onPressTrash) {
      onPressTrash();
    } else if (onPressSave) {
      onPressSave();
    }
  };
  const colorScheme = useColorScheme();
  const orange = "#FF6000";

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-zinc-900 w-fit border-b-2 border-orange-100">
      <TouchableOpacity
        className=" justify-between p-1 pb-4"
        onPress={() => {
          WebBrowser.openBrowserAsync(item.url, { readerMode: true });        }}
      >
        <Text className="text-base h-auto text-black dark:text-white">
          {item.title}
        </Text>
        <Text className="mt-2 text-base h-auto text-black dark:text-white">
          <Text className="font-extrabold">By:</Text> {item.by}
        </Text>

        <TouchableOpacity
          onPress={onPressComments}
          className="flex-1 flex-row mt-2"
        >
          <Text className="text-base h-auto text-black dark:text-white mr-2">
            {item.kids?.length || 0}
          </Text>
          <FontAwesome
            name="comments"
            size={24}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
      <View className="p-2 justify-between flex-row items-center">
        <Text className="text-base h-auto text-black dark:text-white">
          {getLocalTime(item.time)}
        </Text>
        <View className="flex-row gap-4">
        <Text className="text-base h-auto ml-1 text-black dark:text-white">
          {item.score} <FontAwesome name="arrow-up" size={24} color={orange} />{" "}
        </Text>

        <TouchableOpacity onPress={handlePress}>
          <FontAwesome
            name={type}
            size={24}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
        </View>

      </View>
      <View className="h-16 bg-red-500 mb-2">
      <LinkPreview url={item.url} />

      </View>
    </View>
  );
}
