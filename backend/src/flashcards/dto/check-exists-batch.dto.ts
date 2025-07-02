import { IsUUID, IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class CheckFlashcardsExistBatchDto {
  @IsUUID()
  user_id: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  question_ids: string[];
}
 