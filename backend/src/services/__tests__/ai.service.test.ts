import axios from 'axios';
import { AIService } from '../ai.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIService', () => {
  let aiService: AIService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateContent with OpenAI', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      aiService = new AIService();
    });

    it('should generate content successfully with OpenAI', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content:
                  'This is a test educational content about TypeScript. TypeScript is a strongly typed programming language that builds on JavaScript. It adds optional static typing to the language.',
              },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await aiService.generateContent('TypeScript', 300);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('source', 'ai');
      expect(result).toHaveProperty('wordCount');
      expect(result).toHaveProperty('difficulty');
      expect(result.wordCount).toBeGreaterThan(0);
      expect(['easy', 'medium', 'hard']).toContain(result.difficulty);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          messages: expect.any(Array),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-openai-key',
          }),
        })
      );
    });

    it('should handle OpenAI rate limit errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 429 },
        message: 'Rate limit exceeded',
      });

      await expect(aiService.generateContent('TypeScript', 300)).rejects.toThrow(
        'OpenAI rate limit exceeded'
      );
    });

    it('should handle OpenAI authentication errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 401 },
        message: 'Unauthorized',
      });

      await expect(aiService.generateContent('TypeScript', 300)).rejects.toThrow(
        'Invalid OpenAI API key'
      );
    });

    it('should handle empty response from OpenAI', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { choices: [] },
      });

      await expect(aiService.generateContent('TypeScript', 300)).rejects.toThrow(
        'No content generated from OpenAI'
      );
    });
  });

  describe('generateContent with Gemini fallback', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      aiService = new AIService();
    });

    it('should fallback to Gemini when OpenAI fails', async () => {
      const mockGeminiResponse = {
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'This is Gemini generated content about Python. Python is a high-level programming language known for its simplicity and readability.',
                  },
                ],
              },
            },
          ],
        },
      };

      mockedAxios.post
        .mockRejectedValueOnce(new Error('OpenAI failed'))
        .mockResolvedValueOnce(mockGeminiResponse);

      const result = await aiService.generateContent('Python', 300);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('source', 'ai');
      expect(result.wordCount).toBeGreaterThan(0);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateContent with Gemini only', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      delete process.env.OPENAI_API_KEY;
      aiService = new AIService();
    });

    it('should generate content successfully with Gemini', async () => {
      const mockResponse = {
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'JavaScript is a versatile programming language. It powers interactive web applications and runs on both client and server sides.',
                  },
                ],
              },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await aiService.generateContent('JavaScript', 300);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('source', 'ai');
      expect(result.wordCount).toBeGreaterThan(0);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle Gemini rate limit errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 429 },
        message: 'Rate limit exceeded',
      });

      await expect(aiService.generateContent('JavaScript', 300)).rejects.toThrow(
        'Gemini rate limit exceeded'
      );
    });
  });

  describe('generateContent with no API keys', () => {
    beforeEach(() => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      aiService = new AIService();
    });

    it('should throw error when no API keys are configured', async () => {
      await expect(aiService.generateContent('TypeScript', 300)).rejects.toThrow(
        'No AI service configured'
      );
    });
  });
});
