import React, { useState, useEffect } from "react";
import { SafeAreaView, View, FlatList, Modal, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ListItem from "@/components/ListItem";
import LoadingPlaceholder from "@/components/LoadingPlaceholder";
import { getStories, saveArticle } from "@/utils/lib"; 
import StoryTypeModal from "../modal";
import { Article } from "@/utils/types";
import { StoryTypeModalProps } from "@/utils/interfaces";

const ITEM_HEIGHT = 100; // Define ITEM_HEIGHT with an appropriate value
const PAGE_SIZE = 20; // Define PAGE_SIZE with an appropriate value

export default function NewStoriesScreen() {
  const [selectedStoryType, setSelectedStoryType] = useState("newstories");
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
        const validStories = newStories.filter((story): story is Article => 
          story != null && typeof story.id === 'number'
        );
        setStories((oldStories) => [...oldStories, ...validStories]);
      } catch (error) {
        console.error('Error loading stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [selectedStoryType, page]);

  const loadMoreStories = () => {
    setPage((oldPage) => oldPage + 1);
  };

  const handlePressSave = async (item: Article) => {
    try {
      await saveArticle(item); // Save the article
      alert("Article saved!");
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 w-fit items-center justify-center bg-white dark:dark:bg-zinc-900">
      <View className="flex-1 w-full">
        <FlatList
          className="bg-white dark:bg-black h-full w-fit"
          initialNumToRender={5}
          data={stories.filter(story => story != null).slice(0, (page + 1) * PAGE_SIZE)}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()} 
          renderItem={({ item }) => (
            item ? (
              <ListItem
                type="save"
                storyType="newStories"
                item={item}
                onPressSave={() => handlePressSave(item)}
                onPressComments={() => handlePressComments(item)}
              />
            ) : null
          )}
          ListFooterComponent={loading ? <LoadingPlaceholder /> : null}
          onEndReached={loadMoreStories}
          onEndReachedThreshold={0.2}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
        />
      </View>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        className="m-0 flex-1 items-center justify-end w-full bg-white dark:bg-black h-60 bg-opacity-100"
      >
        <View className="bg-white dark:bg-black items-end">
          <TouchableOpacity className="mt-5 p-10" onPress={() => setModalVisible(false)}>
            <FontAwesome name="close" size={24} color="red" />
          </TouchableOpacity>
        </View>
        {selectedItem && (
          <StoryTypeModal item={selectedItem.id} kids={selectedItem.kids} />
        )}
      </Modal>
    </SafeAreaView>
  );
}