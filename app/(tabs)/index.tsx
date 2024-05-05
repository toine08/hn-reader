import React, { useState, useEffect } from "react";
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

const PAGE_SIZE = 20; // Number of items to render at once

export default function TabOneScreen() {
  const [selectedStoryType, setSelectedStoryType] = useState("topstories");
  const [stories, setStories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handlePressComments = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

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
          renderItem={({ item }) => (
            <ListItem
              type="save"
              item={item}
              onPressSave={() => {
                console.log("Save pressed");
                storeData({
                  key: "article",
                  data: item.id,
                });
              }}
              onPressComments={() => handlePressComments(item)} // Set the selected item when the comments icon is pressed
            />
          )}
          onEndReached={loadMoreStories}
          onEndReachedThreshold={0.2}
        />
      </View>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        className="m-0 flex-1 items-center justify-end w-full bg-black h-60 bg-opacity-100"
      >
        <View className="bg-black items-end">
        <TouchableOpacity className="p-12" onPress={() => setModalVisible(false)}>
          <FontAwesome name="close" size={24} color="white" />
        </TouchableOpacity>
        </View>
        {selectedItem && (
          <StoryTypeModal item={selectedItem.id} kids={selectedItem.kids} />
        )}

      </Modal>
    </SafeAreaView>
  );
}