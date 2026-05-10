# 🎓 LESSON 13: ARTICLE AND MEDIA MANAGEMENT

## 🎯 Learning Objectives

After completing this lesson, students will:

- Understand and implement **basic CRUD for articles** using **Server Actions**.
- Know how to **handle media (image) uploads** and optimize images with `next/image`.
- Create **dynamic routes** to display details for each article.
- Integrate a **rich text editor** into the article creation/editing form.
- Understand how to build a **simple comments system** (displaying comments within the scope of the lesson).

## 🧠 Detailed Content

### 1. **Introduction to the Article Management Model**

**Concept:**
An article management system is where users can create, edit, delete, and view their posts, while attaching images and rich content.

**Main components include:**

- Article list (index page)
- Article detail page (dynamic route)
- Create and edit article form
- Media upload (images)
- Rich text editor

### 2. **Creating the Article List Interface**

**Explanation:**
The list page helps display all existing articles. This is where server-side data fetching is implemented.

**Example:**

```tsx
// app/posts/page.tsx
import { getPosts } from "@/lib/actions/post";
import PostCard from "@/components/post-card";

export default async function PostListPage() {
  const posts = await getPosts();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 3. **Creating Server Actions for CRUD**

**Explanation:**
Server Actions in Next.js allow you to perform **add/edit/delete** operations without having to write manual API endpoints.

**Example:**

```ts
// lib/actions/post.ts
"use server";

import { db } from "@/lib/db";

export async function createPost(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");
  return await db.post.create({ data: { title, content } });
}
```

### 4. **Article Creation and Editing Form**

**Explanation:**
Use `form action={serverAction}` and ShadcnUI to create the form.

**Example:**

```tsx
<form action={createPost}>
  <Input name="title" placeholder="Article title" />
  <Textarea name="content" placeholder="Content..." />
  <Button type="submit">Create Article</Button>
</form>
```

### 5. **Image Upload and Optimization with `next/image`**

**Explanation:**
Next.js supports the `<Image />` component for automatic image optimization. Media can be stored in the public folder (temporarily) or by using services like UploadThing/S3.

**Example:**

```tsx
// components/post-form.tsx
<Image
  src="/uploads/sample.jpg"
  width={600}
  height={400}
  alt="Description image"
/>
```

### 6. **Dynamic Route for Article Details**

**Explanation:**
Use `[slug]/page.tsx` to create dynamic routes. Example: `/posts/my-first-post`.

**Example:**

```tsx
// app/posts/[slug]/page.tsx
export default async function PostDetail({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  return (
    <div>
      <h1>{post.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
```

### 7. **Integrating a Rich Text Editor (shadcn/tiptap)**

**Explanation:**
To allow users to input formatted content (bold, image, link), use `Tiptap`.

**What is Tiptap?**
It is a powerful text editor that supports markdown and HTML editing.

**Installation Example:**

```bash
npm install @tiptap/react @tiptap/starter-kit
```

**Form Integration:**

```tsx
// components/editor.tsx
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function Editor({
  onChange,
}: {
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your article...</p>",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return <EditorContent editor={editor} />;
}
```

### 8. **Creating a Simple Comment System**

**Explanation:**
No real-time functionality is required, just a display of the comment list (mock data or from a database) and an add comment form.

**Example Comment Display:**

```tsx
// components/comments.tsx
export default function CommentList({ comments }) {
  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id} className="border-b py-2">
          <strong>{c.author}</strong>: {c.content}
        </li>
      ))}
    </ul>
  );
}
```

## 🧪 Practice Exercise with Solution

### 🚀 Task

> Build a feature to create a new article, including: entering a title, rich text content, uploading a thumbnail image, and displaying the list of articles on `/posts`.

### ✅ Detailed Solution

1. **Create the `createPost` action**:

```ts
// lib/actions/post.ts
export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  // Assuming thumbnail image upload is handled separately
  return await db.post.create({ data: { title, content } });
}
```

1. **Article Creation Form:**

```tsx
<form action={createPost}>
  <Input name="title" placeholder="Title" />
  <Editor onChange={(html) => setContent(html)} />
  <input type="hidden" name="content" value={content} />
  <Button type="submit">Create Article</Button>
</form>
```

1. **Article List (page.tsx):**

```tsx
const posts = await getPosts();
return posts.map((post) => (
  <Link href={`/posts/${post.slug}`}>
    <h3>{post.title}</h3>
  </Link>
));
```

## 🔑 Key Points to Remember

- **Form + Server Actions** is the new trend that reduces the need for manual API writing.
- **Rich text content** must be handled carefully with `dangerouslySetInnerHTML` to prevent XSS (if retrieved from users).
- Clearly distinguish when to use a **Client Component** (`useState`, Editor) and a **Server Component** (data fetching).
- Dynamic route names must match (`[slug]`) and ensure there's a fallback if `params.slug` is not found.

## 📝 Homework

### 📌 Task

> Build an article detail page using the dynamic route `/posts/[slug]`. The article content should be displayed using the HTML format saved from the rich text editor. Also, display a simple comment list below the article.

**Hints:**

- Use `dangerouslySetInnerHTML` to render the HTML.
- Create mock data or use static data for comments.
- Use `params.slug` to fetch the corresponding article from the database.
