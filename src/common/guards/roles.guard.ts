import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@/modules/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);
    this.logger.debug(`User details: ${JSON.stringify(user)}`);

    if (!user) {
      this.logger.error('No user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.role) {
      this.logger.error('No role found for user');
      throw new ForbiddenException('User role not found');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    this.logger.debug(`User role: ${user.role}, Has required role: ${hasRole}`);
    
    if (!hasRole) {
      throw new ForbiddenException(`User role ${user.role} does not have permission to access this resource`);
    }

    return hasRole;
  }
} 