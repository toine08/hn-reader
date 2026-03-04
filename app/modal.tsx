import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, FlatList, Dimensions, TouchableOpacity, Linking, GestureResponderEvent, Modal, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useCallback, memo } from "react";
import { Text, View } from "@/components/Themed";
import { getAllComments, getLocalTime, loadMoreComments } from "@/utils/lib";
import RenderHTML from "react-native-render-html";
import { useColorScheme } from "@/components/useColorScheme";
import { StoryTypeModalProps, Comment } from "@/utils/interfaces";
import { FontAwesome } from "@expo/vector-icons";
import { useRightHandMode } from "@/contexts/RightHandModeContext";

const CommentItem = memo(({ comment, windowWidth, parentId = '', isRightHandMode }: { 
  comment: Comment; 
  windowWidth: number;
  parentId?: string;
  isRightHandMode: boolean;
}) => {
  const colorScheme = useColorScheme();
  const [showReplies, setShowReplies] = useState(true);
  const indentation = (comment.depth || 0) * 20;
  const isNestedComment = (comment.depth || 0) > 0;

  const uniqueKey = `${parentId}-${comment.id}-${comment.time || Date.now()}`;

  const renderHtmlProps = {
    baseStyle: { 
      color: colorScheme === 'dark' ? '#e4e4e7' : '#18181b',
      fontSize: 15,
      lineHeight: 22,
    },
    contentWidth: windowWidth - 40 - indentation,
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
        className="border-b border-zinc-100 dark:border-zinc-800/50"
        style={{ 
          marginLeft: isRightHandMode ? 0 : indentation,
          marginRight: isRightHandMode ? indentation : 0,
          position: 'relative'
        }}
      >
        {/* Vertical connecting line for nested comments */}
        {isNestedComment && (
          <View 
            style={{
              position: 'absolute',
              left: isRightHandMode ? undefined : -12,
              right: isRightHandMode ? -12 : undefined,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: colorScheme === 'dark' ? '#3f3f46' : '#e4e4e7'
            }}
          />
        )}

        {/* Horizontal connecting line for nested comments */}
        {isNestedComment && (
          <View 
            style={{
              position: 'absolute',
              left: isRightHandMode ? undefined : -12,
              right: isRightHandMode ? -12 : undefined,
              top: 24,
              width: 12,
              height: 2,
              backgroundColor: colorScheme === 'dark' ? '#3f3f46' : '#e4e4e7'
            }}
          />
        )}

        <View className="px-4 py-4">
          <View className={`flex-row ${isRightHandMode ? 'flex-row-reverse' : ''} items-center gap-2 mb-2`}>
            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {comment.by || 'Anonymous'}
            </Text>
            <Text className="text-xs text-zinc-400 dark:text-zinc-500">
              •
            </Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              {comment.time ? getLocalTime(comment.time) : 'Unknown'}
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
              className="mt-3 flex-row items-center"
            >
              <FontAwesome 
                name={showReplies ? 'chevron-up' : 'chevron-down'} 
                size={10} 
                color={colorScheme === 'dark' ? '#3b82f6' : '#2563eb'} 
              />
              <Text className="text-xs font-medium text-blue-600 dark:text-blue-400 ml-1.5">
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
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
              isRightHandMode={isRightHandMode}
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
  const { isRightHandMode } = useRightHandMode();
  const windowWidth = Dimensions.get('window').width;
  const insets = useSafeAreaInsets();

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
    const newComments = await loadMoreComments(kids, loadedCount, COMMENTS_PER_PAGE, 0);
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
      isRightHandMode={isRightHandMode}
    />
  ), [windowWidth, isRightHandMode]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={onClose}
      className="m-0 flex-1 items-center justify-end w-full bg-white dark:bg-black h-60 bg-opacity-100"
    >
      <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
        <View className="border-b border-zinc-200 dark:border-zinc-800 pb-3 pt-3">
          <View className="flex-row items-center justify-between px-4">
            <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Comments {kids?.length ? `(${kids.length})` : ''}
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800"
            >
              <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0284c7" />
            <Text className="text-base text-zinc-500 dark:text-zinc-400 mt-4">
              Loading comments...
            </Text>
            <Text className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
              {loadedCount} of {kids?.length || 0}
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
            className="bg-white dark:bg-black"
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <FontAwesome name="comment-o" size={48} color="#a1a1aa" />
            <Text className="text-lg font-medium text-zinc-600 dark:text-zinc-400 mt-4 text-center">
              No comments yet
            </Text>
            <Text className="text-sm text-zinc-500 dark:text-zinc-500 mt-2 text-center">
              Be the first to start the discussion!
            </Text>
          </View>
        )}
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Modal>
  );
}
