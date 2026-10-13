import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./client";
import type { UserProfile, Address } from "@/types";

const MOCK_STORAGE_USER_KEY = "solestreet_mock_user";
const MOCK_STORAGE_USERS_DB = "solestreet_mock_users_db";

function getLocalUsersDb(): Record<string, UserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_USERS_DB);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUsersDb(dbRecord: Record<string, UserProfile>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MOCK_STORAGE_USERS_DB, JSON.stringify(dbRecord));
  } catch {
    // ignore
  }
}

async function hashLocalPassword(password: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Secure password hashing is unavailable in this browser.");
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<UserProfile> {
  if (!isFirebaseConfigured()) {
    // Demo / Offline Auth mode
    const users = getLocalUsersDb();
    if (users[email.toLowerCase()]) {
      throw new Error("An account with this email already exists.");
    }
    const uid = "user_" + Math.random().toString(36).substring(2, 9);
    const profile: UserProfile = {
      uid,
      email: email.toLowerCase(),
      displayName,
      role: "customer",
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: await hashLocalPassword(pass),
    };
    users[email.toLowerCase()] = profile;
    saveLocalUsersDb(users);
    if (typeof window !== "undefined") {
      localStorage.setItem(MOCK_STORAGE_USER_KEY, JSON.stringify(profile));
    }
    return profile;
  }

  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(cred.user, { displayName });

  const profile: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email || email,
    displayName: displayName || cred.user.displayName || "Shoe Enthusiast",
    photoURL: cred.user.photoURL || undefined,
    role: "customer",
    addresses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", cred.user.uid), profile);
  return profile;
}

export async function signInWithEmail(
  email: string,
  pass: string
): Promise<UserProfile> {
  if (!isFirebaseConfigured()) {
    const users = getLocalUsersDb();
    const normalizedEmail = email.toLowerCase();
    const isDemoAdmin = normalizedEmail === "admin@solestreet.com" || normalizedEmail === "majorpartap2026@gmail.com";
    const isDemoCustomer = normalizedEmail === "customer@solestreet.com";
    const legacyPrimaryEmails = ["majorpartap2026@gmial.com", "marjorpartap2026@gamil.com"];
    const legacyPrimaryEmail = legacyPrimaryEmails.find((legacyEmail) => users[legacyEmail]);
    const legacyPrimary = normalizedEmail === "majorpartap2026@gmail.com" && legacyPrimaryEmail
      ? users[legacyPrimaryEmail]
      : undefined;
    const existing = users[normalizedEmail] || legacyPrimary;

    if (!existing && !isDemoAdmin && !isDemoCustomer) {
      throw new Error("No account exists for this email. Please create an account first.");
    }

    const suppliedHash = await hashLocalPassword(pass);
    const demoPassword = isDemoAdmin ? "Admin1234!" : isDemoCustomer ? "Customer1234!" : null;

    const isLegacyPrimaryMigration = Boolean(legacyPrimary && normalizedEmail === "majorpartap2026@gmail.com");
    if (existing?.passwordHash && existing.passwordHash !== suppliedHash && !(isLegacyPrimaryMigration && demoPassword === pass)) {
      throw new Error("Invalid email or password.");
    }
    if (existing && !existing.passwordHash) {
      // Migrate older demo records created before local password support.
      // Only the fixed demo credentials may perform this migration.
      if (demoPassword !== pass) {
        throw new Error("Invalid email or password.");
      }
      existing.passwordHash = suppliedHash;
      existing.email = normalizedEmail;
      existing.displayName = "Major Partap";
      existing.role = "admin";
      if (legacyPrimaryEmail) delete users[legacyPrimaryEmail];
      users[normalizedEmail] = existing;
      saveLocalUsersDb(users);
    }

    if (isLegacyPrimaryMigration && demoPassword === pass) {
      existing.passwordHash = suppliedHash;
      existing.email = normalizedEmail;
      existing.displayName = "Major Partap";
      existing.role = "admin";
      if (legacyPrimaryEmail) delete users[legacyPrimaryEmail];
      users[normalizedEmail] = existing;
      saveLocalUsersDb(users);
    }
    if (!existing && demoPassword !== pass) {
      throw new Error("Invalid email or password.");
    }

    if (!existing) {
      const uid = isDemoAdmin
        ? "admin_demo_uid"
        : "user_" + Math.random().toString(36).substring(2, 9);
      const profile: UserProfile = {
        uid,
        email: normalizedEmail,
        displayName: isDemoAdmin
          ? normalizedEmail === "majorpartap2026@gmail.com" ? "Major Partap" : "Admin"
          : email.split("@")[0] || "Shoe Enthusiast",
        role: isDemoAdmin ? "admin" : "customer",
        addresses: [],
        createdAt: new Date().toISOString(),
        passwordHash: suppliedHash,
      };
      users[normalizedEmail] = profile;
      saveLocalUsersDb(users);
      if (typeof window !== "undefined") {
        localStorage.setItem(MOCK_STORAGE_USER_KEY, JSON.stringify(profile));
      }
      return profile;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(MOCK_STORAGE_USER_KEY, JSON.stringify(existing));
    }
    return existing;
  }

  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const userDoc = await getDoc(doc(db, "users", cred.user.uid));

  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }

  const newProfile: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email || email,
    displayName: cred.user.displayName || "Shoe Enthusiast",
    photoURL: cred.user.photoURL || undefined,
    role: "customer",
    addresses: [],
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, "users", cred.user.uid), newProfile);
  return newProfile;
}

