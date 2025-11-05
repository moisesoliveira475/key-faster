import type { StudyContent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ContentGenerationRequest {
  theme: string;
  length?: number;
  source?: 'ai' | 'wikipedia' | 'combined';
  language?: 'en' | 'pt';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * API Service for communicating with the backend
 */
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate content based on theme
   */
  async generateContent(request: ContentGenerationRequest): Promise<StudyContent> {
    try {
      const response = await fetch(`${this.baseUrl}/content/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: request.theme,
          length: request.length || 300,
          source: request.source || 'combined',
          language: request.language || 'en',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<StudyContent> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate content');
      }

      return result.data;
    } catch (error) {
      console.error('Content generation error:', error);
      throw error;
    }
  }

  /**
   * Fetch Wikipedia content only
   */
  async fetchWikipediaContent(theme: string, language: 'en' | 'pt' = 'en'): Promise<StudyContent> {
    try {
      const response = await fetch(
        `${this.baseUrl}/content/wikipedia/${encodeURIComponent(theme)}?language=${language}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<StudyContent> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch Wikipedia content');
      }

      return result.data;
    } catch (error) {
      console.error('Wikipedia fetch error:', error);
      throw error;
    }
  }

  /**
   * Generate AI content only
   */
  async generateAIContent(theme: string, length: number = 300): Promise<StudyContent> {
    try {
      const response = await fetch(`${this.baseUrl}/content/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme, length }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<StudyContent> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate AI content');
      }

      return result.data;
    } catch (error) {
      console.error('AI content generation error:', error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Health endpoint is at root level, not under /api
      const baseUrl = this.baseUrl.replace('/api', '');
      const response = await fetch(`${baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
