import { Injectable, BadRequestException,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository , DataSource, Not } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly dataSource: DataSource,
  ) {}

  async list(status?: string, emp_no?: string) {
    const qb = this.employeeRepo
      .createQueryBuilder('e')
      .select([
        'e.id AS id',
        'e.emp_no AS emp_no',
        `UPPER(CONCAT(e.fname,' ',COALESCE(e.mname,''),' ',e.lname)) AS name`,
        'e.fname AS fname',
        'e.mname AS mname',
        'e.lname AS lname',
        'e.mobile AS mobile',
        'e.email AS email',
        'e.gender AS gender',
        'e.dob AS dob', 
        'e.address AS address',
        'e.department AS department',
        'e.designation AS designation',
        'e.status AS status',
        'e.created_at AS created_at',
        'e.created_by AS created_by',
        'e.updated_at AS updated_at',
        'e.updated_by AS updated_by',
      ])
      .where('e.is_deleted = :is_deleted', { is_deleted: 'N' });

    if (status && ['1', '2', '3', '4'].includes(status)) {
      qb.andWhere('e.status = :status', { status });
    } else {
      qb.andWhere('e.status IN (:...status)', {
        status: [1, 2, 3, 4],
      });
    }

    if (emp_no) {
      qb.andWhere('e.emp_no = :emp_no', { emp_no });
    }

    return qb.getRawMany();
  }

   async add(dto: CreateEmployeeDto) {
    const now = new Date();

    // DOB future check
    if (new Date(dto.dob) > now) {
      throw new BadRequestException('Date of birth cannot be a future date');
    }

    // Duplicate emp_no check
    const existing = await this.employeeRepo.findOne({
      where: { emp_no: dto.emp_no },
    });

    if (existing) {
      throw new BadRequestException(
        `Employee number (${dto.emp_no}) already exists`,
      );
    }

    // Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employee = queryRunner.manager.create(Employee, {
        user_role: dto.user_role,
        emp_no: dto.emp_no,
        fname: dto.fname,
        mname: dto.mname,
        lname: dto.lname,
        mobile: dto.mobile,
        email: dto.email,
        gender: dto.gender,
        dob: dto.dob,
        address: dto.address?.replace(/'/g, '"'),
        department: dto.department,
        designation: dto.designation,
        created_by: dto.created_by,
        created_at: now,
      });

      const saved = await queryRunner.manager.save(employee);

      await queryRunner.commitTransaction();

      return {
        status: 1,
        message: 'Employee added successfully.',
        error: null,
        data: {
          employee_id: saved.id,
          emp_no: saved.emp_no,
          name: `${saved.fname} ${saved.mname ?? ''} ${saved.lname}`.trim(),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

    async update(dto: UpdateEmployeeDto) {
    const {
      employee_id,
      emp_no,
      email,
      mobile,
      fname,
      mname,
      lname,
      gender,
      dob,
      address,
      department,
      designation,
      updated_by,
    } = dto;

    // DOB future check (same as CI)
    if (new Date(dob) > new Date()) {
      throw new BadRequestException('Date of birth cannot be a future date');
    }

    // Employee exists check
    const employee = await this.employeeRepo.findOne({
      where: { id: +employee_id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Duplicate emp_no check
    const duplicate = await this.employeeRepo.findOne({
      where: {
        emp_no,
        id: Not(+employee_id),
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        `Employee number (${emp_no}) already exists`,
      );
    }

    // Transaction (same as CI)
    return this.dataSource.transaction(async (manager) => {
      await manager.update(
        Employee,
        { id: +employee_id },
        {
          emp_no,
          email,
          mobile,
          fname,
          mname,
          lname,
          gender,
          dob,
          address,
          department,
          designation,
          updated_by: updated_by,
          updated_at: new Date(),
        },
      );

      return {
        status: 1,
        message: 'Employee updated successfully',
        error: null,
      };
    });
  }

}
