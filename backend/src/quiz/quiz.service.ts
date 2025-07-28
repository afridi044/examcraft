import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import {
  QuizWithQuestions,
  ApiResponse,
  CreateQuizInput,
  CreateTopicInput,
  CreateQuestionInput,
  CreateQuestionOptionInput,
  CreateUserAnswerInput,
  UpdateQuizInput,
  QuizRow,
} from '../types/shared.types';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getUserQuizzes(userId: string): Promise<ApiResponse<QuizRow[]>> {
    this.logger.log(`📚 Getting quizzes for user: ${userId}`);
    return await this.databaseService.getUserQuizzes(userId);
  }

  async getUserQuizAttempts(userId: string): Promise<ApiResponse<any[]>> {
    this.logger.log(`📊 Getting quiz attempts for user: ${userId}`);
    return await this.databaseService.getUserQuizAttempts(userId);
  }

  async searchQuizzes(query: string, userId: string): Promise<ApiResponse<any[]>> {
    this.logger.log(`🔍 Searching quizzes for user: ${userId}, query: ${query}`);
    return await this.databaseService.searchQuizzes(query, userId);
  }

  async getQuizWithQuestions(
    quizId: string,
  ): Promise<ApiResponse<QuizWithQuestions>> {
    this.logger.log(`🔍 Getting quiz with questions: ${quizId}`);
    return await this.databaseService.getQuizWithQuestions(quizId);
  }

  async submitAnswer(
    submitAnswerDto: SubmitAnswerDto,
    userId: string,
  ): Promise<ApiResponse<any>> {
    this.logger.log(
      `📝 Submitting answer for question: ${submitAnswerDto.question_id}`,
    );

    const answerInput: CreateUserAnswerInput = {
      user_id: userId,
      question_id: submitAnswerDto.question_id,
      quiz_id: submitAnswerDto.quiz_id,
      selected_option_id: submitAnswerDto.selected_option_id,
      text_answer: submitAnswerDto.text_answer,
      is_correct: submitAnswerDto.is_correct,
      time_taken_seconds: submitAnswerDto.time_taken_seconds,
    };

    return await this.databaseService.submitAnswer(answerInput);
  }

  async createQuiz(
    createQuizDto: CreateQuizDto,
    userId: string,
  ): Promise<ApiResponse<QuizRow>> {
    this.logger.log(`✨ Creating quiz: ${createQuizDto.title}`);

    const quizInput: CreateQuizInput = {
      user_id: userId,
      title: createQuizDto.title,
      description: createQuizDto.description,
      topic_id: createQuizDto.topic_id,
    };

    return await this.databaseService.createQuiz(quizInput);
  }

  async generateQuiz(generateQuizDto: GenerateQuizDto, userId: string): Promise<
    ApiResponse<{
      quiz: QuizRow;
      questions_created: number;
      message: string;
    }>
  > {
    this.logger.log(`🤖 Generating AI quiz: ${generateQuizDto.title}`);

    interface AIQuestion {
      question: string;
      type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
      options?: string[];
      correct_answer: string | number;
      explanation?: string;
      difficulty: number;
    }

    try {
      // ------------------------------------------------
      // 1. Ensure topic
      // ------------------------------------------------
      let topicId = generateQuizDto.topic_id;
      if (!topicId && generateQuizDto.custom_topic) {
        const topicInput: CreateTopicInput = {
          name: generateQuizDto.custom_topic,
          description: `Custom topic: ${generateQuizDto.custom_topic}`,
        };
        const topicRes = await this.databaseService.createTopic(topicInput);
        if (!topicRes.success || !topicRes.data) {
          throw new Error(topicRes.error || 'Failed to create topic');
        }
        topicId = topicRes.data.topic_id;
      }

      // ------------------------------------------------
      // 2. Create quiz record first
      // ------------------------------------------------
      const quizInput: CreateQuizInput = {
        user_id: userId,
        title: generateQuizDto.title,
        description:
          generateQuizDto.description ||
          `AI-generated quiz on ${generateQuizDto.topic_name}`,
        topic_id: topicId,
      };
      const quizRes = await this.databaseService.createQuiz(quizInput);
      if (!quizRes.success || !quizRes.data) {
        throw new Error(quizRes.error || 'Failed to create quiz');
      }
      const quiz = quizRes.data;

      // ------------------------------------------------
      // 3. Call OpenRouter AI to generate questions
      // ------------------------------------------------
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        this.logger.warn('OPENROUTER_API_KEY not configured – skipping AI');
      }

      const buildPrompt = (): string => {
        return `Generate ${generateQuizDto.num_questions} ${generateQuizDto.question_types.join(', ')} questions about ${generateQuizDto.topic_name} (difficulty ${generateQuizDto.difficulty}/5). Respond ONLY in valid JSON with structure: {\n  "questions": [\n    {\n      "question": string,\n      "type": "multiple-choice",\n      "options": string[],\n      "correct_answer": number,\n      "explanation": string,\n      "difficulty": number\n    }\n  ]\n}`;
      };

      let aiQuestions: AIQuestion[] = [];
      if (openRouterApiKey) {
        try {
          const res = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer':
                  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'ExamCraft - AI Quiz Generator',
              },
              body: JSON.stringify({
                model: 'deepseek/deepseek-chat-v3-0324:free',
                messages: [
                  {
                    role: 'system',
                    content:
                      'You are an expert educational content creator. You must respond with ONLY valid JSON - no markdown, no explanations, no additional text. Start your response with { and end with }. Generate quiz questions in the exact JSON format requested.',
                  },
                  { role: 'user', content: buildPrompt() },
                ],
                temperature: 0.7,
                max_tokens: 4000,
              }),
            },
          );

          const json = await res.json();

          // OpenRouter returns { choices: [ { message: { content: '...json...' } } ] }
          const content = json?.choices?.[0]?.message?.content;
          if (typeof content === 'string') {
            try {
              const parsed = JSON.parse(content);
              aiQuestions = (parsed?.questions || []) as AIQuestion[];
            } catch (e) {
              this.logger.error('Failed to parse AI JSON', e);
            }
          }
        } catch (err) {
          this.logger.error(
            'AI generation failed – continuing without AI',
            err,
          );
        }
      }

      if (aiQuestions.length === 0) {
        this.logger.warn('⚠️ AI returned no questions; deleting empty quiz');
        // Clean up: delete quiz record to avoid orphan empty quizzes
        await this.databaseService.deleteQuiz(quiz.quiz_id);
        return {
          success: false,
          data: null,
          error: 'AI did not return any questions. Please try again.',
        };
      }

      // ------------------------------------------------
      // 4. Persist questions
      // ------------------------------------------------
      const questionIds: string[] = [];

      for (const aiQ of aiQuestions) {
        // Create question
        const qInput: CreateQuestionInput = {
          content: aiQ.question,
          question_type: aiQ.type,
          difficulty: aiQ.difficulty,
          topic_id: topicId,
        };
        const qRes = await this.databaseService.createQuestion(qInput);
        if (!qRes.success || !qRes.data) {
          this.logger.warn(`Failed to create question: ${aiQ.question}`);
          continue;
        }
        const question = qRes.data;
        questionIds.push(question.question_id);

        // Options (only for MCQ now)
        if (aiQ.type === 'multiple-choice' && aiQ.options) {
          for (let idx = 0; idx < aiQ.options.length; idx++) {
            const optInput: CreateQuestionOptionInput = {
              question_id: question.question_id,
              content: aiQ.options[idx],
              is_correct: idx === aiQ.correct_answer,
            };
            await this.databaseService.createQuestionOption(optInput);
          }
        }

        // Explanation
        if (aiQ.explanation) {
          await this.databaseService.createExplanation({
            question_id: question.question_id,
            content: aiQ.explanation,
            ai_generated: true,
          });
        }
      }

      // ------------------------------------------------
      // 5. Link questions to quiz
      // ------------------------------------------------
      await this.databaseService.addQuestionsToQuiz(quiz.quiz_id, questionIds);

      const result = {
        quiz,
        questions_created: questionIds.length,
        message: `Successfully generated quiz with ${questionIds.length} questions`,
      };

      return { success: true, data: result, error: null };
    } catch (error) {
      this.logger.error('❌ Quiz generation error:', error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to generate quiz',
      };
    }
  }

  async deleteQuiz(quizId: string): Promise<ApiResponse<null>> {
    this.logger.log(`🗑 Deleting quiz: ${quizId}`);
    return await this.databaseService.deleteQuiz(quizId);
  }

  async getQuizReview(
    quizId: string,
    userId: string,
  ): Promise<ApiResponse<any>> {
    this.logger.log(
      `🧐 Getting quiz review: quiz ${quizId} for user ${userId}`,
    );
    return await this.databaseService.getQuizReview(quizId, userId);
  }

  async updateQuiz(
    quizId: string,
    input: UpdateQuizInput,
  ): Promise<ApiResponse<QuizRow>> {
    return this.databaseService.updateQuiz(quizId, input);
  }
}
