import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateFlashcardFromQuestionDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  question_id: string;

  @IsUUID()
  @IsOptional()
  quiz_id?: string; // optional, for analytics

  @IsUUID()
  @IsOptional()
  topic_id?: string; // optional, to override the question's topic

  @IsString()
  @IsOptional()
  custom_question?: string;

  @IsString()
  @IsOptional()
  custom_answer?: string;
}
 