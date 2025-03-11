import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from "./types";
import { Comment } from "./interfaces";  // Use the interface from interfaces.ts


const PAGE_SIZE = 20; // Number of stories per page
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const INITIAL_FETCH_LIMIT = 10;
const commentCache = new Map<number, Comment>();

// Remove the local Comment interface since we're importing it

// Function to get a page of story IDs
export async function getStoryIds(choice: string, page: number) {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/${choice}.json?print=pretty`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allStoryIds = await response.json();

    // Calculate start and end indices for the slice
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    // Return a slice of the story IDs
    return allStoryIds.slice(start, end);
  } catch (error) {
    console.error('Error fetching story IDs:', error);
    throw error; // Re-throw the error after logging it
  }
}

const fetchWithRetries = async (url: string, retries = 3): Promise<Response> => {
  const timeout = 5000; // 5 seconds timeout
  
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
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries reached');
};

// Update the getStoryData function to use fetchWithRetries
export async function getStoryData(id: number) {
  try {
    const response = await fetchWithRetries(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching story data:', error);
    return null; // Return null instead of throwing
  }
}

// Function to get a page of stories
export async function getStories(choice: string, page: number) {
  try {
    const storyIds = await getStoryIds(choice, page);
    const storyPromises = storyIds.map(getStoryData);
    const stories = await Promise.all(storyPromises);
    // Filter out any null or invalid stories
    return stories.filter(story => 
      story && 
      typeof story === 'object' && 
      'id' in story
    );
  } catch (error) {
    console.error('Error fetching stories:', error);
    return []; // Return empty array instead of throwing
  }
}

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

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Comment> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, TIMEOUT_MS);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries reached');
}

// Modified getAllComments function with batching and caching
export async function getAllComments(
  kids: number[], 
  depth = 0, 
  maxDepth = 2,  // Reduced max depth
  limit = INITIAL_FETCH_LIMIT
): Promise<Comment[]> {
  if (!kids || !kids.length || depth >= maxDepth) return [];
  
  // Only fetch limited number of comments initially
  const kidsToFetch = kids.slice(0, limit);
  
  const promises = kidsToFetch.map(async id => {
    if (commentCache.has(id)) return commentCache.get(id);

    try {
      const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
      );
      const comment = await response.json();
      
      // Only fetch immediate replies for initial load
      const replies = depth < maxDepth - 1 && comment.kids ? 
        await getAllComments(comment.kids, depth + 1, maxDepth, 3) : // Only fetch 3 replies initially
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

// Add new function for loading more comments
export async function loadMoreComments(
  kids: number[],
  offset: number,
  limit: number
): Promise<Comment[]> {
  const nextBatch = kids.slice(offset, offset + limit);
  return getAllComments(nextBatch, 0, 2, limit);
}

// Add cache cleanup function (call this periodically)
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

export async function saveArticle(article: Article) {
  try {
    // First, retrieve existing saved articles
    const savedArticlesJson = await AsyncStorage.getItem('savedArticles');
    const savedArticles = savedArticlesJson ? JSON.parse(savedArticlesJson) : [];

    // Check if article is already saved to prevent duplicates
    const isArticleAlreadySaved = savedArticles.some(
      (savedArticle: Article) => savedArticle.id === article.id
    );

    if (!isArticleAlreadySaved) {
      // Add new article
      savedArticles.push(article);

      // Save updated articles back to storage
      await AsyncStorage.setItem('savedArticles', JSON.stringify(savedArticles));
      return true;
    }
    return false; // Article already saved
  } catch (error) {
    console.error('Error saving article:', error);
    return false;
  }
}

export async function getStorySaved(): Promise<Article[]> {
  try {
    const savedArticles = await AsyncStorage.getItem('savedArticles');
    return savedArticles ? JSON.parse(savedArticles) : [];
  } catch (error) {
    console.error('Error getting saved articles:', error);
    return [];
  }
}

export async function getFilteredSavedStories(
  sortOrder: 'newest' | 'oldest' = 'newest',
  searchTerm: string = ''
): Promise<Article[]> {
  try {
    // Get all saved articles
    let savedArticles = await getStorySaved();
    
    // Apply search filter if search term provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      savedArticles = savedArticles.filter(article => 
        article.title?.toLowerCase().includes(term)
      );
    }
    
    // Sort articles based on the specified order
    savedArticles.sort((a, b) => {
      if (sortOrder === 'newest') {
        return (b.time || 0) - (a.time || 0); // Newest first
      } else {
        return (a.time || 0) - (b.time || 0); // Oldest first
      }
    });
    
    return savedArticles;
  } catch (error) {
    console.error('Error filtering saved articles:', error);
    return [];
  }
}

export async function removeArticle(articleId: number) {
  try {
    const savedArticlesJson = await AsyncStorage.getItem('savedArticles');
    let savedArticles = savedArticlesJson ? JSON.parse(savedArticlesJson) : [];

    // Filter out the article with the given ID
    savedArticles = savedArticles.filter((article: Article) => article.id !== articleId);

    // Save the updated list back to storage
    await AsyncStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    return savedArticles;
  } catch (error) {
    console.error('Error removing article:', error);
    return [];
  }
}

// Add this function to your existing lib.ts file

// Fetch a single item by ID
export const fetchItem = async (id: number) => {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item ${id}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    throw error;
  }
};

