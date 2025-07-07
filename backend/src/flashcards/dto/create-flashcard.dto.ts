import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CreateFlashcardDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsUUID()
  @IsOptional()
  topic_id?: string;

  @IsString()
  @IsOptional()
  custom_topic?: string;

  @IsUUID()
  @IsOptional()
  source_question_id?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
 