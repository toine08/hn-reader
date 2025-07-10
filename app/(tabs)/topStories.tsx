import React, { useState, useRef } from "react";
import { SafeAreaView, View, TextInput, TouchableOpacity, Animated } from "react-native";
import StoryTypeModal from "../modal";
import { Article } from "@/utils/types";
import { ScrollView } from "@/components/ScrollView";
import { AntDesign } from "@expo/vector-icons";

export default function TopStoriesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });
  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const searchBarHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [60, 0],
    extrapolate: 'clamp',
  });

  const handlePressComments = (item: Article) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <SafeAreaView className="flex-1 w-full bg-white dark:bg-zinc-900">
      <Animated.View className="px-4 pt-3 pb-2" style={{ transform: [{ translateY: searchBarTranslateY }], opacity: searchBarOpacity, height: searchBarHeight }}>
        <View className="flex-row items-center bg-neutral-100 dark:bg-zinc-800 rounded-full px-3 py-2">
          <AntDesign name="search1" size={18} color="#666" />
          <TextInput
            className="flex-1 px-2 text-black dark:text-white text-base"
            placeholder="Search stories..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} className="p-1">
              <AntDesign name="close" size={18} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </Animated.View>
      <ScrollView 
        story="topstories"
        saveOrTrash="save"
        onItemSelect={handlePressComments}
        searchQuery={searchQuery}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
      <StoryTypeModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem?.id}
        kids={selectedItem?.kids}
      />
    </SafeAreaView>
  );
}