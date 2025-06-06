import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Session, SessionType, SessionStatus } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto, userId: string): Promise<Session> {
    // Handle convenience fields from frontend
    const sessionData = {
      type: createSessionDto.type,
      status: createSessionDto.completed ? SessionStatus.COMPLETED : (createSessionDto.status || SessionStatus.ACTIVE),
      plannedDuration: createSessionDto.duration || createSessionDto.plannedDuration,
      actualDuration: createSessionDto.completed ? (createSessionDto.duration || createSessionDto.plannedDuration) : createSessionDto.actualDuration,
      interruptionReason: createSessionDto.interruptionReason,
      interruptionCount: createSessionDto.interruptionCount || 0,
      userId,
      startedAt: new Date(createSessionDto.startedAt),
      completedAt: createSessionDto.completedAt ? new Date(createSessionDto.completedAt) : null,
    };

    const session = this.sessionRepository.create(sessionData);
    return this.sessionRepository.save(session);
  }

  async findAllByUser(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { startedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto, userId: string): Promise<Session> {
    const session = await this.findOne(id, userId);
    
    Object.assign(session, updateSessionDto);
    
    if (updateSessionDto.completedAt) {
      session.completedAt = new Date(updateSessionDto.completedAt);
    }

    return this.sessionRepository.save(session);
  }

  async remove(id: string, userId: string): Promise<void> {
    const session = await this.findOne(id, userId);
    await this.sessionRepository.remove(session);
  }

  async getTodayStats(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        startedAt: Between(today, tomorrow),
      },
    });

    const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED);
    const workSessions = completedSessions.filter(s => s.type === SessionType.WORK);
    const totalFocusTime = workSessions.reduce((sum, session) => sum + (session.actualDuration || session.plannedDuration), 0);
    const interruptions = sessions.reduce((sum, session) => sum + session.interruptionCount, 0);
    const successRate = sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 100;

    return {
      completedSessions: completedSessions.length,
      workSessions: workSessions.length,
      totalFocusTime,
      interruptions,
      successRate,
      totalSessions: sessions.length,
    };
  }

  async getWeeklyStats(userId: string): Promise<any> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        startedAt: MoreThanOrEqual(oneWeekAgo),
      },
      order: { startedAt: 'ASC' },
    });

    const dailyStats = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Initialize daily stats
    for (let i = 0; i < 7; i++) {
      const date = new Date(oneWeekAgo);
      date.setDate(date.getDate() + i);
      const dayName = days[date.getDay()];
      dailyStats[dayName] = {
        date: date.toISOString().split('T')[0],
        completedSessions: 0,
        totalFocusTime: 0,
        interruptions: 0,
      };
    }

    // Populate with actual data
    sessions.forEach(session => {
      const dayName = days[session.startedAt.getDay()];
      if (session.status === SessionStatus.COMPLETED) {
        dailyStats[dayName].completedSessions++;
        if (session.type === SessionType.WORK) {
          dailyStats[dayName].totalFocusTime += (session.actualDuration || session.plannedDuration);
        }
      }
      dailyStats[dayName].interruptions += session.interruptionCount;
    });

    return {
      daily: Object.values(dailyStats),
      summary: {
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === SessionStatus.COMPLETED).length,
        totalFocusTime: sessions
          .filter(s => s.status === SessionStatus.COMPLETED && s.type === SessionType.WORK)
          .reduce((sum, session) => sum + (session.actualDuration || session.plannedDuration), 0),
        totalInterruptions: sessions.reduce((sum, session) => sum + session.interruptionCount, 0),
      },
    };
  }
} 