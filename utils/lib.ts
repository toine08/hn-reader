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

// Save article to AsyncStorage - Enhanced version with offline content
export async function saveArticle(article: Article): Promise<boolean> {
  // Use the new function that includes offline content
  return await saveArticleWithOfflineContent(article);
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

// Clean HTML content aggressively to remove all problematic URLs and elements
function cleanHtmlContent(html: string, baseUrl?: string): string {
  let cleanedHtml = html;
  
  // Remove all potentially problematic elements first
  cleanedHtml = cleanedHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
    .replace(/<video[^>]*>.*?<\/video>/gis, '')
    .replace(/<audio[^>]*>.*?<\/audio>/gis, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gis, '')
    .replace(/<svg[^>]*>.*?<\/svg>/gis, '')
    .replace(/<template[^>]*>.*?<\/template>/gis, '')
    .replace(/<button[^>]*>.*?<\/button>/gis, '')
    .replace(/<form[^>]*>.*?<\/form>/gis, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<select[^>]*>.*?<\/select>/gis, '')
    .replace(/<textarea[^>]*>.*?<\/textarea>/gis, '');

  // Aggressive URL cleaning - remove ALL potentially problematic URL schemes and patterns
  const problematicPatterns = [
    // About URLs (various forms)
    /(?:src|href)=["'][^"']*about:[^"']*["']/gi,
    /(?:src|href)=["'][^"']*about\/{0,3}[^"']*["']/gi,
    // Blob URLs
    /(?:src|href)=["'][^"']*blob:[^"']*["']/gi,
    // Data URLs (can be massive and problematic)
    /(?:src|href)=["'][^"']*data:[^"']*["']/gi,
    // JavaScript URLs
    /(?:src|href)=["'][^"']*javascript:[^"']*["']/gi,
    // Chrome extension URLs
    /(?:src|href)=["'][^"']*chrome-extension:[^"']*["']/gi,
    // Webkit/Safari specific
    /(?:src|href)=["'][^"']*webkit:[^"']*["']/gi,
    // File URLs
    /(?:src|href)=["'][^"']*file:[^"']*["']/gi,
    // FTP URLs (often problematic in mobile)
    /(?:src|href)=["'][^"']*ftp:[^"']*["']/gi,
    // Empty or just hash URLs
    /(?:src|href)=["']["']/gi,
    /(?:src|href)=["']#["']/gi,
    /(?:src|href)=["'][#?][^"']*["']/gi,
    // Next.js and build artifacts
    /(?:src|href)=["'][^"']*\/_next\/[^"']*["']/gi,
    /(?:src|href)=["'][^"']*\/static\/[^"']*["']/gi,
    // Common problematic patterns
    /(?:src|href)=["'][^"']*__webpack[^"']*["']/gi,
    /(?:src|href)=["'][^"']*hot-update[^"']*["']/gi,
  ];

  // Apply all problematic pattern removals
  problematicPatterns.forEach(pattern => {
    cleanedHtml = cleanedHtml.replace(pattern, '');
  });

  // Remove ALL images that don't have proper HTTPS URLs
  cleanedHtml = cleanedHtml.replace(/<img(?![^>]*src=["']https:\/\/[^"']+["'])[^>]*>/gi, '');
  
  // Remove any links that don't have proper HTTPS URLs or are just fragments
  cleanedHtml = cleanedHtml.replace(/<a(?![^>]*href=["']https?:\/\/[^"']+["'])[^>]*>(.*?)<\/a>/gi, '$1');
  
  // Fix relative URLs to absolute if we have a base URL
  if (baseUrl) {
    try {
      const base = new URL(baseUrl);
      cleanedHtml = cleanedHtml
        .replace(/src=["']\/([^"'\/][^"'\s?#]*)["']/gi, `src="${base.origin}/$1"`)
        .replace(/href=["']\/([^"'\/][^"'\s?#]*)["']/gi, `href="${base.origin}/$1"`);
    } catch (e) {
      // If baseUrl is invalid, just remove relative URLs
      cleanedHtml = cleanedHtml
        .replace(/src=["']\/[^"']*["']/gi, '')
        .replace(/href=["']\/[^"']*["']/gi, '');
    }
  }

  // Final cleanup - remove any remaining about: references anywhere in the content
  cleanedHtml = cleanedHtml
    .replace(/about:\/{0,3}[^\s<>"']*/gi, '')
    .replace(/about["']?:/gi, '');

  // Remove any remaining empty or malformed attributes
  cleanedHtml = cleanedHtml
    .replace(/\s(?:src|href)=["']["']/gi, '')
    .replace(/\s(?:src|href)=["'][^"']{0,3}["']/gi, '');

  return cleanedHtml;
}

// Extract readable content from HTML with better text extraction
function extractReadableContent(html: string): string {
  // First apply basic cleaning
  const cleaned = cleanHtmlContent(html);
  
  // Try to extract main content containers first
  const contentSelectors = [
    /<main[^>]*>(.*?)<\/main>/is,
    /<article[^>]*>(.*?)<\/article>/is,
    /<div[^>]*class[^>]*(?:content|post|article|entry|body)[^>]*>(.*?)<\/div>/is,
    /<div[^>]*id[^>]*(?:content|post|article|entry|body)[^>]*>(.*?)<\/div>/is,
  ];
  
  let extractedContent = cleaned;
  for (const selector of contentSelectors) {
    const match = cleaned.match(selector);
    if (match && match[1].length > 200) {
      extractedContent = match[1];
      break;
    }
  }
  
  // Extract paragraphs and headings for better readability
  const contentElements = extractedContent.match(/<(?:p|h[1-6]|blockquote|pre|ul|ol|li)[^>]*>.*?<\/(?:p|h[1-6]|blockquote|pre|ul|ol|li)>/gis) || [];
  
  if (contentElements.length > 3) {
    return contentElements.join('\n');
  }
  
  // If we couldn't extract structured content, return cleaned HTML
  return extractedContent;
}

// Fetch and store offline content for an article
export async function fetchOfflineContent(article: Article): Promise<string | null> {
  try {
    // For self-posts (Ask HN, Show HN), the content is already in the text field
    if (!article.url && article.text) {
      return article.text;
    }
    
    // For external URLs, we'll try to fetch a simplified version
    if (article.url) {
      const response = await fetchWithTimeout(article.url, 10000);
      const html = await response.text();
      
      // Apply aggressive HTML cleaning
      let cleanedHtml = cleanHtmlContent(html, article.url);
      
      // Extract main readable content
      cleanedHtml = extractReadableContent(cleanedHtml);
      
      // Final safety check - if content still has issues or is too short, 
      // extract just the text content
      if (cleanedHtml.includes('about:') || cleanedHtml.length < 100) {
        const textContent = html.replace(/<[^>]*>/g, '').trim();
        if (textContent.length > 100) {
          return `<p>${textContent.substring(0, 5000)}</p>`;
        } else {
          return `<p>Content could not be properly extracted for offline reading. Please visit the original URL when online.</p>`;
        }
      }
      
      // Final clean up pass
      cleanedHtml = cleanHtmlContent(cleanedHtml);
      
      return cleanedHtml;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching offline content:', error);
    // Return a simple fallback message instead of null
    return `<p>Content could not be cached for offline reading. Original URL: ${article.url}</p>`;
  }
}

// Save article with offline content
export async function saveArticleWithOfflineContent(article: Article): Promise<boolean> {
  try {
    console.log('Saving article with offline content:', article.id, article.title);
    
    // First, try to fetch offline content
    const offlineContent = await fetchOfflineContent(article);
    console.log('Fetched offline content length:', offlineContent?.length || 0);
    
    // Create enhanced article with offline content
    const enhancedArticle: Article = {
      ...article,
      offlineContent: offlineContent || undefined,
      offlineContentType: article.url ? 'html' : 'text',
      offlineTimestamp: Date.now(),
      isOfflineAvailable: !!offlineContent
    };
    
    console.log('Enhanced article offline available:', enhancedArticle.isOfflineAvailable);
    
    const savedArticlesJson = await AsyncStorage.getItem('savedArticles');
    const savedArticles = savedArticlesJson ? JSON.parse(savedArticlesJson) : [];

    const isArticleAlreadySaved = savedArticles.some(
      (savedArticle: Article) => savedArticle.id === article.id
    );

    if (!isArticleAlreadySaved) {
      savedArticles.push(enhancedArticle);
      await AsyncStorage.setItem('savedArticles', JSON.stringify(savedArticles));
      console.log('Article saved successfully with offline content');
      return true;
    } else {
      // Update existing article with offline content if it doesn't have it
      const existingIndex = savedArticles.findIndex(
        (savedArticle: Article) => savedArticle.id === article.id
      );
      if (existingIndex !== -1 && !savedArticles[existingIndex].offlineContent) {
        savedArticles[existingIndex] = enhancedArticle;
        await AsyncStorage.setItem('savedArticles', JSON.stringify(savedArticles));
        console.log('Updated existing article with offline content');
      }
    }
    return false;
  } catch (error) {
    console.error('Error saving article with offline content:', error);
    return false;
  }
}

// Get offline content for an article
export async function getOfflineContent(articleId: number): Promise<string | null> {
  try {
    const savedArticles = await getStorySaved();
    const article = savedArticles.find(a => a.id === articleId);
    return article?.offlineContent || null;
  } catch (error) {
    console.error('Error getting offline content:', error);
    return null;
  }
}

// Check if article has offline content available
export async function isArticleOfflineAvailable(articleId: number): Promise<boolean> {
  try {
    const savedArticles = await getStorySaved();
    const article = savedArticles.find(a => a.id === articleId);
    return !!article?.isOfflineAvailable;
  } catch (error) {
    console.error('Error checking offline availability:', error);
    return false;
  }
}

// Update existing saved article to include offline content
export async function addOfflineContentToSavedArticle(articleId: number): Promise<boolean> {
  try {
    const savedArticles = await getStorySaved();
    const articleIndex = savedArticles.findIndex(a => a.id === articleId);
    
    if (articleIndex === -1) {
      return false;
    }
    
    const article = savedArticles[articleIndex];
    if (article.isOfflineAvailable) {
      return true; // Already has offline content
    }
    
    const offlineContent = await fetchOfflineContent(article);
    if (offlineContent) {
      savedArticles[articleIndex] = {
        ...article,
        offlineContent,
        offlineContentType: article.url ? 'html' : 'text',
        offlineTimestamp: Date.now(),
        isOfflineAvailable: true
      };
      
      await AsyncStorage.setItem('savedArticles', JSON.stringify(savedArticles));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error adding offline content to saved article:', error);
    return false;
  }
}

