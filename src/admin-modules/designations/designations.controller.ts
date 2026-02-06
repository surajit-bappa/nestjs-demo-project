import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { DesignationsService } from './designations.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';

@Controller('designations')
export class DesignationsController {
  constructor(private readonly designationservice: DesignationsService) {}


@Get('list')
async getDesignations() {
  const designation = await this.designationservice.list();

  if (designation.length > 0) {
      return {
        status: 1,
        message: 'Designation list retrieved successfully',
        error: null,
        data: designation,
      };
    }

    return {
      status: 0,
      message: 'No designation list found',
      error: 'No data found',
      data: null,
    };
  }

  @Post('add')
  @UseInterceptors(AnyFilesInterceptor())  
  async addDesignation(@Body() dto: CreateDesignationDto) {
    return this.designationservice.add(dto);
  }

  @Post('update')
    @UseInterceptors(AnyFilesInterceptor())  
  async updateDesignation(@Body() dto: UpdateDesignationDto) {
    return this.designationservice.update(dto);
  }

  @Post('delete')
  @UseInterceptors(AnyFilesInterceptor())  
  async deleteDesignation(@Body() body: any) {
    const { id } = body;
    return this.designationservice.delete(id);
  }

}
