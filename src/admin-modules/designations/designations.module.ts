import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesignationsController } from './designations.controller';
import { DesignationsService } from './designations.service';
import { Designations } from '../designations/entities/designation.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Designations])], 
  controllers: [DesignationsController],
  providers: [DesignationsService],
})
export class DesignationsModule {}

