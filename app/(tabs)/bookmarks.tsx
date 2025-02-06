import React, { useState } from "react";
import {
  SafeAreaView,
  Modal,
  View,
  TouchableOpacity
} from "react-native";;
import StoryTypeModal from "../modal";
import { Article } from "@/utils/types";
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from "@/components/useColorScheme";
import { ScrollView } from "@/components/ScrollView";

export default function Bookmarks() { 
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
  };



  return (
    <SafeAreaView className="flex-1 w-full bg-white dark:bg-zinc-900">
            <ScrollView 
            story="bookmarks"
            saveOrTrash="trash"
            onItemSelect={handlePressComments}
            />
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