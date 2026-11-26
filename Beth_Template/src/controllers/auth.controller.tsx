import { auth, isProduction } from "../utils/lucia";
import { Context, t } from "elysia";
import { LuciaError } from "lucia";
import { githubAuth, googleAuth } from "../utils/lucia";
import { serializeCookie } from "lucia/utils";
import { parseCookie } from "lucia/utils";
import { OAuthRequestError } from "@lucia-auth/oauth";

export const loginBodySchema = t.Object({
  email: t.String({ format: "email", maxLength: 254 }),
  password: t.String({ minLength: 1, maxLength: 255 }),
});

export const signupBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  email: t.String({ format: "email", maxLength: 254 }),
  password: t.String({ minLength: 8, maxLength: 255 }),
});

type LoginBody = typeof loginBodySchema.static;
type SignupBody = typeof signupBodySchema.static;

export const credentialsLoginController = async ({ body, set }: Context) => {
  const { email, password } = body as LoginBody;

  try {
    const key = await auth.useKey("email", email, password);
    const sessionData = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });
    const sessionCookie = auth.createSessionCookie(sessionData);

    return new Response(null, {
      headers: {
        Location: "/dashboard",
        "Set-Cookie": sessionCookie.serialize(), // store session cookie
      },
      status: 302,
    });
  } catch (error) {
    set.status = 401;
    return "Login failed";
  }
};

export const credentialsSignupController = async ({ body, set }: Context) => {
  const { email, password, name } = body as SignupBody;
  try {
    await auth.createUser({
      key: {
        providerId: "email",
        providerUserId: email,
        password,
      },
      attributes: {
        name,
      },
    });
    set.status = 201;
    return "Register success";
  } catch (e) {
    if (e instanceof LuciaError && e.message === `AUTH_DUPLICATE_KEY_ID`) {
      set.status = 409;
      return "Register failed, email already exists";
    }
    console.error("Register failed:", e instanceof Error ? e.message : "unknown error");
    set.status = 500;
    return "Register failed";
  }
};

export const logoutController = async ({ set, cookie: { auth_session } }: Context) => {
  await auth.invalidateSession(auth_session.value);
  auth_session.remove();
  set.redirect = "/login";
};

export const githubLoginController = async () => {
  const [url, state] = await githubAuth.getAuthorizationUrl();
  const stateCookie = serializeCookie("github_oauth_state", state, {
    httpOnly: true,
    secure: isProduction,
    path: "/",
    maxAge: 60 * 60,
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Set-Cookie": stateCookie,
    },
  });
};

export const githubLoginCallbackController = async ({ request }: Context) => {
  const cookies = parseCookie(request.headers.get("Cookie") ?? "");
  const storedState = cookies.github_oauth_state;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  // validate state
  if (!storedState || !state || storedState !== state || !code) {
    return new Response(null, {
      status: 400,
    });
  }
  try {
    const { getExistingUser, githubUser, createUser } = await githubAuth.validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;
      const user = await createUser({
        attributes: {
          username: githubUser.login,
        },
      });
      return user;
    };

    const user = await getUser();
    const sessionData = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });
    const sessionCookie = auth.createSessionCookie(sessionData);

    // redirect to profile page
    return new Response(null, {
      headers: {
        Location: "/dashboard",
        "Set-Cookie": sessionCookie.serialize(), // store session cookie
      },
      status: 302,
    });
  } catch (e) {
    if (e instanceof OAuthRequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
};

export const googleLoginController = async () => {
  const [url, state] = await googleAuth.getAuthorizationUrl();
  const stateCookie = serializeCookie("google_oauth_state", state, {
    httpOnly: true,
    secure: isProduction,
    path: "/",
    maxAge: 60 * 60,
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Set-Cookie": stateCookie,
    },
  });
};

export const googleLoginCallbackController = async ({ request }: Context) => {
  const cookies = parseCookie(request.headers.get("Cookie") ?? "");
  const storedState = cookies.github_oauth_state;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!state || !code) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const { getExistingUser, googleUser, createUser } = await googleAuth.validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;
      const user = await createUser({
        attributes: {
          name: googleUser.name,
        },
      });
      return user;
    };

    const user = await getUser();
    const sessionData = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });
    const sessionCookie = auth.createSessionCookie(sessionData);

    // redirect to profile page
    return new Response(null, {
      headers: {
        Location: "/dashboard",
        "Set-Cookie": sessionCookie.serialize(), // store session cookie
      },
      status: 302,
    });
  } catch (e) {
    if (e instanceof OAuthRequestError) {
      console.log(e);
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
};
