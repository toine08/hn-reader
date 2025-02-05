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
  const colorScheme = useColorScheme();
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
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
          <View className="flex-row justify-end items-center px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
            <TouchableOpacity 
              className="p-2" 
              onPress={() => setModalVisible(false)}
            >
              <FontAwesome 
                name="close" 
                size={24} 
                color={colorScheme === 'dark' ? '#fff' : '#000'} 
              />
            </TouchableOpacity>
          </View>
          
          {selectedItem && (
            <StoryTypeModal 
              item={selectedItem.id}
              kids={selectedItem.kids} 
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}