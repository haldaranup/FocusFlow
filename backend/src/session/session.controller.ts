import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionType } from './entities/session.entity';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createSessionDto: CreateSessionDto, @Request() req) {
    return this.sessionService.create(createSessionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sessions for the current user' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.sessionService.findAllByUser(req.user.id);
  }

  @Get('stats/today')
  @ApiOperation({ summary: 'Get today\'s session statistics' })
  @ApiResponse({ status: 200, description: 'Today\'s stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTodayStats(@Request() req) {
    return this.sessionService.getTodayStats(req.user.id);
  }

  @Get('stats/weekly')
  @ApiOperation({ summary: 'Get weekly session statistics' })
  @ApiResponse({ status: 200, description: 'Weekly stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWeeklyStats(@Request() req) {
    return this.sessionService.getWeeklyStats(req.user.id);
  }

  @Get('status/blocking')
  @ApiOperation({ summary: 'Get current blocking status and active session' })
  @ApiResponse({ status: 200, description: 'Blocking status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBlockingStatus(@Request() req) {
    try {
      const status = await this.sessionService.getBlockingStatus(req.user.id);
      return status;
    } catch (error) {
      console.error('Error getting blocking status:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.sessionService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto, @Request() req) {
    return this.sessionService.update(id, updateSessionDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a session' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @Request() req) {
    return this.sessionService.remove(id, req.user.id);
  }

  // New blocking-integrated session endpoints
  @Post('start')
  @ApiOperation({ summary: 'Start a new session with automatic blocking' })
  @ApiResponse({ status: 201, description: 'Session started successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async startSession(@Body() body: { sessionType: string }, @Request() req) {
    try {
      // Convert string to enum
      const sessionType = body.sessionType.toUpperCase() as keyof typeof SessionType;
      const sessionTypeEnum = SessionType[sessionType];
      
      if (!sessionTypeEnum) {
        throw new BadRequestException('Invalid session type');
      }

      const result = await this.sessionService.startWorkSession(req.user.id, sessionTypeEnum);
      return {
        message: 'Session started successfully',
        session: result.session,
        blocking: {
          isActive: result.session.type === 'work',
          blockedItems: result.blockedItems,
          count: result.blockedItems.length
        }
      };
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End an active session and deactivate blocking' })
  @ApiResponse({ status: 200, description: 'Session ended successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async endSession(
    @Param('id') id: string, 
    @Body() body: { completed?: boolean, interruptionReason?: string }, 
    @Request() req
  ) {
    try {
      const session = await this.sessionService.endSession(
        id, 
        req.user.id, 
        body.completed !== false, // Default to true if not specified
        body.interruptionReason
      );
      
      return {
        message: 'Session ended successfully',
        session,
        blocking: {
          isActive: false,
          message: session.type === 'work' ? 'Blocking deactivated' : 'No blocking was active'
        }
      };
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }
} 