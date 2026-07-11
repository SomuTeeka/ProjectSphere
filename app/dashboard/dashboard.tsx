"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Heart,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AppHeader } from "../components/app-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
const FAVORITE_PROJECTS_KEY = "projectsphere.favoriteProjects";

type Student = {
  id: string;
  name: string;
  email: string;
  course?: string;
  institutionName?: string;
};

type LinkItem = {
  label: string;
  url: string;
};

type Project = {
  id: string;
  studentId: string;
  studentName: string | null;
  title: string;
  description: string;
  technologiesUsed: string[];
  teamMembers: string[];
  images: string[];
  videos: string[];
  documentation: LinkItem[];
  externalLinks: LinkItem[];
  updatedAt: string;
};

type ProjectFormState = {
  title: string;
  description: string;
  technologiesUsed: string;
  teamMembers: string;
  images: string;
  videos: string;
  documentation: string;
  externalLinks: string;
};

const emptyForm: ProjectFormState = {
  title: "",
  description: "",
  technologiesUsed: "",
  teamMembers: "",
  images: "",
  videos: "",
  documentation: "",
  externalLinks: "",
};

export function Dashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>([]);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const storedStudent = localStorage.getItem("projectsphere.student");

      if (!storedStudent) {
        router.replace("/login?error=Invalid%20username%2Fpassword");
        return;
      }

      try {
        const parsedStudent = JSON.parse(storedStudent) as Student;
        setStudent(parsedStudent);
        setFavoriteProjects(readStoredIds(FAVORITE_PROJECTS_KEY));
        void loadProjects(parsedStudent.id);
      } catch {
        localStorage.removeItem("projectsphere.student");
        router.replace("/login?error=Invalid%20username%2Fpassword");
      }
    });
  }, [router]);

  const projectStats = useMemo(
    () => ({
      total: projects.length,
      contributed: projects.filter((project) => project.teamMembers.length > 1).length,
      technologies: new Set(projects.flatMap((project) => project.technologiesUsed)).size,
    }),
    [projects],
  );

  async function loadProjects(studentId: string) {
    try {
      const response = await fetch(`${API_URL}/api/projects?studentId=${studentId}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getApiMessage(data, "Could not load projects."));
      }

      setProjects(data.projects ?? []);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not load projects.",
      });
    }
  }

  function toggleFavoriteProject(projectId: string) {
    const nextFavorites = favoriteProjects.includes(projectId)
      ? favoriteProjects.filter((id) => id !== projectId)
      : [...favoriteProjects, projectId];

    setFavoriteProjects(nextFavorites);
    localStorage.setItem(FAVORITE_PROJECTS_KEY, JSON.stringify(nextFavorites));
  }

  function updateField(field: keyof ProjectFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function toggleProjectForm() {
    setIsProjectFormOpen((current) => {
      if (current) {
        resetForm();
      }

      return !current;
    });
  }

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!student) {
      router.replace("/login?error=Invalid%20username%2Fpassword");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const payload = {
      studentId: student.id,
      title: form.title,
      description: form.description,
      technologiesUsed: splitList(form.technologiesUsed),
      teamMembers: splitList(form.teamMembers),
      images: splitLines(form.images),
      videos: splitLines(form.videos),
      documentation: parseLinks(form.documentation),
      externalLinks: parseLinks(form.externalLinks),
    };

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getApiMessage(data, "Could not save project."));
      }

      setStatus({
        type: "success",
        message: data.message ?? "Project saved successfully.",
      });
      resetForm();
      setIsProjectFormOpen(false);
      await loadProjects(student.id);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not save project.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!student) {
    return (
      <main className="dashboard-shell">
        <p className="form-alert error">Invalid username/password</p>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <AppHeader />

      <section className="dashboard-hero">
        <div>
          <p className="eyebrow dashboard-eyebrow">Dashboard</p>
          <h1>{student.name}</h1>
          <p>
            Track projects you created or contributed to, keep resources organized,
            and maintain a portfolio-ready record of your technical work.
          </p>
        </div>
        <div className="dashboard-stats" aria-label="Project summary">
          <div>
            <strong>{projectStats.total}</strong>
            <span>Projects</span>
          </div>
          <div>
            <strong>{projectStats.contributed}</strong>
            <span>Team builds</span>
          </div>
          <div>
            <strong>{projectStats.technologies}</strong>
            <span>Technologies</span>
          </div>
        </div>
      </section>

      <section
        className={isProjectFormOpen ? "projects-layout" : "projects-layout projects-layout-full"}
        aria-labelledby="projects-title"
      >
        <div className="projects-main">
          <div className="section-heading">
            <div>
              <p className="eyebrow dashboard-eyebrow">Projects</p>
              <h2 id="projects-title">Created and contributed work</h2>
            </div>
            <button className="secondary-button" type="button" onClick={toggleProjectForm}>
              {isProjectFormOpen ? (
                <X aria-hidden="true" size={18} />
              ) : (
                <Plus aria-hidden="true" size={18} />
              )}
              {isProjectFormOpen ? "Close form" : "Add new project"}
            </button>
          </div>

          {status ? (
            <p className={`form-alert ${status.type}`}>{status.message}</p>
          ) : null}

          <div className="project-list">
            {projects.length === 0 ? (
              <div className="empty-state">
                <strong>No projects yet</strong>
                <span>Create your first project entry to start building your portfolio.</span>
              </div>
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
                    <button
                      className={favoriteProjects.includes(project.id) ? "project-favorite-button active" : "project-favorite-button"}
                      type="button"
                      onClick={() => toggleFavoriteProject(project.id)}
                      title="Save favorite project"
                      aria-label="Save favorite project"
                    >
                      <Heart
                        aria-hidden="true"
                        className={favoriteProjects.includes(project.id) ? "favorite-icon-active" : ""}
                        size={16}
                      />
                    </button>
                    <button type="button" onClick={() => router.push(`/projects/${project.id}`)}>
                      View
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {isProjectFormOpen ? (
          <aside className="project-editor" aria-label="Project editor">
            <h2>Create project</h2>
            <form className="dashboard-form" onSubmit={submitProject}>
              <label>
                Title
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  required
                />
              </label>
              <label>
                Technologies used
                <input
                  value={form.technologiesUsed}
                  onChange={(event) => updateField("technologiesUsed", event.target.value)}
                  placeholder="Next.js, NestJS, PostgreSQL"
                />
              </label>
              <label>
                Team members
                <input
                  value={form.teamMembers}
                  onChange={(event) => updateField("teamMembers", event.target.value)}
                  placeholder="Name, Name"
                />
              </label>
              <label>
                Images
                <textarea
                  value={form.images}
                  onChange={(event) => updateField("images", event.target.value)}
                  placeholder="One image URL per line"
                />
              </label>
              <label>
                Videos
                <textarea
                  value={form.videos}
                  onChange={(event) => updateField("videos", event.target.value)}
                  placeholder="One video URL per line"
                />
              </label>
              <label>
                Documentation
                <textarea
                  value={form.documentation}
                  onChange={(event) => updateField("documentation", event.target.value)}
                  placeholder="Report | https://example.com/report"
                />
              </label>
              <label>
                External links
                <textarea
                  value={form.externalLinks}
                  onChange={(event) => updateField("externalLinks", event.target.value)}
                  placeholder="GitHub | https://github.com/user/repo"
                />
              </label>

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create project"}
              </button>
            </form>
          </aside>
        ) : null}
      </section>
    </main>
  );
}

function readStoredIds(key: string) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as string[]) : [];
  } catch {
    return [];
  }
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLinks(value: string): LinkItem[] {
  return splitLines(value).map((line) => {
    const [label, url] = line.includes("|")
      ? line.split("|").map((part) => part.trim())
      : [line.trim(), line.trim()];

    return {
      label,
      url,
    };
  });
}

function linksToText(values: LinkItem[]) {
  return values.map((value) => `${value.label} | ${value.url}`).join("\n");
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
