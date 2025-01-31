import React from 'react';
import { View } from 'react-native';
import { useColorScheme } from "@/components/useColorScheme";

const LoadingPlaceholder = () => {
  const colorScheme = useColorScheme();
  const shimmerColor = colorScheme === 'dark' ? 'rgb(39 39 42)' : 'rgb(228 228 231)';
  const placeholderItems = Array.from({ length: 5 }); // Show 5 placeholder items

  return (
    <View>
      {placeholderItems.map((_, index) => (
        <View 
          key={index} 
          className="border-b border-zinc-200 dark:border-zinc-800"
        >
          <View className="p-4">
            {/* Title placeholder */}
            <View className="mb-3">
              <View 
                className="h-6 rounded-md mb-2 w-3/4"
                style={{ backgroundColor: shimmerColor, opacity: 1 - (index * 0.1) }}
              />
              <View 
                className="h-6 rounded-md w-1/2"
                style={{ backgroundColor: shimmerColor, opacity: 1 - (index * 0.1) }}
              />
            </View>
            
            {/* Buttons placeholder */}
            <View className="flex-row gap-3 mb-3">
              <View 
                className="w-20 h-9 rounded-md"
                style={{ backgroundColor: shimmerColor, opacity: 1 - (index * 0.1) }}
              />
              <View 
                className="w-24 h-9 rounded-md"
                style={{ backgroundColor: shimmerColor, opacity: 1 - (index * 0.1) }}
              />
            </View>

            {/* Link preview placeholder */}
            <View className="border-t border-zinc-100 dark:border-zinc-700 pt-3">
              <View className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-2 flex-row items-center">
                <View 
                  className="w-5 h-5 rounded-sm mr-2"
                  style={{ backgroundColor: shimmerColor, opacity: 1 - (index * 0.1) }}
                />
                <View 
                  className="flex-1 h-4 rounded-md"
                  style={{ backgroundColor: shimmerColor, opacity: 1 - (index * 0.1) }}
                />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default LoadingPlaceholder;