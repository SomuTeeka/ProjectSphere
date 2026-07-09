"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

type Status = {
  type: "success" | "error";
  message: string;
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const search = new URLSearchParams(window.location.search);

      if (search.get("error")) {
        setStatus({
          type: "error",
          message: "Invalid username/password",
        });
      }
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/students/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Invalid username/password"
            : getApiMessage(data, "Login failed."),
        );
      }

      localStorage.setItem("projectsphere.student", JSON.stringify(data.student));
      setStatus({
        type: "success",
        message: data.message ?? "Login successful.",
      });
      router.push("/dashboard");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Login failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <div className="input-shell">
          <Mail aria-hidden="true" size={18} strokeWidth={2.2} />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@college.edu"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="input-shell">
          <LockKeyhole aria-hidden="true" size={18} strokeWidth={2.2} />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="remember-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          Keep me signed in
        </label>
        <a className="text-link" href="mailto:support@projectsphere.dev">
          Need help?
        </a>
      </div>

      {status ? (
        <p className={`form-alert ${status.type}`} role="status">
          {status.message}
        </p>
      ) : null}

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log in"}
        <ArrowRight aria-hidden="true" size={18} strokeWidth={2.4} />
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <a className="auth0-button" href="/auth/login?returnTo=/auth/sync">
        Continue with Auth0
      </a>
    </form>
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
