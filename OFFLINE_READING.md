# Offline Reading Feature

## Overview
The Hacker News Reader app provides robust offline reading functionality that allows users to read articles even without an internet connection. The feature automatically caches article content when saving bookmarks and provides a clean, readable interface for offline consumption.

## Key Features

### 1. Automatic Content Caching
- When saving an article to bookmarks, the app automatically attempts to fetch and cache the full content
- For external URLs: Downloads HTML content and processes it for optimal offline viewing
- For self-posts (Ask HN, Show HN): Uses the existing text content directly
- All cached content is stored locally using AsyncStorage

### 2. Visual Indicators
- Green download icon and "Read Offline" button appear for articles with cached content
- Clear offline status indicator when reading cached content
- Timestamp showing when content was cached

### 3. Robust Content Processing
The app employs aggressive HTML cleaning to ensure offline content is safe and readable:

#### Removed Elements:
- All script, style, and meta tags
- Problematic embedded content (iframes, videos, audio)
- Navigation elements (nav, header, footer)
- Interactive elements (buttons, forms, inputs)
- Potentially harmful content (SVGs, templates)

#### URL Sanitization:
- Removes all `about:` URLs (prevents the "about:///blank" error)
- Strips `blob:`, `data:`, `javascript:`, and other problematic URL schemes
- Removes empty or malformed attributes
- Converts relative URLs to absolute URLs when possible
- Removes images without proper HTTPS sources

#### Content Extraction:
- Attempts to extract main content from `<main>`, `<article>`, or content-specific containers
- Falls back to extracting paragraphs and headings for better readability
- Provides plain text fallback if HTML processing fails

### 4. Fallback Mechanisms
- **Text-Only Mode**: Users can toggle between rich HTML and plain text modes
- **Automatic Fallback**: If HTML content has issues, automatically switches to text-only mode
- **Error Handling**: Graceful degradation when content can't be processed
- **Quality Checks**: Validates content before rendering to prevent display issues

### 5. User Interface Features
- **"Clear All Bookmarks"** button with confirmation dialog
- **Bulk offline content download** for existing bookmarks
- **Search and sort** functionality for bookmarks
- **Improved typography** for better readability
- **Dark mode support** for all offline reading interfaces

## Usage

### Saving Articles for Offline Reading
1. Navigate to any article
2. Tap the bookmark button to save
3. The app automatically attempts to cache content for offline reading
4. A green download icon will appear if content is successfully cached

### Reading Offline Content
1. Go to the Bookmarks tab
2. Look for articles with the green download icon or "Read Offline" button
3. Tap to open the article
4. The content will display with an offline indicator
5. Use the "Text"/"Rich" toggle for different viewing modes

### Managing Offline Content
- **Download All**: Use the "Download All Offline Content" button in Settings to cache content for existing bookmarks
- **Clear All**: Use the "Clear All Bookmarks" button to remove all saved articles
- **Individual Management**: Remove individual articles by swiping in the bookmarks list

## Technical Implementation

### Content Storage
- Uses AsyncStorage for local persistence
- Enhanced Article type with offline-specific fields:
  - `offlineContent`: Cleaned HTML or text content
  - `offlineContentType`: 'html' or 'text'
  - `offlineTimestamp`: When content was cached
  - `isOfflineAvailable`: Boolean flag for availability

### HTML Cleaning Process
1. **Element Removal**: Strips all potentially problematic HTML elements
2. **URL Sanitization**: Removes dangerous URL schemes and malformed attributes
3. **Content Extraction**: Attempts to extract main readable content
4. **Quality Validation**: Checks content quality and triggers fallbacks if needed
5. **Final Cleanup**: Applies additional safety measures before storage

### Error Handling
- Comprehensive try-catch blocks throughout the offline content pipeline
- Automatic fallback to text-only mode for problematic content
- User-friendly error messages and status indicators
- Console logging for debugging purposes

## Limitations

### Content Quality
- Some websites may not extract well due to complex layouts or anti-scraping measures
- Dynamic content (JavaScript-generated) is not captured
- Some formatting may be lost during the cleaning process

### Storage Constraints
- Content is stored in AsyncStorage, which has size limitations
- Very large articles may be truncated for performance
- Images are only included if they have proper HTTPS URLs

### Network Dependency
- Initial content caching requires an internet connection
- Content extraction quality depends on the source website structure
- Some paywalled or restricted content may not be accessible

## Troubleshooting

### "about:///blank" Errors
This specific error has been addressed with improved HTML cleaning:
- All `about:` URLs are now aggressively removed during content processing
- Multiple cleaning passes ensure no problematic URLs remain
- Automatic fallback to text-only mode if issues persist

### Content Not Displaying
1. Check if the article has the green download icon (content cached successfully)
2. Try toggling to "Text-Only Mode" using the button in the reader
3. If content is garbled, the app will automatically show a text version
4. Some websites may not extract well - this is expected for complex sites

### Performance Issues
- Large bookmarks collections may load slowly
- Consider clearing old bookmarks periodically
- The app limits content size to maintain performance

## Future Improvements

Potential enhancements could include:
- Integration with readability services for better content extraction
- Support for offline image caching
- Export/import functionality for bookmarks
- Advanced content filtering options
- Sync across devices

## Debug Features

In the Settings tab, there are debugging tools:
- **"Test Save Article"**: Tests the saving and caching process
- **"Test HTML Cleaning"**: Validates the HTML cleaning functionality
- **Offline Statistics**: Shows how many articles have cached content
