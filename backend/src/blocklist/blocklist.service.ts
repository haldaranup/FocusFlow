import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlocklistItem } from './entities/blocklist-item.entity';
import { CreateBlocklistItemDto } from './dto/create-blocklist-item.dto';
import { UpdateBlocklistItemDto } from './dto/update-blocklist-item.dto';

@Injectable()
export class BlocklistService {
  constructor(
    @InjectRepository(BlocklistItem)
    private blocklistRepository: Repository<BlocklistItem>,
  ) {}

  async create(
    createBlocklistItemDto: CreateBlocklistItemDto,
    userId: string,
  ): Promise<BlocklistItem> {
    const blocklistItem = this.blocklistRepository.create({
      ...createBlocklistItemDto,
      userId,
      isActive: createBlocklistItemDto.isActive ?? true,
    });

    return await this.blocklistRepository.save(blocklistItem);
  }

  async findAll(userId: string): Promise<BlocklistItem[]> {
    return await this.blocklistRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<BlocklistItem> {
    const blocklistItem = await this.blocklistRepository.findOne({
      where: { id, userId },
    });

    if (!blocklistItem) {
      throw new NotFoundException('Blocklist item not found');
    }

    return blocklistItem;
  }

  async update(
    id: string,
    updateBlocklistItemDto: UpdateBlocklistItemDto,
    userId: string,
  ): Promise<BlocklistItem> {
    const blocklistItem = await this.findOne(id, userId);
    
    Object.assign(blocklistItem, updateBlocklistItemDto);
    
    return await this.blocklistRepository.save(blocklistItem);
  }

  async remove(id: string, userId: string): Promise<void> {
    const blocklistItem = await this.findOne(id, userId);
    await this.blocklistRepository.remove(blocklistItem);
  }

  async findActiveItems(userId: string): Promise<BlocklistItem[]> {
    return await this.blocklistRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async toggleActive(id: string, userId: string): Promise<BlocklistItem> {
    const blocklistItem = await this.findOne(id, userId);
    blocklistItem.isActive = !blocklistItem.isActive;
    return await this.blocklistRepository.save(blocklistItem);
  }
} 