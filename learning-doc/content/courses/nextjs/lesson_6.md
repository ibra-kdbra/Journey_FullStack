# 📘 **Lesson 6: Building Layouts and Navigation**

## 🎯 Learning Objectives

- Understand and apply the **concept of nested layouts** in App Router.
- Create and manage **specific layouts** for different route groups (e.g., authentication pages, admin pages).
- Build a user-friendly **navigation menu** using `next/link` and `usePathname`.
- Create **dynamic metadata** to support SEO and social media sharing.
- Know how to design **responsive** layouts combining **Tailwind CSS** and **ShadcnUI**.

## 🧠 **Detailed Content**

### 1. **What is a Layout in Next.js App Router?**

**Concept**:
In App Router, `layout.tsx` defines a **UI framework (layout)** shared by the child pages within it. It allows for the reuse of parts like the Header, Sidebar, and Footer.

**Real-world example**: The main layout for the entire app might contain the Navigation bar, while the authentication page layout might just be a small centered box.

### 2. **Nested Layouts**

**Concept**:
Next.js allows for **layout within layout**, meaning a layout in a parent directory wraps the layout in a child directory. This helps organize the UI clearly and efficiently.

**Directory Example**:

```
/app
  layout.tsx ← main layout
  /auth
    layout.tsx ← specific layout for auth pages
    login/page.tsx
    register/page.tsx
  /dashboard
    layout.tsx ← specific layout for dashboard
    page.tsx
```

### 3. **Creating a Basic Layout**

Create `app/layout.tsx`:

```tsx
// app/layout.tsx
import "~/styles/globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="p-4 shadow bg-white">Logo & Navigation</header>
        <main className="p-6">{children}</main>
        <footer className="p-4 text-center text-sm text-gray-500">
          © 2025
        </footer>
      </body>
    </html>
  );
}
```

### 4. **Creating a Layout for Login/Registration Pages**

Create `app/auth/layout.tsx`:

```tsx
// app/auth/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        {children}
      </div>
    </div>
  );
}
```

### 5. **Navigation with `next/link`**

**Concept**:
`next/link` helps create links for page transitions in an SPA without reloading the entire page.

**Example**:

```tsx
// components/Navbar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4">
      {["/", "/about", "/dashboard"].map((path) => (
        <Link
          key={path}
          href={path}
          className={`px-3 py-2 rounded ${
            pathname === path ? "bg-blue-600 text-white" : "text-gray-700"
          }`}
        >
          {path === "/" ? "Home" : path.replace("/", "").toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
```

### 6. **Dynamic Metadata and SEO**

**Concept**:
Next.js allows defining metadata for each page to support SEO.

**Example**:

```tsx
// app/about/page.tsx
export const metadata = {
  title: "About - Vievlog",
  description: "About page for the Vievlog application.",
};
```

### 7. **Responsive Navigation with Tailwind CSS & ShadcnUI**

Using components from ShadcnUI:

```tsx
// components/ResponsiveNav.tsx
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function ResponsiveNav() {
  return (
    <div className="md:hidden flex justify-between items-center p-4 border-b">
      <span className="font-bold text-xl">Vievlog</span>
      <Button variant="outline" size="icon">
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
}
```

Combine this with a full menu in `md:flex` to create an adaptive layout.

## 🏆 Practice Exercises

### 🧾 Task

> **Create a layout system for an application with 2 layout zones:**
>
> - `app/layout.tsx` containing the shared navigation and footer.
> - `app/auth/layout.tsx` used specifically for `login` and `register`, without navigation.
>   Also, create a navigation menu that highlights the current tab using `usePathname`.

### ✅ Solution & Analysis

**1. Directory Structure**:

```
app/
  layout.tsx
  page.tsx
  about/page.tsx
  auth/
    layout.tsx
    login/page.tsx
    register/page.tsx
  components/
    Navbar.tsx
```

**2. Navigation Component**:

```tsx
// app/components/Navbar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="flex space-x-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded ${
            pathname === link.href ? "bg-blue-600 text-white" : "text-gray-800"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
```

**3. Integration into the Main Layout**:

```tsx
// app/layout.tsx
import Navbar from "./components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Navbar />
        <main>{children}</main>
        <footer className="text-sm text-gray-500 p-4 text-center">
          © 2025
        </footer>
      </body>
    </html>
  );
}
```

**4. Simple Auth Layout**:

```tsx
// app/auth/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        {children}
      </div>
    </div>
  );
}
```

## 🔑 Key Points to Remember

| Topic                 | Memory Aid                                                                          |
| --------------------- | ----------------------------------------------------------------------------------- |
| Layout in App Router  | `layout.tsx` wraps all `page.tsx` files within the same directory level             |
| Nested Layouts        | Multiple layers of layouts can be created in subdirectories (auth, dashboard...)    |
| `next/link`           | Always use this to replace `<a>` for internal links to avoid page reloads           |
| `usePathname`         | Use this to determine the current URL, useful for highlighting menus or breadcrumbs |
| Metadata              | Helps improve SEO, should be declared in each `page.tsx`                            |
| Responsive Navigation | Use Tailwind (`hidden`, `block`, `md:flex`...) and ShadcnUI for the UI              |

## 📝 Homework

> **Create another layout specifically for the `dashboard` section:**
>
> - `app/dashboard/layout.tsx` with a left sidebar containing 3 menus: Overview, Settings, Users.
> - Create `dashboard/page.tsx` displaying "Welcome to the Dashboard".
> - When a user accesses /dashboard, the sidebar should always be visible, and the current menu item should be highlighted.

👉 **Hint**: Use `usePathname` to check the current path and highlight the corresponding menu item.
