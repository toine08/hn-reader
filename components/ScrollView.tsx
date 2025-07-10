import React, { memo, useCallback, useState, useEffect } from "react";
import { View, FlatList, Dimensions } from "react-native";
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
}

export const ScrollView: React.FC<LocalScrollViewProps> = ({
  story,
  saveOrTrash,
  onItemSelect,
  filteredArticles,
}) => {
  const { stories, loading, refreshing, loadMoreStories, onRefresh } = useStories(story);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<number[]>([]);
  const [localStories, setLocalStories] = useState<Article[]>([]);

  useEffect(() => {
    if (story === 'bookmarks') {
      const fetchSavedArticles = async () => {
        try {
          const articles = await getStorySaved();
          setLocalStories(articles || []);
        } catch (error) {
          console.error('Error fetching saved articles:', error);
        }
      };
      fetchSavedArticles();
    } else {
      setLocalStories(stories);
    }
  }, [story, stories, filteredArticles]);

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
        setLocalStories(prev => prev.filter(s => s.id !== articleId));
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
        data={localStories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ListItem
            type={saveOrTrash}
            storyType={story}
            item={item}
            onPressSave={() => onPressSave(item)}
            onPressComments={() => onPressComments(item)} 
            onPressTrash={() => handlePressTrash(item.id)}
            savedArticles={savedArticleIds}
          />
        )}
        ListFooterComponent={loading ? <LoadingPlaceholder /> : null}
        onEndReached={loadMoreStories}
        onEndReachedThreshold={0.2}
        refreshing={refreshing}
        onRefresh={onRefresh}
        maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        getItemLayout={getItemLayout}
      />
    </View>
  );
};
