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
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

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
    @Request() req: any,
  ) {
    // TODO: swap with JWT guard — req.user.id will come from the auth module
    const userId: string = req.user?.id ?? 'temp-user-id';
    return this.postsService.create(userId, dto, file);
  }

  @Get()
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @Request() req: any,
  ) {
    const userId: string = req.user?.id ?? 'temp-user-id';
    return this.postsService.update(id, userId, dto);
  }

  @Patch(':id/archive')
  toggleArchive(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId: string = req.user?.id ?? 'temp-user-id';
    return this.postsService.toggleArchive(id, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId: string = req.user?.id ?? 'temp-user-id';
    return this.postsService.remove(id, userId);
  }

  // ── Likes ────────────────────────────────────────────────────────────────

  @Post(':id/like')
  likePost(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId: string = req.user?.id ?? 'temp-user-id';
    return this.postsService.likePost(id, userId);
  }

  @Delete(':id/like')
  unlikePost(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId: string = req.user?.id ?? 'temp-user-id';
    return this.postsService.unlikePost(id, userId);
  }

  // ── Saves ─────────────────────────────────────────────────────────────────

  @Post(':id/save')
  savePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { collectionId?: string },
    @Request() req: any,
  ) {
    const userId: string = req.user?.id ?? 'temp-user-id';
    return this.postsService.savePost(id, userId, body.collectionId);
  }

  @Delete(':id/save')
  unsavePost(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId: string = req.user?.id ?? 'temp-user-id';
    return this.postsService.unsavePost(id, userId);
  }

  @Patch(':id/save')
  moveSave(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { collectionId: string | null },
    @Request() req: any,
  ) {
    const userId: string = req.user?.id ?? 'temp-user-id';
    return this.postsService.moveSave(id, userId, body.collectionId);
  }
}
