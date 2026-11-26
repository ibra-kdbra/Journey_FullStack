import { lucia } from "lucia";
import { web } from "lucia/middleware";
import { libsql } from "@lucia-auth/adapter-sqlite";
import { client } from "./drizzle";
import { github, google } from "@lucia-auth/oauth/providers";

// Derive environment-dependent security settings from NODE_ENV.
export const isProduction = process.env.NODE_ENV === "production";

export const auth = lucia({
  env: isProduction ? "PROD" : "DEV", // "PROD" makes lucia set `Secure` on the session cookie
  middleware: web(),
  // the cookie expires together with the session (lucia default) instead of never
  sessionCookie: {
    expires: true,
  },
  adapter: libsql(client, {
    user: "user",
    key: "user_key",
    session: "user_session",
  }),
  getUserAttributes: (user) => {
    return {
      name: user.name,
      githubUsername: user.username,
    };
  },
});

export const githubAuth = github(auth, {
  clientId: process.env.GITHUB_CLIENT_ID as string,
  clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
});

export const googleAuth = google(auth, {
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  redirectUri: process.env.GOOGLE_REDIRECT_URI as string,
});

export type Auth = typeof auth;
