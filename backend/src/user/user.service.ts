import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateProfile(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async updateSettings(
    id: string,
    settings: {
      workDuration?: number;
      shortBreakDuration?: number;
      longBreakDuration?: number;
      sessionsUntilLongBreak?: number;
      soundEnabled?: boolean;
      soundVolume?: number;
      notificationsEnabled?: boolean;
    },
  ): Promise<User> {
    await this.userRepository.update(id, settings);
    return this.findById(id);
  }
} 