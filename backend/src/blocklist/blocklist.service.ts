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
    try {
      console.log('Service: Creating blocklist item with data:', createBlocklistItemDto);
      console.log('Service: User ID:', userId);
      
      const blocklistItem = this.blocklistRepository.create({
        ...createBlocklistItemDto,
        userId,
        isActive: createBlocklistItemDto.isActive ?? true,
      });
      
      console.log('Service: Created entity object:', blocklistItem);
      
      const result = await this.blocklistRepository.save(blocklistItem);
      console.log('Service: Saved to database:', result);
      
      return result;
    } catch (error) {
      console.error('Service: Blocklist creation error:', error);
      console.error('Service: Error details:', error.message);
      console.error('Service: Error stack:', error.stack);
      throw error;
    }
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