import React, { memo, useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Dimensions } from "react-native";
import ListItem from "@/components/ListItem";
import { Article } from "@/utils/types";
import { ScrollViewProps } from "@/utils/interfaces";
import { getStories, getStorySaved, removeArticle, saveArticle, storeData } from "@/utils/lib";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { useFocusEffect } from "expo-router";

const params = {
  initialNumber: 5,
  ITEM_HEIGHT: 150, // Define ITEM_HEIGHT with an appropriate value
  PAGE_SIZE: 20, // Approximate height of each item
};

const VISIBLE_ITEMS = Math.ceil(Dimensions.get('window').height / params.ITEM_HEIGHT * 2);

export const ScrollView: React.FC<ScrollViewProps> = ({
  story,
  saveOrTrash,
  onItemSelect,
}) => {
  const [selectedStoryType, setSelectedStoryType] = useState(story);
  const [stories, setStories] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<number[]>([]);

  if(selectedStoryType === 'bookmarks'){
   useFocusEffect(
       React.useCallback(() => {
         const fetchSavedArticles = async () => {
           try {
             const articles = await getStorySaved();
             setStories(articles || []);
           } catch (error) {
             console.error('Error fetching saved articles:', error);
           }
         };
   
         fetchSavedArticles();
       }, [])
     ); 
  }else{
  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      try {
        const newStories = await getStories(selectedStoryType, page);
        // Filter out any null or undefined stories
        const validStories = newStories.filter(
          (story): story is Article =>
            story != null && typeof story.id === "number"
        );
        setStories((oldStories) => [...oldStories, ...validStories]);
      } catch (error) {
        console.error("Error loading stories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [selectedStoryType, page]);
}

  useFocusEffect(
    React.useCallback(() => {
      const loadSavedArticleIds = async () => {
        try {
          const saved = await getStorySaved();
          setSavedArticleIds(saved.map(article => article.id));
        } catch (error) {
          console.error('Error loading saved article IDs:', error);
        }
      };
      loadSavedArticleIds();
    }, [])
  );

  const loadMoreStories = () => {
    setPage((oldPage) => oldPage + 1);
  };

  const handleRefresh = async () => {
    if (selectedStoryType === 'bookmarks') {
      setRefreshing(false);
      return;
    }
    
    setRefreshing(true);
    try {
      const articles = await getStories(selectedStoryType, 1);
      setStories(articles || []);
    } catch (error) {
      console.error("Error refreshing saved articles:", error);
    }
    setRefreshing(false);
  };

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
    if (onItemSelect) {
      onItemSelect(item); // Call the callback with selected item
    }
  };

  const onPressSave = async (item: Article) => {
    try {
      await saveArticle(item);
      setSavedArticleIds(prev => [...prev, item.id]);
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };

  const handlePressTrash = async (articleId: number) => {
    try {
      await removeArticle(articleId);
      setSavedArticleIds(prev => prev.filter(id => id !== articleId));
      if (selectedStoryType === 'bookmarks') {
        setStories(prev => prev.filter(story => story.id !== articleId));
      }
    } catch (error) {
      console.error('Error removing article:', error);
    }
  };

  const onPressComments = useCallback(
    (item: Article) => handlePressComments(item),
    []
  ); // Add item as a parameter

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: params.ITEM_HEIGHT,
      offset: params.ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View className="flex-1 w-full">
      <FlatList
        className="bg-white dark:bg-black h-full w-fit"
        windowSize={5}
        maxToRenderPerBatch={VISIBLE_ITEMS}
        initialNumToRender={VISIBLE_ITEMS}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        data={stories.slice(0, (page + 1) * params.PAGE_SIZE)}
        keyExtractor={(item) => item.id.toString()} // Ensure unique keys
        renderItem={({ item }) => (
          <ListItem
            type={saveOrTrash}
            storyType={selectedStoryType} // Add the required storyType prop
            item={item}
            onPressSave={() => onPressSave(item)} // Pass the correct item
            onPressComments={() => onPressComments(item)} 
            onPressTrash={() => handlePressTrash(item.id)}
            savedArticles={savedArticleIds}
          />
        )}
        ListFooterComponent={loading ? <LoadingPlaceholder /> : null} // Render LoadingPlaceholder when loading
        onEndReached={loadMoreStories}
        onEndReachedThreshold={0.2}
        refreshing={selectedStoryType !== 'bookmarks' && refreshing}
        onRefresh={selectedStoryType !== 'bookmarks' ? handleRefresh : undefined}
        maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        getItemLayout={getItemLayout}
      />
    </View>
  );
};
