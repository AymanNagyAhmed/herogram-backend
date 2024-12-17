import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  PDF = 'pdf'
}

export enum AllowedExtensions {
    JPG = 'jpg',
    JPEG = 'jpeg',
    PNG = 'png',
    GIF = 'gif',
    MP4 = 'mp4',
    MOV = 'mov',
    AVI = 'avi',
    MKV = 'mkv',
    PDF = 'pdf'
  }

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User, (user) => user.mediaFiles, { 
    lazy: true, 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @Column('text', { name: 'file_path' })
  file_path: string;

  @Column('varchar', { name: 'file_name', length: 255 })
  file_name: string;

  @Column({ type: 'enum', enum: MediaType, name: 'file_type' })
  file_type: MediaType;

  @Column({ type: 'enum', enum: AllowedExtensions, name: 'file_extension' })
  file_extension: string;

  @Column({ name: 'number_of_views', type: 'bigint', default: 0, unsigned: true })
  number_of_views: number;

  @Column({ name: 'file_size', type: 'bigint' })
  file_size: number;

  @Column('text', { name: 'original_name' })
  original_name: string;

  @ManyToMany(() => Tag, (tag) => tag.media, { cascade: true })
  @JoinTable({
    name: 'media_tags',
    joinColumn: { name: 'media_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
} 