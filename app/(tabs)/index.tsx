import { Text, View } from 'react-native'
import React, { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import getData from '../../utils/getData';

export default function TabOneScreen() {
  const [selectedStoryType, setSelectedStoryType] = useState('topstories');

  const stories = getData(selectedStoryType);

  const storeData = async (value: any) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('my-key', jsonValue);
    } catch (e) {
      // saving error
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedStoryType}
        onValueChange={(itemValue: any) => setSelectedStoryType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Top" value="topstories" />
        <Picker.Item label="Job" value="jobstories" />
        <Picker.Item label="Ask" value="askstories" />
        <Picker.Item label="Show" value="showstories" />
        <Picker.Item label="New" value="newstories" />
      </Picker>
      <FlatList
        data={stories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => {
              WebBrowser.openBrowserAsync(item.url);
              storeData({
                key: 'article',
                data: item,
              });
            }}
          >
            <Text style={styles.item}>{item.title}</Text>
          </TouchableOpacity>
        )}
        style={styles.flatList}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 'auto',
  },
  itemContainer: {
    backgroundColor: '#2f2e2e',
    paddingBottom:20,
    margin:5,
  },
  picker: {
    height: 50,
    width: 150,
  },
  flatList: { // Add this style
    width: '100%',
  },
});