import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';
import { ApiResponseUtil } from '@/common/utils/api-response.util';
import { ApplicationException } from '@/common/exceptions/application.exception';

@Injectable()
export class TagsService {
  private readonly BASE_PATH = '/tags';

  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<ApiResponse<Tag>> {
    try {
      const existingTag = await this.tagsRepository.findOne({
        where: { name: createTagDto.name }
      });

      if (existingTag) {
        throw new ApplicationException(
          'Tag with this name already exists',
          HttpStatus.BAD_REQUEST,
          this.BASE_PATH
        );
      }

      const tag = this.tagsRepository.create(createTagDto);
      const savedTag = await this.tagsRepository.save(tag);

      return ApiResponseUtil.success(
        savedTag,
        'Tag created successfully',
        this.BASE_PATH,
        HttpStatus.CREATED
      );
    } catch (error) {
      if (error instanceof ApplicationException) {
        throw error;
      }
      throw new ApplicationException(
        'Failed to create tag',
        HttpStatus.BAD_REQUEST,
        this.BASE_PATH,
        [{ message: error.message }]
      );
    }
  }

  async findAll(): Promise<ApiResponse<Tag[]>> {
    const tags = await this.tagsRepository.find();
    
    return ApiResponseUtil.success(
      tags,
      'Tags retrieved successfully',
      this.BASE_PATH
    );
  }

  async findOne(id: number): Promise<ApiResponse<Tag>> {
    const tag = await this.findTagById(id);
    
    return ApiResponseUtil.success(
      tag,
      'Tag retrieved successfully',
      `${this.BASE_PATH}/${id}`
    );
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<ApiResponse<Tag>> {
    const tag = await this.findTagById(id);

    try {
      await this.tagsRepository.update(
        id,
        {
          name: updateTagDto.name,
        }
      );

      const updatedTag = await this.findTagById(id);

      return ApiResponseUtil.success(
        updatedTag,
        'Tag updated successfully',
        `${this.BASE_PATH}/${id}`
      );
    } catch (error) {
      throw new ApplicationException(
        'Failed to update tag',
        HttpStatus.BAD_REQUEST,
        `${this.BASE_PATH}/${id}`,
        [{ message: error.message }]
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<void>> {
    const tag = await this.findTagById(id);

    try {
      await this.tagsRepository.remove(tag);
      
      return ApiResponseUtil.success(
        undefined,
        'Tag deleted successfully',
        `${this.BASE_PATH}/${id}`
      );
    } catch (error) {
      throw new ApplicationException(
        'Failed to delete tag',
        HttpStatus.BAD_REQUEST,
        `${this.BASE_PATH}/${id}`,
        [{ message: error.message }]
      );
    }
  }

  private async findTagById(id: number): Promise<Tag> {
    try {
      const tag = await this.tagsRepository.findOne({ 
        where: { id }
      });
      
      if (!tag) {
        throw new ApplicationException(
          `Tag with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
          `${this.BASE_PATH}/${id}`
        );
      }
      
      return tag;
    } catch (error) {
      if (error instanceof ApplicationException) {
        throw error;
      }
      throw new ApplicationException(
        `Invalid tag ID: ${id}`,
        HttpStatus.BAD_REQUEST,
        `${this.BASE_PATH}/${id}`,
        [{ message: error.message }]
      );
    }
  }
}
