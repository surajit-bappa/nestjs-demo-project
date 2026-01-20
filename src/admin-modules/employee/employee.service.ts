import { Injectable, BadRequestException,NotFoundException,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository , DataSource, Not } from 'typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly dataSource: DataSource,
  ) {}

   async nameList() {
    return this.employeeRepo
      .createQueryBuilder('e')
      .select([
        `UPPER(CONCAT(e.fname,' ',COALESCE(e.mname,''),' ',e.lname)) AS name`,
        'e.id AS employee_id',
        'e.emp_no AS emp_no',
      ])
      .where('e.is_deleted = :is_deleted', { is_deleted: 'N' })
      .orderBy('name', 'ASC')
      .getRawMany();
  }

   async generateEmployeeNo() {
    try {
     
      // Get last employee number
      const lastEmployeeResult = await this.dataSource.query(
        `SELECT emp_no FROM employee ORDER BY id DESC LIMIT 1`,
      );

      const lastEmployee = lastEmployeeResult[0];
      let newEmpNo = '';

      if (lastEmployee && lastEmployee.emp_no) {
        const lastEmpNo = String(lastEmployee.emp_no).trim();

        // Pure numeric emp no
        if (/^\d+$/.test(lastEmpNo)) {
          const length = lastEmpNo.length;
          const numericValue = parseInt(lastEmpNo, 10);
          newEmpNo = String(numericValue + 1).padStart(length, '0');
        }
        // Alphanumeric emp no
        else {
          const match = lastEmpNo.match(/(\d+)/);
          if (match) {
            const numericPart = match[0];
            const length = numericPart.length;
            const newNumeric = String(parseInt(numericPart, 10) + 1).padStart(
              length,
              '0',
            );
            newEmpNo = lastEmpNo.replace(/\d+/, newNumeric);
          } else {
            newEmpNo = `${lastEmpNo}1`;
          }
        }
      } else {
        newEmpNo = '10000001';
      }

      let counter = 1;
      let exists = await this.dataSource.query(
        `SELECT emp_no FROM employee WHERE emp_no = ? LIMIT 1`,
        [newEmpNo],
      );

      while (exists.length && counter < 100) {
        if (/^\d+$/.test(newEmpNo)) {
          const length = newEmpNo.length;
          newEmpNo = String(parseInt(newEmpNo, 10) + counter).padStart(
            length,
            '0',
          );
        } else {
          const match = newEmpNo.match(/(\d+)/);
          if (match) {
            const length = match[0].length;
            const newNumeric = String(parseInt(match[0], 10) + counter).padStart(
              length,
              '0',
            );
            newEmpNo = newEmpNo.replace(/\d+/, newNumeric);
          }
        }

        exists = await this.dataSource.query(
          `SELECT emp_no FROM employee WHERE emp_no = ? LIMIT 1`,
          [newEmpNo],
        );
        counter++;
      }

      return {
        status: 1,
        message: 'Employee No generated successfully.',
        error: null,
        data: {
          new_employee_id: newEmpNo,
          last_employee_id: lastEmployee?.emp_no ?? 'None',
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while generating the Employee No.',
      );
    }
  }

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

  async changeStatus(body: any) {
    try {
      
      const employeeId = body.employee_id;
      const status = body.status; // 1 Active, 2 Temp Deactive, 3 Left, 4 Retire
      const updated_by = body.updated_by;

      // Required fields check
      if ( !employeeId || !updated_by || status === undefined ) {
        return {
          status: 0,
          message: 'Failed to update employee status.',
          error: 'Request parameters employee_id,logedInEmpNo, status are mandatory.',
          data: null,
        };
      }

      //  Update employee status
      const updateResult = await this.dataSource.query(
        `
        UPDATE employee
        SET status = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ?
        `,
        [status, updated_by, employeeId],
      );

      if (updateResult.affectedRows > 0) {
        return {
          status: 1,
          message:
            Number(status) === 1
              ? 'Successfully activated'
              : 'Successfully deactivated',
          error: null,
          data: true,
        };
      }

      return {
        status: 0,
        message: 'Failed to update employee status.',
        error: 'No changes were made to the employee record.',
        data: null,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while updating employee status.',
      );
    }
  }

}
