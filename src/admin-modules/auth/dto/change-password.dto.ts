import { IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'User id is required.' })
  user_id: string;

  @IsNotEmpty({ message: 'Please enter old password.' })
  @MaxLength(50, { message: 'Old password must be at most 50 characters long.' })
  @Matches(/^[a-zA-Z0-9@#$]+$/, {
    message:
      'Old password can only contain letters, numbers and special characters @, #, $.',
  })
  oldpassword: string;

  @IsNotEmpty({ message: 'Please enter new password.' })
  @MaxLength(50, { message: 'New password must be at most 50 characters long.' })
  @Matches(/^[a-zA-Z0-9@#$]+$/, {
    message:
      'New password can only contain letters, numbers and special characters @, #, $.',
  })
  newpassword: string;
}
