import { IsNotEmpty, IsString , IsNumber} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {

 @IsNumber({}, { message: 'Employee id must be a number' })
  @IsNotEmpty({ message: 'Employee id is mandatory' })
  @Type(() => Number)
  employee_id_fk: number;

  @IsString()
  @IsNotEmpty({ message: 'Username is mandatory' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is mandatory' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Role is mandatory' })
  role: string;


  @IsString()
  @IsNotEmpty({ message: 'Created by is mandatory' })
  created_by: string;
}
