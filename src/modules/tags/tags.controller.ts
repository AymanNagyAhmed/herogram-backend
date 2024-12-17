import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseInterceptors,
  ParseIntPipe,
  UseGuards,
  Logger,
  Request
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';
import { Public } from '@/common/decorators/public.decorator';

@Controller('tags')
@UseInterceptors(ApiResponseInterceptor)
export class TagsController {
  private readonly logger = new Logger(TagsController.name);

  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createTagDto: CreateTagDto, @Request() req) {
    this.logger.debug(`User from request: ${JSON.stringify(req.user)}`);
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateTagDto: UpdateTagDto
  ) {
    return this.tagsService.update(id, updateTagDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
