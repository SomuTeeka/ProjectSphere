import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { DatabaseService } from "../database/database.service";
import { LoginStudentDto } from "./dto/login-student.dto";
import { RegisterStudentDto } from "./dto/register-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

type StudentRow = {
  id: string;
  name: string;
  username: string | null;
  institution_name: string;
  course: string;
  year: string;
  roll_number: string;
  email: string;
  contact_number: string;
  github_profile: string;
  skills: string[];
  department: string | null;
  degree: string | null;
  password_hash: string;
  created_at: Date;
};

type StudentSearchRow = StudentRow & {
  project_titles: string[];
  project_count: string;
};

type StudentSearchFilters = {
  query?: string;
  college?: string;
  department?: string;
  degree?: string;
  skills?: string;
};

@Injectable()
export class StudentsService {
  constructor(private readonly database: DatabaseService) {}

  async register(dto: RegisterStudentDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Password and confirm password do not match.");
    }

    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const result = await this.database.query<StudentRow>(
        `
          INSERT INTO students (
            name,
            username,
            institution_name,
            course,
            year,
            roll_number,
            email,
            contact_number,
            github_profile,
            skills,
            department,
            degree,
            password_hash
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13)
          RETURNING id, name, username, institution_name, course, year, roll_number, email, contact_number, github_profile, skills, department, degree, password_hash, created_at;
        `,
        [
          dto.name.trim(),
          normalizeUsername(dto.username, email),
          dto.institutionName.trim(),
          dto.course.trim(),
          dto.year.trim(),
          dto.rollNumber.trim(),
          email,
          dto.contactNumber.trim(),
          dto.githubProfile.trim(),
          JSON.stringify(normalizeStrings(dto.skills ?? [])),
          dto.department?.trim() || dto.course.trim(),
          dto.degree?.trim() || dto.course.trim(),
          passwordHash,
        ],
      );

