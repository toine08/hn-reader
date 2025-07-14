import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';

function NewsletterAnalytics() {
  const colorScheme = useColorScheme();
  const [stats, setStats] = useState({
    totalSignups: 0,
    weeklySignups: 0,
    lastSignupDate: null as string | null
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [totalSignups, weeklySignups, lastSignup] = await Promise.all([
        AsyncStorage.getItem('newsletter_total_signups'),
        AsyncStorage.getItem('newsletter_weekly_signups'),
        AsyncStorage.getItem('newsletter_last_signup_date')
      ]);

      setStats({
        totalSignups: parseInt(totalSignups || '0'),
        weeklySignups: parseInt(weeklySignups || '0'),
        lastSignupDate: lastSignup
      });
    } catch (error) {
      console.error('Error loading newsletter stats:', error);
    }
  };

  // This would be called from the newsletter hook when someone subscribes
  const trackSignup = async () => {
    try {
      const currentTotal = await AsyncStorage.getItem('newsletter_total_signups');
      const newTotal = (parseInt(currentTotal || '0') + 1).toString();
      
      await Promise.all([
        AsyncStorage.setItem('newsletter_total_signups', newTotal),
        AsyncStorage.setItem('newsletter_last_signup_date', new Date().toISOString())
      ]);
      
      await loadStats();
    } catch (error) {
      console.error('Error tracking signup:', error);
    }
  };

  if (stats.totalSignups === 0) {
    return null; // Don't show if no signups yet
  }

  return (
    <View className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
      <View className="flex-row items-center mb-2">
        <FontAwesome5 
          name="chart-line" 
          size={14} 
          color="#10b981" 
          style={{ marginRight: 6 }} 
        />
        <Text className="text-sm font-medium text-green-800 dark:text-green-200">
          Newsletter Growth
        </Text>
      </View>
      
      <View className="flex-row justify-between">
        <View>
          <Text className="text-lg font-bold text-green-800 dark:text-green-200">
            {stats.totalSignups}
          </Text>
          <Text className="text-xs text-green-600 dark:text-green-400">
            Total Subscribers
          </Text>
        </View>
        
        {stats.weeklySignups > 0 && (
          <View>
            <Text className="text-lg font-bold text-green-800 dark:text-green-200">
              +{stats.weeklySignups}
            </Text>
            <Text className="text-xs text-green-600 dark:text-green-400">
              This Week
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// Export the component and helper function
export default NewsletterAnalytics;
