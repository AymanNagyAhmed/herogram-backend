import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { MediaType } from '../entities/media.entity';

const MB = 1024 * 1024; // 1MB in bytes
const VIDEO_MAX_SIZE = 50 * MB;
const DEFAULT_MAX_SIZE = 5 * MB;

export function IsValidFileSize(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidFileSize',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: number, args: ValidationArguments) {
          const obj = args.object as any;
          const fileType = obj.fileType;
          
          if (fileType === MediaType.VIDEO) {
            return value <= VIDEO_MAX_SIZE;
          }
          
          return value <= DEFAULT_MAX_SIZE;
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as any;
          const fileType = obj.fileType;
          const maxSize = fileType === MediaType.VIDEO ? '50MB' : '5MB';
          
          return `File size must be less than ${maxSize}`;
        },
      },
    });
  };
} 