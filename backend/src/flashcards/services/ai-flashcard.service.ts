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
                   'You are an expert educational content creator and cognitive scientist specializing in designing effective flashcards for spaced repetition and active recall learning. Your expertise includes understanding how memory works, optimal question design for retention, and creating educational content that promotes deep learning.\n\nCRITICAL REQUIREMENTS:\n- Respond ONLY with valid JSON - no markdown, no explanations, no additional text\n- Start your response with { and end with }\n- Follow the exact JSON structure specified in the user prompt\n- Create flashcards that optimize long-term retention and understanding\n- Design questions that promote active recall rather than passive recognition\n- Ensure each flashcard tests a distinct, important concept\n- Use evidence-based principles from cognitive science for effective learning\n- Focus on clarity, accuracy, and educational value in every flashcard\n- Keep answers concise (max 50 words) to fit flashcard UI format',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
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
    const difficultyDescriptions = {
      1: "Beginner level - Basic definitions, fundamental concepts, and simple recall. Questions should test basic knowledge and terminology.",
      2: "Easy level - Simple concepts and straightforward understanding. Questions should test comprehension and basic connections.",
      3: "Medium level - Moderate complexity requiring some analysis. Questions should test understanding and application of concepts.",
      4: "Hard level - Complex scenarios requiring critical thinking. Questions should test synthesis and advanced application.",
      5: "Expert level - Advanced concepts requiring deep understanding. Questions should test mastery and expert-level insights."
    };

    const difficultyDescription = difficultyDescriptions[dto.difficulty as keyof typeof difficultyDescriptions] || difficultyDescriptions[3];

    let contentContext = "";
    if (dto.content_source && dto.content_source.trim()) {
      contentContext = `\n\nCONTENT CONTEXT: Use the following study material as the primary source for creating flashcards:\n${dto.content_source}\n\nIMPORTANT: Base your flashcards primarily on this provided content. Create questions and answers that help students learn and remember the key concepts from this material. If the content doesn't cover enough material for ${dto.num_flashcards} flashcards, supplement with essential knowledge about ${dto.topic_name}, but prioritize the provided content.`;
    }

    let additionalInstructions = "";
    if (dto.additional_instructions && dto.additional_instructions.trim()) {
      additionalInstructions = `\n\nSPECIFIC INSTRUCTIONS: ${dto.additional_instructions}`;
    }

    return `You are an expert educational content creator specializing in creating effective flashcards for spaced repetition and active recall learning.

TASK: Generate ${dto.num_flashcards} educational flashcards about "${dto.topic_name}"

DIFFICULTY LEVEL: ${dto.difficulty}/5 - ${difficultyDescription}

FLASHCARD QUALITY REQUIREMENTS:
1. Questions should be clear, specific, and unambiguous
2. Questions should promote active recall, not passive recognition
3. Answers should be comprehensive but concise (1-3 sentences typically)
4. Each flashcard should test a distinct concept, fact, or skill
5. Avoid questions that can be answered with simple yes/no unless testing specific facts
6. Use varied question formats to maintain engagement
7. Ensure answers are accurate and educational

QUESTION DESIGN PRINCIPLES:
- Use "What is...?", "How does...?", "Why does...?", "When should...?" formats
- Test understanding, not just memorization
- Include application-based questions for higher difficulty levels
- Create questions that require thinking and synthesis
- Avoid overly complex or confusing wording
- Focus on the most important concepts that students need to know

ANSWER GUIDELINES:
- Provide complete but concise answers (maximum 50 words)
- Include key details that aid understanding within the word limit
- Add context when helpful for learning, but keep it brief
- Ensure answers directly address the question asked
- Use clear, educational language appropriate for the difficulty level
- Keep answers focused and to the point to fit flashcard format

TOPIC FOCUS: ${dto.topic_name}${contentContext}${additionalInstructions}

RESPONSE FORMAT: Respond ONLY with valid JSON in this exact structure:
{
  "flashcards": [
    {
      "question": "Clear, specific question that tests understanding and promotes active recall?",
      "answer": "Concise answer (max 50 words) that directly addresses the question and fits flashcard format.",
      "difficulty": ${dto.difficulty},
      "explanation": "Brief explanation of why this concept is important or how it connects to broader topics."
    }
  ]
}

IMPORTANT REQUIREMENTS:
- Start your response with { and end with }
- Include exactly ${dto.num_flashcards} flashcards
- Ensure all questions are relevant to "${dto.topic_name}"
- Keep answers under 50 words to fit flashcard UI format
- Make explanations educational and connect to broader learning objectives
- Vary question types and cognitive levels within the difficulty range
- Focus on concepts that promote long-term retention and understanding
- Create flashcards that would be valuable for exam preparation and knowledge mastery`;
  }
}
