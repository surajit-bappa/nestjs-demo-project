import { IsNotEmpty, IsString , IsNumber, Matches, MaxLength} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoleDto {

  @IsString()
  @MaxLength(5)
  @Matches(/^[A-Z]+$/, {
    message: 'Code must be uppercase letters only',
  })
  rolecode: string;

  @IsString()
  @MaxLength(50)
  rolename: string;

  @Type(() => Number)
  @IsNumber()
  status: number;

  @IsString()
  @IsNotEmpty({ message: 'Created by is mandatory' })
  created_by: string;
}
