import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class MediaService {
  getImagePath(filename: string): string {
    const imagePath = join(__dirname, '..', '..', '..', 'public', 'uploads', 'images', filename);
    
    if (!existsSync(imagePath)) {
      throw new NotFoundException('Image not found');
    }
    
    return imagePath;
  }
} 