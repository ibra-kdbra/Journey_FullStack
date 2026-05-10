# 🎓 **Lesson 11: Building the Profile Page**

## 🎯 Learning Objectives

After this lesson, students will:

- Understand the **structure and role of the Profile page** in web applications.
- Know how to **display and update user information** from an API.
- Be proficient in using **React Hook Form** to handle forms efficiently.
- Practice **client-side user data validation**.
- Integrate **avatar/profile picture uploads** intuitively.
- Grasp the concept of **optimistic updates** and basic implementation.
- Use **ShadcnUI components** flexibly to build the profile UI.

## 📝 Detailed Content

### I. Concepts & Introduction

#### 📌 What is a Profile Page?

A Profile page is where users view and edit their personal information, such as name, email, avatar, bio, etc. This is a common feature in almost any application that includes a login system.

👉 **Reasons to build a great Profile page:**

- Enhances user experience
- Provides personalization
- It is a core part of account management features

### II. Displaying User Information

**Concept: Retrieving data from an API and rendering it in a component**

👉 We will use a `Server Component` or `useEffect` (if necessary) to fetch user data (for example, from your Golang API).

**Example:**

```tsx
// app/profile/page.tsx
import { getCurrentUser } from "@/lib/api";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Personal Information</h1>
      <ProfileForm user={user} />
    </div>
  );
}
```

### III. Handling Forms with React Hook Form

**Concept: A library to manage form state, validation, and updates efficiently.**

👉 Since profile editing forms can be complex (many fields, validation rules), we use the `react-hook-form` library instead of manual state management.

```tsx
// app/profile/profile-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/api";
import { useState } from "react";

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    await updateProfile(data);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register("name", { required: true })} placeholder="Name" />
      {errors.name && <p className="text-red-500 text-sm">Name is required</p>}

      <Input {...register("email", { required: true })} placeholder="Email" />
      {errors.email && (
        <p className="text-red-500 text-sm">Email is required</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
```

### IV. Simple Avatar Upload

**Concept: File upload is the process of sending a file from the client to the server.**

- Use `<input type="file" />` to select an image.
- Use `FormData` to send the file via API.

```tsx
// Simple avatar upload
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });
    }
  }}
/>
```

You can use the [ShadcnUI Avatar Component](https://ui.shadcn.dev/docs/components/avatar) to display user images.

### V. Basic Optimistic Updates

**Concept: Updating the UI before the server confirms a successful operation.**

👉 Provides a smoother experience, but requires a rollback if the operation fails.

```tsx
const onSubmit = async (data: any) => {
  const prevData = { ...user }; // Backup current state
  setUser(data); // Immediately update UI

  const success = await updateProfile(data);
  if (!success) {
    setUser(prevData); // Rollback if update fails
  }
};
```

## 🏆 Practice Exercise with Solution

### Task

Create a `/profile` page that can:

1. Display user name and email.
2. Allow editing of name/email.
3. Upload an avatar (and display the image).
4. Simple validation: fields cannot be empty.

### Suggested Structure

- `app/profile/page.tsx`
- `app/profile/profile-form.tsx`
- `lib/api.ts`: Mock user fetch/update.

### ✅ Solution

> File `lib/api.ts`:

```ts
export async function getCurrentUser() {
  return {
    name: "John Doe",
    email: "johndoe@example.com",
    avatar: "/avatar.png",
  };
}

export async function updateProfile(data: any) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Updating profile info:", data);
  return true;
}
```

> Files `app/profile/page.tsx` and `profile-form.tsx`: As shown in the sections above.

## 🔑 Key Points to Remember

- `react-hook-form` helps reduce boilerplate code when managing forms.
- Ensure you add `"use client"` to components involving interaction (forms, inputs, etc.).
- Client-side validation is important, but server-side validation is still essential.
- File uploads cannot use `JSON.stringify()` – you must use `FormData`.
- Provide visual feedback (e.g., a `loading spinner`) when updating the profile.

## 📝 Homework

**Task:**
Extend the profile form to allow users to update the following:

- Self-description (`bio`)
- Phone number (`phone`)

**Requirements:**

- Update the data display from the API.
- Validation: `bio` max 160 characters, `phone` required and must be numeric.
- Ensure the `bio`/`phone` values are saved and persist after a reload.
