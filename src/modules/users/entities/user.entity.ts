import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Media } from '@/modules/media/entities/media.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255, nullable: true })
  name: string;

  @Column({type: 'text', length: 500, unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserStatus, name: 'status', default: UserStatus.ACTIVE })
  status: UserStatus;

  
  @Column({ type: 'enum', enum: UserRole, name: 'role', default: UserRole.USER })
  role: UserRole;



  @Column({type: 'text', name: 'profile_image', nullable: true })
  profileImage: string;
  
  @Column({type: 'text', select: false })
  @Exclude()
  password: string;

  @OneToMany(() => Media, (media) => media.user, { 
    lazy: true,  
    cascade: true 
  })
  mediaFiles: Promise<Media[]>;

  @Column('datetime', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('datetime', { name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
