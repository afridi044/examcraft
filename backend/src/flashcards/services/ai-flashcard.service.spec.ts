import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiFlashcardService, AIFlashcard } from './ai-flashcard.service';
import { GenerateAiFlashcardsDto } from '../dto/generate-ai-flashcards.dto';

// Mock fetch globally
global.fetch = jest.fn();

describe('AiFlashcardService', () => {
  let service: AiFlashcardService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiFlashcardService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AiFlashcardService>(AiFlashcardService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('generateFlashcardsWithAI', () => {
    const mockDto: GenerateAiFlashcardsDto = {
      topic_name: 'JavaScript Fundamentals',
      num_flashcards: 3,
      difficulty: 2,
      content_source: 'ES6+ features',
      additional_instructions: 'Focus on practical examples',
    };

    const mockAIFlashcards: AIFlashcard[] = [
      {
        question: 'What is the difference between let and const?',
        answer: 'let allows reassignment, const does not',
        difficulty: 2,
        explanation: 'Understanding variable declaration is fundamental',
      },
      {
        question: 'How do you use arrow functions?',
        answer: 'const func = (param) => expression',
        difficulty: 2,
        explanation: 'Arrow functions provide concise syntax',
      },
      {
        question: 'What is destructuring?',
        answer: 'Extracting values from objects/arrays into variables',
        difficulty: 2,
        explanation: 'Destructuring simplifies code and improves readability',
      },
    ];

    beforeEach(() => {
      // Reset mocks for each test
      jest.clearAllMocks();
      (global.fetch as jest.Mock).mockClear();
    });

    it('should generate flashcards successfully', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  flashcards: mockAIFlashcards,
                }),
              },
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateFlashcardsWithAI(mockDto);

      expect(result).toEqual(mockAIFlashcards);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'ExamCraft - AI Flashcard Generator',
          }),
          body: expect.stringContaining('JavaScript Fundamentals'),
        }),
      );
    });

    it('should handle missing API key', async () => {
      mockConfigService.get
        .mockReturnValueOnce(null) // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      await expect(service.generateFlashcardsWithAI(mockDto)).rejects.toThrow(
        'OpenRouter API key not configured',
      );
    });

    it('should handle API error response', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.generateFlashcardsWithAI(mockDto)).rejects.toThrow(
        'OpenRouter API error: 401 - Unauthorized',
      );
    });

    it('should handle invalid response format', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [], // Missing message
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.generateFlashcardsWithAI(mockDto)).rejects.toThrow(
        'Invalid response format from OpenRouter API',
      );
    });

    it('should handle JSON parsing errors', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Invalid JSON content',
              },
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.generateFlashcardsWithAI(mockDto)).rejects.toThrow(
        'No valid JSON found in AI response',
      );
    });

    it('should handle markdown-wrapped JSON', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: '```json\n' + JSON.stringify({ flashcards: mockAIFlashcards }) + '\n```',
              },
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateFlashcardsWithAI(mockDto);

      expect(result).toEqual(mockAIFlashcards);
    });

    it('should handle missing flashcards array', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({ wrong_key: [] }),
              },
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.generateFlashcardsWithAI(mockDto)).rejects.toThrow(
        'AI response does not contain valid flashcards array',
      );
    });

    it('should filter and validate flashcards', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      const invalidFlashcards = [
        { question: 'Valid question', answer: 'Valid answer', difficulty: 2 },
        { question: '', answer: 'Valid answer', difficulty: 2 }, // Invalid
        { question: 'Valid question', answer: '', difficulty: 2 }, // Invalid
        { question: 'Another valid', answer: 'Another answer', difficulty: 3 },
      ];

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({ flashcards: invalidFlashcards }),
              },
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateFlashcardsWithAI(mockDto);

      expect(result).toHaveLength(2); // Only valid flashcards
      expect(result[0].question).toBe('Valid question');
      expect(result[1].question).toBe('Another valid');
    });

    it('should respect num_flashcards limit', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      const manyFlashcards = Array.from({ length: 10 }, (_, i) => ({
        question: `Question ${i}`,
        answer: `Answer ${i}`,
        difficulty: 2,
      }));

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({ flashcards: manyFlashcards }),
              },
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateFlashcardsWithAI(mockDto);

      expect(result).toHaveLength(3); // Limited to num_flashcards
    });

    it('should handle network errors', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce('http://localhost:3000'); // cors.origin

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.generateFlashcardsWithAI(mockDto)).rejects.toThrow(
        'Network error',
      );
    });

    it('should use default cors origin when not configured', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // openrouter.apiKey
        .mockReturnValueOnce(undefined); // cors.origin

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({ flashcards: mockAIFlashcards }),
              },
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await service.generateFlashcardsWithAI(mockDto);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'HTTP-Referer': undefined, // When not configured
          }),
        }),
      );
    });
  });

  describe('buildAIPrompt', () => {
    it('should build prompt with all fields', () => {
      const dto: GenerateAiFlashcardsDto = {
        topic_name: 'React Hooks',
        num_flashcards: 5,
        difficulty: 3,
        content_source: 'React documentation',
        additional_instructions: 'Focus on useState and useEffect',
      };

      const prompt = (service as any).buildAIPrompt(dto);

      expect(prompt).toContain('React Hooks');
      expect(prompt).toContain('5');
      expect(prompt).toContain('3/5');
      expect(prompt).toContain('React documentation');
      expect(prompt).toContain('Focus on useState and useEffect');
      expect(prompt).toContain('"flashcards":');
    });

    it('should build prompt without optional fields', () => {
      const dto: GenerateAiFlashcardsDto = {
        topic_name: 'Basic Math',
        num_flashcards: 2,
        difficulty: 1,
      };

      const prompt = (service as any).buildAIPrompt(dto);

      expect(prompt).toContain('Basic Math');
      expect(prompt).toContain('2');
      expect(prompt).toContain('1/5');
      expect(prompt).not.toContain('Content source/context:');
      expect(prompt).not.toContain('Additional instructions:');
    });

    it('should include proper JSON structure in prompt', () => {
      const dto: GenerateAiFlashcardsDto = {
        topic_name: 'Test Topic',
        num_flashcards: 1,
        difficulty: 2,
      };

      const prompt = (service as any).buildAIPrompt(dto);

      expect(prompt).toContain('"flashcards": [');
      expect(prompt).toContain('"question":');
      expect(prompt).toContain('"answer":');
      expect(prompt).toContain('"difficulty":');
      expect(prompt).toContain('"explanation":');
    });
  });
}); 