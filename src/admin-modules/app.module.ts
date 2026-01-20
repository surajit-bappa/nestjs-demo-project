import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module'; 
import { ScreensModule } from './screens/screens.module';
import { RolesModule } from './roles/roles.module';
import { EmployeeModule } from './employee/employee.module';
import { EntitlementModule } from './entitlement/entitlement.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [__dirname + '/**/*.entity.{js,ts}'],
    synchronize: false,
    logging: true,
  }),
    UsersModule,
    ScreensModule, 
    RolesModule,
    EmployeeModule,
    EntitlementModule,
    AuthModule
  ],
})
export class AppModule {}
