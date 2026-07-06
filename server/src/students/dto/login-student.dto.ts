import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginStudentDto {
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  password!: string;
}
