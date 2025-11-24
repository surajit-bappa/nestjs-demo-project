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

@Post('add')
  @UseInterceptors(FileFieldsInterceptor([]))  
  async addScreen(@Body() body: any) {
    console.log("ADD BODY =", body);
    return this.screensService.addScreen(body);
  }

@Post('update')
@UseInterceptors(FileFieldsInterceptor([]))  
async update(@Body() body: any) {
  console.log("UPDATE BODY =", body);
  return this.screensService.updateScreen(body);
}

@Post('delete')
@UseInterceptors(FileFieldsInterceptor([]))   // allows form-data
async deleteScreen(@Body() body: any) {
  return this.screensService.deleteScreen(body);
}


}
