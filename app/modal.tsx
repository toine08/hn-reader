import { StatusBar } from "expo-status-bar";
import { Platform, Button, SafeAreaView, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { Text, View } from "@/components/Themed";
import { getAllComments, getLocalTime, storeData } from "@/utils/lib";
import RenderHTML from "react-native-render-html";
import { useColorScheme } from "@/components/useColorScheme";

interface Comment {
  id: number;
  text: string;
  by: string;
  score: number;
  time: number;
  // Add other properties of a comment here
}

interface StoryTypeModalProps {
  item: number;
  kids: number[];
}

export default function StoryTypeModal({ item, kids }: StoryTypeModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchComments = async () => {
      const data: any = await getAllComments(kids);
      setComments(data);
    };

    fetchComments();
  }, [kids]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black h-full">
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View className="flex-1 bg-neutral-100 dark:bg-zinc-900 w-fit border-b-2 border-orange-100">
        <Text className="text-base text-black dark:text-white font-bold">{item.by}:</Text>
          <RenderHTML
            baseStyle={{ color: colorScheme === 'dark' ? 'white' : 'black' }}
            contentWidth={100}
            source={{ html: item.text }}
          />
          <Text className="text-base h-auto text-black dark:text-white">
          {getLocalTime(item.time)}
        </Text>
        </View>
      )}
    />
    <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
  </SafeAreaView>
  );
}
