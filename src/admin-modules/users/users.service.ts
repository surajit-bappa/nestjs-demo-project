import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository , DataSource} from 'typeorm';
import { User } from '../users/entities/user.entity'; 
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,  
  ) {}


  async checkUserAccess(username: string, employee_id: number) {

    if (!username || !employee_id) {
      return {
        status: 0,
        message: 'User is not active',
        error: 'username and employee_id are mandatory.',
        data: null,
      };
    }

    try {
      const query = `
        SELECT employee_id_fk, isactive
        FROM user_login
        WHERE username = ?
          AND employee_id_fk = ?
        LIMIT 1
      `;

      const result = await this.dataSource.query(query, [
        username,
        employee_id,
      ]);

      if (result.length === 1) {
        if (result[0].isactive === 1) {
          return {
            status: 1,
            message: 'User is active.',
            error: null,
            data: null,
          };
        } else {
          return {
            status: 0,
            message: 'User is not active.',
            error: 'User is not active.',
            data: null,
          };
        }
      }

      // User not found
      return {
        status: 0,
        message: 'User is not active.',
        error: 'User not found.',
        data: null,
      };
    } catch (err) {
      return {
        status: 0,
        message: 'There is an application error, please contact support team.',
        error: err.message,
        data: null,
      };
    }
  }

 async getUserProfile(employee_id: string) {
  try {
    if (!employee_id) {
      return {
        status: 0,
        message: 'Failed to get user profile.',
        error: 'employee_id is mandatory.',
        data: null,
      };
    }

    const result = await this.dataSource.query(
      `
      SELECT 
        e.id, e.emp_no, e.user_role,
        UPPER(CONCAT(
          e.fname, 
          ' ', 
          IFNULL(e.mname, ''), 
          ' ', 
          e.lname
        )) AS name,
        DATE_FORMAT(e.dob, '%Y-%m-%d') AS dob,
        e.mobile, e.email, e.gender, e.address, 
        e.department, e.designation, e.status
      FROM employee e
      WHERE e.id = ?
        AND e.status IN (1, 2)
      `,
      [employee_id],
    );

    if (result.length === 0) {
      return {
        status: 0,
        message: 'Failed to get user profile.',
        error: 'Invalid employee id or inactive employee.',
        data: null,
      };
    }

    return {
      status: 1,
      message: 'Success',
      error: null,
      data: result[0],
    };
  } catch (error) {
    return {
      status: 0,
      message: 'There is an application error, please contact support team.',
      error: error.message,
      data: null,
    };
  }
}

 async list(userRole?: string) {
  let sql = `
    SELECT 
      u.id AS user_id,
      u.employee_id_fk AS employee_id,
      u.username AS username,
      u.isactive AS isactive,
      u.user_role AS user_role,
      u.created_by AS created_by,
      u.created_at AS created_at,
      e.emp_no AS emp_no,
      cr.rolename AS rolename,
      CONCAT(
        UPPER(e.fname), ' ',
        UPPER(e.mname), ' ',
        UPPER(e.lname)
      ) AS name
    FROM user_login u
    LEFT JOIN employee e ON e.id = u.employee_id_fk
    LEFT JOIN config_role cr ON cr.rolecode = u.user_role
  `;

  const params: any[] = [];

  // Apply role filter (same as PHP logic)
  if (userRole && userRole.toLowerCase() !== 'all') {
    sql += ` WHERE u.user_role = ?`;
    params.push(userRole);
  }

  sql += ` ORDER BY u.created_at DESC`;

  try {
    const result = await this.userRepo.query(sql, params);

    return {
      status: 1,
      message: 'Success',
      error: null,
      data: result,
    };
  } catch (error) {
    return {
      status: 0,
      message: 'Query failed',
      error: error.message,
      data: [],
    };
  }
}

  async create(dto: CreateUserDto) {
    try {
      const existingUser = await this.userRepo.findOne({
        where: { username: dto.username },
      });

      if (existingUser) {
        return {
          status: 0,
          message: 'Username already exists',
          error: 'Username already exists.',
          data: null,
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(dto.password, 10);

      const newUser = this.userRepo.create({
        employee_id_fk: dto.employee_id_fk,
        username: dto.username,
        password_hash: passwordHash,
        user_role: dto.role,
        isactive: 1,
        created_by: dto.created_by,
        created_at: new Date(),
      });

      const savedUser = await this.userRepo.save(newUser);

      return {
        status: 1,
        message: 'User added successfully',
        error: 'null',
        data: 'success',
      };
    } catch (error) {
      
      return {
        status: 0,
        message: 'Failed to add user.',
        error: 'Failed to add user.',
         data: null,
      };
    }
  }

async updateUserStatus(
  username: string,
  employee_id_fk: number,
  status: 1 | 2,
) {
  
  status = Number(status) as 1 | 2;

  if (!username || !employee_id_fk || !status) {
    return {
      status: 0,
      message: 'Failed to update user status',
      error: 'username, employee_id_fk and status are required parameters.',
      data: null,
    };
  }

  try {
    const setStatus = status;             
    const currentStatus = status === 1 ? 2 : 1;

    const query = `
      UPDATE user_login
      SET isactive = ?
      WHERE username = ?
        AND employee_id_fk = ?
        AND isactive = ?
    `;

    const params = [
      setStatus,
      username,
      employee_id_fk,
      currentStatus,
    ];

    const result = await this.dataSource.query(query, params);

    const affected =
      result?.affectedRows ??
      result?.rowCount ??
      0;

    if (affected > 0) {
      return {
        status: 1,
        message:
          status === 1
            ? 'User has been activated.'
            : 'User has been deactivated.',
        error: null,
        data: null,
      };
    }

    return {
      status: 0,
      message: 'Failed to update user status',
      error: 'User not found or already in requested state.',
      data: null,
    };
  } catch (err) {
    return {
      status: 0,
      message: 'There is an application error, please contact support team.',
      error: err.message,
      data: null,
    };
  }
}

async resetPassword(dto: ResetPasswordDto) {
    try {
      const { user_id, password, updated_by } = dto;

      const passwordHash = await bcrypt.hash(password, 10);
      const now = new Date();

      const result = await this.dataSource.query(
        `
        UPDATE user_login
        SET password_hash = ?,
            updated_by = ?,
            updated_at = ?
        WHERE id = ?
        `,
        [passwordHash, updated_by, now, user_id],
      );

      if (result.affectedRows && result.affectedRows > 0) {
        return {
          status: 1,
          message: 'Password changed successfully',
          error: null,
          data: null,
        };
      }

      return {
        status: 0,
        message: 'Failed to reset password',
        error: 'User not found or update failed',
        data: null,
      };
    } catch (error) {
      console.error('RESET PASSWORD ERROR:', error);

      return {
        status: 0,
        message: 'There is an application error, please contact support team.',
        error: error.message,
        data: null,
      };
    }
  }

async delete(id: number) {

  if (!id) {
    return {
      status: 0,
      message: 'Failed to delete user',
      error: 'Id is mandatory',
      data: null,
    };
  }
  try {
    const result = await this.userRepo.delete(id);

    if (result.affected && result.affected > 0) {
       return {
        status: 1,
        message: 'User deleted successfully',
        error: null,
        data: null,
      };
    } else {
      return {
          status: 0,
          message: 'User not found',
          error: 'User not found',
          data: null,
         };
    }
  } catch (err) {
    return {
       status: 0, 
       message: 'Failed to delete user' ,
       error:'Failed to delete user' ,
      data: null,
      };
  }
}

}
