import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Request,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlocklistService } from './blocklist.service';
import { CreateBlocklistItemDto } from './dto/create-blocklist-item.dto';
import { UpdateBlocklistItemDto } from './dto/update-blocklist-item.dto';

@ApiTags('blocklist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blocklist')
export class BlocklistController {
  constructor(private readonly blocklistService: BlocklistService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blocklist item' })
  @ApiResponse({ status: 201, description: 'Blocklist item created successfully' })
  async create(@Body() createBlocklistItemDto: CreateBlocklistItemDto, @Req() req) {
    try {
      console.log('Creating blocklist item:', createBlocklistItemDto);
      console.log('User ID:', req.user.id);
      const result = await this.blocklistService.create(createBlocklistItemDto, req.user.id);
      console.log('Blocklist item created successfully:', result);
      return result;
    } catch (error) {
      console.error('Blocklist creation error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all blocklist items for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Blocklist items retrieved successfully' })
  findAll(@Req() req) {
    return this.blocklistService.findAll(req.user.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active blocklist items for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Active blocklist items retrieved successfully' })
  findActive(@Req() req) {
    return this.blocklistService.findActiveItems(req.user.id);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if a URL is blocked' })
  @ApiResponse({ status: 200, description: 'Block status returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkBlocked(@Query('url') url: string, @Request() req) {
    try {
      if (!url) {
        throw new BadRequestException('URL parameter is required');
      }
      
      const isBlocked = await this.blocklistService.isBlocked(req.user.id, url);
      const activeItems = await this.blocklistService.getActiveBlockedItems(req.user.id);
      
      return {
        url,
        isBlocked,
        activeBlocks: activeItems.length,
        blockedItems: isBlocked ? activeItems.filter(item => 
          url.toLowerCase().includes(item.identifier.toLowerCase())
        ) : []
      };
    } catch (error) {
      console.error('Error checking blocked URL:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blocklist item' })
  @ApiResponse({ status: 200, description: 'Blocklist item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Blocklist item not found' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.blocklistService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blocklist item' })
  @ApiResponse({ status: 200, description: 'Blocklist item updated successfully' })
  @ApiResponse({ status: 404, description: 'Blocklist item not found' })
  update(
    @Param('id') id: string,
    @Body() updateBlocklistItemDto: UpdateBlocklistItemDto,
    @Req() req,
  ) {
    return this.blocklistService.update(id, updateBlocklistItemDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blocklist item' })
  @ApiResponse({ status: 200, description: 'Blocklist item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Blocklist item not found' })
  remove(@Param('id') id: string, @Req() req) {
    return this.blocklistService.remove(id, req.user.id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle active status of a blocklist item' })
  @ApiResponse({ status: 200, description: 'Item active status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async toggleActive(@Param('id') id: string, @Request() req) {
    try {
      const result = await this.blocklistService.toggleActive(id, req.user.id);
      return result;
    } catch (error) {
      console.error('Error toggling blocklist item:', error);
      throw error;
    }
  }

  // New blocking control endpoints
  @Post('activate')
  @ApiOperation({ summary: 'Activate blocking for all active items' })
  @ApiResponse({ status: 200, description: 'Blocking activated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async activateBlocking(@Request() req) {
    try {
      const activeItems = await this.blocklistService.activateBlocking(req.user.id);
      return {
        message: 'Blocking activated',
        blockedItems: activeItems,
        count: activeItems.length
      };
    } catch (error) {
      console.error('Error activating blocking:', error);
      throw error;
    }
  }

  @Post('deactivate')
  @ApiOperation({ summary: 'Deactivate blocking' })
  @ApiResponse({ status: 200, description: 'Blocking deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deactivateBlocking(@Request() req) {
    try {
      await this.blocklistService.deactivateBlocking(req.user.id);
      return {
        message: 'Blocking deactivated'
      };
    } catch (error) {
      console.error('Error deactivating blocking:', error);
      throw error;
    }
  }
} 