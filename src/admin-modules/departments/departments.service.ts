import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository , DataSource , Not } from 'typeorm';
import { Departments } from '../departments/entities/department.entity'; 
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';


@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Departments)
    private readonly deptRepo: Repository<Departments>,
    private readonly dataSource: DataSource,  
  ) {}


async list() {
   return this.deptRepo.find({
      order: { id: 'ASC' },
    });

  }

  async add(dto: CreateDepartmentDto) {
    try {
      const exists = await this.deptRepo.findOne({
      where: {
        code: dto.code,
      },
    });

      if (exists) {
        return {
          status: 0,
          message: 'Failed to add department, duplicate not allowed.',
          error: 'A department with the same code already exists.',
          data: null,
        };
      }

     const department = this.deptRepo.create({
      code: dto.code,
      value: dto.value,
      created_by: dto.created_by,
      status: dto.status,
    });

    const saved = await this.deptRepo.save(department);

      return {
        status: 1,
        message: 'Department added successfully',
        error: 'null',
        data: 'success',
      };
    } catch (error) {
      
      return {
        status: 0,
        message: 'Failed to add department.',
        error: 'Failed to add department.',
         data: null,
      };
    }
  }

   async update(dto: UpdateDepartmentDto) {
   try {
    const duplicate = await this.deptRepo.findOne({
      where: {
        code: dto.code,
        id: Not(dto.id),
      },
    });

   if (duplicate) {
        return {
          status: 0,
          message: 'Failed to update department, duplicate not allowed.',
          error: 'Department code already exists.',
          data: null,
        };
      }

    const department = await this.deptRepo.findOne({
      where: { id: dto.id },
    });

    if (!department) {
      return {
        status: 0,
        message: 'Department not found.',
        error: 'Invalid department id.',
        data: null,
      };
    }

    department.code = dto.code;
    department.value = dto.value;
    department.status = dto.status;
    department.updated_by = dto.updated_by;
    department.updated_at = new Date();

    await this.deptRepo.save(department);

    return {
        status: 1,
        message: 'Department updated successfully.',
        error: null,
        data: null,
       };
     
     } catch (error) {
      
      return {
        status: 0,
        message: 'Failed to update department.',
        error: 'Database error.',
         data: null,
      };
    }

  }

async delete(id: number) {

  if (!id) {
    return {
      status: 0,
      message: 'Failed to delete department',
      error: 'Id is mandatory',
      data: null,
    };
  }
  try {
    const result = await this.deptRepo.delete(id);

    if (result.affected && result.affected > 0) {
       return {
        status: 1,
        message: 'Department deleted successfully',
        error: null,
        data: null,
      };
    } else {
      return {
          status: 0,
          message: 'Failed to delete Department',
          error: 'Department not found',
          data: null,
         };
    }
  } catch (err) {
    return {
       status: 0, 
       message: 'Failed to delete Department' ,
       error:'Database error.' ,
      data: null,
      };
  }
}

}
