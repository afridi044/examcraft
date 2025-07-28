import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  ApiResponse,
  QuestionWithOptions,
  CreateQuestionInput,
  CreateQuestionOptionInput,
} from '../types/shared.types';

@Injectable()
export class QuestionsService {
  constructor(private readonly db: DatabaseService) {}

  getQuestions(filters?: {
    topicId?: string;
    difficulty?: number;
    questionType?: string;
    limit?: number;
  }): Promise<ApiResponse<QuestionWithOptions[]>> {
    return this.db.getQuestionsWithOptions(filters);
  }

  getQuestionById(id: string): Promise<ApiResponse<QuestionWithOptions>> {
    return this.db.getQuestionById(id);
  }

  async createQuestionWithOptions(
    questionInput: CreateQuestionInput,
    optionsInput: CreateQuestionOptionInput[],
  ): Promise<ApiResponse<QuestionWithOptions>> {
    // First, create the question itself
    const questionRes = await this.db.createQuestion(questionInput);
    if (!questionRes.success || !questionRes.data) {
      return questionRes as ApiResponse<any>;
    }
    const question = questionRes.data;

    // Prepare options with question_id
    const optionsWithId = optionsInput.map((o) => ({
      ...o,
      question_id: question.question_id,
    }));

    // Create all options (parallel)
    const optionPromises = optionsWithId.map((opt) =>
      this.db.createQuestionOption(opt),
    );
    const optionResults = await Promise.all(optionPromises);

    // Check if any failed
    const failed = optionResults.find((r) => !r.success);
    if (failed) {
      return {
        success: false,
        data: null,
        error: failed.error || 'Failed to create one or more options',
      };
    }

    const createdOptions = optionResults.map((r) => r.data!);

    const result: QuestionWithOptions = {
      ...question,
      question_options: createdOptions,
    } as any;

    return {
      success: true,
      data: result,
      error: null,
    };
  }
}
