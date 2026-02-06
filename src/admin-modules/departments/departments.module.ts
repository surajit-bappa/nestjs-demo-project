import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Departments } from '../departments/entities/department.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Departments])], 
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}

