import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Hands the signed-in user's Kinde ID token to the browser so the Convex
// client can authenticate. Convex verifies the token's signature and issuer.
export async function GET() {
  const { isAuthenticated, getIdTokenRaw } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = await getIdTokenRaw();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { token },
    { headers: { "Cache-Control": "no-store" } }
  );
}
