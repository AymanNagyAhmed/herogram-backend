import { IsArray, IsOptional } from 'class-validator';

export class CreateMediaDto {
  @IsArray()
  @IsOptional()
  tags?: number[];
}
