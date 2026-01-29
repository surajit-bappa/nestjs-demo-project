import {  IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
 @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required.' })
  @MinLength(5, { message: 'New password must be at least 5 characters.' })
  @MaxLength(10, { message: 'New password must not exceed 10 characters.' })
  new_password: string;

 @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  @MinLength(5, { message: 'Confirm password must be at least 5 characters.' })
  @MaxLength(10, { message: 'New password must not exceed 10 characters.' })
  confirm_password: string;
}
