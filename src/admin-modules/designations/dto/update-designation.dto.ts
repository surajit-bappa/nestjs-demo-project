import {
  IsNumber,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDesignationDto {
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsString()
  @MaxLength(50)
  value: string;

  @IsString()
  @MaxLength(20)
  updated_by: string;

  @Type(() => Number)
  @IsNumber()
  status: number;
}
