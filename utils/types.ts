// Update the Article interface to include all the properties we're using
export interface Article {
  id: number;
  title?: string;
  url?: string;
  time?: number;
  kids?: number[];
  // Add missing properties
  text?: string;        // Content for self-posts like Ask HN
  by?: string;          // Author username
  score?: number;       // Story score/points
  descendants?: number; // Comment count
  type?: string;        // Type of item (story, comment, etc)
}

