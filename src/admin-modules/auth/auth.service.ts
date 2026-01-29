import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//import { createCanvas } from 'canvas';
import { DataSource , Repository} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { MoreThan } from 'typeorm';
import { User } from '../users/entities/user.entity'; 
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';


@Injectable()
export class AuthService {
    constructor(
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,
      private readonly dataSource: DataSource,
    ) {}

  // generateCaptcha() {
  //   const captchaText = Math.random()
  //     .toString(36)
  //     .substring(2, 8)
  //     .toUpperCase();

  //   const expiresAt = Date.now() + 20 * 60 * 1000;

  //   const token = Buffer.from(
  //     JSON.stringify({
  //       captcha_text: captchaText,
  //       expires_at: expiresAt,
  //     }),
  //   ).toString('base64');

  //   const width = 180;
  //   const height = 60;
  //   const canvas = createCanvas(width, height);
  //   const ctx = canvas.getContext('2d');

  //   // Background
  //   ctx.fillStyle = '#e6e6e6';
  //   ctx.fillRect(0, 0, width, height);

  //   // Noise
  //   for (let i = 0; i < 250; i++) {
  //     ctx.fillStyle = `rgb(${100 + Math.random() * 100},${100 + Math.random() * 100},${100 + Math.random() * 100})`;
  //     ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  //   }

  //   // Text
  //   ctx.fillStyle = '#333';
  //   ctx.font = '28px Arial';
  //   let x = 20;
  //   for (const char of captchaText) {
  //     ctx.fillText(char, x, 40 + (Math.random() * 10 - 5));
  //     x += 25;
  //   }

  //   const imageBase64 = canvas.toDataURL('image/png');

  //   return {
  //     captcha_image: imageBase64,
  //     captcha_token: token,
  //   };
  // }

// async login(
//   username: string,
//   password: string,
//   captcha: string,
//   captchaToken: string,
// ) {
//   try {
 
//     if (!username || !password) {
//       return {
//         status: 0,
//         message: 'Username and password are required',
//         error: 'Missing credentials',
//         data: null,
//       };
//     }

//     if (!captcha || !captchaToken) {
//       return {
//         status: 0,
//         message: 'CAPTCHA response and token are required',
//         error: 'CAPTCHA missing',
//         data: null,
//       };
//     }

//     /* ---------------- CAPTCHA VALIDATION ---------------- */

//     const decoded = JSON.parse(
//       Buffer.from(captchaToken, 'base64').toString('utf-8'),
//     );

//     if (!decoded?.captcha_text || !decoded?.expires_at) {
//       return {
//         status: 0,
//         message: 'Invalid CAPTCHA token',
//         error: 'Invalid CAPTCHA token',
//         data: null,
//       };
//     }

//     // expires_at is in SECONDS → convert Date.now()
//     const nowInSeconds = Math.floor(Date.now() / 1000);

//     if (nowInSeconds > decoded.expires_at) {
//       return {
//         status: 0,
//         message: 'CAPTCHA token has expired',
//         error: 'CAPTCHA expired',
//         data: null,
//       };
//     }

//     if (decoded.captcha_text !== captcha) {
//       return {
//         status: 0,
//         message: 'CAPTCHA validation failed',
//         error: 'CAPTCHA mismatch',
//         data: null,
//       };
//     }

//     const users = await this.dataSource.query(
//       `
//       SELECT id, password_hash, user_role
//       FROM user_login
//       WHERE username = ?
//         AND isactive = 1
//         AND user_role IN ('SA','AD')
//       LIMIT 1
//       `,
//       [username],
//     );

//     if (!users.length) {
//       return {
//         status: 0,
//         message: 'Invalid username or inactive user',
//         error: 'User not found',
//         data: null,
//       };
//     }

//     const user = users[0];

//     /* ---------------- PASSWORD CHECK ---------------- */

//     const isPasswordValid = await bcrypt.compare(
//       password,
//       user.password_hash,
//     );

//     if (!isPasswordValid) {
//       return {
//         status: 0,
//         message: 'Invalid password',
//         error: 'Password mismatch',
//         data: null,
//       };
//     }

//     /* ---------------- USER PROFILE ---------------- */

//     const userData = await this.dataSource.query(
//       `
//       SELECT u.id AS user_id,
//              e.id AS emp_id,
//              e.emp_no,
//              UPPER(CONCAT(e.fname,' ',e.mname,' ',e.lname)) AS name,
//              u.username,
//              u.user_role,
//              e.mobile,
//              e.email
//       FROM employee e
//       LEFT JOIN user_login u ON u.employee_id_fk = e.id
//       WHERE u.username = ?
//       LIMIT 1
//       `,
//       [username],
//     );

//     /* ---------------- JWT TOKEN ---------------- */

//     const token = jwt.sign(
//       {
//         id: user.id,
//         username,
//         user_role: user.user_role,
//         data: userData[0],
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '12h' },
//     );

//     return {
//       status: 1,
//       message: 'Login successful',
//       role: user.user_role,
//       token,
//       data: userData[0],
//     };
//   } catch (error) {
//     console.error('LOGIN ERROR:', error);

