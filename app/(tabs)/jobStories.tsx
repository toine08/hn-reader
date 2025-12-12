import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import { ScrollView } from "@/components/ScrollView";
import StoryTypeModal from "@/app/modal";
import { Article } from "@/utils/types";

export default function JobStoriesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 w-full bg-white dark:bg-zinc-900">
      <ScrollView 
        story="jobstories"
        saveOrTrash="save"
        onItemSelect={handlePressComments}
      />
      <StoryTypeModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem?.id}
        kids={selectedItem?.kids}
      />
    </SafeAreaView>
  );
}