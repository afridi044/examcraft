import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from './base-database.service';
import {
  ApiResponse,
  TABLE_NAMES,
  TopicRow,
  QuestionRow,
  QuestionOptionRow,
  ExplanationRow,
  QuestionWithOptions,
  TablesInsert,
  TablesUpdate,
} from '../../types/shared.types';

@Injectable()
export class QuestionDatabaseService extends BaseDatabaseService {
  
  async createTopic(
    input: TablesInsert<'topics'>,
  ): Promise<ApiResponse<TopicRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.TOPICS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createTopic');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createTopic');
    }
  }

  async createQuestion(
    input: TablesInsert<'questions'>,
  ): Promise<ApiResponse<QuestionRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.QUESTIONS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createQuestion');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createQuestion');
    }
  }

  async createQuestionOption(
    input: TablesInsert<'question_options'>,
  ): Promise<ApiResponse<QuestionOptionRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.QUESTION_OPTIONS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createQuestionOption');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createQuestionOption');
    }
  }

  async createExplanation(input: {
    question_id: string;
    content: string;
    ai_generated: boolean;
  }): Promise<ApiResponse<ExplanationRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.EXPLANATIONS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createExplanation');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createExplanation');
    }
  }



  async getQuestionById(questionId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.log(`❓ Getting question by ID: ${questionId}`);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.QUESTIONS)
        .select(
          `
          *,
          question_options(*),
          topic:topics(*)
        `,
        )
        .eq('question_id', questionId)
        .single<QuestionRow>();

      if (error) return this.handleError(error, 'getQuestionById');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getQuestionById');
    }
  }

  async getQuestionsWithOptions(filters?: {
    topicId?: string;
    difficulty?: number;
    questionType?: string;
    limit?: number;
  }): Promise<ApiResponse<QuestionWithOptions[]>> {
    try {
      this.logger.log(`🔍 Getting questions with filters:`, filters);

      let query = this.supabase
        .from(TABLE_NAMES.QUESTIONS)
        .select(
          `
          *,
          question_options(*),
          topic:topics(*)
        `,
        );

      if (filters?.topicId) {
        query = query.eq('topic_id', filters.topicId);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.questionType) {
        query = query.eq('question_type', filters.questionType);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) return this.handleError(error, 'getQuestionsWithOptions');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getQuestionsWithOptions');
    }
  }

  async getAllTopics(): Promise<ApiResponse<TopicRow[]>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .select('*')
        .order('name');

      if (error) return this.handleError(error, 'getAllTopics');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getAllTopics');
    }
  }

  async getTopicById(topicId: string): Promise<ApiResponse<TopicRow>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .select('*')
        .eq('topic_id', topicId)
        .single();

      if (error) return this.handleError(error, 'getTopicById');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getTopicById');
    }
  }

  async updateTopic(
    topicId: string,
    input: TablesUpdate<'topics'>,
  ): Promise<ApiResponse<TopicRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.TOPICS)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('topic_id', topicId)
        .select()
        .single();

      if (error) return this.handleError(error, 'updateTopic');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'updateTopic');
    }
  }

  async deleteTopic(topicId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await this.supabaseAdmin
        .from(TABLE_NAMES.TOPICS)
        .delete()
        .eq('topic_id', topicId);

      if (error) return this.handleError(error, 'deleteTopic');
      return this.handleSuccess(true);
    } catch (error) {
      return this.handleError(error, 'deleteTopic');
    }
  }

  async findSubtopicByNameAndParent(
    subtopicName: string,
    parentTopicId: string,
  ): Promise<ApiResponse<TopicRow | null>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .select('*')
        .eq('name', subtopicName)
        .eq('parent_topic_id', parentTopicId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return this.handleError(error, 'findSubtopicByNameAndParent');
      }
      return this.handleSuccess(data || null);
    } catch (error) {
      return this.handleError(error, 'findSubtopicByNameAndParent');
    }
  }

  async createSubtopic(
    subtopicName: string,
    parentTopicId: string,
  ): Promise<ApiResponse<TopicRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.TOPICS)
        .insert({
          name: subtopicName,
          parent_topic_id: parentTopicId,
        })
        .select()
        .single();

      if (error) return this.handleError(error, 'createSubtopic');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createSubtopic');
    }
  }

  async getTopicsWithSubtopicCount(): Promise<ApiResponse<Array<TopicRow & { subtopic_count: number }>>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .select(`
          *,
          subtopics:topics!topics_parent_topic_id_fkey(count)
        `)
        .is('parent_topic_id', null) // Only parent topics
        .order('name');

      if (error) return this.handleError(error, 'getTopicsWithSubtopicCount');
      
      // Transform the data to include subtopic count
      const transformedData = data?.map(topic => ({
        ...topic,
        subtopic_count: topic.subtopics?.[0]?.count || 0,
      })) || [];

      return this.handleSuccess(transformedData);
    } catch (error) {
      return this.handleError(error, 'getTopicsWithSubtopicCount');
    }
  }

  async getParentTopics(): Promise<ApiResponse<TopicRow[]>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .select('*')
        .is('parent_topic_id', null) // Only parent topics
        .order('name');

      if (error) return this.handleError(error, 'getParentTopics');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getParentTopics');
    }
  }

  async getSubtopicsByParent(parentTopicId: string): Promise<ApiResponse<TopicRow[]>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .select('*')
        .eq('parent_topic_id', parentTopicId)
        .order('name');

      if (error) return this.handleError(error, 'getSubtopicsByParent');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getSubtopicsByParent');
    }
  }
}
