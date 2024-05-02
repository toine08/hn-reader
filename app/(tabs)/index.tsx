import { Text, View,FlatList, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native'
import React, { useState,useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import getData from '../../utils/getData';
import FloatingButton from '@/components/FloatingButton';

export default function TabOneScreen() {
  const [selectedStoryType, setSelectedStoryType] = useState('topstories');

  const stories:any  = getData('topstories');
  

 /* const storeData = async (value: any) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('my-key', jsonValue);
    } catch (e) {
      console.log(e, 'error')
    }
  };*/

  return (
    <SafeAreaView className="flex-1 item-center justify-center p-4 bg-black">
            <FloatingButton className="absolute left-10 bottom-4 bg-red z-10"/>    

      <View className='z-0'>
      <FlatList
      className='bg-neutral-950'
        data={stories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
          className='bg-neutral-900 pb-6 m-2 mb-3 rounded-lg shadow-sm mix-blend-lighten shadow-blue-300'
          
            onPress={() => {
              WebBrowser.openBrowserAsync(item.url);
              /*storeData({
                key: 'article',
                data: item,
              });*/
            }}
          >
            <Text style={styles.item}>{item.title}</Text>
          </TouchableOpacity>
        )}
        style={styles.flatList}
      />

    </View>
    </SafeAreaView>
    
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
    color: 'white',
  },
  itemContainer: {
    backgroundColor: '#2f2e2e',
    paddingBottom:20,
    margin:5,
  },
  flatList: { // Add this style
    width: '100%',
  },
});