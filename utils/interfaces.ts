import { Article } from "./types";

export interface Comment {
  id: number;
  text?: string;
  by?: string;
  time?: number;
  kids?: number[];
  score: number;
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
  item: Article;
  storyType: string;
  type?: "save" | "trash";
  onPressSave?: (item: Article) => void;
  onPressTrash?: (articleId: number) => void;
  onPressComments?: () => void;
  savedArticles: number[];
}