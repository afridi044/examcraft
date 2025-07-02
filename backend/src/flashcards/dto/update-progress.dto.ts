import { IsString, IsUUID, IsIn, IsOptional, IsNumber } from 'class-validator';

export class UpdateProgressDto {
  @IsUUID()
  flashcard_id: string;

  @IsIn(['know', 'dont_know'])
  performance: 'know' | 'dont_know';

  @IsOptional()
  @IsNumber()
  study_time_seconds?: number;
}
