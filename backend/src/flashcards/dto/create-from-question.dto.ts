import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateFlashcardFromQuestionDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  question_id: string;

  @IsUUID()
  @IsOptional()
  quiz_id?: string; // optional, for analytics

  @IsString()
  @IsOptional()
  custom_question?: string;

  @IsString()
  @IsOptional()
  custom_answer?: string;
}
 