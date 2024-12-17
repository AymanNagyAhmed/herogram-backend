import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Media, MediaType, AllowedExtensions } from './entities/media.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';
import { ApiResponseUtil } from '@/common/utils/api-response.util';
import { ApplicationException } from '@/common/exceptions/application.exception';
import { extname } from 'path';

@Injectable()
export class MediaService {
  private readonly BASE_PATH = '/media';

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(
    createMediaDto: CreateMediaDto,
    files: Express.Multer.File[],
    userId: number,
  ): Promise<ApiResponse<Media[]>> {
    try {
      console.log('Starting media creation process...');
      console.log('Files received:', files.length);
      console.log('User ID:', userId);
      console.log('CreateMediaDto:', createMediaDto);
      
      const createdMedia: Media[] = [];

      for (const file of files) {
        console.log('Processing file:', file.originalname);
        const fileType = this.getFileType(file.mimetype);
        const fileExtension = extname(file.originalname).toLowerCase();
        
        console.log('File type:', fileType);
        console.log('File extension:', fileExtension);
        
        // Validate file extension
        if (!Object.values(AllowedExtensions).includes(fileExtension.substring(1) as AllowedExtensions)) {
          throw new ApplicationException(
            `File extension ${fileExtension} is not allowed`,
            HttpStatus.BAD_REQUEST,
            this.BASE_PATH,
          );
        }

        // Validate file size
        const maxSize = fileType === MediaType.VIDEO ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new ApplicationException(
            `File size exceeds the maximum limit of ${maxSize / (1024 * 1024)}MB`,
            HttpStatus.BAD_REQUEST,
            this.BASE_PATH,
          );
        }
        
        console.log('Creating media entity...');
        // Create media entity with the correct property names matching the entity
        const media = this.mediaRepository.create({
          file_name: file.filename,
          original_name: file.originalname,
          file_type: fileType,
          file_extension: fileExtension.substring(1),
          file_size: file.size,
          file_path: `public/uploads/media/${file.filename}`,
          user_id: userId,
          number_of_views: 0
        });

        console.log('Created media entity:', media);

        // Handle tags
        if (createMediaDto.tags?.length) {
          console.log('Processing tags:', createMediaDto.tags);
          const tagIds = createMediaDto.tags.map(tag => 
            typeof tag === 'string' ? parseInt(tag) : tag
          );
          const tags = await this.tagRepository.findBy({
            id: In(tagIds)
          });
          console.log('Found tags:', tags);
          media.tags = tags;
        }

        console.log('Saving media to database...');
        try {
          const savedMedia = await this.mediaRepository.save(media);
          console.log('Media saved successfully:', savedMedia);
          createdMedia.push(savedMedia);
        } catch (dbError) {
          console.error('Database error while saving media:', dbError);
          throw dbError;
        }
      }

      console.log('All media files processed successfully');
      return ApiResponseUtil.success(
        createdMedia,
        'Media files uploaded successfully',
        this.BASE_PATH,
        HttpStatus.CREATED,
      );
    } catch (error) {
      console.error('Error in create media:', error);
      throw new ApplicationException(
        error.message || 'Failed to upload media files',
        HttpStatus.BAD_REQUEST,
        this.BASE_PATH,
        [{ message: error.message }],
      );
    }
  }

  async findAll(): Promise<ApiResponse<Media[]>> {
    const media = await this.mediaRepository.find({
      relations: ['tags'],
    });
    
    return ApiResponseUtil.success(
      media,
      'Media files retrieved successfully',
      this.BASE_PATH,
    );
  }

  async findOne(id: number): Promise<ApiResponse<Media>> {
    const media = await this.findMediaById(id);
    
    // Increment view count
    media.number_of_views++;
    await this.mediaRepository.save(media);
    
    return ApiResponseUtil.success(
      media,
      'Media file retrieved successfully',
      `${this.BASE_PATH}/${id}`,
    );
  }

  async update(
    id: number,
    updateMediaDto: UpdateMediaDto,
    file?: Express.Multer.File,
  ): Promise<ApiResponse<Media>> {
    const media = await this.findMediaById(id);

    try {
      if (file) {
        media.file_name = file.filename;
        media.original_name = file.originalname;
        media.file_size = file.size;
        media.file_type = this.getFileType(file.mimetype);
        media.file_extension = extname(file.originalname).toLowerCase();
      }

      if (updateMediaDto.tags) {
        const tags = await this.tagRepository.findBy({
          id: In(updateMediaDto.tags)
        });
        media.tags = tags;
      }

      const updatedMedia = await this.mediaRepository.save(media);

      return ApiResponseUtil.success(
        updatedMedia,
        'Media file updated successfully',
        `${this.BASE_PATH}/${id}`,
      );
    } catch (error) {
      throw new ApplicationException(
        'Failed to update media file',
        HttpStatus.BAD_REQUEST,
        `${this.BASE_PATH}/${id}`,
        [{ message: error.message }],
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<void>> {
    const media = await this.findMediaById(id);

    try {
      await this.mediaRepository.remove(media);
      
      return ApiResponseUtil.success(
        undefined,
        'Media file deleted successfully',
        `${this.BASE_PATH}/${id}`,
      );
    } catch (error) {
      throw new ApplicationException(
        'Failed to delete media file',
        HttpStatus.BAD_REQUEST,
        `${this.BASE_PATH}/${id}`,
        [{ message: error.message }],
      );
    }
  }

  private async findMediaById(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!media) {
      throw new ApplicationException(
        `Media file with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
        `${this.BASE_PATH}/${id}`,
      );
    }

    return media;
  }

  private getFileType(mimetype: string): MediaType {
    if (mimetype.startsWith('image/')) return MediaType.IMAGE;
    if (mimetype.startsWith('video/')) return MediaType.VIDEO;
    if (mimetype === 'application/pdf') return MediaType.PDF;
    throw new ApplicationException(
      'Unsupported file type',
      HttpStatus.BAD_REQUEST,
      this.BASE_PATH,
    );
  }
}
