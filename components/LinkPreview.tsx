import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { OpenGraphParser } from "@sleiv/react-native-opengraph-parser";
import * as WebBrowser from "expo-web-browser";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { FontAwesome } from "@expo/vector-icons";

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
      const metadataArray:any  = await OpenGraphParser.extractMeta(url);
      if (metadataArray.length > 0) {
        const { title = "", url = "" } = metadataArray[0];
        const urlObject = new URL(url);
        const favicon = urlObject
          ? new URL("/favicon.ico", urlObject.origin).href
          : `${hackerNewsIcon}`;
      if(metadataArray.includes("status: 400")){
        const filteredMetadataArray = metadataArray.filter((meta: string | string[]) => !meta.includes("status: 400"));
        if (filteredMetadataArray.length > 0) {
          const { title = "", url = "" } = filteredMetadataArray[0];
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


      }

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
    return <Text>Error loading preview: {(error as Error).message}</Text>;
  }

  if (loading) {
    return (
      <LoadingPlaceholder />
    );
  }

  if (error) {
    return <Text>Error loading preview: {(error as Error).message}</Text>;
  }

  const { title, description, image, favicon } = preview;

  return (
    <TouchableOpacity
    className="h-17 w-fit  bg-white dark:bg-zinc-800 p-4 flex-row items-start justify-start"
    onPress={() => WebBrowser.openBrowserAsync(url)}
  >
    <View className="flex-1 flex-row bg-white dark:bg-zinc-800 justify-center items-center text-justify">
      {favicon.length !== 0 ? (
        <Image
          source={{ uri: favicon }}
          className="w-16 bg-zinc-600 h-16 rounded-md mr-4"
        />
      ) : (
        <FontAwesome name="hacker-news" size={24}  /> // Replace "icon-name" with the actual name of the icon you want to use
      )}
<Text 
  className="h-16 text-black dark:text-white text-xs underline bg-zinc-600 text-center"
  numberOfLines={1} 
  ellipsizeMode='clip' 
>        {url}
      </Text>
    </View>
  </TouchableOpacity>
  );
};

export default LinkPreview;
