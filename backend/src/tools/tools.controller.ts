import { Controller, Get } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  findAll() {
    return this.toolsService.findAll();
  }
}
