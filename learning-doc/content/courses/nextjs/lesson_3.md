# Lesson 3: Installing and Configuring TypeScript in Next.js App Router

## 🎯 Learning Objectives

- Understand **what TypeScript is**
- Know how to **install TypeScript**
- Understand the structure and main sections of the `tsconfig.json` configuration file
- Understand **basic type definitions**
- Apply TypeScript to write **React/Next.js components with explicit data types**

## 📝 Detailed Content

### 1. What is TypeScript? Why use it?

**TypeScript** is a programming language based on JavaScript that extends it by adding **static typing**.

**Simple example:**

```typescript
let age: number = 30;
age = "30"; // Error!
```

### 2. How to install TypeScript in Next.js

### ✅ Method 1: Start a new Next.js project with TypeScript

```bash
npx create-next-app@latest my-app
cd my-app
```

### ✅ Method 2: Add TypeScript to an existing Next.js project

If you have a Next.js project using JavaScript and want to switch to TypeScript, follow these steps:

##### 2.1. Install necessary packages

```bash
npm install --save-dev typescript @types/react @types/node
# or with yarn
yarn add --dev typescript @types/react @types/node
```

##### 2.2. Create the `tsconfig.json` file

Run the following command for Next.js to automatically generate `tsconfig.json`:

```bash
npx next dev
```

Next.js will detect TypeScript and create a default `tsconfig.json` file.

### 3. Understanding the `tsconfig.json` file

This is a crucial configuration file that determines how TypeScript behaves in your project.

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 4. Basic Type Definitions in TypeScript

Now let's explore how to declare the most important data types you'll use frequently in Next.js:

#### 4.1 Basic Data Types

- `string`: text strings
- `number`: numbers (both integers and floats)
- `boolean`: true or false
- `any`: any type (use sparingly, as it bypasses safety)
- `void`: returns nothing (used for functions)
- `null` and `undefined`

**Example:**

```typescript
let name: string = "John Doe";
let age: number = 25;
let isStudent: boolean = true;
```

#### 4.2 Interfaces

When working with React Props or complex data structures, you use `interface` or `type` to define the shape of an object.

An **interface** is a way to describe the "shape" of an object.

```typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
};
```

### 5. Applying TypeScript in Next.js Components

We will write a simple component using typed props.

```tsx
// app/components/UserCard.tsx

interface UserCardProps {
  name: string;
  age: number;
  isOnline?: boolean;
}

export default function UserCard({
  name,
  age,
  isOnline = false,
}: UserCardProps) {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-bold">{name}</h2>
      <p>Age: {age}</p>
      <p>Status: {isOnline ? "Online" : "Offline"}</p>
    </div>
  );
}
```

## 🏆 Practice Exercises

### Task

**Create a `ProfileCard` component that receives the following props:**

- `username`: string (required)
- `email`: string (optional)
- `age`: number (required)

**Requirements:**

- Write an interface or type for the props.
- The component should display user information in a card format with simple Tailwind CSS styling.
- If `email` is missing, display the text "Email not updated".

## 🔑 Key Points to Remember

- **TypeScript helps detect errors early, making code safer and easier to maintain.**
- Always declare types for component props to avoid errors when passing incorrect data.
- `interface` and `type` are two ways to define data types; use `interface` for objects and `type` for complex types.
- A proper `tsconfig.json` configuration ensures project stability; enable `strict` mode for more rigorous error checking.
- While `any` can be used, it should be avoided as it negates the benefits of TypeScript.
- Provide default values for optional props to prevent errors during usage.

## 📝 Homework

### Task

Create a **`TodoItem`** component that receives these props:

- `title`: string (required)
- `completed`: boolean (default: false)
- `dueDate`: string (date format, optional)

**Requirements:**

- Write an interface/type for the props.
- The component should display:

  - The todo title
  - The completion status (e.g., strike-through if completed)
  - The due date if provided, in a nice format (you can use a date library or native JS)

- Use TypeScript to ensure type safety.
