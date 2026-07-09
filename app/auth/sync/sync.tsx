"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Auth0Sync() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing Auth0 sign in...");

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const response = await fetch("/api/auth0/student-session", {
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(getApiMessage(data, "Could not finish Auth0 sign in."));
        }

        localStorage.setItem("projectsphere.student", JSON.stringify(data.student));
        router.replace("/dashboard");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not finish Auth0 sign in.",
        );
      }
    });
  }, [router]);

  return (
    <main className="dashboard-shell">
      <section className="profile-panel">
        <p className="eyebrow dashboard-eyebrow">Auth0</p>
        <h1>Signing you in</h1>
        <p className="form-note">{message}</p>
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
