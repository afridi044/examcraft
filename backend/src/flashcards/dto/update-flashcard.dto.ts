import { IsOptional, IsString, IsUUID, IsArray, IsIn } from 'class-validator';

export class UpdateFlashcardDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsUUID()
  topic_id?: string;

  @IsOptional()
  @IsString()
  custom_topic?: string;

  @IsOptional()
  @IsIn(['learning', 'under_review', 'mastered'])
  mastery_status?: 'learning' | 'under_review' | 'mastered';

  @IsOptional()
  @IsArray()
  tags?: string[];
}
