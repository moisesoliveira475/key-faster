import axios from 'axios';
import { AppError } from '../middleware/errorHandler';

export interface WikipediaContent {
  text: string;
  source: 'wikipedia';
  articleTitle: string;
  url: string;
  wordCount: number;
}

/**
 * Wikipedia Service for fetching educational content
 */
export class WikipediaService {
  private readonly baseUrl = 'https://en.wikipedia.org/w/api.php';
  private readonly ptBaseUrl = 'https://pt.wikipedia.org/w/api.php';

  /**
   * Fetch Wikipedia content for a given theme
   */
  async fetchContent(theme: string, language: 'en' | 'pt' = 'en'): Promise<WikipediaContent> {
    try {
      // First, search for the article
      const searchResults = await this.searchArticles(theme, language);

      if (searchResults.length === 0) {
        throw new AppError(`No Wikipedia articles found for "${theme}"`, 404);
      }

      // Get the first result
      const articleTitle = searchResults[0];

      // Fetch the article content
      const content = await this.fetchArticleContent(articleTitle, language);

      return content;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to fetch Wikipedia content: ${error.message}`, 500);
    }
  }

  /**
   * Search for Wikipedia articles by theme
   */
  private async searchArticles(theme: string, language: 'en' | 'pt'): Promise<string[]> {
    const baseUrl = language === 'pt' ? this.ptBaseUrl : this.baseUrl;

    try {
      const response = await axios.get(baseUrl, {
        params: {
          action: 'opensearch',
          search: theme,
          limit: 5,
          namespace: 0,
          format: 'json',
        },
        timeout: 10000,
      });

      // OpenSearch returns [query, [titles], [descriptions], [urls]]
      const titles = response.data[1] || [];
      return titles;
    } catch (error: any) {
      throw new AppError(`Wikipedia search failed: ${error.message}`, 500);
    }
  }

  /**
   * Fetch article content by title
   */
  private async fetchArticleContent(
    title: string,
    language: 'en' | 'pt'
  ): Promise<WikipediaContent> {
    const baseUrl = language === 'pt' ? this.ptBaseUrl : this.baseUrl;

    try {
      const response = await axios.get(baseUrl, {
        params: {
          action: 'query',
          prop: 'extracts',
          exintro: true, // Only get the introduction
          explaintext: true, // Plain text, no HTML
          titles: title,
          format: 'json',
        },
        timeout: 10000,
      });

      const pages = response.data.query?.pages;

      if (!pages) {
        throw new AppError('Invalid Wikipedia response', 500);
      }

      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      if (pageId === '-1' || !page.extract) {
        throw new AppError(`Article "${title}" not found or has no content`, 404);
      }

      const text = this.processWikipediaText(page.extract);
      const wordCount = text.split(/\s+/).length;
      const url = `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title)}`;

      return {
        text,
        source: 'wikipedia',
        articleTitle: title,
        url,
        wordCount,
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to fetch article content: ${error.message}`, 500);
    }
  }

  /**
   * Process and clean Wikipedia text
   */
  private processWikipediaText(text: string): string {
    return text
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/[^\S\n]+/g, ' ') // Normalize spaces
      .replace(/\s*\([^)]*\)\s*/g, ' ') // Remove parenthetical notes
      .replace(/\s{2,}/g, ' ') // Remove double spaces
      .trim();
  }

  /**
   * Get a summary of Wikipedia content (first N words)
   */
  extractSummary(content: WikipediaContent, maxWords: number = 300): string {
    const words = content.text.split(/\s+/);

    if (words.length <= maxWords) {
      return content.text;
    }

    // Find the last complete sentence within the word limit
    const truncated = words.slice(0, maxWords).join(' ');
    const lastPeriod = truncated.lastIndexOf('.');

    if (lastPeriod > 0) {
      return truncated.substring(0, lastPeriod + 1);
    }

    return `${truncated}...`;
  }
}