//     return {
//       status: 0,
//       message: 'There is an application error, please contact support team.',
//       error: error.message,
//       data: null,
//     };
//   }
// }

  async login(username: string, password: string) {
    try {
      /* ---------------- VALIDATION ---------------- */

      if (!username || !password) {
        return {
          status: 0,
          message: 'Username and password are required',
          error: 'Missing credentials',
          data: null,
        };
      }

      /* ---------------- USER FETCH ---------------- */

      const users = await this.dataSource.query(
        `
        SELECT id, password_hash, user_role
        FROM user_login
        WHERE username = ?
          AND isactive = 1
          AND user_role IN ('SA','AD')
        LIMIT 1
        `,
        [username],
      );

      if (!users.length) {
        return {
          status: 0,
          message: 'Invalid username or inactive user',
          error: 'User not found',
          data: null,
        };
      }

      const user = users[0];

      /* ---------------- PASSWORD CHECK ---------------- */

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash,
      );

      if (!isPasswordValid) {
        return {
          status: 0,
          message: 'Invalid password',
          error: 'Password mismatch',
          data: null,
        };
      }

      /* ---------------- USER PROFILE ---------------- */

      const userData = await this.dataSource.query(
        `
        SELECT u.id AS user_id,
               e.id AS emp_id,
               e.emp_no,
               UPPER(CONCAT(e.fname,' ',e.mname,' ',e.lname)) AS name,
               u.username,
               u.user_role,
               e.mobile,
               e.email
        FROM employee e
        LEFT JOIN user_login u ON u.employee_id_fk = e.id
        WHERE u.username = ?
        LIMIT 1
        `,
        [username],
      );

      /* ---------------- JWT TOKEN ---------------- */

      const token = jwt.sign(
        {
          id: user.id,
          username,
          user_role: user.user_role,
          data: userData[0],
        },
        process.env.JWT_SECRET,
        { expiresIn: '12h' },
      );

      return {
        status: 1,
        message: 'Login successful',
        role: user.user_role,
        token,
        data: userData[0],
      };
    } catch (error) {
      console.error('LOGIN ERROR:', error);

      return {
        status: 0,
        message: 'There is an application error, please contact support team.',
        error: error.message,
        data: null,
      };
    }
  }

  
async checkCredentials(username: string, emp_no: string, dob: string) {
    try {
      if (!username || !emp_no || !dob) {
        return {
          status: 0,
          message: 'Failed to check credentials',
          error: 'Please provide username, emp_no, and dob.',
          data: null,
        };
      }

      const result = await this.dataSource.query(
        `
        SELECT 
          u.username,
          e.emp_no,
          DATE_FORMAT(e.dob, '%Y-%m-%d') AS dob
        FROM user_login u
        JOIN employee e ON e.id = u.employee_id_fk
        WHERE u.username = ?
          AND e.emp_no = ?
          AND e.dob = ?
        LIMIT 1
        `,
        [username, emp_no, dob],
      );

   if (result.length !== 1) {
      return {
        status: 0,
        message: 'Not matched',
        error: 'Username, Employee No, or DOB not matched.',
        data: null,
      };
    }

    //  Fetch user entity
    const user = await this.userRepo.findOne({
      where: { username },
    });

    if (!user) {
      return {
        status: 0,
        message: 'User not found',
        error: 'No user associated with this username.',
        data: null,
      };
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');

    user.reset_token = token;
    user.reset_token_expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.userRepo.save(user);

      return {
            status: 1,
            message: 'Success.',
            error: null,
            data: {
              token
            },
    };


    } catch (error) {
      console.error('checkCredentials error:', error);
      return {
        status: 0,
        message: 'There is an application error.',
        error: error.message,
        data: null,
      };
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {

      if (dto.new_password !== dto.confirm_password) {

        return {
          status: 0,
          message: 'New Password and confirm password do not match',
          error: 'Passwords do not match',
          data: null,
        };
   }

    const user = await this.userRepo.findOne({
    where: {
      reset_token: dto.token,
      reset_token_expiry: MoreThan(new Date()),
    },
  });
     
     if (!user) {
        return {
          status: 0,
          message: 'Invalid or expired token',
          error: 'Invalid or expired token',
          data: null,
        };
      }

      // Hash password
       user.password_hash = await bcrypt.hash(dto.new_password, 10);
       user.reset_token = null;
       user.reset_token_expiry = null;

      await this.userRepo.save(user);

      return {
        status: 1,
        message: 'Password reset successfully',
        error: null,
        data: null,
      };
    } catch (error) {
      return {
        status: 0,
        message: 'There is an application error.',
        error: error.message,
        data: null,
      };
    }
  }

  async changePassword(dto: ChangePasswordDto) {
    const { user_id, old_password, new_password } = dto;

    try {
      // Fetch existing password
      const user = await this.userRepo.findOne({
      where: { id: Number(user_id) },
      select: ['id', 'password_hash'], // important for security
    });

    if (!user) {
        return {
          status: 0,
          message: 'Failed to change password.',
          error: 'Employee not found.',
          data: null,
        };
    }

    // Compare password
     const isMatch = await bcrypt.compare(old_password, user.password_hash);

      if (!isMatch) {
        return {
          status: 0,
          message: 'Old password did not match.',
          error: 'Old password did not match.',
          data: null,
        };
      }

      //  Hash new password
      user.password_hash = await bcrypt.hash(new_password, 10);

      await this.userRepo.save(user);

        return {
          status: 1,
          message: 'Password changed successfully.',
          error: null,
          data: null,
        };
      
    } catch (error) {
     
      return {
        status: 0,
        message: 'There is an application error.',
        error: error.message,
        data: null,
      };
    }
  }
}
