"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Code2,
  Github,
  GraduationCap,
  Mail,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "../../components/app-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

type Student = {
  id: string;
  name: string;
  username: string | null;
  institutionName: string;
  course: string;
  department: string | null;
  degree: string | null;
  email: string;
  githubProfile: string;
  skills: string[];
};

type Project = {
  id: string;
  title: string;
  description: string;
  technologiesUsed: string[];
};

export function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  async function loadProfile(id: string) {
    try {
      const [studentResponse, projectsResponse] = await Promise.all([
        fetch(`${API_URL}/api/students/${id}`),
        fetch(`${API_URL}/api/projects?studentId=${id}`),
      ]);
      const studentData = await studentResponse.json().catch(() => ({}));
      const projectsData = await projectsResponse.json().catch(() => ({}));

      if (!studentResponse.ok) {
        throw new Error(getApiMessage(studentData, "Could not load student profile."));
      }

      setStudent(studentData.student);
      setProjects(projectsResponse.ok ? projectsData.projects ?? [] : []);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not load student profile.",
      });
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      const storedStudent = localStorage.getItem("projectsphere.student");

      if (!storedStudent) {
        router.replace("/login?error=Invalid%20username%2Fpassword");
        return;
      }

      void loadProfile(params.id);
    });
  }, [params.id, router]);

  return (
    <main className="dashboard-shell">
      <AppHeader
        below={
          <button className="icon-text-button" type="button" onClick={() => router.push("/dashboard")}>
            <ArrowLeft aria-hidden="true" size={18} />
            Dashboard
          </button>
        }
      />

      {status ? (
        <section className="project-detail-shell">
          <p className={`form-alert ${status.type}`}>{status.message}</p>
        </section>
      ) : null}

      {student ? (
        <article className="student-profile-shell">
          <section className="student-profile-hero">
            <span className="student-profile-avatar">
              <UserRound aria-hidden="true" size={42} />
            </span>
            <div>
              <p className="eyebrow dashboard-eyebrow">Student profile</p>
              <h1>{student.name}</h1>
              <p>@{student.username ?? student.email.split("@")[0]}</p>
            </div>
            <div className="student-card-actions">
              <a href={`mailto:${student.email}`}>
                <Mail aria-hidden="true" size={16} />
                Connect
              </a>
              <a href={student.githubProfile} rel="noreferrer" target="_blank">
                <Github aria-hidden="true" size={16} />
                GitHub
              </a>
            </div>
          </section>

          <section className="project-detail-grid">
            <div className="detail-panel">
              <h2>
                <Building2 aria-hidden="true" size={20} />
                College
              </h2>
              <p>{student.institutionName}</p>
            </div>
            <div className="detail-panel">
              <h2>
                <GraduationCap aria-hidden="true" size={20} />
                Degree
              </h2>
              <p>{student.degree ?? student.course}</p>
            </div>
            <div className="detail-panel">
              <h2>
                <UsersRound aria-hidden="true" size={20} />
                Department
              </h2>
              <p>{student.department ?? student.course}</p>
            </div>
            <div className="detail-panel">
              <h2>
                <Code2 aria-hidden="true" size={20} />
                Skills
              </h2>
              {student.skills.length > 0 ? (
                <div className="tag-row">
                  {student.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              ) : (
                <p>No skills listed yet.</p>
              )}
            </div>
          </section>

          <section className="detail-panel student-project-panel">
            <h2>Projects</h2>
            <div className="project-list">
              {projects.length === 0 ? (
                <p>No public projects yet.</p>
              ) : (
                projects.map((project) => (
                  <article className="project-item" key={project.id}>
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <div className="tag-row">
                        {project.technologiesUsed.slice(0, 5).map((technology) => (
                          <span key={technology}>{technology}</span>
                        ))}
                      </div>
                    </div>
                    <div className="project-actions">
                      <button type="button" onClick={() => router.push(`/projects/${project.id}`)}>
                        View
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </article>
      ) : !status ? (
        <section className="project-detail-shell">
          <p className="form-alert success">Loading student profile...</p>
        </section>
      ) : null}
    </main>
  );
}

function getApiMessage(data: unknown, fallback: string) {
  if (typeof data === "object" && data !== null && "message" in data) {
    const message = (data as { message: unknown }).message;

    if (Array.isArray(message)) {
      return message.join(" ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}
