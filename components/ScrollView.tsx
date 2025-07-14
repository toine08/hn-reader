import React, { memo, useCallback, useEffect, useState } from "react";
import { View, FlatList, Dimensions } from "react-native";
import ListItem from "@/components/ListItem";
import Toast from "@/components/Toast";
import { Article } from "@/utils/types";
import { getStories, getStorySaved, removeArticle, saveArticle } from "@/utils/lib";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { useFocusEffect } from "expo-router";

const params = {
  initialNumber: 5,
  ITEM_HEIGHT: 150,
  PAGE_SIZE: 20,
};

const VISIBLE_ITEMS = Math.ceil(Dimensions.get('window').height / params.ITEM_HEIGHT * 2);

interface LocalScrollViewProps {
  story: string;
  saveOrTrash?: "save" | "trash";
  onItemSelect?: (item: Article) => void;
  filteredArticles?: Article[];
  onArticleDeleted?: () => void; // Add callback for when article is deleted
}

export const ScrollView: React.FC<LocalScrollViewProps> = ({
  story,
  saveOrTrash,
  onItemSelect,
  filteredArticles,
  onArticleDeleted, // Add the callback parameter
}: LocalScrollViewProps) => {
  const [stories, setStories] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savedArticleIds, setSavedArticleIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'info'
  });

  // Load saved article IDs
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

  // Load stories based on story type
  useEffect(() => {
    const loadStories = async () => {
      if (story === "bookmarks") {
        if (filteredArticles) {
          setStories(filteredArticles);
        } else {
          try {
            const articles = await getStorySaved();
            setStories(articles || []);
          } catch (error) {
            console.error('Error fetching saved articles:', error);
          }
        }
        return;
      }

      setLoading(true);
      try {
        const newStories = await getStories(story, page);
        const validStories = newStories.filter(
          (story): story is Article =>
            story != null && typeof story.id === "number"
        );
        
        if (page === 1) {
          setStories(validStories);
        } else {
          setStories((oldStories: Article[]) => [...oldStories, ...validStories]);
        }
      } catch (error) {
        console.error("Error loading stories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [story, page, filteredArticles]); // Keep filteredArticles as dependency

  const loadMoreStories = useCallback(() => {
    if (story !== 'bookmarks' && !loading) {
      setPage((oldPage: number) => oldPage + 1);
    }
  }, [story, loading]);

  const handleRefresh = useCallback(async () => {
    if (story === 'bookmarks') return;
    
    setRefreshing(true);
    setPage(1);
    try {
      const articles = await getStories(story, 1);
      setStories(articles || []);
    } catch (error) {
      console.error("Error refreshing stories:", error);
    }
    setRefreshing(false);
  }, [story]);

  const onPressSave = useCallback(async (item: Article) => {
    try {
      // Show loading toast
      setToast({
        visible: true,
        message: 'Saving article for offline reading...',
        type: 'info'
      });

      const success = await saveArticle(item);
      setSavedArticleIds((prev: number[]) => [...prev, item.id]);
      
      // Show success/info toast
      setToast({
        visible: true,
        message: success 
          ? 'Article saved with offline content!' 
          : 'Article saved (offline content may not be available)',
        type: success ? 'success' : 'info'
      });
    } catch (error) {
      console.error("Error saving article:", error);
      setToast({
        visible: true,
        message: 'Failed to save article',
        type: 'error'
      });
    }
  }, []);

  const handlePressTrash = useCallback(async (articleId: number) => {
    try {
      await removeArticle(articleId);
      setSavedArticleIds((prev: number[]) => prev.filter((id: number) => id !== articleId));
      if (story === 'bookmarks') {
        setStories((prev: Article[]) => prev.filter((story: Article) => story.id !== articleId));
        // Call the callback to notify parent component about deletion
        onArticleDeleted?.();
      }
      
      setToast({
        visible: true,
        message: 'Article removed from bookmarks',
        type: 'info'
      });
    } catch (error) {
      console.error('Error removing article:', error);
      setToast({
        visible: true,
        message: 'Failed to remove article',
        type: 'error'
      });
    }
  }, [story, onArticleDeleted]);

  const onPressComments = useCallback(
    (item: Article) => onItemSelect?.(item),
    [onItemSelect]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Article> | null | undefined, index: number) => ({
      length: params.ITEM_HEIGHT,
      offset: params.ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(({ item }: { item: Article }) => (
    <ListItem
      type={saveOrTrash}
      storyType={story}
      item={item}
      onPressSave={() => onPressSave(item)}
      onPressComments={() => onPressComments(item)} 
      onPressTrash={() => handlePressTrash(item.id)}
      savedArticles={savedArticleIds}
    />
  ), [saveOrTrash, story, onPressSave, onPressComments, handlePressTrash, savedArticleIds]);

  return (
    <View className="flex-1 w-full">
      <FlatList
        className="bg-white dark:bg-black h-full w-fit"
        windowSize={5}
        maxToRenderPerBatch={VISIBLE_ITEMS}
        initialNumToRender={VISIBLE_ITEMS}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        data={stories}
        keyExtractor={(item: Article) => item.id.toString()}
        renderItem={renderItem}
        ListFooterComponent={loading ? <LoadingPlaceholder /> : null}
        onEndReached={loadMoreStories}
        onEndReachedThreshold={0.2}
        refreshing={story !== 'bookmarks' && refreshing}
        onRefresh={story !== 'bookmarks' ? handleRefresh : undefined}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        getItemLayout={getItemLayout}
      />
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};
