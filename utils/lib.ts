import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from "./types";
import { Comment } from "./interfaces";

const PAGE_SIZE = 20;
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const INITIAL_FETCH_LIMIT = 10;
const commentCache = new Map<number, Comment>();

// Fetch story IDs with pagination
export async function getStoryIds(choice: string, page: number) {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/${choice}.json?print=pretty`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allStoryIds = await response.json();

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return allStoryIds.slice(start, end);
  } catch (error) {
    console.error('Error fetching story IDs:', error);
    throw error;
  }
}

// Fetch with retry logic
const fetchWithRetries = async (url: string, retries = 3): Promise<Response> => {
  const timeout = 5000;
  
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
      
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries reached');
};

// Get single story data
export async function getStoryData(id: number) {
  try {
    const response = await fetchWithRetries(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching story data:', error);
    return null;
  }
}

// Get paginated stories
export async function getStories(choice: string, page: number) {
  try {
    const storyIds = await getStoryIds(choice, page);
    const storyPromises = storyIds.map(getStoryData);
    const stories = await Promise.all(storyPromises);
    return stories.filter(story => 
      story && 
      typeof story === 'object' && 
      'id' in story
    );
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}

// Fetch with timeout
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  } finally {
    clearTimeout(id);
  }
}

// Get comments with optimized loading
export async function getAllComments(
  kids: number[], 
  depth = 0, 
  maxDepth = 2,
  limit = INITIAL_FETCH_LIMIT
): Promise<Comment[]> {
  if (!kids || !kids.length || depth >= maxDepth) return [];
  
  const kidsToFetch = kids.slice(0, limit);
  
  const promises = kidsToFetch.map(async id => {
    if (commentCache.has(id)) return commentCache.get(id);

    try {
      const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
      );
      const comment = await response.json();
      
      const replies = depth < maxDepth - 1 && comment.kids ? 
        await getAllComments(comment.kids, depth + 1, maxDepth, 3) : 
        [];
      
      const processedComment: Comment = {
        ...comment,
        replies,
        depth,
        score: comment.score || 0,
        id: comment.id,
        text: comment.text || '',
        by: comment.by || '',
        time: comment.time || 0,
        kids: comment.kids || [],
      };
      
      commentCache.set(id, processedComment);
      return processedComment;
    } catch (error) {
      console.error(`Error fetching comment ${id}:`, error);
      return null;
    }
  });

  const comments = await Promise.all(promises);
  return comments.filter((c): c is Comment => c !== null);
}

// Load more comments
export async function loadMoreComments(
  kids: number[],
  offset: number,
  limit: number
): Promise<Comment[]> {
  const nextBatch = kids.slice(offset, offset + limit);
  return getAllComments(nextBatch, 0, 2, limit);
}

// Clear comment cache
export function clearCommentCache() {
  commentCache.clear();
}

export async function storeData(value: any){
  console.log('storeData', value)
  try {
    const existingArticleIds = await AsyncStorage.getItem('hn-article');
    let existingArticleIdsArray = existingArticleIds ? existingArticleIds.split(',') : [];
    const newId = value.data.toString();
    if (!existingArticleIdsArray.includes(newId)) {
      existingArticleIdsArray.push(newId); // convert id to string
      const stringValue = existingArticleIdsArray.join(',');
      await AsyncStorage.setItem('hn-article', stringValue);
      console.log(await AsyncStorage.getItem('hn-article'), 'saved')
    }
  } catch (e) {
    console.error(e, 'error')
  }
};

export async function fetchArticle(id: number) {
  // replace with your actual API call
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
  const article = await response.json();
  return article;
}

export async function clearAll() {
  try {
    await AsyncStorage.clear()
  } catch(e) {
    // clear error
  }

  console.log('Done.')
}

export function getLocalTime(value:number){
  const options:any  = {
    year: "2-digit",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = new Date(value * 1000);
  return date.toLocaleDateString(undefined, options);
}

// Format timestamp for display
export function formatDate(value: number): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  const date = new Date(value * 1000);
  return date.toLocaleDateString(undefined, options);
}

// Save article to AsyncStorage
export async function saveArticle(article: Article) {
  try {
    const savedArticlesJson = await AsyncStorage.getItem('savedArticles');
    const savedArticles = savedArticlesJson ? JSON.parse(savedArticlesJson) : [];

    const isArticleAlreadySaved = savedArticles.some(
      (savedArticle: Article) => savedArticle.id === article.id
    );

    if (!isArticleAlreadySaved) {
      savedArticles.push(article);
      await AsyncStorage.setItem('savedArticles', JSON.stringify(savedArticles));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving article:', error);
    return false;
  }
}

// Get saved articles from AsyncStorage
export async function getStorySaved(): Promise<Article[]> {
  try {
    const savedArticles = await AsyncStorage.getItem('savedArticles');
    return savedArticles ? JSON.parse(savedArticles) : [];
  } catch (error) {
    console.error('Error getting saved articles:', error);
    return [];
  }
}

// Get filtered and sorted saved stories
export async function getFilteredSavedStories(
  sortOrder: 'newest' | 'oldest' = 'newest',
  searchTerm: string = ''
): Promise<Article[]> {
  try {
    let savedArticles = await getStorySaved();
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      savedArticles = savedArticles.filter(article => 
        article.title?.toLowerCase().includes(term)
      );
    }
    
    savedArticles.sort((a, b) => {
      if (sortOrder === 'newest') {
        return (b.time || 0) - (a.time || 0);
      } else {
        return (a.time || 0) - (b.time || 0);
      }
    });
    
    return savedArticles;
  } catch (error) {
    console.error('Error filtering saved articles:', error);
    return [];
  }
}

// Remove article from saved articles
export async function removeArticle(articleId: number) {
  try {
    const savedArticlesJson = await AsyncStorage.getItem('savedArticles');
    let savedArticles = savedArticlesJson ? JSON.parse(savedArticlesJson) : [];

    savedArticles = savedArticles.filter((article: Article) => article.id !== articleId);
    await AsyncStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    return savedArticles;
  } catch (error) {
    console.error('Error removing article:', error);
    return [];
  }
}

// Fetch single item by ID
export const fetchItem = async (id: number) => {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    throw error;
  }
};

