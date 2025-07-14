import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';

interface FirstTimeNewsletterModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function FirstTimeNewsletterModal({
  visible,
  onAccept,
  onDecline,
}: FirstTimeNewsletterModalProps) {
  const colorScheme = useColorScheme();
  const { width, height } = Dimensions.get('window');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          {/* Newsletter icon */}
          <View className="items-center mb-4">
            <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 mb-3">
              <AntDesign
                name="mail"
                size={32}
                color={colorScheme === 'dark' ? '#60A5FA' : '#3B82F6'}
              />
            </View>
            <Text className="text-xl font-bold text-black dark:text-white text-center">
              Stay Updated with HN Weekly
            </Text>
          </View>

          {/* Description */}
          <Text className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-6">
            Get the best Hacker News stories curated weekly, plus exclusive app updates and insights. 
            Join fellow developers who save time with our digest.
          </Text>

          {/* Benefits */}
          <View className="mb-6 space-y-3">
            <View className="flex-row items-center">
              <AntDesign name="checkcircle" size={16} color="#10B981" />
              <Text className="ml-3 text-gray-700 dark:text-gray-300 flex-1">
                Weekly curated HN stories
              </Text>
            </View>
            <View className="flex-row items-center">
              <AntDesign name="checkcircle" size={16} color="#10B981" />
              <Text className="ml-3 text-gray-700 dark:text-gray-300 flex-1">
                App updates & new features
              </Text>
            </View>
            <View className="flex-row items-center">
              <AntDesign name="checkcircle" size={16} color="#10B981" />
              <Text className="ml-3 text-gray-700 dark:text-gray-300 flex-1">
                Developer insights & trends
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View className="space-y-3">
            <TouchableOpacity
              onPress={onAccept}
              className="bg-blue-500 py-4 rounded-xl items-center shadow-sm"
            >
              <Text className="text-white font-semibold text-base">
                Subscribe to HN Weekly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDecline}
              className="py-3 items-center"
            >
              <Text className="text-gray-500 dark:text-gray-400 text-base">
                Maybe later
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fine print */}
          <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
            Free forever. Unsubscribe anytime.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
