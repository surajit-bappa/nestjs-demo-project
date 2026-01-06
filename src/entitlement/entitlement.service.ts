// entitlement.service.ts
import { Injectable,  BadRequestException, InternalServerErrorException, } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EntitlementService {
  constructor(private readonly dataSource: DataSource) {}

  async list(role?: string, screenId?: number) {
    try {
      let sql = `
        SELECT 
          cs.id AS screen_id,
          cs.parent_menu,
          cs.sort_order,
          cs.icon_menu,
          cs.internal_routing,
          crm.id AS role_map_id,
          crm.is_view,
          crm.is_edit,
          cs.menu_name AS screen,
          crm.created_by,
          crm.created_at,
          crm.updated_by,
          crm.updated_at,
          cs.routing_name,
          cr.rolecode AS role_code,
          cr.rolename AS role_name
        FROM config_role_mapping crm
        LEFT JOIN config_screens cs 
          ON cs.id = crm.screen_id_fk
        LEFT JOIN config_role cr 
          ON cr.rolecode = crm.role
        WHERE cs.routing_name != 'ModuleEntitlement'
      `;

      const params: any[] = [];

      if (role) {
        sql += ` AND cr.rolecode = ?`;
        params.push(role);
      }

      if (screenId) {
        sql += ` AND cs.id = ?`;
        params.push(screenId);
      }

      sql += ` GROUP BY crm.id, cr.rolecode`;

      return await this.dataSource.query(sql, params);
    } catch (error) {
      console.error('Entitlement Filter Error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async add(body: any) {
    try {
      const requiredParams = [
        'role_data',
        'screen_id',
        'is_view',
        'is_edit',
        'created_by',
      ];

      for (const param of requiredParams) {
        if (!body[param]) {
          throw new BadRequestException(`${param} is required`);
        }
      }

      const roles = JSON.parse(body.role_data); // [{ value: 'SA' }]
      const screenIds = JSON.parse(body.screen_id); // [1,2,3]

      const isView = body.is_view;
      const isEdit = body.is_edit;
      const created_by = body.created_by;
      const createdAt = new Date();

      const responseData: any[] = [];
      let overallStatus = true;

      for (const role of roles) {
        for (const screenId of screenIds) {
          // 🔎 Check existing role
          const existing = await this.dataSource.query(
            `
            SELECT id FROM config_role_mapping
            WHERE role = ? AND screen_id_fk = ?
            LIMIT 1
            `,
            [role.value.trim(), screenId],
          );

          if (existing.length > 0) {
            responseData.push({
              role: role.value,
              screen_id: screenId,
              status: 0,
              message: 'Role already exists.',
            });
            overallStatus = false;
            continue;
          }

          // ➕ Insert new mapping
          const insertResult = await this.dataSource.query(
            `
            INSERT INTO config_role_mapping
            (role, screen_id_fk, is_view, is_edit, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              role.value.trim(),
              screenId,
              isView,
              isEdit,
              created_by,
              createdAt,
            ],
          );

          if (insertResult.affectedRows > 0) {
            responseData.push({
              role: role.value,
              screen_id: screenId,
              status: 1,
              message: 'Success',
            });
          } else {
            responseData.push({
              role: role.value,
              screen_id: screenId,
              status: 0,
              message: 'Failed to add role data',
            });
            overallStatus = false;
          }
        }
      }

      return {
        status: 1,
        message: overallStatus
          ? 'Entitlement successfully added'
          : 'Some roles failed to add',
        error: overallStatus ? null : 'Some roles failed to add',
        data: responseData,
      };
    } catch (error) {
      console.error('Add Entitlement Error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
