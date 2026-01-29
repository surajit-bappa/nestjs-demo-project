import { IsNotEmpty, MinLength, IsString, MaxLength  } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'User id is required.' })
  user_id: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter old password.' })
  old_password: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter new password.' })
  @MinLength(5, { message: 'New password must be at least 5 characters.' })
  @MaxLength(10, { message: 'New password must not exceed 10 characters.' })
  new_password: string;
}
