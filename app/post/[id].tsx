import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { fetchItem } from '@/utils/lib';
import { Article } from '@/utils/types';
import { Comment } from '@/utils/interfaces';
import RenderHTML from 'react-native-render-html';
import { FontAwesome } from '@expo/vector-icons';
import { getAllComments, getLocalTime } from '@/utils/lib';
import { useColorScheme } from '@/components/useColorScheme';

export default function PostPage() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        if (id && !Array.isArray(id)) {
          const postData = await fetchItem(parseInt(id));
          setPost(postData);
          
          // If post has comments, load them
          if (postData?.kids?.length) {
            const commentData = await getAllComments(postData.kids, 0, 2, 10);
            setComments(commentData);
          }
        }
      } catch (error) {
        console.error('Error loading post:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
  }, [id]);

  const renderHtmlProps = {
    baseStyle: { 
      color: colorScheme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
      lineHeight: 24,
    },
    contentWidth: windowWidth - 32,
    source: { html: post?.text || '' },
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-zinc-600 dark:text-zinc-400">Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-lg text-black dark:text-white">Post not found</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-blue-500 px-4 py-2 rounded-md"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerTitle: 'Post',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome name="close" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
          )
        }} 
      />
      <ScrollView className="flex-1 bg-white dark:bg-black">
        <View className="px-6 py-4">
          {/* Post title */}
          <Text className="text-2xl font-bold text-black dark:text-white mb-4 leading-8">
            {post.title}
          </Text>
          
          {/* Post metadata */}
          <View className="flex-row justify-between items-center mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-700">
            <View>
              <Text className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                by {post.by || 'Anonymous'}
              </Text>
              <Text className="text-xs text-zinc-500 dark:text-zinc-500">
                {post.time ? getLocalTime(post.time) : ''}
              </Text>
            </View>
            <View className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
              <Text className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                {post.score || 0} points
              </Text>
            </View>
          </View>
          
          {/* Post content */}
          {post.text ? (
            <View className="mb-8">
              <RenderHTML 
                {...renderHtmlProps}
                source={{ html: post.text }}
                contentWidth={windowWidth - 48}
                baseStyle={{
                  color: colorScheme === 'dark' ? '#e5e5e5' : '#1f2937',
                  fontSize: 17,
                  lineHeight: 28,
                }}
              />
            </View>
          ) : null}
          
          {/* Comments section */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-black dark:text-white mb-6">
              Comments ({post.kids?.length || 0})
            </Text>
            
            {comments.length > 0 ? (
              comments.map((comment) => (
                <View key={comment.id} className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <Text className="font-semibold text-black dark:text-white">
                      {comment.by || 'Anonymous'}
                    </Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                      {comment.time ? getLocalTime(comment.time) : ''}
                    </Text>
                  </View>
                  <RenderHTML
                    baseStyle={{ 
                      color: colorScheme === 'dark' ? '#e5e5e5' : '#374151',
                      fontSize: 15,
                      lineHeight: 24,
                    }}
                    contentWidth={windowWidth - 80}
                    source={{ html: comment.text || '' }}
                  />
                </View>
              ))
            ) : (
              <View className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <Text className="text-zinc-600 dark:text-zinc-400 text-center">No comments yet.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
