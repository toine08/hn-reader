import { StatusBar } from "expo-status-bar";
import { Platform, SafeAreaView, FlatList, Dimensions, TouchableOpacity, Linking, GestureResponderEvent, Modal, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useCallback, memo } from "react";
import { Text, View } from "@/components/Themed";
import { getAllComments, getLocalTime, loadMoreComments } from "@/utils/lib";
import RenderHTML from "react-native-render-html";
import { useColorScheme } from "@/components/useColorScheme";
import { StoryTypeModalProps, Comment } from "@/utils/interfaces";
import { FontAwesome } from "@expo/vector-icons";

const CommentItem = memo(({ comment, windowWidth, parentId = '' }: { 
  comment: Comment; 
  windowWidth: number;
  parentId?: string;
}) => {
  const colorScheme = useColorScheme();
  const [showReplies, setShowReplies] = useState(true);
  const indentation = (comment.depth || 0) * 16;

  // Generate a unique key using timestamp if needed
  const uniqueKey = `${parentId}-${comment.id}-${comment.time || Date.now()}`;

  const renderHtmlProps = {
    baseStyle: { 
      color: colorScheme === 'dark' ? '#fff' : '#000',
      fontSize: 14,
      lineHeight: 20,
    },
    contentWidth: windowWidth - 32 - indentation,
    source: { html: comment.text || '' },
    renderersProps: {
      a: {
        onPress: (
          event: GestureResponderEvent, 
          href: string, 
          htmlAttribs: Record<string, string>,
          target: "_blank" | "_self" | "_parent" | "_top"
        ) => {
          Linking.openURL(href);
        }
      }
    },
    defaultTextProps: {
      selectable: true
    }
  };

  return (
    <React.Fragment key={uniqueKey}>
      <View 
        className="border-b border-zinc-200 dark:border-zinc-800"
        style={{ marginLeft: indentation }}
      >
        <View className="px-4 py-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-bold text-black dark:text-white">
              {comment.by || 'Anonymous'}
            </Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              {comment.time ? getLocalTime(comment.time) : 'No date'}
            </Text>
          </View>
          
          {comment.text && (
            <View className="mt-1">
              <RenderHTML {...renderHtmlProps} />
            </View>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <TouchableOpacity 
              onPress={() => setShowReplies(!showReplies)}
              className="mt-2"
            >
              <Text className="text-xs text-blue-500">
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showReplies && comment.replies && (
        <View>
          {comment.replies.map((reply, index) => (
            <CommentItem 
              key={`${uniqueKey}-reply-${index}-${reply.id}`}
              comment={reply} 
              windowWidth={windowWidth}
              parentId={uniqueKey}
            />
          ))}
        </View>
      )}
    </React.Fragment>
  );
});

const COMMENTS_PER_PAGE = 10;

export default function StoryTypeModal({ visible, onClose, item, kids }: StoryTypeModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    let isMounted = true;

    const fetchInitialComments = async () => {
      setIsLoading(true);
      if (kids?.length) {
        const initialComments = await getAllComments(kids, 0, 2, COMMENTS_PER_PAGE);
        if (isMounted) {
          setComments(initialComments);
          setLoadedCount(initialComments.length);
        }
      }
      if (isMounted) setIsLoading(false);
    };

    setComments([]);
    setLoadedCount(0);
    fetchInitialComments();

    return () => { isMounted = false };
  }, [kids]);

  const loadMore = async () => {
    if (isLoadingMore || !kids || loadedCount >= kids.length) return;
    
    setIsLoadingMore(true);
    const newComments = await loadMoreComments(kids, loadedCount, COMMENTS_PER_PAGE);
    setComments(prev => [...prev, ...newComments]);
    setLoadedCount(prev => prev + newComments.length);
    setIsLoadingMore(false);
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#0284c7" />
      </View>
    );
  };

  // Memoize CommentItem for better performance
  const renderComment = useCallback(({ item: comment }: { item: Comment }) => (
    <CommentItem 
      comment={comment} 
      windowWidth={windowWidth}
      parentId={`root-${comment.id}`}
    />
  ), [windowWidth]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={onClose}
      className="m-0 flex-1 items-center justify-end w-full bg-white dark:bg-black h-60 bg-opacity-100"
    >
      <View className="bg-white dark:bg-black items-end">
        <TouchableOpacity className="mt-5 p-10" onPress={onClose}>
          <FontAwesome name="close" size={24} color={'red'} />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0284c7" />
          <Text className="text-lg text-zinc-600 dark:text-zinc-400 mt-4">
            Loading comments... ({loadedCount}/{kids?.length || 0})
          </Text>
        </View>
      ) : comments.length > 0 ? (
        <FlatList
          data={comments}
          renderItem={renderComment}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          windowSize={3}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={75}
          removeClippedSubviews={true}
          initialNumToRender={5}
          keyExtractor={item => `comment-${item.id}`}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-zinc-600 dark:text-zinc-400">
            No comments yet. Come back later!
          </Text>
        </View>
      )}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Modal>
  );
}
