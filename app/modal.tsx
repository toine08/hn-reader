import { StatusBar } from "expo-status-bar";
import { Platform, Button, SafeAreaView, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { Text, View } from "@/components/Themed";
import { getAllComments, getLocalTime, storeData } from "@/utils/lib";
import RenderHTML from "react-native-render-html";
import ListItem from "@/components/ListItem";

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

  useEffect(() => {
    const fetchComments = async () => {
      const data: any = await getAllComments(kids);
      setComments(data);
    };

    fetchComments();
  }, [kids]);

  return (
    <SafeAreaView className="flex-1 bg-black h-full">
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View className="bg-neutral-900 m-2 mb-3 w-fit rounded-lg shadow-sm mix-blend-lighten shadow-blue-300 p-4">
          <Text className="text-base text-white font-bold">{item.by}:</Text>
          <RenderHTML
            baseStyle={{ color: "white" }}
            contentWidth={100}
            source={{ html: item.text }}
          />
          <Text className="text-base h-auto text-white">
          {getLocalTime(item.time)}
        </Text>
        </View>
      )}
    />
    <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
  </SafeAreaView>
  );
}
