import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Media } from '@/modules/media/entities/media.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({type: 'varchar', length: 50, unique: true })
  name: string;

  @ManyToMany(() => Media, (media) => media.tags)
  media: Media[];

  @Column({type: 'datetime', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({type: 'datetime', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 