      return {
        message: "Registration details stored successfully.",
        student: this.toPublicStudent(result.rows[0]),
      };
    } catch (error) {
      if (isPostgresError(error) && error.code === "23505") {
        throw new ConflictException("A student with this email already exists.");
      }

      throw error;
    }
  }

  async login(dto: LoginStudentDto) {
    const email = dto.email.trim().toLowerCase();
    const result = await this.database.query<StudentRow>(
      `
        SELECT id, name, institution_name, course, year, roll_number, email, contact_number, github_profile, password_hash, created_at
        , username, skills, department, degree
        FROM students
        WHERE email = $1
        LIMIT 1;
      `,
      [email],
    );

    const student = result.rows[0];

    if (!student) {
      throw new UnauthorizedException("Invalid username/password");
    }

    const passwordMatches = await bcrypt.compare(dto.password, student.password_hash);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid username/password");
    }

    return {
      message: "Login successful.",
      student: this.toPublicStudent(student),
    };
  }

  async detail(id: string) {
    const student = await this.findStudent(id);

    return {
      student: this.toPublicStudent(student),
    };
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.findStudent(id);

    const email = dto.email?.trim().toLowerCase();

    try {
      const result = await this.database.query<StudentRow>(
        `
          UPDATE students
          SET
            name = COALESCE($1, name),
            username = COALESCE($2, username),
            institution_name = COALESCE($3, institution_name),
            course = COALESCE($4, course),
            year = COALESCE($5, year),
            roll_number = COALESCE($6, roll_number),
            email = COALESCE($7, email),
            contact_number = COALESCE($8, contact_number),
            github_profile = COALESCE($9, github_profile),
            skills = COALESCE($10::jsonb, skills),
            department = COALESCE($11, department),
            degree = COALESCE($12, degree),
            updated_at = NOW()
          WHERE id = $13
          RETURNING id, name, username, institution_name, course, year, roll_number, email, contact_number, github_profile, skills, department, degree, password_hash, created_at;
        `,
        [
          dto.name?.trim(),
          dto.username?.trim(),
          dto.institutionName?.trim(),
          dto.course?.trim(),
          dto.year?.trim(),
          dto.rollNumber?.trim(),
          email,
          dto.contactNumber?.trim(),
          dto.githubProfile?.trim(),
          dto.skills ? JSON.stringify(normalizeStrings(dto.skills)) : null,
          dto.department?.trim(),
          dto.degree?.trim(),
          id,
        ],
      );

      return {
        message: "Profile updated successfully.",
        student: this.toPublicStudent(result.rows[0]),
      };
    } catch (error) {
      if (isPostgresError(error) && error.code === "23505") {
        throw new ConflictException("A student with this email already exists.");
      }

      throw error;
    }
  }

  async search(filters: StudentSearchFilters) {
    const query = filters.query?.trim();
    const skills = filters.skills
      ? filters.skills
          .split(",")
          .map((skill) => skill.trim().toLowerCase())
          .filter(Boolean)
      : [];
    const params: unknown[] = [
      query ? `%${query.toLowerCase()}%` : null,
      filters.college?.trim().toLowerCase() || null,
      filters.department?.trim().toLowerCase() || null,
      filters.degree?.trim().toLowerCase() || null,
      skills,
    ];

    const result = await this.database.query<StudentSearchRow>(
      `
        SELECT
          s.id,
          s.name,
          s.username,
          s.institution_name,
          s.course,
          s.year,
          s.roll_number,
          s.email,
          s.contact_number,
          s.github_profile,
          s.skills,
          s.department,
          s.degree,
          s.password_hash,
          s.created_at,
          COALESCE(array_agg(DISTINCT p.title) FILTER (WHERE p.title IS NOT NULL), '{}') AS project_titles,
          COUNT(DISTINCT p.id)::text AS project_count
        FROM students s
        LEFT JOIN project p ON p.student_id = s.id
        WHERE
          (
            $1::text IS NULL
            OR LOWER(s.name) LIKE $1
            OR LOWER(COALESCE(s.username, '')) LIKE $1
            OR LOWER(s.institution_name) LIKE $1
            OR LOWER(s.course) LIKE $1
            OR LOWER(COALESCE(s.department, '')) LIKE $1
            OR LOWER(COALESCE(s.degree, '')) LIKE $1
            OR EXISTS (
              SELECT 1
              FROM jsonb_array_elements_text(s.skills) skill
              WHERE LOWER(skill) LIKE $1
            )
            OR LOWER(COALESCE(p.title, '')) LIKE $1
          )
          AND ($2::text IS NULL OR LOWER(s.institution_name) LIKE '%' || $2 || '%')
          AND ($3::text IS NULL OR LOWER(COALESCE(s.department, '')) LIKE '%' || $3 || '%')
          AND ($4::text IS NULL OR LOWER(COALESCE(s.degree, '')) LIKE '%' || $4 || '%')
          AND (
            cardinality($5::text[]) = 0
            OR EXISTS (
              SELECT 1
              FROM jsonb_array_elements_text(s.skills) skill
              WHERE LOWER(skill) = ANY($5::text[])
            )
          )
        GROUP BY s.id
        ORDER BY s.name ASC
        LIMIT 60;
      `,
      params,
    );

    return {
      students: result.rows.map((student) => ({
        ...this.toPublicStudent(student),
        projectTitles: student.project_titles,
        projectCount: Number(student.project_count),
      })),
    };
  }

  private async findStudent(id: string) {
    const result = await this.database.query<StudentRow>(
      `
        SELECT id, name, username, institution_name, course, year, roll_number, email, contact_number, github_profile, skills, department, degree, password_hash, created_at
        FROM students
        WHERE id = $1
        LIMIT 1;
      `,
      [id],
    );

    const student = result.rows[0];

    if (!student) {
      throw new NotFoundException("Student not found.");
    }

    return student;
  }

  private toPublicStudent(student: StudentRow) {
    return {
      id: student.id,
      name: student.name,
      username: student.username,
      institutionName: student.institution_name,
      course: student.course,
      skills: student.skills,
      department: student.department,
      degree: student.degree,
      year: student.year,
      rollNumber: student.roll_number,
      email: student.email,
      contactNumber: student.contact_number,
      githubProfile: student.github_profile,
      createdAt: student.created_at,
    };
  }
}

function isPostgresError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

function normalizeStrings(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function normalizeUsername(username: string | undefined, email: string) {
  return (username?.trim() || email.split("@")[0]).toLowerCase();
}
