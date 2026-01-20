import { Injectable } from '@nestjs/common';
//import { createCanvas } from 'canvas';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';


@Injectable()
export class AuthService {
    constructor(
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


}
