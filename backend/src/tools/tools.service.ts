import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tool } from './entities/tool.entity';

@Injectable()
export class ToolsService {
  constructor(@InjectRepository(Tool) private toolsRepo: Repository<Tool>) {}

  findAll(): Promise<Tool[]> {
    return this.toolsRepo.find({ order: { name: 'ASC' } });
  }
}
