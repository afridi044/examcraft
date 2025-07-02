import { IsString, IsUUID, IsOptional, IsIn } from 'class-validator';

export class StudySessionDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  topic_id: string;

  @IsOptional()
  @IsIn(['learning', 'under_review', 'mastered', 'all', 'mixed'])
  mastery_status?: 'learning' | 'under_review' | 'mastered' | 'all' | 'mixed';
}
