import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, SafeAreaView, Button, TouchableOpacity } from 'react-native';
import { getStorySaved } from '@/utils/lib'; // import the functions
import * as WebBrowser from 'expo-web-browser';

type Article = {
  id: number;
  title: string;
  // include other properties of the article here
};

export default function TabTwoScreen() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchSavedArticles = async () => {
      const articles:any  = await getStorySaved();
      setSavedArticles(articles);
      console.log(articles, 'articles');
    };

    fetchSavedArticles();
  }, []);

  return (
    <SafeAreaView className='flex-1 bg-black'>
      {savedArticles.length === 0 ? (
        <Text className='text-white text-lg font-bold'>No saved articles</Text>
      ) : (
        <FlatList
          data={savedArticles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) =>
            <TouchableOpacity onPress={() => {
              WebBrowser.openBrowserAsync(item.url);
            }} className='m-2 p-4 bg-neutral-900 rounded-lg shadow-sm shadow-blue-300'>
              <Text className='text-base text-white'>{item.title}</Text>
            </TouchableOpacity>
          }
        />
      )}
    </SafeAreaView>
  );
}