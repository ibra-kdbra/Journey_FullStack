"use client";
import { ReactNode, useCallback, useMemo } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function useAuthFromKinde() {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!isAuthenticated) return null;
      try {
        const res = await fetch("/api/convex-token", { cache: "no-store" });
        if (!res.ok) return null;
        const { token } = await res.json();
        return (token as string) ?? null;
      } catch {
        return null;
      }
    },
    [isAuthenticated]
  );

  return useMemo(
    () => ({
      isLoading: !!isLoading,
      isAuthenticated: !!isAuthenticated,
      fetchAccessToken,
    }),
    [isLoading, isAuthenticated, fetchAccessToken]
  );
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromKinde}>
      {children}
    </ConvexProviderWithAuth>
  );
}
