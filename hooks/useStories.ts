
import { useState, useEffect, useCallback } from 'react';
import { Article } from '@/utils/types';
import { getStories } from '@/utils/lib';

export const useStories = (storyType: string) => {
  const [stories, setStories] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStories = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const newStories = await getStories(storyType, currentPage);
      const validStories = newStories.filter(
        (story): story is Article => story != null && typeof story.id === 'number'
      );
      setStories((prevStories) => {
        const existingIds = new Set(prevStories.map(s => s.id));
        const uniqueNewStories = validStories.filter(s => !existingIds.has(s.id));
        return [...prevStories, ...uniqueNewStories];
      });
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  }, [storyType]);

  useEffect(() => {
    loadStories(1);
  }, [loadStories]);

  const loadMoreStories = () => {
    const newPage = page + 1;
    setPage(newPage);
    loadStories(newPage);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setStories([]);
    await loadStories(1);
    setRefreshing(false);
  }, [loadStories]);

  return { stories, loading, refreshing, loadMoreStories, onRefresh };
};
