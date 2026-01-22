import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigScreens } from '../screens/entities/screens.entity';

@Injectable()
export class ScreensService {
  constructor(
    @InjectRepository(ConfigScreens)
    private readonly screensRepo: Repository<ConfigScreens>,
    private readonly dataSource: DataSource,  
  ) {}

  async list() {
    try {
      const result = await this.dataSource.query(`
        SELECT
            cs1.id AS screen_id,
            cs1.parent_menu,
            cs1.sort_order,
            cs1.icon_menu,
            cs1.internal_routing,
            cs1.menu_name AS screen,
            cs1.routing_name,
            cs1.is_admin,
            cs1.created_by,
            cs1.created_at,
            cs1.updated_by,
            cs1.updated_at,
            cs2.menu_name AS parent_menu_name
        FROM config_screens cs1
        LEFT JOIN config_screens cs2 ON cs1.parent_menu = cs2.id
        GROUP BY cs1.id
      `);

      return {
        status: 1,
        message: 'Success',
        error: null,
        data: result,
      };
    } catch (error) {
      return {
        status: 0,
        message: 'Failed to get screen list',
        error: error.message,
        data: null,
      };
    }
  }

  async getParentScreens() {
  try {
    const result = await this.dataSource.query( `
      SELECT id, menu_name
      FROM config_screens
      WHERE parent_menu = 0
        AND routing_name = ''
      ORDER BY menu_name ASC
    `);
     return {
        status: 1,
        message: 'Success',
        error: null,
        data: result,
      };
    } catch (error) {
      return {
        status: 0,
        message: 'Failed to get parent screen list',
        error: error.message,
        data: null,
      };
    }

  }

  async add(body: any) {
    const {
      screen,
      routing_name,
      icon_menu,
      parent_screen,
      sortOrder,
      internalRouting,
      created_by,
    } = body;

    const requiredParams = [
        'screen',
        'parent_screen',
        'created_by',
      ];

      for (const param of requiredParams) {
        if (!body[param]) {
           return {
                  status: 0,
                  message: 'Failed to add screen',
                  error: `${param} is required`,
                  data: null,
                };
         }
          
      }

    // Check duplicate
    const duplicate = await this.dataSource.query(
      'SELECT menu_name FROM config_screens WHERE menu_name = ?',
      [screen],
    );

    if (duplicate.length > 0) {
      return {
        status: 0,
        message: 'This screen is already available',
        error: 'Duplicate screen entry',
        data: null,
      };
    }

    // Insert record
    const now = new Date();

    const insertResult: any = await this.dataSource.query(
      `INSERT INTO config_screens 
        (menu_name, routing_name, icon_menu, parent_menu, sort_order, internal_routing, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        screen,
        routing_name,
        icon_menu,
        parent_screen,
        parseInt(sortOrder) || 0,
        internalRouting,
        created_by,
        now,
      ],
    );

    const insertId = insertResult.insertId;

    return {
      status: 1,
      message: 'Screen added successfully',
      error: null,
      data: {
        screen_id: insertId,
      },
    };
  }

  async update(body: any) {
  const {
    screen_id,
    updated_by,
    screen,
    routing_name,
    icon_menu,
    parent_screen,
    sortOrder,
    internalRouting,
  } = body;


      const requiredParams = [
        'screen_id',
        'updated_by',
      ];

      for (const param of requiredParams) {
        if (!body[param]) {
           return {
                  status: 0,
                  message: 'Failed to update screen',
                  error: `${param} is required`,
                  data: null,
                };
         }
          
      }

  const update_datetime = new Date();

  try {
    const result: any = await this.dataSource.query(
      `
      UPDATE config_screens 
      SET 
        parent_menu = ?, 
        routing_name = ?, 
        menu_name = ?, 
        sort_order = ?, 
        internal_routing = ?, 
        icon_menu = ?, 
        updated_by = ?, 
        updated_at = ?
      WHERE id = ?
      `,
      [
        parent_screen,
        routing_name,
        screen,
        parseInt(sortOrder) || 0,
        internalRouting,
        icon_menu,
        updated_by,
        update_datetime,
        screen_id,
      ],
    );

    if (result.affectedRows > 0) {
      return {
        status: 1,
        message: 'Screen updated successfully',
        error: null,
        data: result.affectedRows,
      };
    }

    return {
      status: 0,
      message: 'Failed to update screen',
      error: 'Failed to update screen',
      data: null,
    };
  } catch (error) {
    return {
      status: 0,
      message: 'Failed to update screen',
      error: error.message,
      data: null,
    };
  }
}

async delete(body: any) {
  const { screen_id } = body;
  
  if (!screen_id) {
    return {
      status: 0,
      message: 'Failed to delete screen',
      error: 'screen_id is mandatory',
      data: null,
    };
  }

  try {
    // Delete screen
    const deleteScreenResult: any = await this.dataSource.query(
      `DELETE FROM config_screens WHERE id = ?`,
      [screen_id],
    );

    if (deleteScreenResult.affectedRows > 0) {
      // Delete role mapping
      const deleteMappingResult: any = await this.dataSource.query(
        `DELETE FROM config_role_mapping WHERE screen_id_fk = ?`,
        [screen_id],
      );

      return {
        status: 1,
        message: 'Screen deleted successfully',
        error: null,
        data: deleteMappingResult.affectedRows,
      };
    }

    return {
      status: 0,
      message: 'Failed to delete screen',
      error: 'Delete operation failed',
      data: null,
    };
  } catch (error) {
    return {
      status: 0,
      message: 'Failed to delete screen',
      error: error.message,
      data: null,
    };
  }
}

}
