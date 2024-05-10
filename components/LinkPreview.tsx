import { Link } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Linking, Image } from "react-native";
import { OpenGraphParser } from "@sleiv/react-native-opengraph-parser";
import { openBrowserAsync } from "expo-web-browser";
import * as WebBrowser from "expo-web-browser";
import LoadingPlaceholder from "./LoadingPlaceholder";

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
  const hackerNewsIcon = "../assets/favicon.ico";
  const [preview, setPreview] = useState<PreviewData>({
    title: "",
    url: "",
    generator: "",
    viewport: "",
    description: "",
    image: "",
    favicon: "", // Add 'favicon' property to the 'PreviewData' interface
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPreview = async () => {
    try {
      const metadataArray = await OpenGraphParser.extractMeta(url);
      if (metadataArray.length > 0) {
        const { title = "", url = "" } = metadataArray[0];
        const urlObject = new URL(url);
        const favicon = urlObject
          ? new URL("/favicon.ico", urlObject.origin).href
          : `${hackerNewsIcon}`;

        setPreview({
          title,
          url,
          generator: "",
          viewport: "",
          description: "",
          image: "",
          favicon,
        });
      }
      setLoading(false);
    } catch (error: any) {
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

  if (loading) {
    return (
      <LoadingPlaceholder />
    );
  }

  if (error) {
    return <Text>Error loading preview: {error.message}</Text>;
  }

  const { title, description, image, favicon } = preview;

  return (
    <TouchableOpacity
      className="h-fit w-fit bg-white dark:bg-zinc-800 p-4 flex-row items-center"
      onPress={() => WebBrowser.openBrowserAsync(url)}
    >
      <View className="flex-1 flex-row bg-white dark:bg-zinc-800 justify-center items-center">
        <Image
          source={{ uri: favicon || "https://via.placeholder.com/16x16" }}
          className="w-16 bg-transparent h-16 rounded-md mr-4"
        />
        <Text className="text-black dark:text-white text-xs underline">
          {url?.substring(0, 50)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default LinkPreview;
