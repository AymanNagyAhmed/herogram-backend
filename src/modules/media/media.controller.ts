import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

@Controller('media')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ApiResponseInterceptor)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './public/uploads/media',
      filename: (req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'image/jpg',
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'application/pdf',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Unsupported file type'), false);
      }
    },
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max file size
    },
  }))

  create(
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: AuthenticatedRequest,
  ) {
    console.log('Controller: Received request');
    console.log('Controller: Files:', files);
    console.log('Controller: CreateMediaDto:', createMediaDto);
    console.log('Controller: User:', req.user);
    
    return this.mediaService.create(createMediaDto, files, req.user.id);
  }

  @Get()
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('file', 1, {
    storage: diskStorage({
      destination: './public/uploads/media',
      filename: (req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMediaDto: UpdateMediaDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.mediaService.update(id, updateMediaDto, files?.[0]);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
