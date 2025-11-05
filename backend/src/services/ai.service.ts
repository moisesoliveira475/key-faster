import axios from 'axios';
import { AppError } from '../middleware/errorHandler';

export interface AIGeneratedContent {
  text: string;
  source: 'ai';
  wordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * AI Service for content generation
 * Supports OpenAI and Google Gemini
 */
export class AIService {
  private openaiApiKey: string | undefined;
  private geminiApiKey: string | undefined;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
  }

  /**
   * Generate educational content using AI
   */
  async generateContent(theme: string, targetLength: number = 300): Promise<AIGeneratedContent> {
    // Try OpenAI first, then Gemini as fallback
    if (this.openaiApiKey) {
      try {
        return await this.generateWithOpenAI(theme, targetLength);
      } catch (error) {
        console.error('OpenAI generation failed, trying Gemini:', error);
        if (this.geminiApiKey) {
          return await this.generateWithGemini(theme, targetLength);
        }
        throw error;
      }
    } else if (this.geminiApiKey) {
      return await this.generateWithGemini(theme, targetLength);
    } else {
      throw new AppError(
        'No AI service configured. Please set OPENAI_API_KEY or GEMINI_API_KEY',
        503
      );
    }
  }

  /**
   * Generate content using OpenAI
   */
  private async generateWithOpenAI(
    theme: string,
    targetLength: number
  ): Promise<AIGeneratedContent> {
    try {
      const prompt = this.buildPrompt(theme, targetLength);

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an educational content writer. Create clear, factual, and engaging educational content.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: Math.ceil(targetLength * 1.5),
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.choices[0]?.message?.content?.trim();

      if (!text) {
        throw new AppError('No content generated from OpenAI', 500);
      }

      return this.formatResponse(text);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new AppError('Invalid OpenAI API key', 503);
      }
      if (error.response?.status === 429) {
        throw new AppError('OpenAI rate limit exceeded', 429);
      }
      throw new AppError(`OpenAI generation failed: ${error.message}`, 500);
    }
  }

  /**
   * Generate content using Google Gemini
   */
  private async generateWithGemini(
    theme: string,
    targetLength: number
  ): Promise<AIGeneratedContent> {
    try {
      const prompt = this.buildPrompt(theme, targetLength);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: Math.ceil(targetLength * 1.5),
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) {
        throw new AppError('No content generated from Gemini', 500);
      }

      return this.formatResponse(text);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new AppError('Invalid Gemini API key', 503);
      }
      if (error.response?.status === 429) {
        throw new AppError('Gemini rate limit exceeded', 429);
      }
      throw new AppError(`Gemini generation failed: ${error.message}`, 500);
    }
  }

  /**
   * Build prompt for AI content generation
   */
  private buildPrompt(theme: string, targetLength: number): string {
    return `Write an educational text about "${theme}" in approximately ${targetLength} words. 
The text should be:
- Clear and factual
- Suitable for typing practice
- Well-structured with proper paragraphs
- Engaging and informative
- Free of special formatting or markdown

Do not include a title or heading. Start directly with the content.`;
  }

  /**
   * Format and validate AI response
   */
  private formatResponse(text: string): AIGeneratedContent {
    // Clean up the text
    const cleanText = text
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/[^\S\n]+/g, ' '); // Normalize spaces

    const wordCount = cleanText.split(/\s+/).length;

    // Determine difficulty based on word complexity and length
    const difficulty = this.calculateDifficulty(cleanText, wordCount);

    return {
      text: cleanText,
      source: 'ai',
      wordCount,
      difficulty,
    };
  }

  /**
   * Calculate content difficulty
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
}
