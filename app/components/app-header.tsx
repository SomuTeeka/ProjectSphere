"use client";

import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import { Code2, Heart, LogOut, Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

type AppHeaderProps = {
  below?: ReactNode;
};

export function AppHeader({ below }: AppHeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    router.push(trimmedQuery ? `/discover?q=${encodeURIComponent(trimmedQuery)}` : "/discover");
  }

  function logout() {
    localStorage.removeItem("projectsphere.student");
    window.location.href = "/auth/logout";
  }

  return (
    <>
      <header className="dashboard-topbar">
        <div className="brand dashboard-brand">
          <span className="brand-mark dashboard-brand-mark">
            <Code2 aria-hidden="true" size={24} strokeWidth={2.5} />
          </span>
          <span>ProjectSphere</span>
        </div>

        <div className="topbar-actions">
          <form className="topbar-search" onSubmit={submitSearch}>
            <Search aria-hidden="true" size={17} />
            <input
              aria-label="Search students"
              placeholder="Search students, skills, projects"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
          <button
            className="profile-icon-button"
            type="button"
            onClick={() => router.push("/favorites")}
            title="Open favorites"
            aria-label="Open favorites"
          >
            <Heart aria-hidden="true" size={20} />
          </button>
          <button
            className="profile-icon-button"
            type="button"
            onClick={() => router.push("/profile")}
            title="Open profile"
            aria-label="Open profile"
          >
            <UserRound aria-hidden="true" size={20} />
          </button>
          <button className="icon-text-button" type="button" onClick={logout}>
            <LogOut aria-hidden="true" size={18} />
            Logout
          </button>
        </div>
      </header>
      {below ? <div className="below-topbar">{below}</div> : null}
    </>
  );
}
