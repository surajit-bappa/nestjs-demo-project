import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository , DataSource , Not } from 'typeorm';
import { Designations } from '../designations/entities/designation.entity'; 
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';


@Injectable()
export class DesignationsService {
  constructor(
    @InjectRepository(Designations)
    private readonly designationRepo: Repository<Designations>,
    private readonly dataSource: DataSource,  
  ) {}


async list() {
   return this.designationRepo.find({
      order: { id: 'ASC' },
    });

  }

  async add(dto: CreateDesignationDto) {
    try {
      const exists = await this.designationRepo.findOne({
      where: {
        value: dto.value,
      },
    });

      if (exists) {
        return {
          status: 0,
          message: 'Failed to add designation, duplicate value not allowed.',
          error: 'Duplicate value not allowed.',
          data: null,
        };
      }

     const designation = this.designationRepo.create({
      value: dto.value,
      created_by: dto.created_by,
      status: dto.status,
    });

    const saved = await this.designationRepo.save(designation);

      return {
        status: 1,
        message: 'Desigantion added successfully',
        error: 'null',
        data: 'success',
      };
    } catch (error) {
      
      return {
        status: 0,
        message: 'Failed to add desigantion.',
        error: 'Failed to add desigantion.',
         data: null,
      };
    }
  }

   async update(dto: UpdateDesignationDto) {
   try {
    const duplicate = await this.designationRepo.findOne({
      where: {
        value: dto.value,
        id: Not(dto.id),
      },
    });

   if (duplicate) {
        return {
          status: 0,
          message: 'Failed to update designation, duplicate value not allowed.',
          error: 'Duplicate value not allowed.',
          data: null,
        };
      }

    const designation = await this.designationRepo.findOne({
      where: { id: dto.id },
    });

    if (!designation) {
      return {
        status: 0,
        message: 'Designation not found.',
        error: 'Invalid designation id.',
        data: null,
      };
    }

    designation.value = dto.value;
    designation.status = dto.status;
    designation.updated_by = dto.updated_by;
    designation.updated_at = new Date();

    await this.designationRepo.save(designation);

    return {
        status: 1,
        message: 'Designation updated successfully.',
        error: null,
        data: null,
       };
     
     } catch (error) {
      
      return {
        status: 0,
        message: 'Failed to update designation.',
        error: 'Database error.',
         data: null,
      };
    }

  }

async delete(id: number) {

  if (!id) {
    return {
      status: 0,
      message: 'Failed to delete designation',
      error: 'Id is mandatory',
      data: null,
    };
  }
  try {
    const result = await this.designationRepo.delete(id);

    if (result.affected && result.affected > 0) {
       return {
        status: 1,
        message: 'Designation deleted successfully',
        error: null,
        data: null,
      };
    } else {
      return {
          status: 0,
          message: 'Failed to delete designation.',
          error: 'Designation not found',
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
