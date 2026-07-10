"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Heart,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AppHeader } from "../components/app-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
const FAVORITE_PROFILES_KEY = "projectsphere.favoriteProfiles";
const FAVORITE_PROJECTS_KEY = "projectsphere.favoriteProjects";

type FavoriteMode = "profiles" | "projects";

type StudentProfile = {
  id: string;
  name: string;
  username: string | null;
  institutionName: string;
  course: string;
  department: string | null;
  degree: string | null;
  email: string;
  skills: string[];
};

type Project = {
  id: string;
  title: string;
  description: string;
  technologiesUsed: string[];
};

export function Favorites() {
  const router = useRouter();
  const [mode, setMode] = useState<FavoriteMode>("profiles");
  const [profileIds, setProfileIds] = useState<string[]>([]);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  async function loadFavorites(nextProfileIds: string[], nextProjectIds: string[]) {
    setStatus(null);

    try {
      const [profileResults, projectResults] = await Promise.all([
        Promise.all(nextProfileIds.map((id) => fetchJson(`${API_URL}/api/students/${id}`))),
        Promise.all(nextProjectIds.map((id) => fetchJson(`${API_URL}/api/projects/${id}`))),
      ]);

      setProfiles(
        profileResults
          .map((result) => result.student as StudentProfile | undefined)
          .filter((profile): profile is StudentProfile => Boolean(profile)),
      );
      setProjects(
        projectResults
          .map((result) => result.project as Project | undefined)
          .filter((project): project is Project => Boolean(project)),
      );
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not load favorites.",
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

      const nextProfileIds = readStoredIds(FAVORITE_PROFILES_KEY);
      const nextProjectIds = readStoredIds(FAVORITE_PROJECTS_KEY);
      setProfileIds(nextProfileIds);
      setProjectIds(nextProjectIds);
      void loadFavorites(nextProfileIds, nextProjectIds);
    });
  }, [router]);

  const visibleCount = mode === "profiles" ? profiles.length : projects.length;
  const emptyText = useMemo(
    () =>
      mode === "profiles"
        ? "Saved student profiles will appear here."
        : "Saved projects will appear here.",
    [mode],
  );

  function removeFavorite(kind: FavoriteMode, id: string) {
    if (kind === "profiles") {
      const nextIds = profileIds.filter((profileId) => profileId !== id);
      setProfileIds(nextIds);
      setProfiles((current) => current.filter((profile) => profile.id !== id));
      localStorage.setItem(FAVORITE_PROFILES_KEY, JSON.stringify(nextIds));
      return;
    }

    const nextIds = projectIds.filter((projectId) => projectId !== id);
    setProjectIds(nextIds);
    setProjects((current) => current.filter((project) => project.id !== id));
    localStorage.setItem(FAVORITE_PROJECTS_KEY, JSON.stringify(nextIds));
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

      <section className="discover-hero">
        <div>
          <p className="eyebrow dashboard-eyebrow">Favorites</p>
          <h1>Saved work and people.</h1>
          <p>
            Keep promising collaborators and useful projects in one place, then
            switch between profiles and projects when you need them.
          </p>
        </div>
        <div className="dashboard-stats">
          <div>
            <strong>{profiles.length}</strong>
            <span>Profiles</span>
          </div>
          <div>
            <strong>{projects.length}</strong>
            <span>Projects</span>
          </div>
          <div>
            <strong>{visibleCount}</strong>
            <span>Viewing</span>
          </div>
        </div>
      </section>

      <section className="discover-results" aria-labelledby="favorites-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow dashboard-eyebrow">Saved items</p>
            <h2 id="favorites-title">Your favorites</h2>
          </div>
          <div className="segmented-control" aria-label="Favorite type">
            <button
              className={mode === "profiles" ? "active" : ""}
              type="button"
              onClick={() => setMode("profiles")}
            >
              Profiles
            </button>
            <button
              className={mode === "projects" ? "active" : ""}
              type="button"
              onClick={() => setMode("projects")}
            >
              Projects
            </button>
          </div>
        </div>

        {status ? <p className={`form-alert ${status.type}`}>{status.message}</p> : null}

        {mode === "profiles" ? (
          <div className="student-result-grid">
            {profiles.length === 0 ? (
              <div className="empty-state">
                <strong>No favorite profiles yet</strong>
                <span>{emptyText}</span>
              </div>
            ) : (
              profiles.map((profile) => (
                <article className="student-card" key={profile.id}>
                  <div className="student-card-top">
                    <span className="student-avatar">
                      <UserRound aria-hidden="true" size={24} />
                    </span>
                    <button
                      className="favorite-button active"
                      type="button"
                      onClick={() => removeFavorite("profiles", profile.id)}
                      title="Remove favorite profile"
                      aria-label="Remove favorite profile"
                    >
                      <Heart aria-hidden="true" size={18} />
                    </button>
                  </div>
                  <h3>{profile.name}</h3>
                  <p className="student-username">@{profile.username ?? profile.email.split("@")[0]}</p>
                  <div className="student-info-list">
                    <span>
                      <Building2 aria-hidden="true" size={15} />
                      {profile.institutionName}
                    </span>
                    <span>
                      <GraduationCap aria-hidden="true" size={15} />
                      {profile.degree ?? profile.course}
                    </span>
                    <span>
                      <UsersRound aria-hidden="true" size={15} />
                      {profile.department ?? profile.course}
                    </span>
                  </div>
                  <div className="tag-row">
                    {profile.skills.slice(0, 5).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                  <div className="student-card-actions">
                    <button type="button" onClick={() => router.push(`/students/${profile.id}`)}>
                      Open profile
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : (
          <div className="project-list">
            {projects.length === 0 ? (
              <div className="empty-state">
                <strong>No favorite projects yet</strong>
                <span>{emptyText}</span>
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
                      type="button"
                      onClick={() => removeFavorite("projects", project.id)}
                      title="Remove favorite project"
                      aria-label="Remove favorite project"
                    >
                      <Heart aria-hidden="true" className="favorite-icon-active" size={16} />
                    </button>
                    <button type="button" onClick={() => router.push(`/projects/${project.id}`)}>
                      View
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiMessage(data, "Could not load favorite item."));
  }

  return data;
}

function readStoredIds(key: string) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as string[]) : [];
  } catch {
    return [];
  }
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
