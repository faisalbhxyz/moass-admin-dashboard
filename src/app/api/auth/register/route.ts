import { NextRequest, NextResponse } from "next/server";

// Registration disabled for security; admins are created via seed or DB directly
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "Registration is disabled" },
    { status: 403 }
  );
}
