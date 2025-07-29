import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { CreateTopicInput } from '../types/shared.types';

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  private readonly logger = new Logger(TopicsController.name);

  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  @ApiResponse({
    status: 200,
    description: 'Topics retrieved successfully',
  })
  async getAllTopics() {
    this.logger.log('📚 Getting all topics');
    const res = await this.topicsService.getAllTopics();
    return res;
  }

  @Get('with-subtopic-count')
  @ApiOperation({ summary: 'Get all topics with subtopic counts' })
  @ApiResponse({
    status: 200,
    description: 'Topics with subtopic counts retrieved successfully',
  })
  async getTopicsWithSubtopicCount() {
    this.logger.log('📚 Getting topics with subtopic counts');
    const res = await this.topicsService.getTopicsWithSubtopicCount();
    return res;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID' })
  async getById(@Param('id') id: string) {
    const res = await this.topicsService.getTopicById(id);
    if (!res.success) throw new NotFoundException(res.error);
    return res;
  }

  @Post()
  @ApiOperation({ summary: 'Create topic' })
  async create(@Body() body: CreateTopicInput) {
    const res = await this.topicsService.createTopic(body);
    if (!res.success) throw new BadRequestException(res.error);
    return res;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update topic' })
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateTopicInput>,
  ) {
    const res = await this.topicsService.updateTopic(id, body);
    if (!res.success) throw new BadRequestException(res.error);
    return res;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete topic' })
  async delete(@Param('id') id: string) {
    const res = await this.topicsService.deleteTopic(id);
    if (!res.success) throw new BadRequestException(res.error);
    return res;
  }
}
