import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { getLocalTime, storeData } from "@/utils/lib";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function ListItem({ type, item, onPressSave, onPressTrash }: { type: keyof typeof FontAwesome.glyphMap, item: any, onPressSave?: () => void, onPressTrash?: () => Promise<void> }) {
    const handlePress = () => {
        if (type === 'trash' && onPressTrash) {
          onPressTrash();
        } else if (onPressSave) {
          onPressSave();
        }
      };
    
    return (
        <View className="flex-1 bg-neutral-900 m-2 mb-3 w-fit rounded-lg shadow-sm mix-blend-lighten shadow-blue-300">
          <TouchableOpacity
            className=" justify-between p-1 pb-4"
            onPress={() => {
              WebBrowser.openBrowserAsync(item.url);
            }}
          >
            <Text className="text-base h-auto text-white">{item.title}</Text>
          </TouchableOpacity>
          <View className="p-2 justify-between flex-row items-center">
            <Text className="text-base h-auto text-white">
              {getLocalTime(item.time)}
            </Text>
    
            <TouchableOpacity onPress={handlePress}>
      <FontAwesome name={type} size={24} color="white" />
    </TouchableOpacity>
          </View>
        </View>
      );
}