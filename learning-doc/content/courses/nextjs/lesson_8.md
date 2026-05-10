# 🎓 **Lesson 8: State Management in Next.js App Router**

## 🎯 **Learning Objectives**

After completing this lesson, students will:

- Understand what **state** is and its role in React/Next.js App Router.
- Master the use of `useState` and `useReducer` for **local state**.
- Know how to share state between components using the **Context API**.
- Know how to organize **global state** with Zustand.
- Know how to **persist state across reloads or navigation** (state persistence).
- Be able to create a context (e.g., Theme, Auth) and implement it in App Router.
- Know when to use local state, context, or a global store.

## 📝 **Detailed Content**

### 1. **What is State?**

**State** is internal data stored within a component to reflect the UI in real-time.
For example: When a user types into an input or clicks a button — we need state to store and react to that action.

➡️ Before coding: Visualize state as a **temporary memory** that allows the interface to interact with the user.

### 2. **Local State with `useState`**

📌 `useState` is the simplest hook for creating state within a component.

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      <p>You have clicked {count} times</p>
      <button onClick={() => setCount(count + 1)} className="btn">
        Increment
      </button>
    </div>
  );
}
```

✅ When to use:

- For small UI components where state doesn't need to be shared widely.

### 3. **Advanced Local State with `useReducer`**

📌 `useReducer` is suitable for more complex logic (like a lightweight Redux).

```tsx
"use client";

import { useReducer } from "react";

function reducer(state: number, action: "increment" | "decrement") {
  switch (action) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
  }
}

export default function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);

  return (
    <div className="p-4">
      <p>Count: {count}</p>
      <button onClick={() => dispatch("increment")} className="btn">
        +
      </button>
      <button onClick={() => dispatch("decrement")} className="btn">
        -
      </button>
    </div>
  );
}
```

✅ When to use:

- When state logic is complex (e.g., multiple transition conditions).
- When you want to separate the reducer into its own file like Redux.

### 4. **Sharing State with Context API**

📌 Context API is used to share state between components that are **not directly related**.

**Example: ThemeContext for Dark/Light mode**

#### 1. `theme-context.tsx`

```tsx
"use client";

import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};
```

#### 2. Usage in `layout.tsx`

```tsx
import { ThemeProvider } from "./theme-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

#### 3. Theme Switcher Component

```tsx
"use client";
import { useTheme } from "./theme-context";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Switch to {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
```

✅ When to use:

- For state like `auth`, `theme`, `language`, etc.
- Avoid for very frequently changing data (can cause many re-renders).

### 5. **Global State with Zustand (Modern, Lightweight)**

📌 Zustand helps you create global state without needing Context or Redux.

#### 1. Installation

```bash
npm install zustand
```

#### 2. Creating a Store

```tsx
import { create } from "zustand";

type CounterStore = {
  count: number;
  increase: () => void;
  reset: () => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
```

#### 3. Usage in a Component

```tsx
"use client";

import { useCounterStore } from "./store";

export default function GlobalCounter() {
  const { count, increase, reset } = useCounterStore();

  return (
    <div className="p-4">
      <p>Global count: {count}</p>
      <button onClick={increase} className="btn">
        +
      </button>
      <button onClick={reset} className="btn">
        Reset
      </button>
    </div>
  );
}
```

✅ When to use:

- Global state management, easier to use than Redux.
- No boilerplate needed compared to Redux.

### 6. **State Persistence and Hydration**

📌 You can **save state to localStorage** and restore it after a reload.

```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeStore = {
  theme: "light" | "dark";
  toggle: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      toggle: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    { name: "theme-storage" }
  )
);
```

✅ Keeps the **user's selected theme** even after reloading the page.

## 🏆 **Practice Exercise with Detailed Solution**

### 🎯 Task

> Create an `AuthContext` using the `Context API` that contains:
>
> - Login status (isLoggedIn)
> - `login()` and `logout()` functions
>
> Create a mock login form (no API connection). When "Login" is clicked, display "Welcome, you are logged in!", along with a "Logout" button.

### ✅ Detailed Solution

#### 1. Create `auth-context.tsx`

```tsx
"use client";

import { createContext, useContext, useState } from "react";

const AuthContext = createContext<{
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};
```

#### 2. Usage in `layout.tsx`

```tsx
import { AuthProvider } from "./auth-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

#### 3. Create Login Form

```tsx
"use client";
import { useAuth } from "./auth-context";

export default function LoginForm() {
  const { isLoggedIn, login, logout } = useAuth();

  return (
    <div className="p-4">
      {isLoggedIn ? (
        <>
          <p>✅ Welcome, you are logged in!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <p>🔐 Please log in</p>
          <button onClick={login}>Login</button>
        </>
      )}
    </div>
  );
}
```

## 🔑 **Key Points to Remember**

- `useState` and `useReducer` only work in **Client Components** (`'use client'`).
- Context API should be used for **lightweight, sparsely shared data**; it's not suitable for large states.
- Zustand is an excellent alternative to Redux, with **less boilerplate** and easier scalability.
- Always place the `Provider` in the correct `layout.tsx` or `template.tsx` to avoid null context errors.
- Avoid storing `passwords` or `tokens` in state – use `cookies` or `httpOnly` instead.

## 📝 **Homework**

### 🎯 Task

> Create a `CounterStore` using Zustand to manage the number of visits a user has made to the application.
> Each time the user reloads the page, the visit count should **increase by 1 and remain persisted after the reload**.

Requirements:

- Use Zustand + `persist` middleware.
- Display the visit count in the top-right corner of the screen.
