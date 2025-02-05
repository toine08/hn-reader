import React, { memo, useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import ListItem from "@/components/ListItem";
import { Article } from "@/utils/types";
import {ScrollViewProps} from '@/utils/interfaces'
import { getStories, saveArticle, storeData } from "@/utils/lib";
import LoadingPlaceholder from "./LoadingPlaceholder";

const params = {
  initialNumber: 5,
  ITEM_HEIGHT: 100, // Define ITEM_HEIGHT with an appropriate value
  PAGE_SIZE: 20,
};

export const ScrollView: React.FC<ScrollViewProps> = ({ story, onItemSelect }) => {
  const [selectedStoryType, setSelectedStoryType] = useState(story);
  const [stories, setStories] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      try {
        const newStories = await getStories(selectedStoryType, page);
        // Filter out any null or undefined stories
        const validStories = newStories.filter(
          (story): story is Article =>
            story != null && typeof story.id === "number"
        );
        setStories((oldStories) => [...oldStories, ...validStories]);
      } catch (error) {
        console.error("Error loading stories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [selectedStoryType, page]);

  const loadMoreStories = () => {
    setPage((oldPage) => oldPage + 1);
  };

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
    if (onItemSelect) {
        onItemSelect(item);  // Call the callback with selected item
      }
  };

  const onPressSave = useCallback((item: Article) => {
    // Add item as a parameter
    console.log("Save pressed");
    storeData({
      key: "article",
      data: item.id,
    });
  }, []);

  const onPressComments = useCallback(
    (item: Article) => handlePressComments(item),
    []
  ); // Add item as a parameter

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: params.ITEM_HEIGHT,
      offset: params.ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View className="flex-1 w-full">
      <FlatList
        className="bg-white dark:bg-black h-full w-fit"
        initialNumToRender={5}
        data={stories.slice(0, (page + 1) * params.PAGE_SIZE)}
        keyExtractor={(item) => item.id.toString()} // Ensure unique keys
        renderItem={({ item }) => (
          <ListItem
            type="save"
            storyType={selectedStoryType} // Add the required storyType prop
            item={item}
            onPressSave={() => onPressSave(item)} // Pass the correct item
            onPressComments={() => onPressComments(item)} // Pass the correct item
          />
        )}
        ListFooterComponent={loading ? <LoadingPlaceholder /> : null} // Render LoadingPlaceholder when loading
        onEndReached={loadMoreStories}
        onEndReachedThreshold={0.2}
        getItemLayout={getItemLayout}
      />
    </View>
  );
}
