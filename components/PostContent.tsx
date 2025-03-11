import React from 'react';
import { View } from 'react-native';
import RenderHTML from 'react-native-render-html';

type PostContentProps = {
  content: string;
  width: number;
};

export default function PostContent({ content, width }: PostContentProps) {
  return (
    <View>
      <RenderHTML
        contentWidth={width}
        source={{ html: content }}
      />
    </View>
  );
}
