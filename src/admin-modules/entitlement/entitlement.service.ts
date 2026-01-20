// entitlement.service.ts
import { Injectable,  BadRequestException, InternalServerErrorException, } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EntitlementService {
  constructor(private readonly dataSource: DataSource) {}

  async leftMenuList(userRole: string) {
    try {
      if (!userRole) {
        throw new BadRequestException('user_role is required');
      }

      // Parent menus
      const parents = await this.dataSource.query(
        `
        SELECT 
          cs.menu_name AS description,
          cs.routing_name,
          cs.internal_routing,
          cs.icon_menu,
          crm.role,
          crm.screen_id_fk,
          (
            SELECT COUNT(*) 
            FROM config_screens cfc 
            WHERE cfc.parent_menu = cs.id
          ) AS children_count,
          '' AS childrens,
          crm.is_view,
          crm.is_edit
        FROM config_role_mapping crm
        LEFT JOIN config_screens cs 
          ON cs.id = crm.screen_id_fk
        WHERE crm.role = ?
          AND cs.parent_menu = 0
          AND cs.is_admin = 0
          AND crm.is_view = 1
        ORDER BY cs.sort_order
        `,
        [userRole],
      );

      // Fetch children per parent
      for (const parent of parents) {
        if (parent.children_count > 0) {
          const children = await this.dataSource.query(
            `
            SELECT 
              cs.menu_name AS description,
              cs.routing_name,
              cs.internal_routing,
              cs.icon_menu,
              crm.role,
              crm.screen_id_fk,
              crm.is_edit
            FROM config_role_mapping crm
            LEFT JOIN config_screens cs 
              ON cs.id = crm.screen_id_fk
            WHERE crm.role = ?
              AND cs.parent_menu = ?
              AND crm.is_view = 1
            ORDER BY cs.sort_order
            `,
            [userRole, parent.screen_id_fk],
          );

          parent.childrens = children;
        }
      }

      return {
        status: 1,
        message: 'Success',
        error: null,
        data: parents,
      };
    } catch (error) {
      console.error('leftMenuList Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch left menu list',
      );
    }
  }

  async adminMenuList(userRole: string) {
    try {
      if (!userRole) {
        throw new BadRequestException('user_role is required');
      }

      // 🔹 Parent admin menus
      const parents = await this.dataSource.query(
        `
        SELECT 
          cs.menu_name AS description,
          cs.routing_name,
          cs.internal_routing,
          cs.icon_menu,
          crm.role,
          crm.screen_id_fk,
          (
            SELECT COUNT(*) 
            FROM config_screens cfc 
            WHERE cfc.parent_menu = cs.id
          ) AS children_count,
          '' AS childrens,
          crm.is_view,
          crm.is_edit
        FROM config_role_mapping crm
        LEFT JOIN config_screens cs 
          ON cs.id = crm.screen_id_fk
        WHERE crm.role = ?
          AND cs.parent_menu = 0
          AND cs.is_admin = 1
          AND crm.is_view = 1
        ORDER BY cs.sort_order
        `,
        [userRole],
      );

      // 🔹 Load children menus
      for (const parent of parents) {
        if (parent.children_count > 0) {
          const children = await this.dataSource.query(
            `
            SELECT 
              cs.menu_name AS description,
              cs.routing_name,
              cs.internal_routing,
              cs.icon_menu,
              crm.role,
              crm.screen_id_fk,
              crm.is_edit
            FROM config_role_mapping crm
            LEFT JOIN config_screens cs 
              ON cs.id = crm.screen_id_fk
            WHERE crm.role = ?
              AND cs.parent_menu = ?
              AND crm.is_view = 1
            ORDER BY cs.sort_order
            `,
            [userRole, parent.screen_id_fk],
          );

          parent.childrens = children;
        }
      }

      return {
        status: 1,
        message: 'Success',
        error: null,
        data: parents,
      };
    } catch (error) {
      console.error('adminMenuList Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch admin menu list',
      );
    }
  }

  async getScreenList() {
    const query = `
      SELECT DISTINCT cs.*
      FROM config_screens cs
      LEFT JOIN config_role_mapping crm
        ON cs.id = crm.screen_id_fk
      ORDER BY cs.menu_name
    `;

    return this.dataSource.query(query);
  }

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

    async update(body: any) {
    try {
      const requiredParams = [
        'role_data',
        'screen_id',
        'is_view',
        'is_edit',
        'updated_by',
      ];

      for (const param of requiredParams) {
        if (!body[param]) {
          throw new BadRequestException(`${param} is required`);
        }
      }

      const screenId = body.screen_id;
      const isView = body.is_view;
      const isEdit = body.is_edit;
      const updated_by = body.updated_by;
      const datetime = new Date();

      // Decode role_data
      let decodedData: any;
      try {
        decodedData = JSON.parse(body.role_data);
      } catch {
        return {
          status: 0,
          message: 'Failed to update role data',
          error:
            'Invalid role_data format. Expected object with value property or array of objects.',
          data: null,
        };
      }

      let roles: any[] = [];

      // Single role object
      if (decodedData?.value) {
        roles = [decodedData];
      }
      // Array of roles
      else if (Array.isArray(decodedData)) {
        roles = decodedData;
      } else {
        return {
          status: 0,
          message: 'Failed to update role data',
          error:
            'Invalid role_data format. Expected object with value property or array of objects.',
          data: null,
        };
      }

      const responseData: any[] = [];
      let overallStatus = 1;

      for (const role of roles) {
        if (!role.value) {
          responseData.push({
            role: '',
            status: 0,
            message: 'Role missing value property',
          });
          overallStatus = 0;
          continue;
        }

        const roleValue = role.value.trim();

        // Check existing mapping
        const existing = await this.dataSource.query(
          `
          SELECT id FROM config_role_mapping
          WHERE screen_id_fk = ? AND role = ?
          LIMIT 1
          `,
          [screenId, roleValue],
        );

        // Update
        if (existing.length > 0) {
          const updateResult = await this.dataSource.query(
            `
            UPDATE config_role_mapping
            SET
              is_edit = ?,
              is_view = ?,
              updated_by = ?,
              updated_at = ?
            WHERE screen_id_fk = ? AND role = ?
            `,
            [
              isEdit,
              isView,
              updated_by,
              datetime,
              screenId,
              roleValue,
            ],
          );

          if (updateResult.affectedRows > 0) {
            responseData.push({
              role: roleValue,
              status: 1,
              message: 'Role updated successfully',
            });
          } else {
            responseData.push({
              role: roleValue,
              status: 0,
              message: 'No changes made to role data',
            });
            overallStatus = 0;
          }
        }
        // Insert
        else {
          const insertResult = await this.dataSource.query(
            `
            INSERT INTO config_role_mapping
            (role, screen_id_fk, created_by, created_at, is_edit, is_view)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              roleValue,
              screenId,
              updated_by,
              datetime,
              isEdit,
              isView,
            ],
          );

          if (insertResult.affectedRows > 0) {
            responseData.push({
              role: roleValue,
              status: 1,
              message: 'Role inserted successfully',
            });
          } else {
            responseData.push({
              role: roleValue,
              status: 0,
              message: 'Failed to insert role data',
            });
            overallStatus = 0;
          }
        }
      }

      return {
        status: overallStatus,
        message:
          overallStatus === 1
            ? 'Entitlement successfully updated'
            : 'Some roles failed to update',
        error: overallStatus === 1 ? null : 'Some roles failed to update',
        data: responseData,
      };
    } catch (error) {
      console.error('Entitlement.update Error:', error);
      throw new InternalServerErrorException(
        'An error occurred while updating entitlement.',
      );
    }
  }

  async delete(body: any) {
    try {
      if (!body.id) {
        throw new BadRequestException('id is required');
      }

      const id = body.id;

      // Verify entitlement record
      const verify = await this.dataSource.query(
        `
        SELECT id, role, screen_id_fk
        FROM config_role_mapping
        WHERE id = ?
        `,
        [id],
      );

      if (!verify.length) {
        return {
          status: 0,
          message: 'Entitlement not found',
          error: 'No record found with the provided id and organization_id.',
          data: null,
        };
      }

      const record = verify[0];

      // Fetch screen details
      const screenResult = await this.dataSource.query(
        `
        SELECT id, menu_name, routing_name
        FROM config_screens
        WHERE id = ?
        `,
        [record.screen_id_fk],
      );

      const screenName = screenResult.length
        ? String(screenResult[0].menu_name).trim()
        : '';

      // Protected screens
      const protectedScreens = [
        'User Management',
        'Module Entitlements',
        'Module Config',
      ];

      if (
        String(record.role).toUpperCase() === 'SA' &&
        protectedScreens.includes(screenName)
      ) {
        return {
          status: 0,
          message:
            'System Admin entitlement cannot be deleted for protected screens.',
          error: `Role SA is protected from deletion for screen: ${screenName}.`,
          data: null,
        };
      }

      //  Delete entitlement
      const deleteResult = await this.dataSource.query(
        `
        DELETE FROM config_role_mapping WHERE id = ?
        `,
        [id],
      );

      if (deleteResult.affectedRows > 0) {
        return {
          status: 1,
          message: 'Entitlement deleted successfully.',
          error: null,
          data: {
            deleted_id: id,
          },
        };
      }

      return {
        status: 0,
        message: 'Failed to delete entitlement.',
        error: 'Database error occurred during deletion.',
        data: null,
      };
    } catch (error) {
      console.error('Entitlement.delete Error:', error);
      throw new InternalServerErrorException(
        'An error occurred while deleting entitlement.',
      );
    }
  }
}
