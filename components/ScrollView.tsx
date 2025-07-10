import React, { memo, useCallback, useState, useEffect, useRef } from "react";
import { View, FlatList, Dimensions, Animated } from "react-native";
import ListItem from "@/components/ListItem";
import { Article } from "@/utils/types";
import { getStorySaved, removeArticle, saveArticle } from "@/utils/lib";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { useFocusEffect } from "expo-router";
import { useStories } from "@/hooks/useStories";

const params = {
  ITEM_HEIGHT: 150,
  PAGE_SIZE: 20,
};

const VISIBLE_ITEMS = Math.ceil(Dimensions.get('window').height / params.ITEM_HEIGHT * 2);

interface LocalScrollViewProps {
  story: string;
  saveOrTrash?: "save" | "trash";
  onItemSelect?: (item: Article) => void;
  filteredArticles?: Article[];
  searchQuery?: string;
  onScroll?: (event: any) => void; // Add onScroll prop
}

export const ScrollView: React.FC<LocalScrollViewProps> = ({
  story,
  saveOrTrash,
  onItemSelect,
  filteredArticles,
  searchQuery,
  onScroll,
}) => {
  const { stories, loading, refreshing, loadMoreStories, onRefresh } = story !== 'bookmarks' ? useStories(story) : { stories: [], loading: false, refreshing: false, loadMoreStories: () => {}, onRefresh: () => {} };
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<number[]>([]);
  const [filteredLocalStories, setFilteredLocalStories] = useState<Article[]>([]);

  useEffect(() => {
    const dataToFilter = story === 'bookmarks' ? filteredArticles || [] : stories;
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = dataToFilter.filter(
        (article) =>
          article.title?.toLowerCase().includes(lowerCaseQuery) ||
          article.by?.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredLocalStories(filtered);
    } else {
      setFilteredLocalStories(dataToFilter);
    }
  }, [stories, filteredArticles, searchQuery, story]);

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

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
    if (onItemSelect) {
      onItemSelect(item);
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
      if (story === 'bookmarks') {
        // When an article is trashed from bookmarks, update the filteredLocalStories directly
        setFilteredLocalStories(prev => prev.filter(s => s.id !== articleId));
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
      <Animated.FlatList
        className="bg-white dark:bg-black h-full w-fit"
        windowSize={5}
        maxToRenderPerBatch={VISIBLE_ITEMS}
        initialNumToRender={VISIBLE_ITEMS}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        data={filteredLocalStories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ListItem
            type={saveOrTrash}
            storyType={story}
            item={item}
            onPressSave={() => onPressSave(item)}
            onPressComments={() => onPressComments(item)} 
            onPressTrash={() => onPressTrash(item.id)}
            savedArticles={savedArticleIds}
          />
        )}
        ListFooterComponent={loading ? <LoadingPlaceholder /> : null}
        onEndReached={story !== 'bookmarks' ? loadMoreStories : undefined}
        onEndReachedThreshold={0.2}
        refreshing={story !== 'bookmarks' && refreshing}
        onRefresh={story !== 'bookmarks' ? onRefresh : undefined}
        maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        getItemLayout={getItemLayout}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
