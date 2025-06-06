import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { Session } from './entities/session.entity';
import { BlocklistModule } from '../blocklist/blocklist.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    BlocklistModule
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {} 