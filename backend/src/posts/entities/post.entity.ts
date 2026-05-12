import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tool } from '../../tools/entities/tool.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Like } from './like.entity';
import { Save } from './save.entity';

export interface EditingSetting {
  label: string;
  value: string;
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  imageUrl: string;

  @Column()
  imagePublicId: string;

  @Column({ nullable: true, type: 'text' })
  caption: string;

  @Column({ type: 'jsonb' })
  editingConfig: { settings: EditingSetting[] };

  @Column({ default: false })
  isArchived: boolean;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  savesCount: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ nullable: true })
  toolId: string;

  @ManyToOne(() => Tool, { eager: true, onDelete: 'SET NULL', nullable: true })
  tool: Tool;

  @ManyToMany(() => Tag, (tag) => tag.posts, { eager: true })
  @JoinTable({ name: 'post_tags' })
  tags: Tag[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Save, (save) => save.post)
  saves: Save[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
