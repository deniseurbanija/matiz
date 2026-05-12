import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { Save } from './entities/save.entity';
import { Tag } from '../tags/entities/tag.entity';
import { UploadService } from '../upload/upload.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(Like) private likesRepo: Repository<Like>,
    @InjectRepository(Save) private savesRepo: Repository<Save>,
    @InjectRepository(Tag) private tagsRepo: Repository<Tag>,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    userId: string,
    dto: CreatePostDto,
    file: Express.Multer.File,
  ): Promise<Post> {
    const { url, publicId } = await this.uploadService.uploadImage(file);

    const tags =
      dto.tagIds?.length ? await this.tagsRepo.findBy({ id: In(dto.tagIds) }) : [];

    const post = this.postsRepo.create({
      userId,
      imageUrl: url,
      imagePublicId: publicId,
      caption: dto.caption,
      editingConfig: dto.editingConfig,
      toolId: dto.toolId,
      tags,
    });

    return this.postsRepo.save(post);
  }

  async findAll(query: QueryPostDto) {
    const { q, toolId, tag, seed = '42', offset = '0', limit = '20' } = query;
    const take = Math.min(parseInt(limit), 50);
    const skip = parseInt(offset);

    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.tool', 'tool')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.isArchived = false');

    if (q) {
      qb.andWhere('post.caption ILIKE :q', { q: `%${q}%` });
    }

    if (toolId) {
      qb.andWhere('post.toolId = :toolId', { toolId });
    }

    if (tag) {
      qb.andWhere('tags.slug = :tag', { tag });
    }

    // Seeded random: same seed always produces the same order → no repeats within a session
    qb.orderBy(`md5(CAST(:seed AS TEXT) || CAST(post.id AS TEXT))`, 'ASC')
      .setParameter('seed', seed)
      .skip(skip)
      .take(take);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      nextOffset: skip + take,
      hasMore: skip + take < total,
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepo.findOne({
      where: { id },
      relations: ['user', 'tool', 'tags'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findByUser(userId: string, includeArchived = false): Promise<Post[]> {
    return this.postsRepo.find({
      where: { userId, ...(includeArchived ? {} : { isArchived: false }) },
      relations: ['tool', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, userId: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.assertOwnership(id, userId);

    if (dto.tagIds !== undefined) {
      post.tags = dto.tagIds?.length
        ? await this.tagsRepo.findBy({ id: In(dto.tagIds) })
        : [];
    }

    if (dto.caption !== undefined) post.caption = dto.caption;
    if (dto.editingConfig !== undefined) post.editingConfig = dto.editingConfig;
    if (dto.toolId !== undefined) post.toolId = dto.toolId;

    return this.postsRepo.save(post);
  }

  async toggleArchive(id: string, userId: string): Promise<Post> {
    const post = await this.assertOwnership(id, userId);
    post.isArchived = !post.isArchived;
    return this.postsRepo.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.assertOwnership(id, userId);
    await this.uploadService.deleteImage(post.imagePublicId);
    await this.postsRepo.remove(post);
  }

  // ── Likes ────────────────────────────────────────────────────────────────

  async likePost(postId: string, userId: string): Promise<void> {
    await this.findOne(postId);
    const existing = await this.likesRepo.findOne({ where: { postId, userId } });
    if (existing) throw new BadRequestException('Post already liked');

    await this.likesRepo.save(this.likesRepo.create({ postId, userId }));
    await this.postsRepo.increment({ id: postId }, 'likesCount', 1);
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const like = await this.likesRepo.findOne({ where: { postId, userId } });
    if (!like) throw new NotFoundException('Like not found');

    await this.likesRepo.remove(like);
    await this.postsRepo.decrement({ id: postId }, 'likesCount', 1);
  }

  // ── Saves ─────────────────────────────────────────────────────────────────

  async savePost(
    postId: string,
    userId: string,
    collectionId?: string,
  ): Promise<void> {
    await this.findOne(postId);
    const existing = await this.savesRepo.findOne({ where: { postId, userId } });
    if (existing) throw new BadRequestException('Post already saved');

    await this.savesRepo.save(
      this.savesRepo.create({ postId, userId, collectionId }),
    );
    await this.postsRepo.increment({ id: postId }, 'savesCount', 1);
  }

  async unsavePost(postId: string, userId: string): Promise<void> {
    const save = await this.savesRepo.findOne({ where: { postId, userId } });
    if (!save) throw new NotFoundException('Save not found');

    await this.savesRepo.remove(save);
    await this.postsRepo.decrement({ id: postId }, 'savesCount', 1);
  }

  async moveSave(
    postId: string,
    userId: string,
    collectionId: string | null,
  ): Promise<void> {
    const save = await this.savesRepo.findOne({ where: { postId, userId } });
    if (!save) throw new NotFoundException('Save not found');

    save.collectionId = collectionId;
    await this.savesRepo.save(save);
  }

  async getSavedByUser(userId: string): Promise<Post[]> {
    const saves = await this.savesRepo.find({
      where: { userId },
      relations: ['post', 'post.tool', 'post.tags'],
      order: { createdAt: 'DESC' },
    });
    return saves.map((s) => s.post);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async assertOwnership(id: string, userId: string): Promise<Post> {
    const post = await this.postsRepo.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not your post');
    return post;
  }
}
