import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module'; // your user module
import { ScreensModule } from './screens/screens.module';
import { EmployeeModule } from './employee/employee.module';
import { EntitlementModule } from './entitlement/entitlement.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '103.160.107.147',      // same as phpMyAdmin
      port: 3306,
      username: 'cvsbfsjv_test_usr',       // your MySQL username
      password: 'TestPasword1@',           // your MySQL password
      database: 'cvsbfsjv_test_nodejs', // your DB name
      entities: [__dirname + '/**/*.entity.{js,ts}'],       // include all your entities here
      synchronize: false,      // auto create tables (only for dev)
    }),

    UsersModule,
    ScreensModule, 
    EmployeeModule,
    EntitlementModule
  ],
})
export class AppModule {}
