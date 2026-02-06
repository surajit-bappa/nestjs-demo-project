import { IsNotEmpty, IsString , IsNumber, Matches, MaxLength} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepartmentDto {

  @IsString()
  @MaxLength(5)
  @Matches(/^[A-Z]+$/, {
    message: 'Code must be uppercase letters only',
  })
  code: string;

  @IsString()
  @MaxLength(50)
  value: string;

  @Type(() => Number)
  @IsNumber()
  status: number;

  @IsString()
  @IsNotEmpty({ message: 'Created by is mandatory' })
  created_by: string;
}
