# 🎓 **Lesson 10: Authentication and Authorization (Auth)**

## 🎯 **Learning Objectives**

After this lesson, students will:

- Understand the concepts of **authentication** and **authorization** in web applications.
- Know how to implement **route protection middleware** in Next.js App Router.
- Master how **JWT and Cookie-based Auth** work in a client-server environment.
- Be able to create **login pages**, **registration pages**, and check authentication status.
- Understand and apply **Role-Based Access Control (RBAC)**.
- Integrate with a **Golang API backend** for user authentication.

## 📝 **Detailed Content**

### 1. 💡 Basic Concepts

#### ✅ What is Authentication?

**Authentication** is the process of verifying _who you are_ – for example, entering an email and password so the system confirms your identity.

👉 Real-world example: Logging into Gmail with your Google account.

#### ✅ What is Authorization?

**Authorization** is the process of verifying _what you are allowed to do_ – for example, after logging in, are you allowed to access the admin page?

👉 Real-world example: A regular user account cannot modify other users' permissions.

### 2. 🔐 Common Authentication Methods

| Type    | Main Features                                 | Best for...              |
| ------- | --------------------------------------------- | ------------------------ |
| JWT     | Stores token on client (localStorage, cookie) | SPA, API-based apps      |
| Session | Stores session on server                      | SSR apps, legacy systems |
| OAuth   | Auth via Google, Facebook, etc.               | Social login, 3rd party  |

> In this lesson, we use **JWT + Cookie-based auth** – straightforward and well-suited for Next.js App Router and Golang APIs.

### 3. 📁 General Architecture

```plaintext
/pages
  - login/page.tsx
  - register/page.tsx
  - dashboard/page.tsx
/middleware.ts   ← Route protection
/lib
  - auth.ts       ← Auth logic
  - roles.ts      ← RBAC logic
/context
  - auth-context.tsx ← Shared login state via useContext
```

### 4. 👤 Setting up the **Login** & **Registration** Pages

> Using **ShadcnUI Form + Tailwind CSS**

#### 🧱 Process Description

1. Enter email & password.
2. Send data to Golang API (`/auth/login`).
3. Backend returns `access_token` + `refresh_token`.
4. Store `access_token` in a **cookie** (HTTP-only).
5. Redirect to `/dashboard`.

#### 📄 Login: `/login/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await axios.post("/api/login", { email, password });
    if (res.status === 200) router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <Input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleLogin}>Login</Button>
    </div>
  );
}
```

### 5. ⚙️ Route Protection Middleware

#### 🧱 Description

- Every time a user visits `/dashboard`, the middleware checks for a token in the cookies.
- If missing, redirect to `/login`.

#### 📄 middleware.ts

```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token");
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

> 🔑 Don't forget to declare the matcher in `next.config.js`:

```js
matcher: ["/dashboard/:path*"];
```

### 6. 🔁 Creating an **Auth Context** to share state

#### 📄 context/auth-context.tsx

```tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("/api/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 7. 🧑‍💼 Role-Based Access Control (RBAC)

#### 🧱 Description

- Backend returns user role (admin, user...).
- Frontend checks the role before displaying features.

#### 📄 roles.ts

```ts
export const hasRole = (user, role: string) => user?.role === role;
```

#### 📄 dashboard/page.tsx

```tsx
import { useAuth } from "@/context/auth-context";
import { hasRole } from "@/lib/roles";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {hasRole(user, "admin") && <p>🔧 Admin Management Page</p>}
    </div>
  );
}
```

## 🏆 **Practice Exercise (with Solution)**

### 📌 Task

Build a login system using JWT & Cookies:

- Interface: Use ShadcnUI.
- Form submission to `/api/login`, backend returns JWT.
- Store JWT in a cookie.
- Middleware blocks unauthenticated users from accessing `/dashboard`.

### ✅ Detailed Solution

- [x] Use Shadcn `<Input>` and `<Button>`.
- [x] Call API via `axios.post("/api/login", {...})`.
- [x] Receive token and store it using `setCookie` in a route handler.
- [x] `middleware.ts` checks for the token.
- [x] Add `AuthContext` to manage login status.

## 🔑 **Key Points to Remember**

| Concept                      | Common Pitfalls                              |
| ---------------------------- | -------------------------------------------- |
| `middleware.ts`              | Cannot access `localStorage`, use `cookies`  |
| `axios.post`                 | Send data as JSON (correct `Content-Type`)   |
| `setCookie` in route handler | Use `httpOnly` for security                  |
| `use client`                 | Necessary when using client-side state/hooks |
| `AuthContext`                | Does not fully replace middleware            |

## 📝 **Homework**

### 📌 Task

Create an `/admin` page that only allows users with the `"admin"` role to access. If not an admin, redirect to `/dashboard`.

### 🔍 Hints

- Middleware checks the JWT and decodes the role.
- If not an admin → `redirect("/dashboard")`.
- The `/admin/page.tsx` file displays the management content.
