"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Heart,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "../components/app-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
const FAVORITES_KEY = "projectsphere.favoriteProfiles";

type StudentResult = {
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
  projectTitles: string[];
  projectCount: number;
};

type SearchForm = {
  q: string;
  college: string;
  department: string;
  degree: string;
  skills: string;
};

export function Discover() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<SearchForm>({
    q: searchParams.get("q") ?? "",
    college: "",
    department: "",
    degree: "",
    skills: "",
  });
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);

  async function searchStudents(values: SearchForm) {
    setIsSearching(true);
    setStatus(null);

    try {
      const params = new URLSearchParams();
      Object.entries(values).forEach(([key, value]) => {
        if (value.trim()) {
          params.set(key, value.trim());
        }
      });

      const response = await fetch(`${API_URL}/api/students/search?${params.toString()}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getApiMessage(data, "Could not search students."));
      }

      setStudents(data.students ?? []);
      setStatus({
        type: "success",
        message: `${data.students?.length ?? 0} profile${data.students?.length === 1 ? "" : "s"} found.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not search students.",
      });
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      const storedStudent = localStorage.getItem("projectsphere.student");

      if (!storedStudent) {
        router.replace("/login?error=Invalid%20username%2Fpassword");
        return;
      }

      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);

      if (searchParams.get("q")) {
        void searchStudents({
          q: searchParams.get("q") ?? "",
          college: "",
          department: "",
          degree: "",
          skills: "",
        });
      }
    });
  }, [router, searchParams]);

  const favoriteCount = favorites.length;
  const activeFilters = useMemo(
    () => [form.q, form.college, form.department, form.degree, form.skills].filter(Boolean).length,
    [form],
  );

  function updateField(field: keyof SearchForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await searchStudents(form);
  }

  function toggleFavorite(studentId: string) {
    const nextFavorites = favorites.includes(studentId)
      ? favorites.filter((id) => id !== studentId)
      : [...favorites, studentId];

    setFavorites(nextFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
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
          <p className="eyebrow dashboard-eyebrow">Discover students</p>
          <h1>Find collaborators faster.</h1>
          <p>
            Search by name, username, skills, college, department, degree, or project
            titles to connect for hackathons, research, startups, and learning.
          </p>
        </div>
        <div className="dashboard-stats">
          <div>
            <strong>{students.length}</strong>
            <span>Results</span>
          </div>
          <div>
            <strong>{activeFilters}</strong>
            <span>Active filters</span>
          </div>
          <div>
            <strong>{favoriteCount}</strong>
            <span>Saved profiles</span>
          </div>
        </div>
      </section>

      <section className="discover-search-panel" aria-label="Student discovery search">
        <form className="discover-form" onSubmit={handleSubmit}>
          <label className="discover-query">
            <Search aria-hidden="true" size={22} />
            <input
              autoFocus
              placeholder="Search name, username, skill, college, degree, or project title"
              value={form.q}
              onChange={(event) => updateField("q", event.target.value)}
            />
          </label>

          <div className="discover-filters">
            <label>
              College
              <input
                value={form.college}
                onChange={(event) => updateField("college", event.target.value)}
                placeholder="Institution"
              />
            </label>
            <label>
              Department
              <input
                value={form.department}
                onChange={(event) => updateField("department", event.target.value)}
                placeholder="Computer Science"
              />
            </label>
            <label>
              Degree
              <input
                value={form.degree}
                onChange={(event) => updateField("degree", event.target.value)}
                placeholder="B.Tech"
              />
            </label>
            <label>
              Skills
              <input
                value={form.skills}
                onChange={(event) => updateField("skills", event.target.value)}
                placeholder="React, Python"
              />
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={isSearching}>
            <Sparkles aria-hidden="true" size={18} />
            {isSearching ? "Searching..." : "Search students"}
          </button>
        </form>
      </section>

      <section className="discover-results" aria-labelledby="discover-results-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow dashboard-eyebrow">Results</p>
            <h2 id="discover-results-title">Student profiles</h2>
          </div>
          {status ? <p className={`form-alert ${status.type}`}>{status.message}</p> : null}
        </div>

        <div className="student-result-grid">
          {students.length === 0 ? (
            <div className="empty-state">
              <strong>Start with a search</strong>
              <span>Results appear here so profiles stay easy to scan and compare.</span>
            </div>
          ) : (
            students.map((student) => (
              <article className="student-card" key={student.id}>
                <div className="student-card-top">
                  <span className="student-avatar">
                    <UserRound aria-hidden="true" size={24} />
                  </span>
                  <button
                    className={favorites.includes(student.id) ? "favorite-button active" : "favorite-button"}
                    type="button"
                    onClick={() => toggleFavorite(student.id)}
                    title="Save favorite profile"
                    aria-label="Save favorite profile"
                  >
                    <Heart aria-hidden="true" size={18} />
                  </button>
                </div>
                <h3>{student.name}</h3>
                <p className="student-username">@{student.username ?? student.email.split("@")[0]}</p>
                <div className="student-info-list">
                  <span>
                    <Building2 aria-hidden="true" size={15} />
                    {student.institutionName}
                  </span>
                  <span>
                    <GraduationCap aria-hidden="true" size={15} />
                    {student.degree ?? student.course}
                  </span>
                  <span>
                    <UsersRound aria-hidden="true" size={15} />
                    {student.department ?? student.course}
                  </span>
                </div>
                <div className="tag-row">
                  {student.skills.slice(0, 5).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <p className="student-projects">
                  {student.projectCount} project{student.projectCount === 1 ? "" : "s"}
                  {student.projectTitles.length > 0 ? `: ${student.projectTitles.slice(0, 2).join(", ")}` : ""}
                </p>
                <div className="student-card-actions">
                  <button type="button" onClick={() => router.push(`/students/${student.id}`)}>
                    Open profile
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
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
