"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Code2,
  ExternalLink,
  FileText,
  Heart,
  Image,
  Link as LinkIcon,
  UsersRound,
  Video,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "../../components/app-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
const FAVORITE_PROJECTS_KEY = "projectsphere.favoriteProjects";

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
  createdAt: string;
  updatedAt: string;
};

export function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  async function loadProject(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/projects/${id}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getApiMessage(data, "Could not load project."));
      }

      setProject(data.project);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not load project.",
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

      setFavoriteProjects(readStoredIds(FAVORITE_PROJECTS_KEY));
      void loadProject(params.id);
    });
  }, [params.id, router]);

  function toggleFavoriteProject(projectId: string) {
    const nextFavorites = favoriteProjects.includes(projectId)
      ? favoriteProjects.filter((id) => id !== projectId)
      : [...favoriteProjects, projectId];

    setFavoriteProjects(nextFavorites);
    localStorage.setItem(FAVORITE_PROJECTS_KEY, JSON.stringify(nextFavorites));
  }

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

      {project ? (
        <article className="project-detail-shell">
          <section className="project-detail-hero">
            <div>
              <p className="eyebrow dashboard-eyebrow">Project detail</p>
              <h1>{project.title}</h1>
              <p>{project.description}</p>
              <button
                className={favoriteProjects.includes(project.id) ? "favorite-wide-button active" : "favorite-wide-button"}
                type="button"
                onClick={() => toggleFavoriteProject(project.id)}
              >
                <Heart aria-hidden="true" size={18} />
                {favoriteProjects.includes(project.id) ? "Saved project" : "Save project"}
              </button>
            </div>
            <dl className="project-meta">
              <div>
                <dt>Author</dt>
                <dd>{project.studentName ?? "Student"}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(project.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{formatDate(project.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="project-detail-grid">
            <ResourcePanel
              icon={Code2}
              title="Technologies used"
              values={project.technologiesUsed}
            />
            <ResourcePanel icon={UsersRound} title="Team members" values={project.teamMembers} />
            <MediaPanel icon={Image} title="Images" values={project.images} kind="image" />
            <MediaPanel icon={Video} title="Videos" values={project.videos} kind="video" />
            <LinkPanel icon={FileText} title="Documentation" values={project.documentation} />
            <LinkPanel icon={ExternalLink} title="External links" values={project.externalLinks} />
          </section>
        </article>
      ) : !status ? (
        <section className="project-detail-shell">
          <p className="form-alert success">Loading project details...</p>
        </section>
      ) : null}
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

function ResourcePanel({
  icon: Icon,
  title,
  values,
}: {
  icon: typeof Code2;
  title: string;
  values: string[];
}) {
  return (
    <section className="detail-panel">
      <h2>
        <Icon aria-hidden="true" size={20} />
        {title}
      </h2>
      {values.length > 0 ? (
        <div className="tag-row">
          {values.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
      ) : (
        <p>No information provided.</p>
      )}
    </section>
  );
}

function MediaPanel({
  icon: Icon,
  title,
  values,
  kind,
}: {
  icon: typeof Code2;
  title: string;
  values: string[];
  kind: "image" | "video";
}) {
  return (
    <section className="detail-panel span-detail">
      <h2>
        <Icon aria-hidden="true" size={20} />
        {title}
      </h2>
      {values.length > 0 ? (
        <div className={kind === "image" ? "media-grid" : "video-list"}>
          {values.map((value) =>
            kind === "image" ? (
              <a href={value} key={value} rel="noreferrer" target="_blank">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`${title} resource`} src={value} />
              </a>
            ) : (
              <a className="resource-link" href={value} key={value} rel="noreferrer" target="_blank">
                <Video aria-hidden="true" size={18} />
                {value}
              </a>
            ),
          )}
        </div>
      ) : (
        <p>No information provided.</p>
      )}
    </section>
  );
}

function LinkPanel({
  icon: Icon,
  title,
  values,
}: {
  icon: typeof Code2;
  title: string;
  values: LinkItem[];
}) {
  return (
    <section className="detail-panel">
      <h2>
        <Icon aria-hidden="true" size={20} />
        {title}
      </h2>
      {values.length > 0 ? (
        <div className="resource-link-list">
          {values.map((value) => (
            <a
              className="resource-link"
              href={value.url}
              key={`${value.label}-${value.url}`}
              rel="noreferrer"
              target="_blank"
            >
              <LinkIcon aria-hidden="true" size={18} />
              {value.label}
            </a>
          ))}
        </div>
      ) : (
        <p>No information provided.</p>
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
