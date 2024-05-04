import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  FlatList,
  View,
  Text,
  SafeAreaView,
  Button,
  TouchableOpacity,
} from "react-native";
import { getStorySaved, removeArticleId } from "@/utils/lib"; // import the functions
import * as WebBrowser from "expo-web-browser";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ListItem from "@/components/ListItem";

type Article = {
  id: number;
  title: string;
  url: string;
  // include other properties of the article here
};

export default function TabTwoScreen() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedArticles = async () => {
    const articles: any = await getStorySaved();
    setSavedArticles(articles);
    console.log(articles, "articles");
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchSavedArticles();
    }, [])
  );

  useEffect(() => {
    fetchSavedArticles();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSavedArticles().then(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 justify-center items-center w-full h-full">
      {savedArticles.length === 0 ? (
        <Text className="text-white text-lg font-bold">No saved articles</Text>
      ) : (
        <FlatList
          className="bg-transparent w-full h-full"
          data={savedArticles}
          keyExtractor={(item ) => item.id.toString()}
          onRefresh={onRefresh}
          refreshing={refreshing}
          renderItem={({ item }) => <ListItem type="trash" item={item}   onPressTrash={async () => {
            console.log("item deleted");
            const updatedArticles: any = await removeArticleId(item.id);
            setSavedArticles(updatedArticles); // Update the state with the returned list of article IDs
          }} />}          
        />
      )}
    </SafeAreaView>
  );
}
