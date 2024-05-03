import { Text, View,FlatList, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native'
import React, { useState,useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import getData from '../../utils/lib';
import FloatingButton from '@/components/FloatingButton';
import { FontAwesome } from '@expo/vector-icons';
import { storeData } from '@/utils/lib';

export default function TabOneScreen() {
  const [selectedStoryType, setSelectedStoryType] = useState('topstories');
  const stories:any  = getData(selectedStoryType);
  
  return (
    <SafeAreaView className="flex-1 item-center justify-center p-4 bg-black"> 

      <View className='z-0'>
      <FloatingButton className="absolute left-10 bottom-4 bg-red z-10 bg-red"/>   
      <FlatList
      className=''
        data={stories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View           className='bg-neutral-900 pb-6 m-2 mb-3 rounded-lg shadow-sm mix-blend-lighten shadow-blue-300'
          >
          <TouchableOpacity           
            onPress={() => {
              WebBrowser.openBrowserAsync(item.url);
            }}
          >
            <Text style={styles.item}>{item.title}</Text>
          </TouchableOpacity>
          <TouchableOpacity className='absolute right-4 bottom-2 mt-4' 
          onPress={()=>{console.log("Save pressed");
             storeData({
                key: 'article',
                data: item.id,
              });
           }}>
            <FontAwesome name="save" size={24} color="white" />
            </TouchableOpacity>
          </View>
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