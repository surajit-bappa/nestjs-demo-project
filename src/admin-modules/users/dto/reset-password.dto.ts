import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ResetPasswordDto {
  @IsNumber({}, { message: 'User id must be a number' })
  @IsNotEmpty({ message: 'User id is mandatory' })
  @Type(() => Number)
  user_id: number;

  @IsString()
  @IsNotEmpty({ message: 'Password is mandatory' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Updated by is mandatory' })
  updated_by: string;
}
