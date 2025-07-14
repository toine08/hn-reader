import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import StoryTypeModal from "../app/modal";
import { Article } from "@/utils/types";
import { ScrollView } from "@/components/ScrollView";

interface StoryScreenProps {
  storyType: string;
  saveOrTrash?: "save" | "trash";
}

export default function StoryScreen({ storyType, saveOrTrash = "save" }: StoryScreenProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 w-full bg-white dark:bg-zinc-900">
      <ScrollView 
        story={storyType}
        saveOrTrash={saveOrTrash}
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
