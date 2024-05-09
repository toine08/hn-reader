import { Link } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { OpenGraphParser } from '@sleiv/react-native-opengraph-parser';
import { openBrowserAsync } from 'expo-web-browser';
import * as WebBrowser from 'expo-web-browser';

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


const LinkPreview: React.FC<WebLinkPreviewProps> = ({ url }) => {
  const [preview, setPreview] = useState<PreviewData>({
    title: '',
    url: '',
    generator: '',
    viewport: '',
    description: '',
    image: '',
    favicon: '', // Add 'favicon' property to the 'PreviewData' interface
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPreview = async () => {
    try {
      const metadataArray = await OpenGraphParser.extractMeta(url);
      if (metadataArray.length > 0) {
        const { title = '', url = '' } = metadataArray[0];
        const favicon = url ? new URL('/favicon.ico', url).href : '';
        console.log('favicon', favicon);
        setPreview({ title, url, generator: '', viewport: '', description: '', image: '', favicon }); // Add 'favicon' property to the 'setPreview' function
      }
      setLoading(false);
    } catch (error:any ) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [url]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading preview: {error.message}</Text>;
  }

  const { title, description, image } = preview;

  return (
    <TouchableOpacity
      className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 flex-row items-center"
      onPress={() => WebBrowser.openBrowserAsync(url)}
    >
      {image && (
        <Image source={{ uri: image }} className="w-16 h-16 rounded-md mr-4" />
      )}
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <Image source={{ uri: image }} className="w-16 h-16 rounded-md mr-4" />
        <Text className="text-small font-bold text-blue-500 mb-1">{title}</Text>
        <Text className="text-blue-500 underline">{url}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default LinkPreview;