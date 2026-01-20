import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(private readonly dataSource: DataSource) {}

  async getRoleList(userRole?: string) {
    let sql = `
      SELECT rolename, rolecode
      FROM config_role
      WHERE status = 1
    `;

    if (userRole === 'AD') {
      sql += ` AND rolecode != 'SA'`;
    }

    return this.dataSource.query(sql);
  }
}
