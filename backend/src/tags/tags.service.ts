import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(@InjectRepository(Tag) private tagsRepo: Repository<Tag>) {}

  findAll(): Promise<Tag[]> {
    return this.tagsRepo.find({ order: { name: 'ASC' } });
  }
}
