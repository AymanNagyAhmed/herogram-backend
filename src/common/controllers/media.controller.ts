import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { checkImageExists } from '../utils/file-check';
import { extname } from 'path';

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

  @Get('public/uploads/media/:filename')
  async getMedia(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'uploads', 'media', filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('Media file not found');
    }

    const file = createReadStream(filePath);
    
    // Set appropriate content type based on file extension
    const ext = extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.pdf') contentType = 'application/pdf';
    
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
    });
    
    file.pipe(res);
  }
} 