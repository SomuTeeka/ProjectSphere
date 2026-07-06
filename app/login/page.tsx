import Link from "next/link";
import { Code2 } from "lucide-react";
import { LoginForm } from "./login-form";

export default function StudentLoginPage() {
  return (
    <main className="auth-shell">
      <section className="story-panel" aria-label="ProjectSphere overview">
        <div className="story-content">
          <div className="brand">
            <span className="brand-mark">
              <Code2 aria-hidden="true" size={25} strokeWidth={2.5} />
            </span>
            <span>ProjectSphere</span>
          </div>

          <div className="story-copy">
            <p className="eyebrow">Welcome back</p>
            <h1>Return to your project workspace.</h1>
            <p>
              Continue shaping your project profiles, collecting resources, and
              growing a portfolio that reflects how you build.
            </p>

            <div className="proof-strip" aria-label="Platform highlights">
              <div className="proof-item">
                <strong>Share</strong>
                <span>Publish demos, repositories, reports, and learnings.</span>
              </div>
              <div className="proof-item">
                <strong>Explore</strong>
                <span>Find student work by stack, institution, or topic.</span>
              </div>
              <div className="proof-item">
                <strong>Grow</strong>
                <span>Turn every project into a portfolio milestone.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="form-wrap" aria-labelledby="login-title">
        <div className="auth-card login-card">
          <div className="auth-card-inner">
            <div className="auth-heading">
              <div>
                <p className="eyebrow">Student login</p>
                <h1 id="login-title">Sign in</h1>
                <p>Use your registered email and password to continue.</p>
              </div>
              <Link className="auth-switch" href="/register">
                Register
              </Link>
            </div>

            <LoginForm />

            <div className="auth-footer">
              <span>New to ProjectSphere?</span>
              <Link href="/register">Create your student profile</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
