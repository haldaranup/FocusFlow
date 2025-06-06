import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Session } from '../../session/entities/session.entity';
import { BlocklistItem } from '../../blocklist/entities/blocklist-item.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: 25 })
  workDuration: number; // in minutes

  @Column({ default: 5 })
  shortBreakDuration: number; // in minutes

  @Column({ default: 15 })
  longBreakDuration: number; // in minutes

  @Column({ default: 4 })
  sessionsUntilLongBreak: number;

  @Column({ default: true })
  soundEnabled: boolean;

  @Column({ type: 'float', default: 0.5 })
  soundVolume: number;

  @Column({ default: true })
  notificationsEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => BlocklistItem, (blocklistItem) => blocklistItem.user)
  blocklistItems: BlocklistItem[];
} 