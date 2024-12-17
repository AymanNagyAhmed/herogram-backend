import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { checkImageExists } from '../utils/file-check';

@Controller()
export class MediaController {
  @Get('public/uploads/images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'uploads', 'images', filename);
    
    // Debug logging
    console.log('Requested file:', filename);
    console.log('Full path:', filePath);
    console.log('File exists:', checkImageExists(filename));
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('Image not found');
    }

    const file = createReadStream(filePath);
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="${filename}"`,
    });
    
    file.pipe(res);
  }
} 