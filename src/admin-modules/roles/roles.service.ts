
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

  async getRoleList(userRole?: string,status?: number) {

    const where: any = {};

    if (userRole === 'AD') {
      where.rolecode = Not('SA');
    }

    if (status !== undefined && status !== null) {
          where.status = status;
    }

    return this.rolesRepo.find({
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
            message: 'A role with the same code already exists',
            error: 'Role code already exists.',
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

  async update(dto: UpdateRoleDto) {
     try {
      const duplicate = await this.rolesRepo.findOne({
        where: {
          rolecode: dto.rolecode,
          id: Not(dto.id),
        },
      });
  
     if (duplicate) {
          return {
            status: 0,
            message: 'Failed to update role, duplicate not allowed.',
            error: 'Role code already exists.',
            data: null,
          };
        }
  
      const role = await this.rolesRepo.findOne({
        where: { id: dto.id },
      });
  
      if (!role) {
        return {
          status: 0,
          message: 'Role not found.',
          error: 'Invalid role id.',
          data: null,
        };
      }
  
      role.rolecode = dto.rolecode;
      role.rolename = dto.rolename;
      role.status = dto.status;
      role.updated_by = dto.updated_by;
      role.updated_at = new Date();
  
      await this.rolesRepo.save(role);
  
      return {
          status: 1,
          message: 'Role updated successfully.',
          error: null,
          data: null,
         };
       
       } catch (error) {
        
        return {
          status: 0,
          message: 'Failed to update role.',
          error: 'Database error.',
           data: null,
        };
      }
  
    }

  async delete(id: number) {

  if (!id) {
    return {
      status: 0,
      message: 'Failed to delete role',
      error: 'Id is mandatory',
      data: null,
    };
  }
  try {
    const result = await this.rolesRepo.delete(id);

    if (result.affected && result.affected > 0) {
       return {
        status: 1,
        message: 'Role deleted successfully',
        error: null,
        data: null,
      };
    } else {
      return {
          status: 0,
          message: 'Failed to delete role',
          error: 'Role not found',
          data: null,
         };
    }
  } catch (err) {
    return {
       status: 0, 
       message: 'Failed to delete role' ,
       error:'Database error.' ,
      data: null,
      };
  }
}

}

