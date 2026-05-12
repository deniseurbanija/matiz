import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Post } from './posts/entities/post.entity';
import { Like } from './posts/entities/like.entity';
import { Save } from './posts/entities/save.entity';
import { Tag } from './tags/entities/tag.entity';
import { Tool } from './tools/entities/tool.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';
import { ToolsModule } from './tools/tools.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'matiz'),
        entities: [User, Post, Like, Save, Tag, Tool],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    TagsModule,
    ToolsModule,
  ],
  providers: [
    // JwtAuthGuard protects all routes; use @Public() to opt out
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
