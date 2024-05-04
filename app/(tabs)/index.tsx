import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import getData, { getLocalTime } from "../../utils/lib";
import FloatingButton from "@/components/FloatingButton";
import { FontAwesome } from "@expo/vector-icons";
import { storeData } from "@/utils/lib";
import ListItem from "@/components/ListItem";

const PAGE_SIZE = 20; // Number of items to render at once

export default function TabOneScreen() {
  const [selectedStoryType, setSelectedStoryType] = useState("topstories");
  const [stories, setStories] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadStories = async () => {
      const newStories = await getData(selectedStoryType, page);
      setStories((oldStories) => [...oldStories, ...newStories]);
    };
  
    loadStories();
  }, [selectedStoryType, page]);
  
  const loadMoreStories = () => {
    setPage((oldPage) => oldPage + 1);
  };
  
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <View className="">
        <FlatList
          className="bg-transparent h-full w-auto"
          data={stories.slice(0, (page + 1) * PAGE_SIZE)}
          keyExtractor={(item, index) => `${item.id}`}
          renderItem={({ item }) => <ListItem type="save" item={item} onPressSave={() => {
            console.log("Save pressed");
            storeData({
              key: "article",
              data: item.id,
            });
          }} />}          
          onEndReached={loadMoreStories}
          onEndReachedThreshold={0.2}
        />
      </View>
    </SafeAreaView>
  );
}