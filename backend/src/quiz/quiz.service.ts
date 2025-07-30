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

  async recordQuizCompletion(
    userId: string,
    quizId: string,
    completionData: {
      totalQuestions: number;
      answeredQuestions: number;
      correctAnswers: number;
      scorePercentage: number;
      timeSpentSeconds: number;
      wasAutoSubmitted: boolean;
    }
  ): Promise<ApiResponse<any>> {
    this.logger.log(`🏁 Recording quiz completion for user: ${userId}, quiz: ${quizId}`);
    return await this.databaseService.recordQuizCompletion(userId, quizId, completionData);
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
      // 1. Ensure topic and handle subtopic logic
      // ------------------------------------------------
      let topicId = generateQuizDto.topic_id;
      let finalTopicName = generateQuizDto.topic_name;

      // Handle subtopic logic
      if (generateQuizDto.subtopic_name && generateQuizDto.topic_id) {
        // Check if subtopic already exists under the parent topic
        const existingSubtopicRes = await this.databaseService.findSubtopicByNameAndParent(
          generateQuizDto.subtopic_name,
          generateQuizDto.topic_id
        );

        if (!existingSubtopicRes.success) {
          throw new Error(existingSubtopicRes.error || 'Failed to check for existing subtopic');
        }

        if (existingSubtopicRes.data) {
          // Subtopic exists, use it
          topicId = existingSubtopicRes.data.topic_id;
          finalTopicName = `${generateQuizDto.topic_name} - ${generateQuizDto.subtopic_name}`;
          this.logger.log(`📝 Using existing subtopic: ${generateQuizDto.subtopic_name}`);
        } else {
          // Create new subtopic under the parent topic
          const subtopicRes = await this.databaseService.createSubtopic(
            generateQuizDto.subtopic_name,
            generateQuizDto.topic_id
          );

          if (!subtopicRes.success || !subtopicRes.data) {
            throw new Error(subtopicRes.error || 'Failed to create subtopic');
          }

          topicId = subtopicRes.data.topic_id;
          finalTopicName = `${generateQuizDto.topic_name} - ${generateQuizDto.subtopic_name}`;
          this.logger.log(`✨ Created new subtopic: ${generateQuizDto.subtopic_name} under ${generateQuizDto.topic_name}`);
        }
      } else if (generateQuizDto.topic_id) {
        // Using existing topic without subtopic
        finalTopicName = generateQuizDto.topic_name;
      } else {
        throw new Error('topic_id is required');
      }

      // ------------------------------------------------
      // 2. Create quiz record first
      // ------------------------------------------------
      const quizInput: CreateQuizInput = {
        user_id: userId,
        title: generateQuizDto.title,
        description:
          generateQuizDto.description ||
          `AI-generated quiz on ${finalTopicName}`,
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
        const difficultyDescriptions = {
          1: "Beginner level - Basic concepts, definitions, and fundamental knowledge. Questions should test basic understanding and recall.",
          2: "Easy level - Simple applications and straightforward concepts. Questions should test comprehension and basic application.",
          3: "Medium level - Moderate complexity with some analysis required. Questions should test understanding and moderate application.",
          4: "Hard level - Complex scenarios requiring analysis and synthesis. Questions should test higher-order thinking skills.",
          5: "Expert level - Advanced concepts requiring deep understanding and critical thinking. Questions should test mastery and expert-level application."
        };

        const difficultyDescription = difficultyDescriptions[generateQuizDto.difficulty as keyof typeof difficultyDescriptions] || difficultyDescriptions[3];

        let contentContext = "";
        if (generateQuizDto.content_source && generateQuizDto.content_source.trim()) {
          contentContext = `\n\nCONTENT CONTEXT: Use the following study material as the primary source for generating questions:\n${generateQuizDto.content_source}\n\nIMPORTANT: Base your questions primarily on this provided content. If the content doesn't cover enough material for ${generateQuizDto.num_questions} questions, supplement with general knowledge about ${finalTopicName}, but prioritize the provided content.`;
        }

        let additionalInstructions = "";
        if (generateQuizDto.additional_instructions && generateQuizDto.additional_instructions.trim()) {
          additionalInstructions = `\n\nSPECIFIC INSTRUCTIONS: ${generateQuizDto.additional_instructions}`;
        }

        return `You are an expert educational content creator specializing in creating high-quality multiple-choice questions for academic assessments.

TASK: Generate ${generateQuizDto.num_questions} multiple-choice questions about "${finalTopicName}"

DIFFICULTY LEVEL: ${generateQuizDto.difficulty}/5 - ${difficultyDescription}

QUALITY REQUIREMENTS:
1. Each question must have exactly 4 options (A, B, C, D)
2. Only ONE option should be correct
3. All incorrect options must be plausible and educational
4. Avoid "all of the above" or "none of the above" options
5. Questions should be clear, unambiguous, and well-written
6. Each question should test a distinct concept or skill
7. Avoid repetitive question patterns
8. Ensure questions are appropriate for the specified difficulty level

QUESTION STRUCTURE GUIDELINES:
- Question stems should be clear and complete
- Options should be grammatically consistent
- Correct answers should be distributed across all positions (A, B, C, D)
- Explanations should be educational and help learners understand the concept
- Questions should progress from basic to more complex within the difficulty level

TOPIC FOCUS: ${finalTopicName}${contentContext}${additionalInstructions}

RESPONSE FORMAT: Respond ONLY with valid JSON in this exact structure:
{
  "questions": [
    {
      "question": "Clear, complete question text ending with a question mark?",
      "type": "multiple-choice",
      "options": [
        "Option A - First choice",
        "Option B - Second choice", 
        "Option C - Third choice",
        "Option D - Fourth choice"
      ],
      "correct_answer": 0,
      "explanation": "Educational explanation of why this answer is correct and why others are incorrect. Include key concepts and learning points.",
      "difficulty": ${generateQuizDto.difficulty}
    }
  ]
}

IMPORTANT: 
- Start your response with { and end with }
- Include exactly ${generateQuizDto.num_questions} questions
- Use correct_answer: 0 for option A, 1 for B, 2 for C, 3 for D
- Ensure all questions are relevant to "${finalTopicName}"
- Make explanations educational and helpful for learning
- Vary question types and cognitive levels within the difficulty range`;
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
                      'You are an expert educational content creator specializing in assessment design and curriculum development. Your role is to create high-quality, pedagogically sound multiple-choice questions that effectively assess student learning.\n\nCRITICAL REQUIREMENTS:\n- Respond ONLY with valid JSON - no markdown, no explanations, no additional text\n- Start your response with { and end with }\n- Follow the exact JSON structure specified in the user prompt\n- Ensure all questions are educationally valuable and well-crafted\n- Maintain consistency in question quality and difficulty\n- Focus on creating questions that promote learning and understanding\n- Avoid ambiguous or poorly worded questions\n- Ensure all distractors (incorrect options) are plausible and educational',
                  },
                  { role: 'user', content: buildPrompt() },
                ],
                temperature: 0.3,
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
