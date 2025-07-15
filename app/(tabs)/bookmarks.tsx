import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import StoryTypeModal from "../modal";
import { Article } from "@/utils/types";
import { ScrollView } from "@/components/ScrollView";
import { getFilteredSavedStories, clearAll } from "@/utils/lib";

export default function Bookmarks() { 
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-render

  // Refresh articles when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Load and filter articles
  useEffect(() => {
    const loadFilteredArticles = async () => {
      setIsSearching(true);
      const articles = await getFilteredSavedStories(sortOrder, debouncedSearchTerm);
      setFilteredArticles(articles);
      setIsSearching(false);
    };
    loadFilteredArticles();
  }, [debouncedSearchTerm, sortOrder, refreshKey]); // Add refreshKey as dependency

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleClearAllBookmarks = () => {
    Alert.alert(
      "Clear All Bookmarks",
      "Are you sure you want to delete all bookmarked articles? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAll();
              setRefreshKey(prev => prev + 1);
              Alert.alert("Success", "All bookmarks have been cleared.");
            } catch (error) {
              console.error("Error clearing bookmarks:", error);
              Alert.alert("Error", "Failed to clear bookmarks.");
            }
          }
        }
      ]
    );
  };

  // Add callback to handle when an article is deleted
  const handleArticleDeleted = () => {
    setRefreshKey(prev => prev + 1); // Force refresh of filtered articles
  };

  return (
    <SafeAreaView className="flex-1 w-full bg-white dark:bg-zinc-900">
      {/* Always visible search header */}
      <View className="px-4 pt-3 pb-2">
        {/* Search bar */}
        <View className="flex-row items-center bg-neutral-100 dark:bg-zinc-800 rounded-full px-3 py-2">
          <AntDesign name="search1" size={18} color="#666" />
          <TextInput
            className="flex-1 px-2 text-black dark:text-white text-base"
            placeholder="Search bookmarks..."
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoFocus={false}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={clearSearch} className="p-1">
              <AntDesign name="close" size={18} color="#666" />
            </TouchableOpacity>
          ) : null}
          
          {/* Sort toggle button */}
          <TouchableOpacity 
            onPress={toggleSortOrder} 
            className="ml-1 p-1"
          >
            <AntDesign 
              name={sortOrder === 'newest' ? 'arrowdown' : 'arrowup'} 
              size={18} 
              color="#666" 
            />
          </TouchableOpacity>

          {/* Clear all bookmarks button */}
          {filteredArticles.length > 0 && (
            <TouchableOpacity 
              onPress={handleClearAllBookmarks} 
              className="ml-1 p-1"
            >
              <AntDesign 
                name="delete" 
                size={18} 
                color="#ef4444" 
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Status row - shows count and sorting info */}
        {(isSearching || filteredArticles.length > 0 || debouncedSearchTerm) && (
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {isSearching ? 'Searching...' : 
                `${filteredArticles.length} ${filteredArticles.length === 1 ? 'result' : 'results'}`}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
            </Text>
          </View>
        )}
      </View>

      {/* No results message */}
      {filteredArticles.length === 0 && debouncedSearchTerm && !isSearching && (
        <View className="flex-1 justify-center items-center px-6">
          <AntDesign name="search1" size={50} color="#ccc" />
          <Text className="mt-4 text-lg text-gray-500 dark:text-gray-400">No results found</Text>
          <Text className="mt-2 text-center text-gray-500 dark:text-gray-400">
            No bookmarks match "{debouncedSearchTerm}"
          </Text>
          <TouchableOpacity 
            onPress={clearSearch}
            className="mt-4 bg-blue-500 px-4 py-2 rounded-md"
          >
            <Text className="text-white font-medium">Clear Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Only show ScrollView when we have results or no search term */}
      {(filteredArticles.length > 0 || !debouncedSearchTerm) && (
        <ScrollView 
          story="bookmarks"
          saveOrTrash="trash"
          onItemSelect={handlePressComments}
          filteredArticles={filteredArticles}
          onArticleDeleted={handleArticleDeleted}
        />
      )}
      
      <StoryTypeModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem?.id}
        kids={selectedItem?.kids}
      />
    </SafeAreaView>
  );
}