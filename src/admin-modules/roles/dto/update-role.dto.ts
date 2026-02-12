import {
  IsNumber,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRoleDto {
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsString()
  @MaxLength(5)
  @Matches(/^[A-Z]+$/, {
    message: 'Code must be in uppercase letters only',
  })
  rolecode: string;

  @IsString()
  @MaxLength(50)
  rolename: string;

  @IsString()
  @MaxLength(20)
  updated_by: string;

  @Type(() => Number)
  @IsNumber()
  status: number;
}
