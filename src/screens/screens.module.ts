
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigScreens } from './screens.entity';
import { ScreensService } from './screens.service';
import { ScreensController } from './screens.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigScreens])],
  controllers: [ScreensController],
  providers: [ScreensService],
})
export class ScreensModule {}


