import axios from 'axios';
import { WikipediaService } from '../wikipedia.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WikipediaService', () => {
  let wikipediaService: WikipediaService;

  beforeEach(() => {
    jest.clearAllMocks();
    wikipediaService = new WikipediaService();
  });

  describe('fetchContent', () => {
    it('should fetch Wikipedia content successfully', async () => {
      const mockSearchResponse = {
        data: ['TypeScript', ['TypeScript', 'TypeScript (programming language)'], [], []],
      };

      const mockArticleResponse = {
        data: {
          query: {
            pages: {
              '12345': {
                title: 'TypeScript',
                extract:
                  'TypeScript is a programming language developed by Microsoft. It is a strict syntactical superset of JavaScript and adds optional static typing to the language. TypeScript is designed for the development of large applications.',
              },
            },
          },
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockSearchResponse)
        .mockResolvedValueOnce(mockArticleResponse);

      const result = await wikipediaService.fetchContent('TypeScript', 'en');

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('source', 'wikipedia');
      expect(result).toHaveProperty('articleTitle', 'TypeScript');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('wordCount');
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.url).toContain('en.wikipedia.org');
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should fetch Portuguese Wikipedia content', async () => {
      const mockSearchResponse = {
        data: ['Python', ['Python', 'Python (linguagem de programação)'], [], []],
      };

      const mockArticleResponse = {
        data: {
          query: {
            pages: {
              '67890': {
                title: 'Python',
                extract:
                  'Python é uma linguagem de programação de alto nível. Foi criada por Guido van Rossum e lançada em 1991.',
              },
            },
          },
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockSearchResponse)
        .mockResolvedValueOnce(mockArticleResponse);

      const result = await wikipediaService.fetchContent('Python', 'pt');

      expect(result).toHaveProperty('text');
      expect(result.url).toContain('pt.wikipedia.org');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('pt.wikipedia.org'),
        expect.any(Object)
      );
    });

    it('should handle no search results found', async () => {
      const mockSearchResponse = {
        data: ['NonExistentTopic', [], [], []],
      };

      mockedAxios.get.mockResolvedValueOnce(mockSearchResponse);

      await expect(wikipediaService.fetchContent('NonExistentTopic', 'en')).rejects.toThrow(
        'No Wikipedia articles found'
      );
    });

    it('should handle article not found', async () => {
      const mockSearchResponse = {
        data: ['Test', ['Test Article'], [], []],
      };

      const mockArticleResponse = {
        data: {
          query: {
            pages: {
              '-1': {
                title: 'Test Article',
                missing: true,
              },
            },
          },
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockSearchResponse)
        .mockResolvedValueOnce(mockArticleResponse);

      await expect(wikipediaService.fetchContent('Test', 'en')).rejects.toThrow(
        'not found or has no content'
      );
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(wikipediaService.fetchContent('TypeScript', 'en')).rejects.toThrow(
        'Wikipedia search failed'
      );
    });

    it('should handle invalid Wikipedia response', async () => {
      const mockSearchResponse = {
        data: ['Test', ['Test'], [], []],
      };

      const mockArticleResponse = {
        data: {},
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockSearchResponse)
        .mockResolvedValueOnce(mockArticleResponse);

      await expect(wikipediaService.fetchContent('Test', 'en')).rejects.toThrow(
        'Invalid Wikipedia response'
      );
    });
  });

  describe('extractSummary', () => {
    it('should extract summary within word limit', () => {
      const mockContent = {
        text: 'This is a long article. It has many sentences. Each sentence adds more information. We want to extract just a summary. This should be truncated at some point. More text here. And even more text. Keep going with more content.',
        source: 'wikipedia' as const,
        articleTitle: 'Test',
        url: 'https://en.wikipedia.org/wiki/Test',
        wordCount: 100,
      };

      const summary = wikipediaService.extractSummary(mockContent, 10);

      const wordCount = summary.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(10);
      expect(summary).toContain('.');
    });

    it('should return full text if under word limit', () => {
      const mockContent = {
        text: 'Short article with few words.',
        source: 'wikipedia' as const,
        articleTitle: 'Test',
        url: 'https://en.wikipedia.org/wiki/Test',
        wordCount: 5,
      };

      const summary = wikipediaService.extractSummary(mockContent, 100);

      expect(summary).toBe(mockContent.text);
    });

    it('should add ellipsis if no sentence boundary found', () => {
      const mockContent = {
        text: 'This is text without proper sentence endings and it just keeps going on and on',
        source: 'wikipedia' as const,
        articleTitle: 'Test',
        url: 'https://en.wikipedia.org/wiki/Test',
        wordCount: 15,
      };

      const summary = wikipediaService.extractSummary(mockContent, 5);

      expect(summary).toContain('...');
    });
  });
});
