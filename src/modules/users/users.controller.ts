import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  Req,
  UnsupportedMediaTypeException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseIntPipe,
  ForbiddenException,

} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { Public } from '@/common/decorators/public.decorator';

interface UserPayload {
  id: number;
  email: string;
  // add other user properties as needed
}

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

@Controller('users')
@UseInterceptors(ApiResponseInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('profileImage'))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    ) 
    profileImage?: Express.Multer.File,
  ) {
    return this.usersService.create(createUserDto, profileImage);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImage', {
    storage: diskStorage({
      destination: './public/uploads/images',
      filename: (req, file, callback) => {
        const userId = req.params.id;
        const fileExtName = extname(file.originalname);
        callback(null, `${userId}-${Date.now()}${fileExtName}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 2MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    ) file?: Express.Multer.File,
    @Req() req?: AuthenticatedRequest
  ) {
    if (req?.user) {
      this.checkUserAccess(req.user, id);
    }
    
    if (file) {
      const imageUrl = `${req?.protocol}://${req?.get('host')}/public/uploads/images/${file.filename}`;
      updateUserDto.profileImage = imageUrl;
    }
    
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post(':id/profile-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './public/uploads/images',
      filename: (req, file, callback) => {
        const userId = req.params.id;
        const fileExtName = extname(file.originalname);
        callback(null, `${userId}-${Date.now()}${fileExtName}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async uploadProfileImage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    this.checkUserAccess(req.user, id);
    
    const imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/images/${file.filename}`;
    await this.usersService.update(id, { profileImage: imageUrl });
    
    return { imageUrl };
  }

  private checkUserAccess(user: UserPayload, targetUserId: number): void {
    if (user.id !== targetUserId) {
      throw new ForbiddenException('You can only modify your own profile');
    }
  }
}
