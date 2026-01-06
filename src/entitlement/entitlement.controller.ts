// entitlement.controller.ts
import { Controller, Get, Post, Body, Query, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { EntitlementService } from './entitlement.service';

@Controller('entitlement')
export class EntitlementController {
  constructor(private readonly entitlementService: EntitlementService) {}

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
}
