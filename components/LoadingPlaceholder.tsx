import React from 'react';
import { View } from 'react-native';

const LoadingPlaceholder = () => (
  <View className="bottom-2 border-orange-100 shadow-md rounded-md p-4 w-full h-full mx-auto">
    <View className="flex space-x-4">
      <View className="bg-gray-700 h-10 w-10 rounded-md" />
      <View className="flex-1 space-y-6 py-1">
        <View className="h-2 bg-gray-700 rounded-md" />
        <View className="space-y-3">
          <View className="grid-cols-3 gap-4">
            <View className="h-2 bg-gray-700 rounded-md col-span-2" />
            <View className="h-2 bg-gray-700 rounded-md col-span-1" />
          </View>
          <View className="h-2 bg-gray-700 rounded-md" />
        </View>
      </View>
    </View>
  </View>
);
export default LoadingPlaceholder