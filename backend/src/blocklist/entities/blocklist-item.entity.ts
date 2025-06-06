import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum BlockType {
  WEBSITE = 'website',
  APPLICATION = 'application',
}

@Entity('blocklist_items')
export class BlocklistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: BlockType,
  })
  type: BlockType;

  @Column()
  name: string;

  @Column()
  identifier: string; // URL pattern for websites, app name for applications

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  category?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.blocklistItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
} 