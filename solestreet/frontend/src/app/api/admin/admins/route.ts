import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin-data";
import { strictEmailSchema } from "@/lib/validations/auth";

const adminSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: strictEmailSchema,
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export async function POST(req: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase is not configured." }, { status: 503 });
  }
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  }

  try {
    const auth = getAdminAuth();
    const actor = await auth.verifyIdToken(authorization.slice(7));
    if ((actor.email || "").toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Only the primary administrator can create admin accounts." }, { status: 403 });
    }
    const actorDoc = await getAdminFirestore().collection("users").doc(actor.uid).get();
    if (actorDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Only an existing admin can create admins." }, { status: 403 });
    }
    const parsed = adminSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Name, email, and a strong password are required." }, { status: 400 });
    }
    const { displayName, email, password } = parsed.data;
    const created = await auth.createUser({ displayName, email, password });
    await auth.setCustomUserClaims(created.uid, { role: "admin" });
    await getAdminFirestore().collection("users").doc(created.uid).set({
      uid: created.uid,
      email: created.email || email,
      displayName,
      role: "admin",
      addresses: [],
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, uid: created.uid });
  } catch (error) {
    console.error("Admin creation failed:", error);
    return NextResponse.json({ error: "Unable to create admin account." }, { status: 500 });
  }
}
