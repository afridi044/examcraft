import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateAiFlashcardsDto } from '../dto/generate-ai-flashcards.dto';

export interface AIFlashcard {
  question: string;
  answer: string;
  difficulty: number;
  explanation?: string;
}

export interface AIFlashcardResponse {
  flashcards: AIFlashcard[];
}

@Injectable()
export class AiFlashcardService {
  private readonly logger = new Logger(AiFlashcardService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateFlashcardsWithAI(
    dto: GenerateAiFlashcardsDto,
  ): Promise<AIFlashcard[]> {
    const openRouterApiKey =
      this.configService.get<string>('openrouter.apiKey');
    const appUrl = this.configService.get<string>(
      'cors.origin',
      'http://localhost:3000',
    );

    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    this.logger.log(
      `🤖 Generating ${dto.num_flashcards} AI flashcards for topic: ${dto.topic_name}`,
    );

    // Build the prompt for AI
    const prompt = this.buildAIPrompt(dto);

    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': appUrl,
            'X-Title': 'ExamCraft - AI Flashcard Generator',
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-r1-0528-qwen3-8b:free', // Free model
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert educational content creator specialized in creating effective flashcards for studying. You must respond with ONLY valid JSON - no markdown, no explanations, no additional text. Start your response with { and end with }. Generate flashcards in the exact JSON format requested. Focus on creating clear, concise questions with accurate answers that promote active recall and spaced repetition learning.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 4000,
            // Performance optimizations
            stream: false,
            top_p: 0.9,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `OpenRouter API error: ${response.status} - ${errorText}`,
        );
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      const content = data.choices[0].message.content;
      this.logger.debug(`AI Response: ${content}`);

      // Parse the JSON response
      let aiResponse: AIFlashcardResponse;
      try {
        // Clean the content and try multiple parsing strategies
        let cleanContent = content.trim();

        // Remove markdown code blocks if present
        cleanContent = cleanContent
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '');

        // Try parsing the cleaned content
        aiResponse = JSON.parse(cleanContent);
      } catch (parseError) {
        this.logger.error('Failed to parse AI response as JSON:', parseError);
        this.logger.debug('Raw content:', content);

        // Try to extract JSON from the content using regex
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            aiResponse = JSON.parse(jsonMatch[0]);
          } catch (regexParseError) {
            throw new Error('Unable to parse AI response as valid JSON');
          }
        } else {
          throw new Error('No valid JSON found in AI response');
        }
      }

      if (!aiResponse.flashcards || !Array.isArray(aiResponse.flashcards)) {
        throw new Error('AI response does not contain valid flashcards array');
      }

      // Validate and clean up flashcards
      const validFlashcards = aiResponse.flashcards
        .filter((card: any) => card.question && card.answer)
        .map((card: any) => ({
          question: String(card.question).trim(),
          answer: String(card.answer).trim(),
          difficulty: Number(card.difficulty) || dto.difficulty,
          explanation: card.explanation
            ? String(card.explanation).trim()
            : undefined,
        }))
        .slice(0, dto.num_flashcards); // Ensure we don't exceed requested count

      this.logger.log(
        `✅ Generated ${validFlashcards.length} valid flashcards`,
      );
      return validFlashcards;
    } catch (error) {
      this.logger.error('AI flashcard generation failed:', error);
      throw error;
    }
  }

  private buildAIPrompt(dto: GenerateAiFlashcardsDto): string {
    const basePrompt = `Generate ${dto.num_flashcards} educational flashcards about "${dto.topic_name}".

Requirements:
- Difficulty level: ${dto.difficulty}/5 (1=beginner, 5=expert)
- Create questions that promote active recall and understanding
- Provide clear, accurate answers
- Each flashcard should test different aspects of the topic

${dto.content_source ? `Content source/context: ${dto.content_source}` : ''}
${dto.additional_instructions ? `Additional instructions: ${dto.additional_instructions}` : ''}

Respond with ONLY this JSON structure (no markdown, no extra text):
{
  "flashcards": [
    {
      "question": "Clear, specific question that tests understanding",
      "answer": "Comprehensive but concise answer",
      "difficulty": ${dto.difficulty},
      "explanation": "Optional: Brief explanation of why this is important to know"
    }
  ]
}

Focus on:
- Questions that require thinking, not just memorization
- Answers that are accurate and complete
- Progressive difficulty appropriate for level ${dto.difficulty}
- Variety in question types (what, how, why, when, etc.)
- Real-world applications when relevant`;

    return basePrompt;
  }
}
