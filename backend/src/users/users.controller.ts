import { Body, Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { PostsService } from '../posts/posts.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  // All /users/me/* routes must come before /users/:id to avoid shadowing
  @Get('me/saved')
  getSaved(@CurrentUser() user: User) {
    return this.postsService.getSavedByUser(user.id);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Public()
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const profile = await this.usersService.findPublicProfile(id);
    if (!profile) throw new NotFoundException('User not found');
    return profile;
  }

  @Public()
  @Get(':id/posts')
  getUserPosts(@Param('id') id: string) {
    return this.postsService.findByUser(id);
  }
}
