import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { PASSWORD_POLICY, PASSWORD_POLICY_MESSAGE } from "../password-policy";

export class RegisterStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  institutionName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  course!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  year!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  rollNumber!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  contactNumber!: string;

  @IsUrl({ require_protocol: true })
  @MaxLength(240)
  githubProfile!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  @Matches(PASSWORD_POLICY, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}
