# 📚 LESSON 7: Server Components vs Client Components

## 🎯 Learning Objectives

After completing this lesson, students will:

- Clearly understand the difference between **Server Components** and **Client Components** in Next.js App Router.
- Know when to use each component type to optimize performance.
- Know how to **distinguish**, **use**, and **organize** source code effectively between Server and Client Components.
- Master the `"use client"` directive and understand its purpose.
- Know how to **fetch data in Server Components** and **handle user interactions in Client Components**.
- Apply **Suspense** and **Streaming** in a simple, practical way.

## 📝 Detailed Content

### I. **Overview of Server & Client Components**

#### ❓ Concepts

- **Server Components**: Components that run entirely on the server and never send JavaScript code to the client.
- **Client Components**: Components that are bundled and sent to the client to support interactivity (event handling, animation, state, etc.).

#### ✅ Benefits of Separation

| Feature                      | Server Components            | Client Components        |
| ---------------------------- | ---------------------------- | ------------------------ |
| Where does it run?           | On the server                | In the browser           |
| Can use useState, useEffect? | ❌ No                        | ✅ Yes                   |
| Can fetch data?              | ✅ Yes (even better)         | ✅ Yes, but less optimal |
| Is it bundled to the client? | ❌ No                        | ✅ Yes                   |
| Performance optimization?    | ✅ Better (less JS download) | ❌ Heavier               |

### II. **Distinguishing and Declaring Components**

#### 🛠 Default in App Router

- **Default is Server Component** if no directive is provided.
- To declare a **Client Component**? 👉 Add the line `"use client"` at the very top.

#### 📌 Examples

```tsx
// app/components/HelloServer.tsx (Server Component)
export default function HelloServer() {
  return <div>Hello from Server!</div>;
}
```

```tsx
// app/components/HelloClient.tsx (Client Component)
"use client"; // 🧠 Mandatory to enable JS-side logic

import { useState } from "react";

export default function HelloClient() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
  );
}
```

### III. **When to use each component type?**

#### 🧭 Server Components – use when

- Displaying data only (static/dynamic)
- No interactivity is needed
- Security is required (e.g., hiding logic from the client)
- Optimizing for SEO and SSR

#### 🧭 Client Components – use when

- User interaction is involved (clicks, inputs, animations...)
- Using `useState`, `useEffect`, `useContext`, `ref`, etc.
- Using JS libraries that only work on the client side (Chart.js, IntersectionObserver, etc.)

### IV. **Data Fetching in Server Components**

```tsx
// app/components/UserList.tsx
async function getUsers() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  return res.json();
}

export default async function UserList() {
  const users = await getUsers();
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

> 📌 _No need for `useEffect` or `useState`. Everything is handled on the Server, returning ready-to-use HTML._

### V. **Hydration & Streaming (Basic Explanation)**

#### 💧 Hydration

- The process where React binds event handlers to server-rendered elements.
- Applies to Client Components.

#### ⛵ Streaming

- Allows the server to render small parts of HTML as data becomes available, without waiting for the whole page.
- Used with `<Suspense>` to display loading states.

```tsx
// app/page.tsx
import UserList from "./components/UserList";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading data...</div>}>
      <UserList />
    </Suspense>
  );
}
```

### VI. **Effective Project Organization**

```
/app
  /components
    Button.tsx          // client (uses useState)
    Navbar.tsx          // client
    ArticleList.tsx     // server (fetches data)
    ArticleCard.tsx     // server
```

> ⚙ Hint: To manage better, you can create directories like `/components/client` and `/components/server`.

## 🏆 Practice Exercise with Solution

### **📌 Task: Create a page displaying a list of users with a Like button**

1. **UserList** (Server Component): Fetch the user list from an API.
2. **LikeButton** (Client Component): Each user has a Like button that displays and increments the like count.

### **✅ Solution:**

```tsx
// app/components/LikeButton.tsx
"use client";
import { useState } from "react";

export default function LikeButton() {
  const [likes, setLikes] = useState(0);
  return (
    <button onClick={() => setLikes(likes + 1)} className="text-blue-600">
      👍 {likes}
    </button>
  );
}
```

```tsx
// app/components/UserList.tsx
import LikeButton from "./LikeButton";

async function getUsers() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  return res.json();
}

export default async function UserList() {
  const users = await getUsers();

  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex justify-between items-center border p-2"
        >
          <span>{user.name}</span>
          <LikeButton />
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// app/page.tsx
import UserList from "./components/UserList";

export default function HomePage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-4">User List</h1>
      <UserList />
    </main>
  );
}
```

## 🔑 Key Points to Remember

- **Default components are Server** in App Router.
- Use `"use client"` to declare a component as a Client Component.
- Server Components **cannot use** `useState`, `useEffect`, or `ref`.
- Fetch data in Server Components if user interaction is not required.
- Use Client Components only when **interactivity** is truly needed.
- Server Components help reduce bundle size and improve SEO.

## 📝 Homework

### **📌 Task:**

Create a simple Blog page:

- `BlogList` (Server Component): Fetch the list of articles from an API (`https://jsonplaceholder.typicode.com/posts`).
- `ToggleContent` (Client Component): Each article has a "View Content" button to show/hide the article body.

> 📌 Hint: `ToggleContent` uses `useState` to show/hide content. Keep it as a separate Client Component for reusability.

## ✅ Conclusion

This lesson is a crucial step in understanding how to **distribute logic and performance between Server and Client**, which is the key to optimizing applications in the modern Next.js App Router environment.
