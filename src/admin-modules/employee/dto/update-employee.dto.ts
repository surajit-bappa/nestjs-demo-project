import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  employee_id: string;

  @IsNotEmpty()
  @IsString()
  emp_no: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Matches(/^\d{10}$/, {
    message: 'Mobile number must be exactly 10 digits',
  })
  mobile: string;

  @Matches(/^[A-Z][a-zA-Z]*$/, {
    message: 'First name must start with capital letter',
  })
  fname: string;

  @IsOptional()
  @IsString()
  mname?: string;

  @Matches(/^[A-Z][a-zA-Z]*$/, {
    message: 'Last name must start with capital letter',
  })
  lname: string;

  @IsNotEmpty()
  @IsString()
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

  @IsNotEmpty()
  @IsString()
  updated_by: string;
}
