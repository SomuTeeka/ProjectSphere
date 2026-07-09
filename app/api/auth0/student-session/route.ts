import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

export async function GET() {
  const session = await auth0.getSession();

  if (!session?.user?.sub || !session.user.email) {
    return NextResponse.json({ message: "Auth0 session not found." }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/api/students/auth0-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth0Sub: session.user.sub,
      email: session.user.email,
      name: session.user.name ?? session.user.nickname ?? session.user.email,
      nickname: session.user.nickname,
      picture: session.user.picture,
    }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));

  return NextResponse.json(data, { status: response.status });
}
