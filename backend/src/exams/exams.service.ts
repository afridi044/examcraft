import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { GenerateExamDto } from './dto/generate-exam.dto';
import type {
  ApiResponse,
  ExamRow,
  ExamSessionRow,
  ExamInsert,
  ExamSessionInsert,
} from '../types/shared.types';

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get all exams for a user
   */
  async getUserExams(userId: string): Promise<ApiResponse<any[]>> {
    this.logger.log(`📚 Getting exams for user: ${userId}`);
    return await this.databaseService.getUserExams(userId);
  }

  /**
   * Get exam by ID with questions
   */
  async getExamById(examId: string): Promise<ApiResponse<any>> {
    this.logger.log(`🔍 Getting exam: ${examId}`);
    return await this.databaseService.getExamById(examId);
  }

  /**
   * Create a new exam
   */
  async createExam(createExamDto: CreateExamDto): Promise<ApiResponse<ExamRow>> {
    this.logger.log(`✨ Creating exam: ${createExamDto.title}`);

    const examInput: ExamInsert = {
      user_id: createExamDto.user_id,
      title: createExamDto.title,
      description: createExamDto.description,
      duration_minutes: createExamDto.duration_minutes,
      passing_score: createExamDto.passing_score,
      topic_id: createExamDto.topic_id,
    };

    return await this.databaseService.createExam(
      examInput,
      createExamDto.question_ids,
    );
  }

  /**
   * Generate AI-powered exam
   */
  async generateExam(generateExamDto: GenerateExamDto): Promise<ApiResponse<{ exam: ExamRow; questions: any[] }>> {
    this.logger.log(`🤖 Generating AI exam: ${generateExamDto.title}`);

    let createdExamId: string | null = null;
    let createdTopicId: string | null = null;
    let isCustomTopic = false;

    try {
      // Step 1: Handle topic creation if needed
      let topicId = generateExamDto.topic_id;
      if (!topicId && generateExamDto.custom_topic) {
        isCustomTopic = true;
        const topicResult = await this.databaseService.createTopic({
          name: generateExamDto.custom_topic,
          description: `Custom topic: ${generateExamDto.custom_topic}`,
        });
        
        if (topicResult.success && topicResult.data) {
          topicId = topicResult.data.topic_id;
          createdTopicId = topicId;
        }
      }

      // Step 2: Create the exam first
      const examInput: ExamInsert = {
        user_id: generateExamDto.user_id,
        title: generateExamDto.title,
        description: generateExamDto.description || `AI-generated exam on ${generateExamDto.topic_name}`,
        duration_minutes: generateExamDto.duration_minutes,
        passing_score: generateExamDto.passing_score,
        topic_id: topicId,
      };

      const examRes = await this.databaseService.createExam(examInput, []);
      if (!examRes.success || !examRes.data) {
        throw new Error(examRes.error || 'Failed to create exam');
      }

      const exam = examRes.data;
      createdExamId = exam.exam_id;

      // Step 3: Generate questions using AI
      const aiPrompt = this.buildExamPrompt(generateExamDto);
      
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'ExamCraft - AI Exam Generator',
        },
        body: JSON.stringify({
          model: 'microsoft/wizardlm-2-8x22b',
          messages: [
            {
              role: 'system',
              content: 'You are an expert exam creator. Generate comprehensive exam questions that thoroughly test knowledge and understanding.',
            },
            {
              role: 'user',
              content: aiPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('AI returned empty response');
      }

      // Step 4: Parse AI response and create questions
      this.logger.debug('🔍 Raw AI response:', content.substring(0, 200) + '...');
      const cleanedContent = this.cleanAIResponse(content);
      this.logger.debug('🧹 Cleaned AI response:', cleanedContent.substring(0, 200) + '...');
      
      const questionsData = JSON.parse(cleanedContent);
      if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
        throw new Error('Invalid AI response format');
      }

      if (questionsData.questions.length === 0) {
        throw new Error('AI failed to generate questions');
      }

      // Step 5: Create questions in database
      const questionIds: string[] = [];
      
      for (const questionData of questionsData.questions) {
        const questionInput = {
          content: questionData.question,
          question_type: questionData.type,
          difficulty: generateExamDto.difficulty,
          topic_id: topicId || null,
        };

        const questionRes = await this.databaseService.createQuestion(questionInput);

        if (questionRes.success && questionRes.data) {
          const questionId = questionRes.data.question_id;
          questionIds.push(questionId);

          // Create question options for multiple choice questions
          if (questionData.type === 'multiple-choice' && questionData.options) {
            for (let idx = 0; idx < questionData.options.length; idx++) {
              const optionInput = {
                question_id: questionId,
                content: questionData.options[idx],
                is_correct: idx === questionData.correct_answer_index,
              };
              await this.databaseService.createQuestionOption(optionInput);
            }
          }

          // Create explanation if provided
          if (questionData.explanation) {
            await this.databaseService.createExplanation({
              question_id: questionId,
              content: questionData.explanation,
              ai_generated: true,
            });
          }
        }
      }

      // Step 6: Associate questions with exam
      if (questionIds.length > 0) {
        // Use the existing method from exam creation
        await this.databaseService.updateExam(exam.exam_id, {}, questionIds);
      } else {
        throw new Error('No questions were successfully created');
      }

      // Step 7: Return exam with questions
      const finalExamRes = await this.databaseService.getExamById(exam.exam_id);
      
      return {
        success: true,
        data: {
          exam: exam,
          questions: finalExamRes.data?.questions || [],
        },
        error: null,
      };

    } catch (error) {
      this.logger.error('🚨 AI exam generation failed:', error);

      // ⚠️ CRITICAL: Clean up orphan data
      try {
        if (createdExamId) {
          this.logger.warn(`🧹 Cleaning up orphan exam: ${createdExamId}`);
          await this.databaseService.deleteExam(createdExamId);
        }

        // Only delete custom topics if they were created specifically for this exam
        // and no other data references them
        if (isCustomTopic && createdTopicId) {
          this.logger.warn(`🧹 Cleaning up orphan topic: ${createdTopicId}`);
          await this.databaseService.deleteTopic(createdTopicId);
        }
      } catch (cleanupError) {
        this.logger.error('🚨 Failed to clean up orphan data:', cleanupError);
      }

      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate exam',
      };
    }
  }

  private buildExamPrompt(dto: GenerateExamDto): string {
    return `Generate ${dto.num_questions} ${dto.question_types.join(', ')} questions for a comprehensive exam about ${dto.topic_name} (difficulty ${dto.difficulty}/5). The exam duration is ${dto.duration_minutes} minutes.

${dto.content_source ? `Use this content as reference: ${dto.content_source}` : ''}
${dto.additional_instructions ? `Additional requirements: ${dto.additional_instructions}` : ''}

Respond ONLY in valid JSON with this structure:
{
  "questions": [
    {
      "question": "question text",
      "type": "multiple-choice|true-false|short-answer",
      "options": ["option1", "option2", "option3", "option4"], // only for multiple-choice
      "correct_answer_index": 0, // only for multiple-choice (0-based index)
      "correct_answer": "answer text", // only for true-false and short-answer
      "explanation": "detailed explanation of the answer"
    }
  ]
}

Requirements:
- Questions should be comprehensive and test deep understanding
- Mix different cognitive levels (recall, comprehension, application, analysis)
- Ensure questions are appropriate for exam conditions
- Include clear, unambiguous wording
- For multiple choice: exactly 4 options with one correct answer
- For true/false: clear statements that are definitively true or false
- For short answer: questions requiring 1-3 sentence responses`;
  }

  /**
   * Clean AI response by removing markdown code blocks
   */
  private cleanAIResponse(content: string): string {
    // Remove markdown code blocks (```json and ```)
    let cleaned = content.trim();
    
    // Remove starting ```json or ```
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
    
    // Remove ending ```
    cleaned = cleaned.replace(/\n?\s*```\s*$/i, '');
    
    return cleaned.trim();
  }

  /**
   * Update an exam
   */
  async updateExam(
    examId: string,
    updateExamDto: UpdateExamDto,
  ): Promise<ApiResponse<ExamRow>> {
    this.logger.log(`📝 Updating exam: ${examId}`);

    const examInput = {
      title: updateExamDto.title,
      description: updateExamDto.description,
      duration_minutes: updateExamDto.duration_minutes,
      passing_score: updateExamDto.passing_score,
      topic_id: updateExamDto.topic_id,
    };

    // Remove undefined values
    const cleanInput = Object.fromEntries(
      Object.entries(examInput).filter(([_, value]) => value !== undefined),
    );

    return await this.databaseService.updateExam(
      examId,
      cleanInput,
      updateExamDto.question_ids,
    );
  }

  /**
   * Delete an exam
   */
  async deleteExam(examId: string): Promise<ApiResponse<boolean>> {
    this.logger.log(`🗑️ Deleting exam: ${examId}`);
    return await this.databaseService.deleteExam(examId);
  }

  /**
   * Get exam sessions for a user
   */
  async getUserExamSessions(
    userId: string,
    examId?: string,
  ): Promise<ApiResponse<any[]>> {
    this.logger.log(
      `📊 Getting exam sessions for user: ${userId}${examId ? `, exam: ${examId}` : ''}`,
    );
    return await this.databaseService.getExamSessions(userId, examId);
  }

  /**
   * Start a new exam session
   */
  async startExamSession(
    examId: string,
    userId: string,
  ): Promise<ApiResponse<ExamSessionRow>> {
    this.logger.log(`🚀 Starting exam session - Exam: ${examId}, User: ${userId}`);

    // Check if exam exists and get exam details
    const examResponse = await this.databaseService.getExamById(examId);
    if (!examResponse.success || !examResponse.data) {
      return {
        success: false,
        data: null,
        error: 'Exam not found',
      };
    }

    // Check if user has an active session for this exam
    const activeSessionsResponse = await this.databaseService.getExamSessions(
      userId,
      examId,
    );
    
    if (activeSessionsResponse.success && activeSessionsResponse.data) {
      const activeSessions = activeSessionsResponse.data.filter(
        (session: any) => session.status === 'in_progress',
      );
      
      if (activeSessions.length > 0) {
        return {
          success: false,
          data: null,
          error: 'You already have an active session for this exam',
        };
      }
    }

    // Create new exam session
    const sessionInput: ExamSessionInsert = {
      exam_id: examId,
      user_id: userId,
      status: 'in_progress',
    };

    return await this.databaseService.createExamSession(sessionInput);
  }

  /**
   * End an exam session
   */
  async endExamSession(
    sessionId: string,
    totalScore?: number,
  ): Promise<ApiResponse<ExamSessionRow>> {
    this.logger.log(`🏁 Ending exam session: ${sessionId}`);

    const updateData = {
      end_time: new Date().toISOString(),
      status: 'completed' as const,
      total_score: totalScore,
    };

    return await this.databaseService.updateExamSession(sessionId, updateData);
  }

  /**
   * Get exam session by ID
   */
  async getExamSession(sessionId: string): Promise<ApiResponse<any>> {
    this.logger.log(`🔍 Getting exam session: ${sessionId}`);
    return await this.databaseService.getExamSessionById(sessionId);
  }

  /**
   * Submit answer for exam session
   */
  async submitExamAnswer(
    sessionId: string,
    questionId: string,
    userId: string,
    selectedOptionId?: string,
    textAnswer?: string,
    isCorrect?: boolean,
    timeTakenSeconds?: number,
  ): Promise<ApiResponse<any>> {
    this.logger.log(
      `📝 Submitting exam answer - Session: ${sessionId}, Question: ${questionId}`,
    );

    const answerInput = {
      user_id: userId,
      question_id: questionId,
      session_id: sessionId,
      selected_option_id: selectedOptionId,
      text_answer: textAnswer,
      is_correct: isCorrect,
      time_taken_seconds: timeTakenSeconds,
    };

    return await this.databaseService.submitAnswer(answerInput);
  }

  /**
   * Time out an exam session (when timer expires)
   */
  async timeoutExamSession(sessionId: string): Promise<ApiResponse<ExamSessionRow>> {
    this.logger.log(`⏰ Timing out exam session: ${sessionId}`);

    const updateData = {
      end_time: new Date().toISOString(),
      status: 'timed_out' as const,
    };

    return await this.databaseService.updateExamSession(sessionId, updateData);
  }
}
