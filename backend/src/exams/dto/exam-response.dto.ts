import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { QuestionWithOptions } from '../../types/shared.types';

export class ExamQuestionDto {
  @ApiProperty()
  question_id: string;

  @ApiProperty()
  question_order: number;

  @ApiProperty()
  points: number;

  @ApiPropertyOptional()
  question?: QuestionWithOptions;
}

export class ExamResponseDto {
  @ApiProperty()
  exam_id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  duration_minutes: number;

  @ApiPropertyOptional()
  passing_score?: number;

  @ApiPropertyOptional()
  topic_id?: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiPropertyOptional({
    description: 'Topic information if topic_id is provided',
    type: 'object',
    additionalProperties: false,
    properties: {
      topic_id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' }
    }
  })
  topic?: {
    topic_id: string;
    name: string;
    description?: string;
  };

  @ApiPropertyOptional({
    description: 'Questions in the exam with their order and points',
    type: [ExamQuestionDto]
  })
  questions?: ExamQuestionDto[];

  @ApiPropertyOptional({
    description: 'Total number of questions in the exam'
  })
  total_questions?: number;

  @ApiPropertyOptional({
    description: 'Total points available in the exam'
  })
  total_points?: number;
}

export class ExamListResponseDto {
  @ApiProperty()
  exam_id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  duration_minutes: number;

  @ApiPropertyOptional()
  passing_score?: number;

  @ApiProperty()
  created_at: string;

  @ApiPropertyOptional({
    description: 'Topic information if topic_id is provided',
    type: 'object',
    additionalProperties: false,
    properties: {
      topic_id: { type: 'string' },
      name: { type: 'string' }
    }
  })
  topic?: {
    topic_id: string;
    name: string;
  };

  @ApiProperty()
  total_questions: number;

  @ApiProperty()
  total_points: number;
} 