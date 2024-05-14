import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Button
} from "react-native";
import getData from "../../utils/lib";
import { storeData } from "@/utils/lib";
import ListItem from "@/components/ListItem";
import StoryTypeModal from "../modal";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme.web";
import LoadingPlaceholder from '@/components/LoadingPlaceholder'; // Import your LoadingPlaceholder component


const PAGE_SIZE = 20; // Number of items to render at once

export default function newStoriesScreen() {
  const colorScheme = useColorScheme();
  const [selectedStoryType, setSelectedStoryType] = useState("newstories");
  const [stories, setStories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Add a loading state


  const ITEM_HEIGHT = 50; // Define ITEM_HEIGHT or import it if it's defined in another module

  const handlePressComments = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const onPressSave = useCallback((item: any) => { // Add item as a parameter
    console.log("Save pressed");
    storeData({
      key: "article",
      data: item.id,
    });
  }, []);

  const onPressComments = useCallback((item: any) => handlePressComments(item), []); // Add item as a parameter

  const getItemLayout = useCallback((_: any, index: number) => (
    {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
  ), []);

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true)
      const newStories = await getData(selectedStoryType, page);
      setStories((oldStories) => [...oldStories, ...newStories]);
      setLoading(false)
    };

    loadStories();
  }, [selectedStoryType, page]);

  const loadMoreStories = () => {
    setPage((oldPage) => oldPage + 1);
  };

  return (
    <SafeAreaView className="flex-1 w-fit items-center justify-center bg-white dark:dark:bg-zinc-900">
      <View className="flex-1 w-full">
        <FlatList
          className="bg-white dark:bg-black h-full w-fit"
          initialNumToRender={5}
          data={stories.slice(0, (page + 1) * PAGE_SIZE)}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <ListItem
              type="save"
              item={item}
              onPressSave={()=>{onPressSave}}
              onPressComments={()=>{onPressComments}}// Set the selected item when the comments icon is pressed
            />
          )}
          ListFooterComponent={loading ? LoadingPlaceholder : null} // Render LoadingPlaceholder when loading
          onEndReached={loadMoreStories}
          onEndReachedThreshold={0.2}
          getItemLayout={getItemLayout}
        />

      </View>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        className="m-0 flex-1 items-center justify-end w-full bg-white dark:bg-black h-60 bg-opacity-100"
      >
        <View className="bg-white dark:bg-black items-end">
        <TouchableOpacity className="mt-5 p-10" onPress={() => setModalVisible(false)}>
        <FontAwesome name="close" size={24} color={'red'} />
        </TouchableOpacity>
        </View>
        {selectedItem && (
          <StoryTypeModal item={selectedItem.id} kids={selectedItem.kids} />
        )}

      </Modal>
    </SafeAreaView>
  );
}