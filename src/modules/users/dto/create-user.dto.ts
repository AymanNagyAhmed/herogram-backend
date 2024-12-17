import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsOptional()
    name?: string;
  
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    status?: string;
  
    @IsString()
    password: string;

    @IsString()
    @IsOptional()
    profileImage?: string;
}
