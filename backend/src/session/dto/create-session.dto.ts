import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { SessionType, SessionStatus } from '../entities/session.entity';

export class CreateSessionDto {
  @IsEnum(SessionType)
  type: SessionType;

  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @IsNumber()
  plannedDuration: number;

  @IsNumber()
  @IsOptional()
  actualDuration?: number;

  @IsString()
  @IsOptional()
  interruptionReason?: string;

  @IsNumber()
  @IsOptional()
  interruptionCount?: number;

  @IsDateString()
  startedAt: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;

  // For convenience when frontend sends these
  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
} 