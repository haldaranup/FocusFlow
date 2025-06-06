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
  create(@Body() createBlocklistItemDto: CreateBlocklistItemDto, @Req() req) {
    return this.blocklistService.create(createBlocklistItemDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blocklist items for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Blocklist items retrieved successfully' })
  findAll(@Req() req) {
    return this.blocklistService.findAll(req.user.userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active blocklist items for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Active blocklist items retrieved successfully' })
  findActive(@Req() req) {
    return this.blocklistService.findActiveItems(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blocklist item' })
  @ApiResponse({ status: 200, description: 'Blocklist item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Blocklist item not found' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.blocklistService.findOne(id, req.user.userId);
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
    return this.blocklistService.update(id, updateBlocklistItemDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blocklist item' })
  @ApiResponse({ status: 200, description: 'Blocklist item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Blocklist item not found' })
  remove(@Param('id') id: string, @Req() req) {
    return this.blocklistService.remove(id, req.user.userId);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle active status of a blocklist item' })
  @ApiResponse({ status: 200, description: 'Blocklist item status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Blocklist item not found' })
  toggleActive(@Param('id') id: string, @Req() req) {
    return this.blocklistService.toggleActive(id, req.user.userId);
  }
} 