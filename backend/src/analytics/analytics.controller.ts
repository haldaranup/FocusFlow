import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily analytics for the specified period' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 7)' })
  @ApiResponse({ status: 200, description: 'Daily analytics retrieved successfully' })
  async getDailyStats(
    @Query('days') days: string = '7',
    @Req() req: any,
  ) {
    const numberOfDays = parseInt(days) || 7;
    return this.analyticsService.getDailyStats(req.user.id, numberOfDays);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly analytics for the specified period' })
  @ApiQuery({ name: 'weeks', required: false, description: 'Number of weeks to analyze (default: 4)' })
  @ApiResponse({ status: 200, description: 'Weekly analytics retrieved successfully' })
  async getWeeklyStats(
    @Query('weeks') weeks: string = '4',
    @Req() req: any,
  ) {
    const numberOfWeeks = parseInt(weeks) || 4;
    return this.analyticsService.getWeeklyStats(req.user.id, numberOfWeeks);
  }

  @Get('productivity-hours')
  @ApiOperation({ summary: 'Get productivity analysis by hour of day' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' })
  @ApiResponse({ status: 200, description: 'Hourly productivity data retrieved successfully' })
  async getProductivityByHour(
    @Query('days') days: string = '30',
    @Req() req: any,
  ) {
    const numberOfDays = parseInt(days) || 30;
    return this.analyticsService.getProductivityByHour(req.user.id, numberOfDays);
  }

  @Get('session-types')
  @ApiOperation({ summary: 'Get session type distribution analysis' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' })
  @ApiResponse({ status: 200, description: 'Session type distribution retrieved successfully' })
  async getSessionTypeDistribution(
    @Query('days') days: string = '30',
    @Req() req: any,
  ) {
    const numberOfDays = parseInt(days) || 30;
    return this.analyticsService.getSessionTypeDistribution(req.user.id, numberOfDays);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get personalized productivity insights and recommendations' })
  @ApiResponse({ status: 200, description: 'Analytics insights retrieved successfully' })
  async getAnalyticsInsights(@Req() req: any) {
    return this.analyticsService.getAnalyticsInsights(req.user.id);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get comprehensive analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics overview retrieved successfully' })
  async getAnalyticsOverview(@Req() req: any) {
    try {
      const [
        dailyStats,
        weeklyStats,
        productivityHours,
        sessionTypes,
        insights,
      ] = await Promise.all([
        this.analyticsService.getDailyStats(req.user.id, 7),
        this.analyticsService.getWeeklyStats(req.user.id, 4),
        this.analyticsService.getProductivityByHour(req.user.id, 30),
        this.analyticsService.getSessionTypeDistribution(req.user.id, 30),
        this.analyticsService.getAnalyticsInsights(req.user.id),
      ]);

      return {
        daily: dailyStats,
        weekly: weeklyStats,
        productivityHours,
        sessionTypes,
        insights,
      };
    } catch (error) {
      console.error('Analytics Overview Error:', error);
      console.error('Error stack:', error.stack);
      console.error('User ID:', req.user?.id);
      throw error;
    }
  }
} 