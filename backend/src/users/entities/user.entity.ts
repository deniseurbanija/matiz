import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  password: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  googleId: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  hashedRefreshToken: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
