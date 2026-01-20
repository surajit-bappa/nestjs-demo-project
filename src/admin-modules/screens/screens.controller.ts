import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ScreensService } from './screens.service';

@Controller('screens')
export class ScreensController {
  constructor(private readonly screensService: ScreensService) {}

  @Get('list')
  async getScreens() {
    return this.screensService.list();
  }

  @Get('parent-list')
  async getParentScreenList() {

    return this.screensService.getParentScreens();
  }

@Post('add')
  @UseInterceptors(FileFieldsInterceptor([]))  
  async addScreen(@Body() body: any) {
    return this.screensService.add(body);
  }

@Post('update')
@UseInterceptors(FileFieldsInterceptor([]))  
async updateScreen(@Body() body: any) {
  return this.screensService.update(body);
}

@Post('delete')
@UseInterceptors(FileFieldsInterceptor([]))  
async deleteScreen(@Body() body: any) {
  return this.screensService.delete(body);
}


}
