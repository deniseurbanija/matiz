import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';

const MB10 = 10 * 1024 * 1024;

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MB10 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.create(user.id, dto, file);
  }

  @Public()
  @Get()
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.update(id, user.id, dto);
  }

  @Patch(':id/archive')
  toggleArchive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.toggleArchive(id, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.remove(id, user.id);
  }

  // ── Likes ────────────────────────────────────────────────────────────────

  @Post(':id/like')
  likePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.likePost(id, user.id);
  }

  @Delete(':id/like')
  unlikePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.unlikePost(id, user.id);
  }

  // ── Saves ─────────────────────────────────────────────────────────────────

  @Post(':id/save')
  savePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { collectionId?: string },
    @CurrentUser() user: User,
  ) {
    return this.postsService.savePost(id, user.id, body.collectionId);
  }

  @Delete(':id/save')
  unsavePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.unsavePost(id, user.id);
  }

  @Patch(':id/save')
  moveSave(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { collectionId: string | null },
    @CurrentUser() user: User,
  ) {
    return this.postsService.moveSave(id, user.id, body.collectionId);
  }
}
