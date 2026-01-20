import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

  // ✅ FIRST NAME
  @Transform(({ value }) =>
    value?.trim().replace(/\s+/g, ' ')
  )
  @IsString()
  @Matches(/^[A-Z][a-zA-Z ]*$/, {
    message: 'First name must start with capital letter',
  })
  fname: string;

  // ✅ MIDDLE NAME (optional)
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
  @IsString()
  @Matches(/^[A-Z][a-zA-Z ]*$/, {
    message: 'Last name must start with capital letter',
  })
  lname: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
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

}
