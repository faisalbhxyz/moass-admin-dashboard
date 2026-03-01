import { getCurrentUser } from "./auth";
import { NextResponse } from "next/server";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return user;
}
