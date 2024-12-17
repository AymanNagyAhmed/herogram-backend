import { Injectable, NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';
import { ApiResponseUtil } from '@/common/utils/api-response.util';
import { ApplicationException } from '@/common/exceptions/application.exception';
import * as bcryptjs from 'bcryptjs';
import { DeepPartial } from 'typeorm';
import { UserStatus, UserRole } from '@/modules/users/entities/user.entity';
import { Media } from '@/modules/media/entities/media.entity';


@Injectable()
export class UsersService {
    private readonly BASE_PATH = '/users';
    private readonly SALT_ROUNDS = 10;

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto, profileImage?: Express.Multer.File): Promise<ApiResponse<Omit<User, 'password'>>> {
        try {
            const existingUser = await this.usersRepository.findOne({
                where: { email: createUserDto.email }
            });

            if (existingUser) {
                throw new ApplicationException(
                    'User with this email already exists',
                    HttpStatus.BAD_REQUEST,
                    this.BASE_PATH
                );
            }

            const hashedPassword = await bcryptjs.hash(createUserDto.password, this.SALT_ROUNDS);
            
            let profileImagePath: string | null = null;
            if (profileImage) {
                profileImagePath = `public/uploads/images/${profileImage.filename}`;
            }
            
            const user = this.usersRepository.create({
                ...createUserDto,
                password: hashedPassword,
                profileImage: profileImagePath,
                status: UserStatus.ACTIVE,
                role: UserRole.USER
            } as DeepPartial<User>);
            
            const savedUser = await this.usersRepository.save(user);
            
            const userResponse = {
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
                status: savedUser.status,
                role: savedUser.role,
                profileImage: savedUser.profileImage,
                mediaFiles: savedUser.mediaFiles,
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt
            };
            
            return ApiResponseUtil.success(
                userResponse,
                'User created successfully',
                this.BASE_PATH,
                HttpStatus.CREATED
            );
        } catch (error) {
            if (error instanceof ApplicationException) {
                throw error;
            }
            throw new ApplicationException(
                'Failed to create user',
                HttpStatus.BAD_REQUEST,
                this.BASE_PATH,
                [{ message: error.message }]
            );
        }
    }

    async findAll(): Promise<ApiResponse<User[]>> {
        const users = await this.usersRepository.find({
            select: {
                id: true,
                name: true,
                email: true,
                status: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        
        return ApiResponseUtil.success(
            users,
            'Users retrieved successfully',
            this.BASE_PATH
        );
    }

    async findOne(id: number): Promise<ApiResponse<User>> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id },
                select: ['id', 'email', 'name', 'status', 'role']
            });

            if (!user) {
                throw new ApplicationException(
                    `User with ID ${id} not found`,
                    HttpStatus.NOT_FOUND,
                    '/users'
                );
            }

            return ApiResponseUtil.success(
                user,
                'User retrieved successfully',
                '/users'
            );
        } catch (error) {
            // ... error handling
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<ApiResponse<User>> {
        const user = await this.findUserById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        let hashedPassword: string | undefined;
        if (updateUserDto.password) {
            const salt = await bcryptjs.genSalt(10);
            hashedPassword = await bcryptjs.hash(updateUserDto.password, salt);
        }

        // Handle profile image path - extract only the relative path
        let profileImage = updateUserDto.profileImage;
        if (profileImage) {
            try {
                const url = new URL(profileImage);
                // Extract the path starting from 'public/uploads/...'
                const pathMatch = url.pathname.match(/\/?public\/uploads\/.*$/);
                if (pathMatch) {
                    profileImage = pathMatch[0].replace(/^\//, ''); // Remove leading slash if present
                }
            } catch (e) {
                // If it's not a valid URL, assume it's already a relative path
                profileImage = updateUserDto.profileImage;
            }
        }

        try {
            // First update the user
            await this.usersRepository.update(
                id,
                {
                    email: updateUserDto.email,
                    password: hashedPassword,
                    name: updateUserDto.name,
                    profileImage: profileImage,
                }
            );

            // Then fetch the updated user
            const updatedUser = await this.findUserById(id);

            return ApiResponseUtil.success(
                updatedUser,
                'User updated successfully',
                `${this.BASE_PATH}/${id}`
            );
        } catch (error) {
            console.error(error);
            throw new ApplicationException(
                'Failed to update user',
                HttpStatus.BAD_REQUEST,
                `${this.BASE_PATH}/${id}`,
                [{ message: error.message }]
            );
        }
    }

    async remove(id: number): Promise<ApiResponse<void>> {
        const user = await this.findUserById(id);

        try {
            await this.usersRepository.remove(user);
            
            return ApiResponseUtil.success(
                undefined,
                'User deleted successfully',
                `${this.BASE_PATH}/${id}`
            );
        } catch (error) {
            throw new ApplicationException(
                'Failed to delete user',
                HttpStatus.BAD_REQUEST,
                `${this.BASE_PATH}/${id}`,
                [{ message: error.message }]
            );
        }
    }

    private async findUserById(id: number): Promise<User> {
        try {
            const user = await this.usersRepository.findOne({ 
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    status: true,
                    profileImage: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            
            if (!user) {
                throw new ApplicationException(
                    `User with ID ${id} not found`,
                    HttpStatus.NOT_FOUND,
                    `${this.BASE_PATH}/${id}`
                );
            }
            
            return user;
        } catch (error) {
            if (error instanceof ApplicationException) {
                throw error;
            }
            throw new ApplicationException(
                `Invalid user ID: ${id}`,
                HttpStatus.BAD_REQUEST,
                `${this.BASE_PATH}/${id}`,
                [{ message: error.message }]
            );
        }
    }

    // Method used by auth service
    async findUserByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                status: true,
                profileImage: true,
            }
        });
    }

    async getUserMedia(id: number): Promise<ApiResponse<Media[]>> {
        try {
            // First check if user exists
            const user = await this.findUserById(id);
            
            // Get media files for this user
            const mediaFiles = await user.mediaFiles;
            
            return ApiResponseUtil.success(
                mediaFiles,
                'User media files retrieved successfully',
                `${this.BASE_PATH}/${id}/media`
            );
        } catch (error) {
            if (error instanceof ApplicationException) {
                throw error;
            }
            throw new ApplicationException(
                'Failed to retrieve user media files',
                HttpStatus.BAD_REQUEST,
                `${this.BASE_PATH}/${id}/media`,
                [{ message: error.message }]
            );
        }
    }
}
