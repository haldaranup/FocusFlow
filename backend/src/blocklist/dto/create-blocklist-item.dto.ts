import { IsEnum, IsString, IsBoolean, IsOptional } from 'class-validator';
import { BlockType } from '../entities/blocklist-item.entity';

export class CreateBlocklistItemDto {
  @IsEnum(BlockType)
  type: BlockType;

  @IsString()
  name: string;

  @IsString()
  identifier: string; // URL pattern for websites, app name for applications

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  category?: string;
} 