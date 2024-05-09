import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  FlatList,
  View,
  Text,
  SafeAreaView,
  Button,
  TouchableOpacity,
  Modal,
} from "react-native";
import { getStorySaved, removeArticleId } from "@/utils/lib"; // import the functions
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ListItem from "@/components/ListItem";
import StoryTypeModal from "../modal";

type Article = {
  id: number;
  title: string;
  url: string;
  kids: number[];
  // include other properties of the article here
};

export default function TabTwoScreen() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);


  const handlePressComments = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };


  const fetchSavedArticles = async () => {
    const articles: any = await getStorySaved();
    setSavedArticles(articles);
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
    <SafeAreaView className="flex-1 justify-center items-center w-full h-full dark:bg-zinc-900">
      {savedArticles.length === 0 ? (
        <Text className="text-white text-lg font-bold">No saved articles</Text>
      ) : (
        <FlatList
          className="bg-transparent w-full h-full"
          data={savedArticles}
          keyExtractor={(item ) => item.id.toString()}
          onRefresh={onRefresh}
          refreshing={refreshing}
          renderItem={({ item }) => <ListItem type="trash" item={item} onPressTrash={async () => {
            console.log("item deleted");
            const updatedArticles: any = await removeArticleId(item.id);
            setSavedArticles(updatedArticles); // Update the state with the returned list of article IDs
          } } onPressComments={() => {
            setSelectedItem(item);
            setModalVisible(true);
          }} />}          
        />
      )}
       <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        className="m-0 flex-1 items-center justify-end w-full bg-white dark:bg-black h-8 0 bg-opacity-100"
      >
        <View className="bg-white dark:bg-black items-end">
        <TouchableOpacity className="mt-5 p-10" onPress={() => setModalVisible(false)}>
        <FontAwesome name="close" size={24} color={'red'} />
        </TouchableOpacity>
        </View>
        {selectedItem && (
          <StoryTypeModal item={selectedItem.id} kids={selectedItem.kids} />
        )}

      </Modal>
    </SafeAreaView>
  );
}
