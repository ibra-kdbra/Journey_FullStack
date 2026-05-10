# 🎓 **Lesson 5: ShadcnUI - UI Component Library**

## 🎯 Learning Objectives

- Understand **what ShadcnUI is** and **why you should use it** over other UI libraries.
- Know how to **install and configure ShadcnUI** in a Next.js App Router project.
- Master the use of **common components** such as `Button`, `Input`, `Card`, `Dialog`, `Form`, etc.
- Know how to **customize themes** and perfectly integrate with **Tailwind CSS**.
- Confidently build a **modern login form interface** using ShadcnUI standards.

## 📝 Detailed Content

### 1. 📌 What is ShadcnUI?

**Description:**
ShadcnUI is an **open-source UI component library** built with **React**, **Tailwind CSS**, and **Radix UI**. Its unique feature is that **you own the code** – components are added directly to your project, allowing for easy customization without being bound by external packages.

**Key Highlights of ShadcnUI:**

- Uses **pure Tailwind CSS** ➜ easy control over styling.
- Based on **Radix UI** ➜ high accessibility and excellent keyboard support.
- **TypeScript-ready** ➜ precise typing.
- Components follow a **standard design system**: Button, Input, Card, Form, Dialog...

**Quick Comparison with Other Libraries:**

| Library      | Customization Level | Tailwind Optimization | Code Ownership | Accessibility |
| ------------ | ------------------- | --------------------- | -------------- | ------------- |
| **ShadcnUI** | ✅ High             | ✅ Excellent          | ✅ Yes         | ✅ Good       |
| MUI          | ❌ Low              | ❌ CSS Binding        | ❌ No          | ✅ Good       |
| Chakra UI    | ⚠ Medium            | ❌ Not Used           | ❌ No          | ✅ Good       |
| Tailwind UI  | ⚠ High              | ✅ Good               | ⚠ Limited      | ⚠ Manual      |

### 2. ⚙️ Installing ShadcnUI

**Step 1: Install via CLI**

```bash
npx shadcn-ui@latest init
```

- Select framework: `Next.js (App Router)`
- Tailwind config is automatically updated.
- Necessary files like `components/ui`, `lib/utils.ts`, and `tailwind.config.ts` are added automatically.

**Step 2: Configure ThemeProvider**

Add to `app/layout.tsx`:

```tsx
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3. 🧱 Getting Familiar with Common Components

#### 🧩 3.1 Button

**Description:**
The `Button` component supports multiple `variants`, states (`loading`, `disabled`), and sizes.

**Example:**

```tsx
import { Button } from "@/components/ui/button";

export default function Example() {
  return (
    <div className="space-x-2">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  );
}
```

#### 🧩 3.2 Input

**Description:**
The Input is designed to be simple but fully supports `placeholder`, `disabled`, `type`, etc.

**Example:**

```tsx
import { Input } from "@/components/ui/input";

export default function InputExample() {
  return <Input placeholder="Enter your email" type="email" />;
}
```

#### 🧩 3.3 Card

**Description:**
The Card is an ideal UI container for displaying content in block format.

**Example:**

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome!</CardTitle>
      </CardHeader>
      <CardContent>This is the card content.</CardContent>
    </Card>
  );
}
```

#### 🧩 3.4 Form (with Zod)

**Description:**
Shadcn Form combines with `react-hook-form` and `zod` for powerful form validation.

**Installation:**

```bash
npm install react-hook-form zod @hookform/resolvers
```

**Form Example:**

```tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
});

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data: any) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("email")} placeholder="Email" />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### 🧩 3.5 Dialog (Modal)

**Description:**
`Dialog` is a modal component that can be opened/closed flexibly.

**Example:**

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Show Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification</DialogTitle>
        </DialogHeader>
        <p>This is the content of the Modal!</p>
      </DialogContent>
    </Dialog>
  );
}
```

## 🧪 Practice Exercise with Solution

### 📌 Task: Build a login form using ShadcnUI

**Requirements:**

- Form includes 2 fields: `email` and `password`
- Validate with `zod`: email must be in the correct format, password cannot be empty
- Include a loading state during submission
- Display errors clearly

### ✅ Solution and Analysis

```tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password cannot be empty"),
});

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: any) => {
    setLoading(true);
    setTimeout(() => {
      console.log(data);
      setLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-[300px]">
      <Input {...register("email")} placeholder="Email" />
      {errors.email && (
        <p className="text-sm text-red-500">{errors.email.message}</p>
      )}

      <Input {...register("password")} placeholder="Password" type="password" />
      {errors.password && (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
```

## 🔑 Key Points to Remember

| 💡 Concept                                                                                 | 🔍 Memory Aid |
| ------------------------------------------------------------------------------------------ | ------------- |
| **ShadcnUI** is _not a package_, but a collection of components copied into your project   |               |
| **Tailwind Integration** is very tight ➜ basic understanding of Tailwind is required first |               |
| **Folder Structure**: components are stored in `components/ui` and can be fully customized |               |
| **Zod + React Hook Form** is the ideal pair for form validation                            |               |
| **ThemeProvider** must wrap the entire app to use dark/light mode                          |               |

## 📝 Homework

### 🧠 Task

Create a **modal (dialog)** using ShadcnUI that displays a **registration form** including:

- `email`, `username`, `password`
- Validation with `zod`
- An external button to open the modal
- Upon successful submission, display the alert `"Registration successful"` in the console

**Hint:** Use `Dialog`, `Form`, `Button`, `Input`, `zod`, and `react-hook-form`.
