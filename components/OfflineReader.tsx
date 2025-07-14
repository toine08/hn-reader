import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Article } from '@/utils/types';
import RenderHTML from 'react-native-render-html';
import { FontAwesome } from '@expo/vector-icons';
import { getLocalTime, getOfflineContent } from '@/utils/lib';
import { useColorScheme } from '@/components/useColorScheme';

interface OfflineReaderProps {
  article: Article;
  onClose?: () => void;
}

export default function OfflineReader({ article, onClose }: OfflineReaderProps) {
  const [offlineContent, setOfflineContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [textOnlyMode, setTextOnlyMode] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    const loadOfflineContent = async () => {
      setLoading(true);
      try {
        // First check if the article already has offline content
        if (article.offlineContent) {
          setOfflineContent(article.offlineContent);
        } else {
          // Try to get it from storage
          const content = await getOfflineContent(article.id);
          setOfflineContent(content);
        }
      } catch (error) {
        console.error('Error loading offline content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOfflineContent();
  }, [article.id, article.offlineContent]);

  const renderHtmlProps = {
    baseStyle: { 
      color: colorScheme === 'dark' ? '#e5e5e5' : '#1f2937',
      fontSize: 17,
      lineHeight: 28,
      fontFamily: 'System',
    },
    contentWidth: windowWidth - 48,
    // Ignore problematic tags that might cause issues
    ignoredDomTags: [
      'script', 'style', 'head', 'meta', 'link', 'title', 'svg', 'button', 
      'iframe', 'video', 'audio', 'embed', 'object', 'canvas', 'form',
      'input', 'select', 'textarea', 'template'
    ],
    // Handle images better and ignore problematic ones
    renderersProps: {
      img: {
        enableExperimentalPercentWidth: true,
      }
    },
    systemFonts: ['System'],
    // Better typography
    tagsStyles: {
      p: {
        marginBottom: 16,
        lineHeight: 28,
        fontSize: 17,
      },
      h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        marginBottom: 20,
        marginTop: 24,
        color: colorScheme === 'dark' ? '#ffffff' : '#111827',
      },
      h2: {
        fontSize: 24,
        fontWeight: '700' as const,
        marginBottom: 16,
        marginTop: 20,
        color: colorScheme === 'dark' ? '#ffffff' : '#111827',
      },
      h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        marginBottom: 12,
        marginTop: 16,
        color: colorScheme === 'dark' ? '#ffffff' : '#111827',
      },
      blockquote: {
        borderLeftWidth: 4,
        borderLeftColor: colorScheme === 'dark' ? '#4b5563' : '#d1d5db',
        paddingLeft: 16,
        marginLeft: 0,
        marginBottom: 16,
        fontStyle: 'italic' as const,
        backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#f9fafb',
        padding: 16,
        borderRadius: 8,
      },
      code: {
        backgroundColor: colorScheme === 'dark' ? '#374151' : '#f3f4f6',
        padding: 4,
        borderRadius: 4,
        fontSize: 15,
        fontFamily: 'Courier',
      },
      pre: {
        backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#f8fafc',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
      },
      a: {
        color: colorScheme === 'dark' ? '#60a5fa' : '#2563eb',
        textDecorationLine: 'underline' as const,
      },
      ul: {
        marginBottom: 16,
      },
      ol: {
        marginBottom: 16,
      },
      li: {
        marginBottom: 8,
        lineHeight: 24,
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-zinc-600 dark:text-zinc-400">Loading offline content...</Text>
      </View>
    );
  }

  if (!offlineContent) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black p-4">
        <FontAwesome name="wifi" size={50} color="#ccc" />
        <Text className="mt-4 text-lg text-black dark:text-white text-center">
          Offline content not available
        </Text>
        <Text className="mt-2 text-center text-gray-500 dark:text-gray-400">
          This article needs to be downloaded for offline reading when you have an internet connection.
        </Text>
        {onClose && (
          <TouchableOpacity 
            onPress={onClose}
            className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black">
      <View className="px-6 py-4">
        {/* Back button for additional navigation - only show if onClose is provided */}
        {onClose && (
          <TouchableOpacity 
            onPress={onClose}
            className="flex-row items-center mb-4 self-start"
          >
            <FontAwesome name="arrow-left" size={16} color={colorScheme === 'dark' ? '#60a5fa' : '#2563eb'} />
            <Text className="ml-2 text-blue-500 dark:text-blue-400 font-medium">
              Back to list
            </Text>
          </TouchableOpacity>
        )}

        {/* Offline indicator */}
        <View className="flex-row items-center justify-between mb-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <View className="flex-row items-center flex-1">
            <FontAwesome name="download" size={18} color="#22c55e" />
            <Text className="ml-3 text-sm text-green-700 dark:text-green-300 font-medium">
              Reading offline • Cached {article.offlineTimestamp ? new Date(article.offlineTimestamp).toLocaleDateString() : ''}
            </Text>
          </View>
          
          {/* Text-only mode toggle for HTML content */}
          {article.offlineContentType === 'html' && (
            <TouchableOpacity 
              onPress={() => setTextOnlyMode(!textOnlyMode)}
              className={`px-3 py-1 rounded-full ${textOnlyMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <Text className={`text-xs font-medium ${textOnlyMode ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {textOnlyMode ? 'Rich' : 'Text'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Article title */}
        <Text className="text-2xl font-bold text-black dark:text-white mb-4 leading-8">
          {article.title}
        </Text>
        
        {/* Article metadata */}
        <View className="flex-row justify-between items-center mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <View>
            <Text className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              by {article.by || 'Anonymous'}
            </Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-500">
              {article.time ? getLocalTime(article.time) : ''}
            </Text>
          </View>
          {article.score && (
            <View className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
              <Text className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                {article.score} points
              </Text>
            </View>
          )}
        </View>

        {/* Article content */}
        <View className="mb-8">
          {article.offlineContentType === 'text' || !article.url || textOnlyMode ? (
            // For text content or text-only mode
            <Text className="text-lg text-gray-800 dark:text-gray-200 leading-8 font-normal">
              {offlineContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
            </Text>
          ) : (
            // For HTML content from external URLs
            <View>
              {(() => {
                try {
                  // Advanced content cleaning and validation
                  let safeContent = offlineContent;
                  
                  // Remove any remaining problematic URLs and patterns
                  const problematicPatterns = [
                    /about:\/{0,3}[^"'\s<>]*/gi,
                    /blob:[^"'\s<>]*/gi,
                    /data:[^"'\s<>]*/gi,
                    /javascript:[^"'\s<>]*/gi,
                    /chrome-extension:[^"'\s<>]*/gi,
                    /webkit:[^"'\s<>]*/gi,
                    /file:[^"'\s<>]*/gi,
                  ];
                  
                  problematicPatterns.forEach(pattern => {
                    safeContent = safeContent.replace(pattern, '');
                  });
                  
                  // Remove any images that don't have proper HTTPS sources
                  safeContent = safeContent.replace(/<img(?![^>]*src=["']https:\/\/[^"']+["'])[^>]*>/gi, '');
                  
                  // Remove any links that might be problematic
                  safeContent = safeContent.replace(/<a(?![^>]*href=["']https?:\/\/[^"']+["'])[^>]*>(.*?)<\/a>/gi, '$1');
                  
                  // Additional safety: remove any remaining empty or malformed attributes
                  safeContent = safeContent
                    .replace(/\s(?:src|href)=["']["']/gi, '')
                    .replace(/\s(?:src|href)=["'][^"']{0,3}["']/gi, '');

                  // Content quality checks
                  const hasProblematicContent = 
                    safeContent.includes('about:') || 
                    safeContent.includes('blob:') ||
                    safeContent.includes('data:') ||
                    safeContent.length < 50;

                  // If content is still problematic, automatically switch to text mode
                  if (hasProblematicContent) {
                    return (
                      <View>
                        <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                          <Text className="text-blue-700 dark:text-blue-300 text-sm">
                            Automatically switched to text-only mode for better readability
                          </Text>
                        </View>
                        <Text className="text-lg text-gray-800 dark:text-gray-200 leading-8 font-normal">
                          {offlineContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                        </Text>
                      </View>
                    );
                  }

                  // Try to render the cleaned HTML
                  return (
                    <RenderHTML
                      {...renderHtmlProps}
                      source={{ html: safeContent }}
                    />
                  );
                } catch (error) {
                  console.error('Error processing offline content:', error);
                  return (
                    <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <Text className="text-yellow-800 dark:text-yellow-200 mb-2 font-semibold">
                        Content Display Issue
                      </Text>
                      <Text className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                        The cached content couldn't be displayed properly. Here's the text version:
                      </Text>
                      <Text className="text-gray-800 dark:text-gray-200 leading-7">
                        {offlineContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                      </Text>
                    </View>
                  );
                }
              })()}
            </View>
          )}
        </View>

        {/* Original URL link if available */}
        {article.url && (
          <View className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Text className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
              Original Article:
            </Text>
            <Text className="text-sm text-blue-500 dark:text-blue-400" numberOfLines={3}>
              {article.url}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
