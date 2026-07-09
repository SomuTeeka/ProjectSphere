"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Github,
  GraduationCap,
  Hash,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one numeral, and one special character.";

const registrationFields = [
  {
    label: "Name",
    name: "name",
    type: "text",
    placeholder: "Aarav Mehta",
    icon: UserRound,
    autoComplete: "name",
  },
  {
    label: "Institution Name",
    name: "institutionName",
    type: "text",
    placeholder: "National Institute of Technology",
    icon: Building2,
    autoComplete: "organization",
  },
  {
    label: "Course",
    name: "course",
    type: "text",
    placeholder: "B.Tech Computer Science",
    icon: GraduationCap,
    autoComplete: "off",
  },
  {
    label: "Year",
    name: "year",
    type: "text",
    placeholder: "3rd Year",
    icon: CalendarDays,
    autoComplete: "off",
  },
  {
    label: "Roll Number",
    name: "rollNumber",
    type: "text",
    placeholder: "21CS1042",
    icon: Hash,
    autoComplete: "off",
  },
  {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: "you@college.edu",
    icon: Mail,
    autoComplete: "email",
  },
  {
    label: "Contact Number",
    name: "contactNumber",
    type: "tel",
    placeholder: "+91 98765 43210",
    icon: Phone,
    autoComplete: "tel",
  },
  {
    label: "GitHub Profile Link",
    name: "githubProfile",
    type: "url",
    placeholder: "https://github.com/username",
    icon: Github,
    autoComplete: "url",
  },
  {
    label: "Password",
    name: "password",
    type: "password",
    placeholder: "Create a strong password",
    icon: LockKeyhole,
    autoComplete: "new-password",
  },
  {
    label: "Confirm Password",
    name: "confirmPassword",
    type: "password",
    placeholder: "Repeat your password",
    icon: LockKeyhole,
    autoComplete: "new-password",
  },
] as const;

type RegistrationField = (typeof registrationFields)[number];

type FormState = Record<RegistrationField["name"], string>;
type Status = {
  type: "success" | "error";
  message: string;
};

const initialState = {
  name: "",
  institutionName: "",
  course: "",
  year: "",
  rollNumber: "",
  email: "",
  contactNumber: "",
  githubProfile: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<Status | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = useMemo(
    () => ({
      uppercase: /[A-Z]/.test(form.password),
      lowercase: /[a-z]/.test(form.password),
      numeral: /\d/.test(form.password),
      special: /[^A-Za-z0-9]/.test(form.password),
      length: form.password.length >= 8,
    }),
    [form.password],
  );

  const passwordIsValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch =
    form.confirmPassword.length === 0 || form.password === form.confirmPassword;

  function updateField(name: RegistrationField["name"], value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!PASSWORD_POLICY.test(form.password)) {
      setStatus({
        type: "error",
        message: PASSWORD_MESSAGE,
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus({
        type: "error",
        message: "Password and confirm password do not match.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/students/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getApiMessage(data, "Registration failed."));
      }

      setStatus({
        type: "success",
        message: data.message ?? "Registration details stored successfully.",
      });
      setForm(initialState);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        {registrationFields.map((field) => {
          const Icon = field.icon;
          const isPassword = field.name === "password";
          const isConfirmPassword = field.name === "confirmPassword";

          return (
            <div className="field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <div className="input-shell">
                <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  value={form[field.name]}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  aria-invalid={
                    (isPassword && form.password.length > 0 && !passwordIsValid) ||
                    (isConfirmPassword && !passwordsMatch)
                  }
                  required
                />
              </div>

              {isPassword ? (
                <ul className="password-rules" aria-label="Password requirements">
                  <li className={passwordChecks.uppercase ? "met" : ""}>
                    Uppercase letter
                  </li>
                  <li className={passwordChecks.lowercase ? "met" : ""}>
                    Lowercase letter
                  </li>
                  <li className={passwordChecks.numeral ? "met" : ""}>Numeral</li>
                  <li className={passwordChecks.special ? "met" : ""}>
                    Special character
                  </li>
                  <li className={passwordChecks.length ? "met" : ""}>
                    8 characters minimum
                  </li>
                </ul>
              ) : null}

              {isConfirmPassword && !passwordsMatch ? (
                <p className="field-error">Passwords do not match.</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="form-note">
        Your profile will later connect to project showcases, resource links, and
        portfolio publishing.
      </p>

      {status ? (
        <p className={`form-alert ${status.type}`} role="status">
          {status.message}
        </p>
      ) : null}

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create student account"}
        <ArrowRight aria-hidden="true" size={18} strokeWidth={2.4} />
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <a className="auth0-button" href="/auth/login?screen_hint=signup&returnTo=/auth/sync">
        Sign up with Auth0
      </a>
    </form>
  );
}

function getApiMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data
  ) {
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
