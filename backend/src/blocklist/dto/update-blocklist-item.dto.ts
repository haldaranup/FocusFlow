import { PartialType } from '@nestjs/mapped-types';
import { CreateBlocklistItemDto } from './create-blocklist-item.dto';

export class UpdateBlocklistItemDto extends PartialType(CreateBlocklistItemDto) {} 