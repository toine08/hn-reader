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
  visible: boolean;
  onClose: () => void;
  item?: number;
  kids?: number[];
}
export interface ListItemProps {
  item: Article;  // Change from number to Article
  storyType: string;
  type?: "save" | "trash";
  onPressSave?: (item: Article) => void;
  onPressTrash?: (articleId: number) => void;
  onPressComments?: () => void;
  isSaved?: boolean;
  savedArticles: number[];  // Add this line to track saved article IDs
}

export interface ScrollViewProps {
  story: string;
  saveOrTrash: ListItemProps["type"];
  onItemSelect?: (item: Article)=>void;
}