export async function signInWithGoogle(): Promise<UserProfile> {
  if (!isFirebaseConfigured()) {
    const email = "google.demo@solestreet.com";
    const profile: UserProfile = {
      uid: "google_demo_uid_123",
      email,
      displayName: "Google Demo User",
      role: "customer",
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(MOCK_STORAGE_USER_KEY, JSON.stringify(profile));
    }
    return profile;
  }

  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const userDoc = await getDoc(doc(db, "users", cred.user.uid));

  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }

  const newProfile: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email || "",
    displayName: cred.user.displayName || "Google User",
    photoURL: cred.user.photoURL || undefined,
    role: "customer",
    addresses: [],
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, "users", cred.user.uid), newProfile);
  return newProfile;
}

export async function signOutUser(): Promise<void> {
  if (!isFirebaseConfigured()) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(MOCK_STORAGE_USER_KEY);
    }
    return;
  }
  await firebaseSignOut(auth);
}

export async function sendResetPassword(email: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    return; // Simulated success
  }
  await sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MOCK_STORAGE_USER_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as UserProfile;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  if (!isFirebaseConfigured()) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MOCK_STORAGE_USER_KEY);
      if (stored) {
        const current = JSON.parse(stored);
        const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem(MOCK_STORAGE_USER_KEY, JSON.stringify(updated));
        const users = getLocalUsersDb();
        if (updated.email) users[updated.email.toLowerCase()] = updated;
        saveLocalUsersDb(users);
      }
    }
    return;
  }

  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function addUserAddress(
  uid: string,
  address: Omit<Address, "id">
): Promise<Address> {
  const newAddress: Address = {
    ...address,
    id: "addr_" + Math.random().toString(36).substring(2, 9),
  };

  const profile = await getUserProfile(uid);
  const addresses = profile?.addresses || [];

  if (newAddress.isDefault) {
    addresses.forEach((a) => (a.isDefault = false));
  } else if (addresses.length === 0) {
    newAddress.isDefault = true;
  }

  const updatedAddresses = [...addresses, newAddress];
  await updateUserProfile(uid, { addresses: updatedAddresses });
  return newAddress;
}

export async function deleteUserAddress(
  uid: string,
  addressId: string
): Promise<void> {
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const filtered = profile.addresses.filter((a) => a.id !== addressId);
  if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
    filtered[0].isDefault = true;
  }
  await updateUserProfile(uid, { addresses: filtered });
}

export async function setDefaultUserAddress(
  uid: string,
  addressId: string
): Promise<void> {
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const updated = profile.addresses.map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));
  await updateUserProfile(uid, { addresses: updated });
}

export async function updateUserAddress(
  uid: string,
  addressId: string,
  address: Partial<Omit<Address, "id">>
): Promise<Address | null> {
  const profile = await getUserProfile(uid);
  if (!profile) return null;

  let updatedTarget: Address | null = null;
  const updatedAddresses = profile.addresses.map((a) => {
    if (a.id === addressId) {
      updatedTarget = {
        ...a,
        ...address,
        id: a.id,
      };
      return updatedTarget;
    }
    if (address.isDefault) {
      return { ...a, isDefault: false };
    }
    return a;
  });

  await updateUserProfile(uid, { addresses: updatedAddresses });
  return updatedTarget;
}
