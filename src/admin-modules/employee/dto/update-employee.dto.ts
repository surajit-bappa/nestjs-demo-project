import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEmployeeDto {

  @IsNotEmpty()
  @IsString()
  employee_id: string;

  @IsNotEmpty()
  @IsString()
  emp_no: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @Matches(/^\d{10}$/, {
    message: 'Mobile number must be exactly 10 digits',
  })
  mobile: string;

  // ✅ FIRST NAME
  @Transform(({ value }) =>
    value?.trim().replace(/\s+/g, ' ')
  )
  @Matches(/^[A-Z][a-zA-Z ]*$/, {
    message: 'First name must start with capital letter',
  })
  fname: string;

  // ✅ MIDDLE NAME
  @Transform(({ value }) =>
    value?.trim().replace(/\s+/g, ' ')
  )
  @IsOptional()
  @IsString()
  mname?: string;

  // ✅ LAST NAME
  @Transform(({ value }) =>
    value?.trim().replace(/\s+/g, ' ')
  )
  @Matches(/^[A-Z][a-zA-Z ]*$/, {
    message: 'Last name must start with capital letter',
  })
  lname: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  @IsString()
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
