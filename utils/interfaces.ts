import { Article } from "./types";
export interface Comment {
  id: number;
  text?: string;
  by?: string;
  time?: number;
  kids?: number[];
  score: number;  // Added required score field
  replies?: Comment[];
  depth?: number;
}

export interface StoryTypeModalProps {
  item: number;  // This expects a story ID number
  kids?: number[];
  onClose?: () => void;
}
export interface ListItemProps {
  item: Article;  // Change from number to Article
  storyType: string;
  type?: "save" | "trash";
  onPressSave?: () => void;
  onPressTrash?: () => void;
  onPressComments?: () => void;
}

export interface ScrollViewProps {
  story: string;
  saveOrTrash: ListItemProps["type"];
  onItemSelect?: (item: Article)=>void;
}