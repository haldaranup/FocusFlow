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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
    return this.sessionService.create(createSessionDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sessions for the current user' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.sessionService.findAllByUser(req.user.userId);
  }

  @Get('stats/today')
  @ApiOperation({ summary: 'Get today\'s session statistics' })
  @ApiResponse({ status: 200, description: 'Today\'s stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTodayStats(@Request() req) {
    return this.sessionService.getTodayStats(req.user.userId);
  }

  @Get('stats/weekly')
  @ApiOperation({ summary: 'Get weekly session statistics' })
  @ApiResponse({ status: 200, description: 'Weekly stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWeeklyStats(@Request() req) {
    return this.sessionService.getWeeklyStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.sessionService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto, @Request() req) {
    return this.sessionService.update(id, updateSessionDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a session' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @Request() req) {
    return this.sessionService.remove(id, req.user.userId);
  }
} 