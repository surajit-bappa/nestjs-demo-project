
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Roles } from '../roles/entities/roles.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepo: Repository<Roles>,
  ) {}

  async getRoleList(userRole?: string) {
    const where: any = { status: 1 };

    if (userRole === 'AD') {
      where.rolecode = Not('SA');
    }

    return this.rolesRepo.find({
      select: ['rolename', 'rolecode'],
      where,
      order: { rolename: 'ASC' },
    });
  }

  async add(dto: CreateRoleDto) {
      try {
        const exists = await this.rolesRepo.findOne({
        where: {
          rolecode: dto.rolecode,
        },
      });
  
        if (exists) {
          return {
            status: 0,
            message: 'A department with the same code already exists',
            error: 'Department code already exists.',
            data: null,
          };
        }
  
       const roles = this.rolesRepo.create({
        rolecode: dto.rolecode,
        rolename: dto.rolename,
        created_by: dto.created_by,
        status: dto.status,
      });
  
      const saved = await this.rolesRepo.save(roles);
  
        return {
          status: 1,
          message: 'Role added successfully',
          error: 'null',
          data: 'success',
        };
      } catch (error) {
        
        return {
          status: 0,
          message: 'Failed to add role.',
          error: 'Failed to add role.',
           data: null,
        };
      }
    }
}

