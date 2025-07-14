import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNewsletter } from '@/hooks/useNewsletter';

interface NewsletterFormProps {
  onSubscriptionSuccess?: () => void;
}

export default function NewsletterForm({ onSubscriptionSuccess }: NewsletterFormProps) {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { subscription, isLoading, subscribe, unsubscribe, isSubscribed } = useNewsletter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const success = await subscribe(email, name.trim() || undefined);
    
    if (success) {
      Alert.alert(
        'Success!', 
        'Thank you for subscribing! You\'ll receive updates about new features and curated tech content.',
        [{ text: 'OK', onPress: onSubscriptionSuccess }]
      );
      setEmail('');
      setName('');
    } else {
      Alert.alert(
        'Error', 
        'Failed to subscribe. Please try again later.'
      );
    }
  };

  const handleUnsubscribe = async () => {
    Alert.alert(
      'Unsubscribe',
      'Are you sure you want to unsubscribe from the newsletter?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unsubscribe', 
          style: 'destructive',
          onPress: async () => {
            const success = await unsubscribe();
            if (success) {
              Alert.alert('Success', 'You have been unsubscribed.');
            } else {
              Alert.alert('Error', 'Failed to unsubscribe. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (isSubscribed) {
    return (
      <View className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <View className="flex-row items-center mb-2">
          <FontAwesome5 
            name="check-circle" 
            size={16} 
            color="#10b981" 
            style={{ marginRight: 8 }} 
          />
          <Text className="text-lg font-semibold text-green-800 dark:text-green-200">
            Newsletter Subscribed
          </Text>
        </View>
        
        <Text className="text-sm text-green-700 dark:text-green-300 mb-3">
          You're subscribed with: {subscription?.email}
        </Text>
        
        <TouchableOpacity
          onPress={handleUnsubscribe}
          className="self-start"
        >
          <Text className="text-sm text-green-600 dark:text-green-400 underline">
            Unsubscribe
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <View className="flex-row items-center mb-2">
        <FontAwesome5 
          name="envelope" 
          size={16} 
          color={colorScheme === 'dark' ? '#60a5fa' : '#3b82f6'} 
          style={{ marginRight: 8 }} 
        />
        <Text className="text-lg font-semibold text-blue-800 dark:text-blue-200">
          Join Our Newsletter
        </Text>
      </View>
      
      <Text className="text-sm text-blue-700 dark:text-blue-300 mb-4">
        Get weekly curated tech articles, startup insights, and exclusive app updates delivered to your inbox. Join 1000+ tech enthusiasts!
      </Text>

      {/* Value proposition */}
      <View className="mb-4 p-3 bg-white dark:bg-zinc-800 rounded-md border border-blue-200 dark:border-blue-700">
        <Text className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">What you'll get:</Text>
        <Text className="text-xs text-blue-700 dark:text-blue-300">• 📰 Weekly top HN stories digest</Text>
        <Text className="text-xs text-blue-700 dark:text-blue-300">• 🚀 Early access to new app features</Text>
        <Text className="text-xs text-blue-700 dark:text-blue-300">• 💡 Tech trends & startup insights</Text>
        <Text className="text-xs text-blue-700 dark:text-blue-300">• 🎯 Zero spam, unsubscribe anytime</Text>
      </View>

      <View className="space-y-3">
        <View>
          <Text className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            Name (Optional)
          </Text>
          <TextInput
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-300 dark:border-blue-700 rounded-md text-black dark:text-white"
            placeholder="Your name"
            placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            Email Address *
          </Text>
          <TextInput
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-300 dark:border-blue-700 rounded-md text-black dark:text-white"
            placeholder="your@email.com"
            placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={isLoading}
          className={`w-full py-3 rounded-md flex-row items-center justify-center ${
            isLoading 
              ? 'bg-blue-300 dark:bg-blue-800' 
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
          }`}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-medium">Subscribing...</Text>
            </>
          ) : (
            <Text className="text-white font-medium">Subscribe to Newsletter</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text className="text-xs text-blue-600 dark:text-blue-400 mt-2">
        Privacy-first: We'll never share your email or spam you. Unsubscribe anytime.
      </Text>
    </View>
  );
}
