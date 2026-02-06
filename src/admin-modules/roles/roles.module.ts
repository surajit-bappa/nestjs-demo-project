import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Roles } from './entities/roles.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([Roles]), 
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
