import React, { useState, useEffect, memo } from "react";
import { View, Text, Image } from "react-native";
import { OpenGraphParser } from "@sleiv/react-native-opengraph-parser";
import * as WebBrowser from "expo-web-browser";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";

type PreviewData = {
  title: string;
  url: string;
  generator: string;
  viewport: string;
  description: string;
  image: string;
  favicon: string; // Add 'favicon' property to the 'PreviewData' interface
};

interface WebLinkPreviewProps {
  url: string;
}

const LinkPreview: React.FC<WebLinkPreviewProps> = memo(({ url }) => {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hostname, setHostname] = useState<string>('');

  const getFaviconUrl = (urlString: string) => {
    try {
      const urlObject = new URL(urlString);
      setHostname(urlObject.hostname);
      return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=128`;
    } catch {
      return '';
    }
  };

  const fetchPreview = async () => {
    try {
      // Instead of directly fetching the URL, just parse it and get the favicon
      const favicon = getFaviconUrl(url);
      setLoading(false);
      return { favicon };
    } catch (error) {
      console.error('Error processing URL:', error);
      setError('Unable to load preview');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [url]);


  if (loading) {
    return (
      <View className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-2">
        <Text className="text-xs text-zinc-500">Loading preview...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-2">
        <Text className="text-xs text-zinc-500">{hostname || url}</Text>
      </View>
    );
  }

  return (
    <View className="bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden">
      <View className="flex-row items-center p-2 space-x-2">
        <View className="w-5 h-5 justify-center items-center flex-shrink-0">
          {hostname ? (
            <Image
              source={{ uri: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128` }}
              className="w-4 h-4 rounded-sm"
              resizeMode="contain"
            />
          ) : (
            <FontAwesome 
              name="link" 
              size={14} 
              color={colorScheme === 'dark' ? '#fff' : '#000'} 
            />
          )}
        </View>
        <Text 
          className="flex-1 text-xs text-black dark:text-white"
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {hostname || url}
        </Text>
      </View>
    </View>
  );
}, (prevProps, nextProps) => prevProps.url === nextProps.url);

LinkPreview.displayName = 'LinkPreview';

export default LinkPreview;
