// ~/lib/auth-client.ts
import PocketBase from "pocketbase";
import { useState, useEffect, useCallback } from "react";

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8090"
);

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  image?: string; // Backwards compatibility for UI
  created: string;
  updated: string;
}

export interface Session {
  user: User;
  token: string;
}

// Account registration
export async function signUp({
  username,
  email,
  password,
  passwordConfirm,
}: {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): Promise<User> {
  try {
    const record = await pb.collection("users_tbl").create<User>({
      username,
      email,
      password,
      passwordConfirm,
    });
    return record;
  } catch (error: any) {
    console.error("SignUp error details:", error);
    console.error("Error data:", error.data);
    throw error;
  }
}

// Login
export async function signIn(
  email: string,
  password: string
): Promise<Session> {
  const authData = await pb
    .collection("users_tbl")
    .authWithPassword(email, password);
  return {
    user: authData.record as unknown as User,
    token: authData.token,
  };
}

// Get user information from PocketBase authStore
const fetchUser = async (): Promise<{ user: User } | null> => {
  if (!pb.authStore.isValid) return null;

  try {
    const user = pb.authStore.model as unknown as User;
    return { user };
  } catch (err) {
    return null;
  }
};

// Hook useSession
export function useSession() {
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [isPending, setIsPending] = useState(true);

  const refetch = useCallback(async () => {
    setIsPending(true);
    const data = await fetchUser();
    setSession(data);
    setIsPending(false);
  }, []);

  useEffect(() => {
    refetch();

    // Listen for token (auth) changes in localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === "pocketbase_auth") {
        refetch();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refetch]);

  return {
    data: session,
    isPending,
    refetch,
  };
}

// Logout
// ~/lib/auth-client.ts
export async function signOut(token?: string) {
  try {
    if (!token) {
      const stored = localStorage.getItem("pocketbase_auth");
      token = stored ? JSON.parse(stored).token : undefined;
    }

    if (!token) throw new Error("No token found");

    await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Clear localStorage
    localStorage.removeItem("pocketbase_auth");

    // Redirect if necessary
    window.location.href = "/auth/sign-in";
  } catch (err) {
    console.error("Error signing out:", err);
  }
}
