import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  emp_no: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'Mobile number must be exactly 10 digits',
  })
  mobile: string;

  @IsString()
  @Matches(/^[A-Z][a-zA-Z]*$/, {
    message: 'First name must start with capital letter',
  })
  fname: string;

  @IsOptional()
  @IsString()
  mname?: string;

  @IsString()
  @Matches(/^[A-Z][a-zA-Z]*$/, {
    message: 'Last name must start with capital letter',
  })
  lname: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsDateString()
  dob: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsString()
  @IsNotEmpty()
  created_by: string;

  @IsString()
  @IsNotEmpty()
  user_role: string;
}
