// entitlement.controller.ts
import { Controller, Get, Post, Body, Query, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { EntitlementService } from './entitlement.service';

@Controller('entitlement')
export class EntitlementController {
  constructor(private readonly entitlementService: EntitlementService) {}

  @Get('left-menu')
  async leftMenuList(@Query('user_role') userRole: string) {
    return this.entitlementService.leftMenuList(userRole);
  }

  @Get('admin-menu')
  async adminMenuList(@Query('user_role') userRole: string) {
    return this.entitlementService.adminMenuList(userRole);
  }

   @Get('screens')
  async getModuleEntitlementScreens() {
    const result = await this.entitlementService.getScreenList();

    return {
      status: 1,
      message: 'Success',
      error: null,
      data: result,
    };
  }

  @Get('list')
  async getEntitlement(
    @Query('role') role?: string,
    @Query('screen_id') screenId?: number,
  ) {
    const result = await this.entitlementService.list(role, screenId);

    if (result.length) {
      return {
        status: 1,
        message: 'Success',
        error: null,
        data: result,
      };
    }

    return {
      status: 0,
      message: 'Failed to fetch data',
      error: 'Failed to fetch data',
      data: null,
    };
  }

 @Post('add')
  @UseInterceptors(AnyFilesInterceptor())
  async addEntitlement(@Body() body: any) {
     console.log('FORM BODY:', body); 
    return await this.entitlementService.add(body);
  }

  @Post('update')
  @UseInterceptors(AnyFilesInterceptor()) 
  async updateEntitlement(@Body() body: any) {
    return this.entitlementService.update(body);
  }

  @Post('delete')
  @UseInterceptors(AnyFilesInterceptor()) 
  async deleteEntitlement(@Body() body: any) {
    return this.entitlementService.delete(body);
  }

}
