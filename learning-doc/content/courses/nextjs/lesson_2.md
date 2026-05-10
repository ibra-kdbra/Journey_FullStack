# 🎓 **Lesson 2: App Router Directory Structure in Next.js**

## 🎯 **Learning Objectives**

After completing this lesson, students will:

✅ Clearly understand the role and function of the `app/` directory in Next.js  
✅ Master how special files work: `page.tsx`, `layout.tsx`, `loading.tsx`
✅ Know how to create basic routes and organize reusable layouts across pages  
✅ Become familiar with route groups, dynamic routes, and metadata

## 📝 **Detailed Content**

### 1. 🔍 Introduction to the `app/` Directory

**Concept**:
The `app/` directory is the core of the new routing structure in Next.js since version 13+. Each subdirectory within `app/` represents a route.

**Example**:

```bash
app/
├── layout.tsx
├── page.tsx
├── about/
│   └── page.tsx
└── contact/
    └── page.tsx
```

### 2. 📄 Special Files in App Router

#### ✅ `page.tsx`

- The **entry point** for each route.
- Every folder containing a `page.tsx` file creates a corresponding route.

📌 **Example**:
`app/about/page.tsx` → route `/about`

#### ✅ `layout.tsx`

- Defines the layout for the entire application or a specific part of it.
- Layouts are reused when navigating between routes → avoiding re-rendering of unchanged parts.

📌 **Example**:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

#### ✅ `loading.tsx`

- Automatically displayed while waiting for internal components to load (especially during data fetching).
- Helps improve the user experience.

📌 **Example**:

```tsx
// app/about/loading.tsx
export default function Loading() {
  return <p>Loading About page...</p>;
}
```

### 3. 📁 Route Groups and Dynamic Routes

#### ✅ Route Groups

- Group routes **without affecting the URL**.
- Used for organizing code and applying shared layouts.

📌 Syntax: `(group-name)`

```bash
app/
├── (public)/
│   ├── about/page.tsx
│   └── contact/page.tsx
```

> ⚠️ The URL does not contain `(public)`; it is only for file organization.

#### ✅ Dynamic Routes

- Allows dynamic routing based on parameters.

📌 Syntax: `[param]`

```bash
app/products/[id]/page.tsx → "/products/123"
```

**How to use `params`**:

```tsx
export default function ProductPage({ params }) {
  return <p>Product ID: {params.id}</p>;
}
```

### 4. 🌐 Metadata and SEO in App Router

**Concept**: Metadata is information that helps improve SEO, social media sharing, and displays the page title.

📌 Integrate by exporting `metadata` in each `page.tsx` or `layout.tsx`:

```tsx
export const metadata = {
  title: "About Page",
  description: "Information about WatchControls company",
};
```

> Metadata is rendered in the `<head>` and supports automatic updates per route.

## 🏆 **Practice Exercises**

### 🔧 Task

**Goal**: Create a website with the following routes: `/`, `/about`, `/contact`
**Requirements**:

- Create a common layout for the entire site
- A specific loading page for `/about`
- Add metadata for each page

#### Required Directory Structure

```bash
app/
├── layout.tsx
├── page.tsx
├── about/
│   ├── page.tsx
│   └── loading.tsx
├── contact/
│   └── page.tsx
```

## 🔑 **Key Points to Remember**

| Concept              | Memory Aid                                                |
| -------------------- | --------------------------------------------------------- |
| `page.tsx`           | Entry point for each route                                |
| `layout.tsx`         | Used to wrap layouts for the whole app or specific parts  |
| `loading.tsx`        | Displayed during fetching or lazy-loading of components   |
| Route Group `(name)` | Code organization, does not affect the URL                |
| `[param]`            | Dynamic route, retrieves dynamic data from the URL        |
| `metadata`           | Adds title, description, etc., for SEO and social sharing |

## 📝 **Homework**

**Task**:

1. Create another route `/services` to display a list of services.
2. Add a specific `layout.tsx` for `services/` to display a left sidebar.
3. Add metadata for the `/services` page.

📌 Hint:

- `app/services/layout.tsx` → contains the `sidebar`
- `app/services/page.tsx` → main content
- Use `export const metadata = {...}` as learned
