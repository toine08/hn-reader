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
      <ScrollView className="flex-1 bg-white dark:bg-black p-4">
        {/* Post title */}
        <Text className="text-xl font-bold text-black dark:text-white mb-2">
          {post.title}
        </Text>
        
        {/* Post metadata */}
        <View className="flex-row justify-between mb-6">
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            by {post.by || 'Anonymous'} · {post.time ? getLocalTime(post.time) : ''}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            {post.score || 0} points
          </Text>
        </View>
        
        {/* Post content */}
        {post.text ? (
          <View className="mb-8 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md">
            <RenderHTML {...renderHtmlProps} />
          </View>
        ) : null}
        
        {/* Comments section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-black dark:text-white mb-2">
            Comments ({post.kids?.length || 0})
          </Text>
          
          {comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} className="mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <View className="flex-row justify-between mb-1">
                  <Text className="font-medium text-black dark:text-white">
                    {comment.by || 'Anonymous'}
                  </Text>
                  <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                    {comment.time ? getLocalTime(comment.time) : ''}
                  </Text>
                </View>
                <RenderHTML
                  baseStyle={{ 
                    color: colorScheme === 'dark' ? '#fff' : '#000',
                    fontSize: 14,
                  }}
                  contentWidth={windowWidth - 32}
                  source={{ html: comment.text || '' }}
                />
              </View>
            ))
          ) : (
            <Text className="text-zinc-600 dark:text-zinc-400">No comments yet.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}
