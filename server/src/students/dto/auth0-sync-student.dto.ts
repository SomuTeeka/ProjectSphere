import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class Auth0SyncStudentDto {
  @IsString()
  @MaxLength(240)
  auth0Sub!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  picture?: string;
}
