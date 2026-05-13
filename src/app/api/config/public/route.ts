import { NextResponse } from "next/server";
import { hasGoogleAuth } from "@/lib/auth-env";

export function GET() {
  return NextResponse.json({
    googleAuth: hasGoogleAuth(),
  });
}
