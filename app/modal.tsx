import { StatusBar } from "expo-status-bar";
import { Platform, SafeAreaView, FlatList, Dimensions, TouchableOpacity, Linking, GestureResponderEvent, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { Text, View } from "@/components/Themed";
import { getAllComments, getLocalTime } from "@/utils/lib";
import RenderHTML from "react-native-render-html";
import { useColorScheme } from "@/components/useColorScheme";
import { StoryTypeModalProps, Comment } from "@/utils/interfaces";
import { FontAwesome } from "@expo/vector-icons";

const CommentItem = ({ comment, windowWidth, parentId = '' }: { 
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
};

const params = {
  ITEM_HEIGHT: 120, // Approximate height for comment items
  PAGE_SIZE: 20,
};

const VISIBLE_ITEMS = Math.ceil(Dimensions.get('window').height / params.ITEM_HEIGHT * 2);

export default function StoryTypeModal({ visible, onClose, item, kids }: StoryTypeModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchComments = async () => {
      if (kids && kids.length > 0) {
        const data = await getAllComments(kids);

        // Add default score if missing
        const commentsWithScore = data.map(comment => ({
          ...comment,
          score: comment.score || 0
        }));
        setComments(commentsWithScore);
      }
    };

    fetchComments();
  }, [kids]);

  const getItemLayout = React.useCallback(
    (_: any, index: number) => ({
      length: params.ITEM_HEIGHT,
      offset: params.ITEM_HEIGHT * index,
      index,
    }),
    []
  );

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
      {comments.length > 0 ? (
        <FlatList
          className="flex-1 bg-white dark:bg-black"
          data={comments}
          windowSize={5}
          maxToRenderPerBatch={VISIBLE_ITEMS}
          initialNumToRender={VISIBLE_ITEMS}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          getItemLayout={getItemLayout}
          keyExtractor={(item) => `comment-${item.id}-${item.time || Date.now()}`}
          renderItem={({ item, index }) => (
            <CommentItem 
              key={`root-${item.id}-${index}`}
              comment={item} 
              windowWidth={windowWidth}
              parentId={`root-${index}`}
            />
          )}
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
