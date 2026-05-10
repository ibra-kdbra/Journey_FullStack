# 📘 **Lesson 9: Data Fetching and API Integration**

## 🎯 **Learning Objectives**

After completing this lesson, students will:

- Clearly understand the different _data fetching_ methods in Next.js App Router (Server-side & Client-side).
- Know how to use `fetch()` in Server Components.
- Create and integrate **Route Handlers (API Routes)** in App Router.
- Know how to use the **SWR** library for efficient client-side data fetching.
- Be able to handle **loading states**, **error states**, and data **caching**.
- Connect to a real backend API (e.g., a Gin Golang REST API).
- Understand when and why to choose each fetching method.

## 📝 **Detailed Content**

### I. Data Fetching Overview

#### 🔹 What is Data Fetching?

It is the process of retrieving data from an external source (API, database, etc.) to display it on the user interface.

#### 🔹 Why is understanding Fetch Data important?

In Next.js App Router, data can be fetched on both the **server** and the **client**. Choosing the correct fetching strategy optimizes performance and the user experience.

### II. Data Fetching in **Server Components**

#### 📘 Concept

Next.js App Router prioritizes fetching data in **Server Components** to improve performance and SEO.

#### ✅ Advantages

- Faster page loads.
- No redundant client-side fetching.
- SEO optimized.

#### 💡 Example: Fetching a list of posts from an API

```ts
// app/posts/page.tsx
import { Post } from "@/types";

async function getPosts(): Promise<Post[]> {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60 }, // ISR caching
  });

  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border rounded">
          {post.title}
        </div>
      ))}
    </div>
  );
}
```

### III. Creating Route Handlers (API Routes) in App Router

#### 📘 Concept

In App Router, API Routes are called **Route Handlers**, and they reside in the `/app/api` directory.

#### 🛠 Organization

```
/app/api/posts/route.ts
```

#### 💡 Example: Creating an API that returns a list of posts

```ts
// app/api/posts/route.ts
import { NextResponse } from "next/server";

const data = [
  { id: 1, title: "What is Next.js?" },
  { id: 2, title: "Deep Dive into App Router" },
];

export async function GET() {
  return NextResponse.json(data);
}
```

### IV. Data Fetching in **Client Components**

#### 📘 Concept

Client-side fetching allows data to be loaded after the initial page render — suitable for dynamic or real-time data.

#### 🔧 Popular Libraries

- `SWR` (Stale While Revalidate)
- `React Query` (advanced, not covered in this lesson)

#### 💡 Example: Using SWR to fetch a post list

```ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PostListClient() {
  const { data, error, isLoading } = useSWR("/api/posts", fetcher);

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div>
      {data.map((post: any) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

### V. Handling Loading and Error States

When fetching data, it's essential to **display clear states** to the user:

#### ✅ Loading

- Display a spinner or a placeholder.

#### ✅ Error

- Provide a clear error message.
- Optionally include a retry button.

💡 In SWR, these states are determined by `isLoading` and `error`.

## 🏆 **Practice Exercise**

### Task

> Build a `/books` page using a Server Component to fetch a list of books from a mock API at `/api/books`. Each book has an `id`, `title`, and `author`.

### Step 1: Create the Route Handler `/api/books`

```ts
// app/api/books/route.ts
import { NextResponse } from "next/server";

const books = [
  { id: 1, title: "Learn Next.js", author: "John Doe" },
  { id: 2, title: "Tailwind Mastery", author: "Jane Smith" },
];

export async function GET() {
  return NextResponse.json(books);
}
```

### Step 2: Create the `/books` page to fetch from the API

```ts
// app/books/page.tsx

async function getBooks() {
  const res = await fetch("http://localhost:3000/api/books", {
    next: { revalidate: 30 },
  });

  return res.json();
}

export default async function BookPage() {
  const books = await getBooks();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Book List</h1>
      {books.map((book: any) => (
        <div key={book.id} className="border p-4 rounded">
          <p className="font-semibold">{book.title}</p>
          <p className="text-gray-500">Author: {book.author}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔑 **Key Points to Remember**

| Topic                        | Memory Aid                                                |
| ---------------------------- | --------------------------------------------------------- |
| `fetch` in Server Components | No `useEffect` needed, runs automatically server-side     |
| `use client`                 | Required when using `useSWR`, `useEffect`, or React hooks |
| API Routes in App Router     | Located in `/app/api/.../route.ts`                        |
| `SWR` vs `fetch`             | SWR is for client-side, with caching and revalidation     |
| Avoid double fetching        | Do not fetch on both Server and Client for the same data  |

## 📝 **Homework**

### Task

> Create a `/users` page using a **Client Component + SWR** to fetch data from an API at `/api/users`, where each user has an `id`, `name`, and `email`. Display the user list and handle loading/error states clearly.

### Hints

1. Create `app/api/users/route.ts` similar to the `books` section.
2. Use `useSWR` to fetch data in `app/users/page.tsx` (ensure you use `"use client"`).
3. Use Tailwind CSS or ShadcnUI for styling if you want a better look.
