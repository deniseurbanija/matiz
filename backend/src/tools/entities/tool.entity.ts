import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tools')
export class Tool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;
}
