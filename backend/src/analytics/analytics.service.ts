import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Session, SessionStatus } from '../session/entities/session.entity';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays, subWeeks, format, getHours } from 'date-fns';

export interface DailyStats {
  date: string;
  totalFocusTime: number;
  completedSessions: number;
  totalSessions: number;
  successRate: number;
}

export interface WeeklyStats {
  week: string;
  totalFocusTime: number;
  completedSessions: number;
  averageSessionLength: number;
  successRate: number;
}

export interface ProductivityHour {
  hour: number;
  totalFocusTime: number;
  completedSessions: number;
  averageSessionLength: number;
}

export interface SessionTypeDistribution {
  type: string;
  count: number;
  totalTime: number;
  percentage: number;
}

export interface AnalyticsInsights {
  peakProductivityHour: number;
  averageDailyFocusTime: number;
  currentStreak: number;
  improvementFromLastWeek: number;
  totalFocusTimeThisWeek: number;
  mostProductiveDay: string;
  recommendations: string[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async getDailyStats(userId: string, days: number = 7): Promise<DailyStats[]> {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        startedAt: Between(startOfDay(startDate), endOfDay(endDate)),
      },
      order: { startedAt: 'ASC' },
    });

    const dailyStats: { [key: string]: DailyStats } = {};
    
    // Initialize all days with zero stats
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, days - 1 - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      dailyStats[dateKey] = {
        date: dateKey,
        totalFocusTime: 0,
        completedSessions: 0,
        totalSessions: 0,
        successRate: 0,
      };
    }

    // Process sessions
    sessions.forEach(session => {
      const dateKey = format(session.startedAt, 'yyyy-MM-dd');
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].totalSessions++;
        if (session.status === SessionStatus.COMPLETED) {
          dailyStats[dateKey].completedSessions++;
          // Use actualDuration if available, otherwise fall back to plannedDuration
          const sessionDuration = session.actualDuration || session.plannedDuration || 0;
          dailyStats[dateKey].totalFocusTime += sessionDuration;
        }
      }
    });

    // Calculate success rates
    Object.keys(dailyStats).forEach(dateKey => {
      const stats = dailyStats[dateKey];
      stats.successRate = stats.totalSessions > 0 
        ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
        : 0;
    });

    return Object.values(dailyStats);
  }

  async getWeeklyStats(userId: string, weeks: number = 4): Promise<WeeklyStats[]> {
    const endDate = new Date();
    const startDate = subWeeks(endDate, weeks - 1);
    
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        startedAt: Between(startOfWeek(startDate), endOfWeek(endDate)),
      },
      order: { startedAt: 'ASC' },
    });

    const weeklyStats: { [key: string]: WeeklyStats } = {};
    
    // Initialize all weeks
    for (let i = 0; i < weeks; i++) {
      const weekStart = subWeeks(endDate, weeks - 1 - i);
      const weekKey = format(startOfWeek(weekStart), 'yyyy-MM-dd');
      weeklyStats[weekKey] = {
        week: weekKey,
        totalFocusTime: 0,
        completedSessions: 0,
        averageSessionLength: 0,
        successRate: 0,
      };
    }

    // Process sessions by week
    const weeklyData: { [key: string]: { totalTime: number; completed: number; total: number } } = {};
    
    sessions.forEach(session => {
      const weekKey = format(startOfWeek(session.startedAt), 'yyyy-MM-dd');
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { totalTime: 0, completed: 0, total: 0 };
      }
      
      weeklyData[weekKey].total++;
      if (session.status === SessionStatus.COMPLETED) {
        weeklyData[weekKey].completed++;
        // Use actualDuration if available, otherwise fall back to plannedDuration
        const sessionDuration = session.actualDuration || session.plannedDuration || 0;
        weeklyData[weekKey].totalTime += sessionDuration;
      }
    });

    // Calculate weekly statistics
    Object.keys(weeklyData).forEach(weekKey => {
      if (weeklyStats[weekKey]) {
        const data = weeklyData[weekKey];
        weeklyStats[weekKey].totalFocusTime = data.totalTime;
        weeklyStats[weekKey].completedSessions = data.completed;
        weeklyStats[weekKey].averageSessionLength = data.completed > 0 
          ? Math.round(data.totalTime / data.completed)
          : 0;
        weeklyStats[weekKey].successRate = data.total > 0 
          ? Math.round((data.completed / data.total) * 100)
          : 0;
      }
    });

    return Object.values(weeklyStats);
  }

  async getProductivityByHour(userId: string, days: number = 30): Promise<ProductivityHour[]> {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        startedAt: Between(startDate, endDate),
        status: SessionStatus.COMPLETED,
      },
    });

    const hourlyData: { [hour: number]: { totalTime: number; count: number } } = {};
    
    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = { totalTime: 0, count: 0 };
    }

    // Process sessions by hour
    sessions.forEach(session => {
      const hour = getHours(session.startedAt);
      // Use actualDuration if available, otherwise fall back to plannedDuration
      const sessionDuration = session.actualDuration || session.plannedDuration || 0;
      hourlyData[hour].totalTime += sessionDuration;
      hourlyData[hour].count++;
    });

    // Convert to ProductivityHour array
    return Object.keys(hourlyData).map(hourStr => {
      const hour = parseInt(hourStr);
      const data = hourlyData[hour];
      return {
        hour,
        totalFocusTime: data.totalTime,
        completedSessions: data.count,
        averageSessionLength: data.count > 0 ? Math.round(data.totalTime / data.count) : 0,
      };
    });
  }

  async getSessionTypeDistribution(userId: string, days: number = 30): Promise<SessionTypeDistribution[]> {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        startedAt: Between(startDate, endDate),
        status: SessionStatus.COMPLETED,
      },
    });

    const typeData: { [type: string]: { count: number; totalTime: number } } = {};
    let totalSessions = 0;

    sessions.forEach(session => {
      const type = session.type || 'unknown';
      if (!typeData[type]) {
        typeData[type] = { count: 0, totalTime: 0 };
      }
      typeData[type].count++;
      // Use actualDuration if available, otherwise fall back to plannedDuration
      const sessionDuration = session.actualDuration || session.plannedDuration || 0;
      typeData[type].totalTime += sessionDuration;
      totalSessions++;
    });

    return Object.keys(typeData).map(type => ({
      type,
      count: typeData[type].count,
      totalTime: typeData[type].totalTime,
      percentage: totalSessions > 0 ? Math.round((typeData[type].count / totalSessions) * 100) : 0,
    }));
  }

  async getAnalyticsInsights(userId: string): Promise<AnalyticsInsights> {
    const [
      productivityHours,
      dailyStats,
      weeklyStats,
      thisWeekStats,
      lastWeekStats
    ] = await Promise.all([
      this.getProductivityByHour(userId, 30),
      this.getDailyStats(userId, 7),
      this.getWeeklyStats(userId, 4),
      this.getDailyStats(userId, 7),
      this.getDailyStats(userId, 14)
    ]);

    // Find peak productivity hour
    const peakHour = productivityHours.reduce((peak, current) => 
      current.totalFocusTime > peak.totalFocusTime ? current : peak
    );

    // Calculate averages
    const averageDailyFocusTime = dailyStats.reduce((sum, day) => sum + day.totalFocusTime, 0) / dailyStats.length;
    
    // Calculate current streak
    let currentStreak = 0;
    for (let i = dailyStats.length - 1; i >= 0; i--) {
      if (dailyStats[i].completedSessions > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate improvement from last week
    const thisWeekTotal = thisWeekStats.slice(-7).reduce((sum, day) => sum + day.totalFocusTime, 0);
    const lastWeekTotal = lastWeekStats.slice(0, 7).reduce((sum, day) => sum + day.totalFocusTime, 0);
    const improvementFromLastWeek = lastWeekTotal > 0 
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : 0;

    // Find most productive day
    const mostProductiveDay = dailyStats.reduce((best, current) => 
      current.totalFocusTime > best.totalFocusTime ? current : best
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(dailyStats, productivityHours, weeklyStats);

    return {
      peakProductivityHour: peakHour.hour,
      averageDailyFocusTime: Math.round(averageDailyFocusTime),
      currentStreak,
      improvementFromLastWeek,
      totalFocusTimeThisWeek: thisWeekTotal,
      mostProductiveDay: format(new Date(mostProductiveDay.date), 'EEEE'),
      recommendations,
    };
  }

  private generateRecommendations(
    dailyStats: DailyStats[],
    productivityHours: ProductivityHour[],
    weeklyStats: WeeklyStats[]
  ): string[] {
    const recommendations: string[] = [];

    // Check for consistency
    const consistentDays = dailyStats.filter(day => day.completedSessions > 0).length;
    if (consistentDays < 5) {
      recommendations.push("Try to maintain more consistent daily focus sessions for better results.");
    }

    // Check peak productivity hour
    const peakHour = productivityHours.reduce((peak, current) => 
      current.totalFocusTime > peak.totalFocusTime ? current : peak
    );
    if (peakHour.hour < 12) {
      recommendations.push(`Your peak productivity is at ${peakHour.hour}:00. Consider scheduling important tasks in the morning.`);
    } else {
      recommendations.push(`Your peak productivity is at ${peakHour.hour}:00. You work best in the afternoon/evening.`);
    }

    // Check weekly improvement
    if (weeklyStats.length >= 2) {
      const latestWeek = weeklyStats[weeklyStats.length - 1];
      const previousWeek = weeklyStats[weeklyStats.length - 2];
      if (latestWeek.successRate < previousWeek.successRate) {
        recommendations.push("Your success rate decreased this week. Consider reviewing your break schedule.");
      }
    }

    // Session length recommendations
    const avgSessionLength = dailyStats.reduce((sum, day) => {
      return sum + (day.completedSessions > 0 ? day.totalFocusTime / day.completedSessions : 0);
    }, 0) / dailyStats.filter(day => day.completedSessions > 0).length;

    if (avgSessionLength < 20 * 60) { // Less than 20 minutes
      recommendations.push("Consider longer focus sessions (25+ minutes) for deeper concentration.");
    } else if (avgSessionLength > 35 * 60) { // More than 35 minutes
      recommendations.push("Try shorter sessions with more frequent breaks to maintain focus quality.");
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }
} 