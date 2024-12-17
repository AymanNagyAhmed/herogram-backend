import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

export const FileValidationPipe = new ParseFilePipe({
  validators: [
    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB
  ],
  fileIsRequired: false,
}); 