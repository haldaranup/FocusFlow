import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocklistService } from './blocklist.service';
import { BlocklistController } from './blocklist.controller';
import { BlocklistItem } from './entities/blocklist-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlocklistItem])],
  controllers: [BlocklistController],
  providers: [BlocklistService],
  exports: [BlocklistService],
})
export class BlocklistModule {} 