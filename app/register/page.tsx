import Link from "next/link";
import { Code2 } from "lucide-react";
import { RegisterForm } from "./register-form";

export default function StudentRegistrationPage() {
  return (
    <main className="auth-shell">
      <StoryPanel />

      <section className="form-wrap" aria-labelledby="registration-title">
        <div className="auth-card">
          <div className="auth-card-inner">
            <div className="auth-heading">
              <div>
                <p className="eyebrow">Student onboarding</p>
                <h1 id="registration-title">Create your ProjectSphere profile</h1>
                <p>
                  Start a public home for your projects, resources, demos, and
                  technical milestones.
                </p>
              </div>
              <Link className="auth-switch" href="/login">
                Sign in
              </Link>
            </div>

            <RegisterForm />

            <div className="auth-footer">
              <span>Already building here?</span>
              <Link href="/login">Log in to your workspace</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StoryPanel() {
  return (
    <section className="story-panel" aria-label="ProjectSphere overview">
      <div className="story-content">
        <div className="brand">
          <span className="brand-mark">
            <Code2 aria-hidden="true" size={25} strokeWidth={2.5} />
          </span>
          <span>ProjectSphere</span>
        </div>

        <div className="story-copy">
          <p className="eyebrow">Showcase. Discover. Learn.</p>
          <h1>Make student projects easier to explore.</h1>
          <p>
            ProjectSphere brings project profiles, implementation notes, code
            links, demos, and student portfolios into one focused platform.
          </p>

          <div className="proof-strip" aria-label="Platform highlights">
            <div className="proof-item">
              <strong>Profiles</strong>
              <span>Capture the story, stack, screenshots, and resources.</span>
            </div>
            <div className="proof-item">
              <strong>Discovery</strong>
              <span>Explore projects across courses, years, and domains.</span>
            </div>
            <div className="proof-item">
              <strong>Portfolio</strong>
              <span>Build a public record of technical achievements.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
