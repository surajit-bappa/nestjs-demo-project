import { IsNotEmpty, IsString , IsNumber, Matches, MaxLength} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDesignationDto {

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
