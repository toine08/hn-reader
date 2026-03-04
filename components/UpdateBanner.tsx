import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from './Themed';
import { useAppUpdates } from '@/hooks/useAppUpdates';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';

export function UpdateBanner() {
  const { isUpdatePending, isDownloading, applyUpdate } = useAppUpdates();
  const colorScheme = useColorScheme();

  if (!isUpdatePending) {
    return null;
  }

  return (
    <View className="bg-blue-500 dark:bg-blue-600 px-4 py-3 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1 bg-transparent">
        <FontAwesome 
          name="download" 
          size={16} 
          color="white" 
          style={{ marginRight: 8 }}
        />
        <Text className="text-white font-medium flex-1">
          {isDownloading ? 'Downloading update...' : 'Update ready!'}
        </Text>
      </View>
      
      {isDownloading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <TouchableOpacity 
          onPress={applyUpdate}
          className="bg-white/20 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold text-sm">
            Restart
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
