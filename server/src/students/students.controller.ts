import { Body, Controller, Post } from "@nestjs/common";
import { LoginStudentDto } from "./dto/login-student.dto";
import { RegisterStudentDto } from "./dto/register-student.dto";
import { StudentsService } from "./students.service";

@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post("register")
  register(@Body() dto: RegisterStudentDto) {
    return this.studentsService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginStudentDto) {
    return this.studentsService.login(dto);
  }
}
