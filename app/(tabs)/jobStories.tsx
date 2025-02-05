import React, { useState} from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from "react-native";

import StoryTypeModal from "../modal";
import { FontAwesome } from "@expo/vector-icons";
import { ScrollView } from "@/components/ScrollView";


const PAGE_SIZE = 20; // Number of items to render at once

export default function jobStoriesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handlePressComments = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 w-fit items-center justify-center bg-white dark:dark:bg-zinc-900">
      <ScrollView 
            story = 'jobstories'
            saveOrTrash="save"
            onItemSelect={handlePressComments}
            />
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