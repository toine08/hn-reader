import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  FlatList,
  SafeAreaView,
  Modal,
  View,
  TouchableOpacity
} from "react-native";
import { useFocusEffect } from "expo-router";
import { getStorySaved, removeArticle } from "@/utils/lib";
import ListItem from "@/components/ListItem";
import StoryTypeModal from "../modal";
import { Article } from "@/utils/types";
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from "@/components/useColorScheme";

export default function Bookmarks() { 
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handlePressTrash = async (articleId: number) => {
    try {
      const updatedArticles = await removeArticle(articleId);
      setSavedArticles(updatedArticles);
    } catch (error) {
      console.error('Error removing article:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchSavedArticles = async () => {
        try {
          const articles = await getStorySaved();
          setSavedArticles(articles || []);
        } catch (error) {
          console.error('Error fetching saved articles:', error);
        }
      };

      fetchSavedArticles();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const articles = await getStorySaved();
      setSavedArticles(articles || []);
    } catch (error) {
      console.error('Error refreshing saved articles:', error);
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 w-full bg-white dark:bg-zinc-900">
      <View className="flex-1 w-full">
        <FlatList
          className="bg-white dark:bg-black h-full w-fit"
          data={savedArticles}
          keyExtractor={(item) => item.id.toString()} // Ensure unique keys
          renderItem={({ item }) => (
            <ListItem
              type="trash"
              storyType="bookmarks"  // Add the required storyType prop
              item={item}
              onPressTrash={() => handlePressTrash(item.id)}
              onPressComments={() => handlePressComments(item)}
            />
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>
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