import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as crypto from 'crypto'; // to encrypt password

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}


async listUsers() {
    // ⚠️ Use plain quotes instead of backticks for table/column names
    const sql = `
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
        CONCAT(UPPER(e.fname), ' ', UPPER(e.mname), ' ', UPPER(e.lname)) AS name
      FROM user_login u
      LEFT JOIN employee e ON e.id = u.employee_id_fk
      LEFT JOIN config_role cr ON cr.rolecode = u.user_role
      ORDER BY u.created_at DESC
    `;

    try {
      const result = await this.userRepo.query(sql);
      return {
        status: 1,
        message: 'Success',
        error: null,
        data: result,
      };
    } catch (error) {
      console.error('❌ SQL Error:', error);
      return {
        status: 0,
        message: 'Query failed',
        error: error.message,
        data: [],
      };
    }
  }

  async create(body: any) {
    try {
      const encryptedPassword = crypto
        .createHash('sha256')
        .update(body.password)
        .digest('hex');

      const newUser = this.userRepo.create({
        employee_id_fk: body.employee_id_fk,
        username: body.username,
        password_hash: encryptedPassword,
        user_role: body.role,
        isactive: 1,
        created_by: body.logedInEmpNo,
        created_at: new Date(),
      });

      const savedUser = await this.userRepo.save(newUser);
      return { success: true, data: savedUser };
    } catch (err) {
      console.error('Error inserting user:', err);
      return { success: false, error: err.message };
    }
  }

  async update(body: any) {
    try {
      const user = await this.userRepo.findOne({ where: { id: body.id } });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      user.username = body.username ?? user.username;
      user.user_role = body.role ?? user.user_role;
      user.employee_id_fk = body.employee_id_fk ?? user.employee_id_fk;
      user.isactive = body.isactive ?? user.isactive;
      user.updated_by = body.logedInEmpNo;
      user.updated_at = new Date();

      const updatedUser = await this.userRepo.save(user);

      return { success: true, data: updatedUser };
    } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, error: err.message };
    }
  }

async delete(id: number) {
  try {
    const result = await this.userRepo.delete(id);

    if (result.affected && result.affected > 0) {
      return { success: true };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (err) {
    console.error('Error hard deleting user:', err);
    return { success: false, error: err.message };
  }
}

}
