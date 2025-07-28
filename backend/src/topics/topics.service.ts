import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTopicInput, ApiResponse } from '../types/shared.types';
import type { Tables } from '../types/supabase.generated';

type TopicRow = Tables<'topics'>;

@Injectable()
export class TopicsService {
  constructor(private readonly db: DatabaseService) {}

  getAllTopics(): Promise<ApiResponse<TopicRow[]>> {
    return this.db.getAllTopics();
  }

  getTopicById(id: string): Promise<ApiResponse<TopicRow>> {
    return this.db.getTopicById(id);
  }

  createTopic(input: CreateTopicInput): Promise<ApiResponse<TopicRow>> {
    return this.db.createTopic(input);
  }

  updateTopic(
    id: string,
    input: Partial<CreateTopicInput>,
  ): Promise<ApiResponse<TopicRow>> {
    return this.db.updateTopic(id, input);
  }

  deleteTopic(id: string): Promise<ApiResponse<boolean>> {
    return this.db.deleteTopic(id);
  }
}
