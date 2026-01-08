import { Controller, Get, Post, Body, Query, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}


  @Get('name-list')
  async employeeNameList() {
    const result = await this.employeeService.nameList();

    if (result && result.length > 0) {
      return {
        status: 1,
        message: 'Success',
        error: null,
        data: result,
      };
    }

    return {
      status: 0,
      message: 'Failed to get employee name list',
      error: 'Failed to retrieve employee name list',
      data: null,
    };
  }

  @Post('generate-employee-no')
  async generateEmployeeNo(@Body('logedInEmpNo') logedInEmpNo: string) {
    return this.employeeService.generateEmployeeNo(logedInEmpNo);
  }

  @Get('list')
  async getEmployees(
    @Query('status') status?: string,
    @Query('emp_no') emp_no?: string,
  ) {
    const result = await this.employeeService.list(status, emp_no);

    if (result.length > 0) {
      return {
        status: 1,
        message: 'Success',
        error: null,
        data: { result },
      };
    }

    return {
      status: 0,
      message: 'Employee record not found',
      error: 'No data found.',
      data: null,
    };
  }

@Post('add')
  @UseInterceptors(AnyFilesInterceptor()) 
  async addEmployee(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.add(dto);
  }

  @Post('update')
  @UseInterceptors(AnyFilesInterceptor()) 
  async updateEmployee(@Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(dto);
  }

  @Post('change-status')
    @UseInterceptors(AnyFilesInterceptor()) 
    async changeEmployeeStatus(@Body() body: any) {
      return this.employeeService.changeStatus(body);
  }

}
