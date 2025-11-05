import { AppError } from '../middleware/errorHandler';
import { type AIGeneratedContent, AIService } from './ai.service';
import { type WikipediaContent, WikipediaService } from './wikipedia.service';

export interface GeneratedContent {
  id: string;
  theme: string;
  text: string;
  source: 'ai' | 'wikipedia' | 'combined';
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
  estimatedTime: number;
  metadata: {
    aiModel?: string;
    wikipediaArticle?: string;
    wikipediaUrl?: string;
    language: string;
  };
  createdAt: Date;
}

/**
 * Content Service - Orchestrates content generation from multiple sources
 */
export class ContentService {
  private aiService: AIService;
  private wikipediaService: WikipediaService;

  constructor() {
    this.aiService = new AIService();
    this.wikipediaService = new WikipediaService();
  }

  /**
   * Generate content from AI only
   */
  async generateAIContent(theme: string, targetLength: number = 300): Promise<GeneratedContent> {
    try {
      const aiContent = await this.aiService.generateContent(theme, targetLength);

      return this.formatContent({
        theme,
        text: aiContent.text,
        source: 'ai',
        difficulty: aiContent.difficulty,
        wordCount: aiContent.wordCount,
        metadata: {
          aiModel: 'openai-gpt-3.5-turbo',
          language: 'en',
        },
      });
    } catch (error: any) {
      throw new AppError(`AI content generation failed: ${error.message}`, error.statusCode || 500);
    }
  }

  /**
   * Fetch content from Wikipedia only
   */
  async fetchWikipediaContent(
    theme: string,
    language: 'en' | 'pt' = 'en'
  ): Promise<GeneratedContent> {
    try {
      const wikiContent = await this.wikipediaService.fetchContent(theme, language);

      // Extract summary if content is too long
      const text =
        wikiContent.wordCount > 500
          ? this.wikipediaService.extractSummary(wikiContent, 400)
          : wikiContent.text;

      const wordCount = text.split(/\s+/).length;

      return this.formatContent({
        theme,
        text,
        source: 'wikipedia',
        difficulty: this.calculateDifficulty(text, wordCount),
        wordCount,
        metadata: {
          wikipediaArticle: wikiContent.articleTitle,
          wikipediaUrl: wikiContent.url,
          language,
        },
      });
    } catch (error: any) {
      throw new AppError(
        `Wikipedia content fetch failed: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Generate combined content from AI and Wikipedia
   */
  async generateCombinedContent(
    theme: string,
    targetLength: number = 300,
    language: 'en' | 'pt' = 'en'
  ): Promise<GeneratedContent> {
    try {
      // Fetch both sources in parallel
      const [aiResult, wikiResult] = await Promise.allSettled([
        this.aiService.generateContent(theme, Math.floor(targetLength * 0.6)),
        this.wikipediaService.fetchContent(theme, language),
      ]);

      // Handle different scenarios
      if (aiResult.status === 'fulfilled' && wikiResult.status === 'fulfilled') {
        // Both succeeded - combine them
        return this.combineContent(theme, aiResult.value, wikiResult.value, language);
      } else if (aiResult.status === 'fulfilled') {
        // Only AI succeeded
        console.warn('Wikipedia fetch failed, using AI only');
        return this.generateAIContent(theme, targetLength);
      } else if (wikiResult.status === 'fulfilled') {
        // Only Wikipedia succeeded
        console.warn('AI generation failed, using Wikipedia only');
        return this.fetchWikipediaContent(theme, language);
      } else {
        // Both failed
        throw new AppError('Failed to generate content from any source', 500);
      }
    } catch (error: any) {
      throw new AppError(
        `Combined content generation failed: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  /**
   * Combine AI and Wikipedia content intelligently
   */
  private combineContent(
    theme: string,
    aiContent: AIGeneratedContent,
    wikiContent: WikipediaContent,
    language: 'en' | 'pt'
  ): GeneratedContent {
    // Extract Wikipedia summary
    const wikiSummary = this.wikipediaService.extractSummary(wikiContent, 200);

    // Combine: AI intro + Wikipedia facts
    const combinedText = `${aiContent.text}\n\n${wikiSummary}`;
    const wordCount = combinedText.split(/\s+/).length;

    return this.formatContent({
      theme,
      text: combinedText,
      source: 'combined',
      difficulty: aiContent.difficulty,
      wordCount,
      metadata: {
        aiModel: 'openai-gpt-3.5-turbo',
        wikipediaArticle: wikiContent.articleTitle,
        wikipediaUrl: wikiContent.url,
        language,
      },
    });
  }

  /**
   * Format content into standard structure
   */
  private formatContent(data: {
    theme: string;
    text: string;
    source: 'ai' | 'wikipedia' | 'combined';
    difficulty: 'easy' | 'medium' | 'hard';
    wordCount: number;
    metadata: any;
  }): GeneratedContent {
    return {
      id: this.generateId(),
      theme: data.theme,
      text: data.text,
      source: data.source,
      difficulty: data.difficulty,
      wordCount: data.wordCount,
      estimatedTime: this.calculateEstimatedTime(data.wordCount),
      metadata: data.metadata,
      createdAt: new Date(),
    };
  }

  /**
   * Calculate difficulty based on text characteristics
   */
  private calculateDifficulty(text: string, wordCount: number): 'easy' | 'medium' | 'hard' {
    const avgWordLength = text.replace(/\s/g, '').length / wordCount;

    if (avgWordLength < 5 && wordCount < 200) {
      return 'easy';
    } else if (avgWordLength > 6 || wordCount > 400) {
      return 'hard';
    }
    return 'medium';
  }

  /**
   * Calculate estimated typing time (assuming 40 WPM average)
   */
  private calculateEstimatedTime(wordCount: number): number {
    const averageWPM = 40;
    return Math.ceil(wordCount / averageWPM);
  }

  /**
   * Generate unique content ID
   */
  private generateId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
