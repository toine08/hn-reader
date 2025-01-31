import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
} from "react-native";
import { getStories, getStoryData } from "@/utils/lib";
import { storeData } from "@/utils/lib";
import ListItem from "@/components/ListItem";
import StoryTypeModal from "../modal";
import { FontAwesome } from "@expo/vector-icons";
import LoadingPlaceholder from "@/components/LoadingPlaceholder";
import { useColorScheme } from "@/components/useColorScheme";

const LoadingView = () => (
  <View>
    <LoadingPlaceholder />
    <LoadingPlaceholder />
    <LoadingPlaceholder />
  </View>
);

export default function bestStoriesScreen() {
  const colorScheme = useColorScheme();

  const [selectedStoryType, setSelectedStoryType] = useState("beststories");
  const [stories, setStories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Add a loading state
  const [refreshing, setRefreshing] = useState(false);

  const windowHeight = Dimensions.get('window').height;
  const ITEM_HEIGHT = 150; // Approximate height of each item
  const VISIBLE_ITEMS = Math.ceil(windowHeight / ITEM_HEIGHT * 2); // Double the visible items

  const PAGE_SIZE = 100; 

  const handlePressComments = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const onPressSave = useCallback((item: any) => {
    // Add item as a parameter
    console.log("Save pressed");
    storeData({
      key: "article",
      data: item.id,
    });
  }, []);

  const onPressComments = useCallback(
    (item: any) => handlePressComments(item),
    []
  ); // Add item as a parameter

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const loadMoreStories = () => {
    setPage((oldPage) => oldPage + 1);
  };

  const loadStories = async () => {
    try {
      const newStories = await getStories(selectedStoryType, page);  // Use getStories instead of getStoryData
      setStories((oldStories) => [...oldStories, ...newStories]);
      setPage((oldPage) => oldPage + 1); // Increment the page number
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadStories();
  }, [page]);

  return (
    <SafeAreaView className="flex-1 w-fit items-center justify-center bg-white dark:dark:bg-zinc-900">
      <TouchableOpacity
        onPress={() => {
          loadStories();
          console.log("Button pressed");
        }}
        className="hidden top-0 p-3 pt-1 pb-1 flex-row h-fit w-28 z-10 absolute bg-zinc-900 opacity-90 rounded-md items-center justify-between"
      >
        <FontAwesome
          name="refresh"
          size={24}
          color={colorScheme === "dark" ? "white" : "black"}
        />
        <Text className="text-lg ml-2 text-black dark:text-white">Refresh</Text>
      </TouchableOpacity>
      <View className="flex-1 w-full">
        <FlatList
          className="bg-white dark:bg-black h-full w-fit"
          windowSize={5}
          maxToRenderPerBatch={VISIBLE_ITEMS}
          initialNumToRender={VISIBLE_ITEMS}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          data={stories ? stories.slice(0, (page + 1) * PAGE_SIZE) : []} // Ensure stories is not null
          keyExtractor={(item) => item.id.toString()} // Ensure unique keys
          renderItem={({ item }) => (
            <ListItem
              type="save"
              storyType={selectedStoryType} // Pass the storyType prop
              item={item}
              onPressSave={() => onPressSave(item)} // Pass the correct item
              onPressComments={() => onPressComments(item)} // Pass the correct item
            />
          )}
          ListFooterComponent={loading ? <LoadingView /> : null} // Render LoadingView when loading
          onEndReached={loadMoreStories}
          onEndReachedThreshold={0.5}
          getItemLayout={getItemLayout}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />
      </View>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        className="m-0 flex-1 items-center justify-end w-full bg-white dark:bg-black h-60 bg-opacity-100"
      >
        <View className="bg-white dark:bg-black items-end">
          <TouchableOpacity
            className="mt-5 p-10"
            onPress={() => setModalVisible(false)}
          >
            <FontAwesome name="close" size={24} color={"red"} />
          </TouchableOpacity>
        </View>
        {selectedItem && (
          <StoryTypeModal item={selectedItem.id} kids={selectedItem.kids} />
        )}
      </Modal>
    </SafeAreaView>
  );
}
