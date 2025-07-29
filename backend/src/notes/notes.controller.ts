import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { User } from '../auth/decorators/user.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Notes')
@Controller('notes')
export class NotesController {
  private readonly logger = new Logger(NotesController.name);

  constructor(private readonly notesService: NotesService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async test() {
    this.logger.log('🧪 Notes controller test endpoint called');
    return { success: true, message: 'Notes controller is working!' };
  }

  @Get('user')
  @ApiOperation({ summary: 'Get all notes for the authenticated user' })
  @ApiResponse({ status: 200, description: 'User notes retrieved successfully' })
  async getUserNotes(@User() user: AuthUser) {
    this.logger.log(`📝 Getting notes for user: ${user.id}`);
    const result = await this.notesService.getUserNotes(user.id);
    this.logger.log(`📊 Notes data sample: ${JSON.stringify(result.data?.slice(0, 1), null, 2)}`);
    return result;
  }

  @Get(':noteId')
  @ApiOperation({ summary: 'Get note by ID' })
  @ApiParam({ name: 'noteId', description: 'Note ID', example: 'uuid-note-id' })
  @ApiResponse({ status: 200, description: 'Note retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async getNoteById(@Param('noteId') noteId: string, @User() user: AuthUser) {
    this.logger.log(`🔍 Getting note: ${noteId} for user: ${user.id}`);
    return await this.notesService.getNoteById(noteId, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new study note' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createNote(@Body() createNoteDto: CreateNoteDto, @User() user: AuthUser) {
    this.logger.log(`✨ Creating note: ${createNoteDto.title} for user: ${user.id}`);
    return await this.notesService.createNote(createNoteDto, user.id);
  }

  @Patch(':noteId')
  @ApiOperation({ summary: 'Update a study note' })
  @ApiParam({ name: 'noteId', description: 'Note ID', example: 'uuid-note-id' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async updateNote(
    @Param('noteId') noteId: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @User() user: AuthUser,
  ) {
    this.logger.log(`✏️ Updating note: ${noteId} for user: ${user.id}`);
    return await this.notesService.updateNote(noteId, updateNoteDto, user.id);
  }

  @Delete(':noteId')
  @ApiOperation({ summary: 'Delete a study note' })
  @ApiParam({ name: 'noteId', description: 'Note ID', example: 'uuid-note-id' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async deleteNote(@Param('noteId') noteId: string, @User() user: AuthUser) {
    this.logger.log(`🗑️ Deleting note: ${noteId} for user: ${user.id}`);
    return await this.notesService.deleteNote(noteId, user.id);
  }
} 