import { AIService } from '../ai.service';
import { ContentService } from '../content.service';
import { WikipediaService } from '../wikipedia.service';

jest.mock('../ai.service');
jest.mock('../wikipedia.service');

const MockedAIService = AIService as jest.MockedClass<typeof AIService>;
const MockedWikipediaService = WikipediaService as jest.MockedClass<typeof WikipediaService>;

describe('ContentService', () => {
  let contentService: ContentService;
  let mockAIService: jest.Mocked<AIService>;
  let mockWikipediaService: jest.Mocked<WikipediaService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAIService = new MockedAIService() as jest.Mocked<AIService>;
    mockWikipediaService = new MockedWikipediaService() as jest.Mocked<WikipediaService>;

    contentService = new ContentService();
    (contentService as any).aiService = mockAIService;
    (contentService as any).wikipediaService = mockWikipediaService;
  });

  describe('generateAIContent', () => {
    it('should generate AI content successfully', async () => {
      const mockAIContent = {
        text: 'This is AI generated content about React. React is a JavaScript library for building user interfaces.',
        source: 'ai' as const,
        wordCount: 15,
        difficulty: 'medium' as const,
      };

      mockAIService.generateContent = jest.fn().mockResolvedValue(mockAIContent);

      const result = await contentService.generateAIContent('React', 300);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('theme', 'React');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('source', 'ai');
      expect(result).toHaveProperty('difficulty');
      expect(result).toHaveProperty('wordCount');
      expect(result).toHaveProperty('estimatedTime');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('createdAt');
      expect(result.metadata.aiModel).toBe('openai-gpt-3.5-turbo');
      expect(mockAIService.generateContent).toHaveBeenCalledWith('React', 300);
    });

    it('should handle AI generation errors', async () => {
      mockAIService.generateContent = jest
        .fn()
        .mockRejectedValue(new Error('AI service unavailable'));

      await expect(contentService.generateAIContent('React', 300)).rejects.toThrow(
        'AI content generation failed'
      );
    });
  });

  describe('fetchWikipediaContent', () => {
    it('should fetch Wikipedia content successfully', async () => {
      const mockWikiContent = {
        text: 'Node.js is an open-source, cross-platform JavaScript runtime environment. It executes JavaScript code outside a web browser.',
        source: 'wikipedia' as const,
        articleTitle: 'Node.js',
        url: 'https://en.wikipedia.org/wiki/Node.js',
        wordCount: 18,
      };

      mockWikipediaService.fetchContent = jest.fn().mockResolvedValue(mockWikiContent);

      const result = await contentService.fetchWikipediaContent('Node.js', 'en');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('theme', 'Node.js');
      expect(result).toHaveProperty('source', 'wikipedia');
      expect(result).toHaveProperty('text');
      expect(result.metadata.wikipediaArticle).toBe('Node.js');
      expect(result.metadata.wikipediaUrl).toBe('https://en.wikipedia.org/wiki/Node.js');
      expect(mockWikipediaService.fetchContent).toHaveBeenCalledWith('Node.js', 'en');
    });

    it('should extract summary for long Wikipedia content', async () => {
      const longText = 'word '.repeat(600);
      const mockWikiContent = {
        text: longText.trim(),
        source: 'wikipedia' as const,
        articleTitle: 'Long Article',
        url: 'https://en.wikipedia.org/wiki/Long',
        wordCount: 600,
      };

      mockWikipediaService.fetchContent = jest.fn().mockResolvedValue(mockWikiContent);
      mockWikipediaService.extractSummary = jest.fn().mockReturnValue('word '.repeat(400).trim());

      const result = await contentService.fetchWikipediaContent('Long Article', 'en');

      expect(mockWikipediaService.extractSummary).toHaveBeenCalledWith(mockWikiContent, 400);
      expect(result.wordCount).toBeLessThan(600);
    });

    it('should handle Wikipedia fetch errors', async () => {
      mockWikipediaService.fetchContent = jest
        .fn()
        .mockRejectedValue(new Error('Article not found'));

      await expect(contentService.fetchWikipediaContent('NonExistent', 'en')).rejects.toThrow(
        'Wikipedia content fetch failed'
      );
    });
  });

  describe('generateCombinedContent', () => {
    it('should combine AI and Wikipedia content successfully', async () => {
      const mockAIContent = {
        text: 'Vue.js is a progressive JavaScript framework. It is designed to be incrementally adoptable.',
        source: 'ai' as const,
        wordCount: 14,
        difficulty: 'medium' as const,
      };

      const mockWikiContent = {
        text: 'Vue.js was created by Evan You and released in 2014. It has gained significant popularity in web development.',
        source: 'wikipedia' as const,
        articleTitle: 'Vue.js',
        url: 'https://en.wikipedia.org/wiki/Vue.js',
        wordCount: 18,
      };

      mockAIService.generateContent = jest.fn().mockResolvedValue(mockAIContent);
      mockWikipediaService.fetchContent = jest.fn().mockResolvedValue(mockWikiContent);
      mockWikipediaService.extractSummary = jest.fn().mockReturnValue(mockWikiContent.text);

      const result = await contentService.generateCombinedContent('Vue.js', 300, 'en');

      expect(result).toHaveProperty('source', 'combined');
      expect(result.text).toContain(mockAIContent.text);
      expect(result.text).toContain(mockWikiContent.text);
      expect(result.metadata.aiModel).toBe('openai-gpt-3.5-turbo');
      expect(result.metadata.wikipediaArticle).toBe('Vue.js');
      expect(mockAIService.generateContent).toHaveBeenCalled();
      expect(mockWikipediaService.fetchContent).toHaveBeenCalled();
    });

    it('should fallback to AI only when Wikipedia fails', async () => {
      const mockAIContent = {
        text: 'Angular is a TypeScript-based web application framework.',
        source: 'ai' as const,
        wordCount: 8,
        difficulty: 'easy' as const,
      };

      mockAIService.generateContent = jest.fn().mockResolvedValue(mockAIContent);
      mockWikipediaService.fetchContent = jest
        .fn()
        .mockRejectedValue(new Error('Wikipedia failed'));

      const result = await contentService.generateCombinedContent('Angular', 300, 'en');

      expect(result).toHaveProperty('source', 'ai');
      expect(result.text).toBe(mockAIContent.text);
    });

    it('should fallback to Wikipedia only when AI fails', async () => {
      const mockWikiContent = {
        text: 'Svelte is a free and open-source front-end compiler.',
        source: 'wikipedia' as const,
        articleTitle: 'Svelte',
        url: 'https://en.wikipedia.org/wiki/Svelte',
        wordCount: 9,
      };

      mockAIService.generateContent = jest.fn().mockRejectedValue(new Error('AI failed'));
      mockWikipediaService.fetchContent = jest.fn().mockResolvedValue(mockWikiContent);

      const result = await contentService.generateCombinedContent('Svelte', 300, 'en');

      expect(result).toHaveProperty('source', 'wikipedia');
      expect(result.metadata.wikipediaArticle).toBe('Svelte');
    });

    it('should throw error when both sources fail', async () => {
      mockAIService.generateContent = jest.fn().mockRejectedValue(new Error('AI failed'));
      mockWikipediaService.fetchContent = jest
        .fn()
        .mockRejectedValue(new Error('Wikipedia failed'));

      await expect(contentService.generateCombinedContent('Unknown', 300, 'en')).rejects.toThrow(
        'Failed to generate content from any source'
      );
    });
  });

  describe('content formatting and calculations', () => {
    it('should calculate estimated time correctly', async () => {
      const mockAIContent = {
        text: 'word '.repeat(200).trim(),
        source: 'ai' as const,
        wordCount: 200,
        difficulty: 'medium' as const,
      };

      mockAIService.generateContent = jest.fn().mockResolvedValue(mockAIContent);

      const result = await contentService.generateAIContent('Test', 200);

      // 200 words / 40 WPM = 5 minutes
      expect(result.estimatedTime).toBe(5);
    });

    it('should generate unique IDs for content', async () => {
      const mockAIContent = {
        text: 'Test content',
        source: 'ai' as const,
        wordCount: 2,
        difficulty: 'easy' as const,
      };

      mockAIService.generateContent = jest.fn().mockResolvedValue(mockAIContent);

      const result1 = await contentService.generateAIContent('Test1', 100);
      const result2 = await contentService.generateAIContent('Test2', 100);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(/^content_\d+_[a-z0-9]+$/);
    });

    it('should set createdAt timestamp', async () => {
      const mockAIContent = {
        text: 'Test content',
        source: 'ai' as const,
        wordCount: 2,
        difficulty: 'easy' as const,
      };

      mockAIService.generateContent = jest.fn().mockResolvedValue(mockAIContent);

      const beforeTime = new Date();
      const result = await contentService.generateAIContent('Test', 100);
      const afterTime = new Date();

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });
});
