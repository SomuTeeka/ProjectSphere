import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { LoginStudentDto } from "./dto/login-student.dto";
import { RegisterStudentDto } from "./dto/register-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { Auth0SyncStudentDto } from "./dto/auth0-sync-student.dto";
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

  @Post("auth0-sync")
  auth0Sync(@Body() dto: Auth0SyncStudentDto) {
    return this.studentsService.auth0Sync(dto);
  }

  @Get("search")
  search(
    @Query("q") query?: string,
    @Query("college") college?: string,
    @Query("department") department?: string,
    @Query("degree") degree?: string,
    @Query("skills") skills?: string,
  ) {
    return this.studentsService.search({
      query,
      college,
      department,
      degree,
      skills,
    });
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.studentsService.detail(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }
}
