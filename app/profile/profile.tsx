"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Github,
  GraduationCap,
  Hash,
  Mail,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

type Student = {
  id: string;
  name: string;
  username: string | null;
  institutionName: string;
  course: string;
  skills: string[];
  department: string | null;
  degree: string | null;
  year: string;
  rollNumber: string;
  email: string;
  contactNumber: string;
  githubProfile: string;
};

type Status = {
  type: "success" | "error";
  message: string;
};

const profileFields = [
  {
    label: "Name",
    name: "name",
    type: "text",
    icon: UserRound,
    autoComplete: "name",
  },
  {
    label: "Username",
    name: "username",
    type: "text",
    icon: UserRound,
    autoComplete: "username",
  },
  {
    label: "Institution Name",
    name: "institutionName",
    type: "text",
    icon: Building2,
    autoComplete: "organization",
  },
  {
    label: "Course",
    name: "course",
    type: "text",
    icon: GraduationCap,
    autoComplete: "off",
  },
  {
    label: "Department",
    name: "department",
    type: "text",
    icon: Building2,
    autoComplete: "off",
  },
  {
    label: "Degree",
    name: "degree",
    type: "text",
    icon: GraduationCap,
    autoComplete: "off",
  },
  {
    label: "Skills",
    name: "skills",
    type: "text",
    icon: GraduationCap,
    autoComplete: "off",
  },
  {
    label: "Year",
    name: "year",
    type: "text",
    icon: CalendarDays,
    autoComplete: "off",
  },
  {
    label: "Roll Number",
    name: "rollNumber",
    type: "text",
    icon: Hash,
    autoComplete: "off",
  },
  {
    label: "Email",
    name: "email",
    type: "email",
    icon: Mail,
    autoComplete: "email",
  },
  {
    label: "Contact Number",
    name: "contactNumber",
    type: "tel",
    icon: Phone,
    autoComplete: "tel",
  },
  {
    label: "GitHub Profile Link",
    name: "githubProfile",
    type: "url",
    icon: Github,
    autoComplete: "url",
  },
] as const;

type ProfileField = (typeof profileFields)[number];
type ProfileForm = Record<ProfileField["name"], string>;

const emptyProfile: ProfileForm = {
  name: "",
  username: "",
  institutionName: "",
  course: "",
  skills: "",
  department: "",
  degree: "",
  year: "",
  rollNumber: "",
  email: "",
  contactNumber: "",
  githubProfile: "",
};

export function Profile() {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string>("");
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [status, setStatus] = useState<Status | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadProfile(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/students/${id}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getApiMessage(data, "Could not load profile."));
      }

      const student = data.student as Student;
      setForm(toProfileForm(student));
      localStorage.setItem("projectsphere.student", JSON.stringify(student));
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not load profile.",
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

      try {
        const parsedStudent = JSON.parse(storedStudent) as Student;
        setStudentId(parsedStudent.id);
        setForm(toProfileForm(parsedStudent));
        void loadProfile(parsedStudent.id);
      } catch {
        localStorage.removeItem("projectsphere.student");
        router.replace("/login?error=Invalid%20username%2Fpassword");
      }
    });
  }, [router]);

  function updateField(name: ProfileField["name"], value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!studentId) {
      router.replace("/login?error=Invalid%20username%2Fpassword");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_URL}/api/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          skills: splitList(form.skills),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getApiMessage(data, "Could not update profile."));
      }

      localStorage.setItem("projectsphere.student", JSON.stringify(data.student));
      setStatus({
        type: "success",
        message: data.message ?? "Profile updated successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not update profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <button className="icon-text-button" type="button" onClick={() => router.push("/dashboard")}>
          <ArrowLeft aria-hidden="true" size={18} />
          Dashboard
        </button>
      </header>

      <section className="profile-panel" aria-labelledby="profile-title">
        <div className="profile-heading">
          <p className="eyebrow dashboard-eyebrow">Personal information</p>
          <h1 id="profile-title">Edit your profile</h1>
          <p>
            Update the personal information captured during registration. These
            details keep your portfolio identity current.
          </p>
        </div>

        <form className="auth-form" onSubmit={submitProfile}>
          <div className="form-grid">
            {profileFields.map((field) => {
              const Icon = field.icon;

              return (
                <div className="field" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <div className="input-shell">
                    <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      value={form[field.name]}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      required
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {status ? (
            <p className={`form-alert ${status.type}`} role="status">
              {status.message}
            </p>
          ) : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <Save aria-hidden="true" size={18} />
            {isSubmitting ? "Saving profile..." : "Save profile"}
          </button>
        </form>
      </section>
    </main>
  );
}

function toProfileForm(student: Student): ProfileForm {
  return {
    name: student.name ?? "",
    username: student.username ?? "",
    institutionName: student.institutionName ?? "",
    course: student.course ?? "",
    skills: student.skills?.join(", ") ?? "",
    department: student.department ?? "",
    degree: student.degree ?? "",
    year: student.year ?? "",
    rollNumber: student.rollNumber ?? "",
    email: student.email ?? "",
    contactNumber: student.contactNumber ?? "",
    githubProfile: student.githubProfile ?? "",
  };
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
