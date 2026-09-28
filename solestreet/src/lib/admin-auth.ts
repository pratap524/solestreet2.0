import { NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { isFirebaseConfigured } from "@/lib/firebase/client";

/**
 * Verifies the request has a valid admin token.
 * Returns the user profile if valid, or a NextResponse error.
 */
export async function verifyAdminRequest(
  req: Request
): Promise<
  | { authorized: true; uid: string; email: string; role: "admin" }
  | { authorized: false; response: NextResponse }
> {
  // Demo mode: check for demo admin header
  if (!isFirebaseConfigured()) {
    const demoAdmin = req.headers.get("x-demo-admin");
    const demoUid = req.headers.get("x-demo-uid") || "admin_demo";
    const demoEmail = req.headers.get("x-demo-email") || "admin@solestreet.com";

    if (demoAdmin === "true") {
      return { authorized: true, uid: demoUid, email: demoEmail, role: "admin" };
    }
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 }
      ),
    };
  }

  // Production mode: verify Firebase ID token
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.slice(7);

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);

    // Check admin role from Firestore user document
    const adminDb = getAdminFirestore();
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "User profile not found" },
          { status: 403 }
        ),
      };
    }

    const userData = userDoc.data();
    if (userData?.role !== "admin") {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Insufficient permissions. Admin access required." },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      uid: decoded.uid,
      email: decoded.email || "",
      role: "admin",
    };
  } catch (err) {
    console.error("[Admin Auth] Token verification failed:", err);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 }
      ),
    };
  }
}

/**
 * Creates an audit log entry for admin actions.
 */
export function createAuditLog(
  action: string,
  resource: string,
  resourceId: string,
  userId: string,
  userName: string,
  details?: string
) {
  const entry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    resource,
    resourceId,
    userId,
    userName,
    details,
    timestamp: new Date().toISOString(),
  };

  // In production, this would write to Firestore.
  // For now, structured log for observability.
  console.log("[AuditLog]", JSON.stringify(entry));
  return entry;
}
