# 🎓 **Lesson 1: Introduction to Next.js App Router and Building Applications**

## 🎯 Learning Objectives

✅ Understand **what Next.js is** and why you should use it  
✅ Know the differences between **App Router** and **Pages Router**  
✅ Clearly understand the new directory structure with `app/`  
✅ Differentiate between **Server Components** and **Client Components**

## 📝 Detailed Content

### 1. **What is Next.js and why use it?**

**Concept**:
Next.js is a **React framework** developed by Vercel that helps build **high-performance, SEO-friendly** web applications, supporting both **SSR (server-side rendering)** and **SSG (static site generation)**.

### 2. **App Router vs. Pages Router**

| Criteria       | Pages Router (`pages/`)    | App Router (`app/`)                      |
| -------------- | -------------------------- | ---------------------------------------- |
| Routing Method | Based on files in `pages/` | Based on folders/files in `app/`         |
| Component type | Client Components only     | Supports both Server & Client Components |
| Layout         | No root layout             | Supports nested layouts (`layout.tsx`)   |
| Advantages     | Simple, familiar           | Modern, powerful, performance-optimized  |

### 3. **App Router Directory Structure**

```
my-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── about/
│       └── page.tsx
├── public/
├── styles/
├── tsconfig.json
└── next.config.js
```

### 4. **Server Component vs. Client Component**

**Concepts**:

- **Server Component**:

  - Default in App Router.
  - Rendered **on the server**, reducing unnecessary JavaScript sent to the client.
  - Does not use `useState`, `useEffect`, `onClick`, etc.

- **Client Component**:

  - Used when interactivity is needed (buttons, effects, state).
  - Must declare `"use client"` at the top of the file.

## 💻 **Practice: Create your first Next.js project with App Router**

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

> 🔎 `--app`: Choose App Router  
> 🔎 `--typescript`: Create project with TypeScript

## 🏆 **Practice Exercises**

### 🔖 Task

Create a new page named **About** at the path `/about`. This page should display a title and a description of Next.js.

## 🔑 Key Points to Remember

| Points to Note                                                                            |
| ----------------------------------------------------------------------------------------- |
| App Router uses the `app/` directory instead of `pages/`                                  |
| `layout.tsx` must return the `<html><body>{children}</body></html>` structure             |
| Server Components are the default; only add `"use client"` when interactivity is required |
| `page.tsx` = each route within app/                                                       |

## 📝 Homework

### 🧠 Task

Create another page named **Contact** at the path `/contact`, containing the following:

- Title: "Contact Us"
- Description: "You can send an email to [contact@myapp.com](mailto:contact@myapp.com) to get in touch."

> 💡 Extension: Try adding Tailwind CSS classes like `bg-white`, `shadow`, `rounded` to this page for extra practice.
