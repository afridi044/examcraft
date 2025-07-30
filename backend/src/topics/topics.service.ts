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

  getTopicsWithSubtopicCount(): Promise<ApiResponse<Array<TopicRow & { subtopic_count: number }>>> {
    return this.db.getTopicsWithSubtopicCount();
  }

  getParentTopics(): Promise<ApiResponse<TopicRow[]>> {
    return this.db.getParentTopics();
  }

  getSubtopicsByParent(parentTopicId: string): Promise<ApiResponse<TopicRow[]>> {
    return this.db.getSubtopicsByParent(parentTopicId);
  }

  getTopicById(id: string): Promise<ApiResponse<TopicRow>> {
    return this.db.getTopicById(id);
  }

  createTopic(input: CreateTopicInput): Promise<ApiResponse<TopicRow>> {
    return this.db.createTopic(input);
  }

  findSubtopicByNameAndParent(
    subtopicName: string,
    parentTopicId: string,
  ): Promise<ApiResponse<TopicRow | null>> {
    return this.db.findSubtopicByNameAndParent(subtopicName, parentTopicId);
  }

  createSubtopic(
    subtopicName: string,
    parentTopicId: string,
  ): Promise<ApiResponse<TopicRow>> {
    return this.db.createSubtopic(subtopicName, parentTopicId);
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
