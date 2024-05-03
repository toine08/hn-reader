import { Text, View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import React, { useState,useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import getData from '../../utils/lib';
import FloatingButton from '@/components/FloatingButton';
import { FontAwesome } from '@expo/vector-icons';
import { storeData } from '@/utils/lib';

export default function TabOneScreen() {
  const [selectedStoryType, setSelectedStoryType] = useState('newstories');
  const [refreshing, setRefreshing] = useState(false);
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    getData(selectedStoryType).then(data => setStories(data));
  }, [selectedStoryType]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getData(selectedStoryType).then(data => {
      setStories(data);
      setRefreshing(false);
    });
  }, [selectedStoryType]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <View className='w-full h-full'>
        <FlatList
          className="bg-transparent w-full h-full"
          data={stories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-neutral-900 pb-6 m-2 mb-3 rounded-lg shadow-sm mix-blend-lighten shadow-blue-300">
              <TouchableOpacity
                onPress={() => {
                  WebBrowser.openBrowserAsync(item.url);
                }}
              >
                <Text className=" m-2 p-1 pb-4 text-base h-auto text-white">{item.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="absolute right-4 bottom-2 mt-4"
                onPress={() => {
                  console.log("Save pressed");
                  storeData({
                    key: 'article',
                    data: item.id,
                  });
                }}
              >
                <FontAwesome name="save" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
      <FloatingButton className="absolute right-2 bottom-2 z-10" />
    </SafeAreaView>
  );
}