# Lesson 17: Testing in Next.js

## 🎯 Learning Objectives

After this lesson, students will:

- Understand the role and common types of testing in Next.js applications.
- Know how to install and configure a testing environment with Jest and React Testing Library.
- Be able to write unit tests for simple functions and components in Next.js App Router.
- Understand how to perform basic integration tests in Next.js.
- Master the principles of writing end-to-end (E2E) tests with Cypress and how to set up the environment.
- Know how to distinguish between testing Server Components and Client Components.
- Know how to measure test coverage and integrate tests into a simple CI/CD workflow.

## 📝 Detailed Content

### 1. Why do we need Testing?

**Concept:**
Testing is the process of verifying software to ensure an application runs as expected, minimizing bugs and improving product quality. Writing tests helps catch errors early, reduces maintenance costs, and builds confidence during application development.

### 2. Common Types of Testing in Next.js

- **Unit Testing:** Verifies the smallest units of code (functions, components) work correctly.
- **Integration Testing:** Checks how different modules or components coordinate with each other.
- **End-to-End Testing (E2E):** Validates the entire application flow from the user's perspective.

### 3. Setting up the Testing Environment with Jest and React Testing Library

**Jest:** A popular JavaScript testing framework supporting mocks, snapshots, and assertions.
**React Testing Library (RTL):** A library that helps test React UI components from a user-centric perspective (avoiding implementation details).

**Installation:**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event babel-jest
```

**Basic Configuration:**
Create a simple `jest.config.js` file:

```js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

`jest.setup.js` file:

```js
import "@testing-library/jest-dom";
```

Explanation:

- `testEnvironment: 'jsdom'` simulates a browser environment for testing React.
- `setupFilesAfterEnv` loads extension functions like `toBeInTheDocument`.

### 4. Writing a Unit Test for a Utility Function

**Concept:** A unit test checks a small function or module independent of the UI.

Example:

```ts
// utils/formatDate.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US");
}
```

Test:

```ts
import { formatDate } from "@/utils/formatDate";

test("formatDate formats date in US locale", () => {
  const date = new Date("2025-08-04T00:00:00");
  expect(formatDate(date)).toBe("8/4/2025");
});
```

Explanation: The test above verifies that the `formatDate` function returns the correctly formatted string.

### 5. Writing a Component Test with React Testing Library

**Concept:** Tests how a UI component interacts and renders.

Example Button component:

```tsx
// components/Button.tsx
import React from "react";

type ButtonProps = {
  label: string;
  onClick: () => void;
};

export default function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

Test:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/Button";

test("Button displays label and handles click", () => {
  const handleClick = jest.fn();
  render(<Button label="Click me" onClick={handleClick} />);

  const btn = screen.getByText("Click me");
  expect(btn).toBeInTheDocument();

  fireEvent.click(btn);
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

Explanation:

- Renders the component.
- Checks if the text is displayed.
- Simulates a click and verifies the callback was called.

### 6. Testing Server Components and Client Components

- **Server Components** typically lack UI interaction; focus on testing logic or through integration tests.
- **Client Components** require testing for interaction, events, and state.

_Note:_ Testing Server Components is more complex; this lesson focuses on Client Components.

### 7. Integration Testing in Next.js

Checks the coordination between components, APIs, or routing. For example, testing a page that combines multiple components and data fetching.

Simple example: testing a page with a button that calls a mock API when clicked.

### 8. End-to-End (E2E) Testing with Cypress

**Concept:** E2E tests validate the entire real-world application flow from the UI, simulating user actions.

**Installation:**

```bash
npm install --save-dev cypress
```

**Example test for opening the homepage and checking the title:**

```js
describe("Homepage", () => {
  it("should display welcome message", () => {
    cy.visit("http://localhost:3000");
    cy.contains("Welcome to My Next.js App");
  });
});
```

Explanation:

- `cy.visit()` opens the page.
- `cy.contains()` checks the displayed content.

### 9. Test Coverage and CI/CD

- Use Jest to measure test coverage with the command:

```bash
jest --coverage
```

- Integrate tests into a CI/CD pipeline (GitHub Actions, GitLab CI) to automatically run tests on every commit/pull request.

## 🏆 Practice Exercise with Detailed Solution

### Task: Write a Unit Test and a Component Test for a simple Like button

**Description:**
Build a `LikeButton` component that:

- Displays the number of likes.
- Increments the like count by 1 when clicked.
- Write a unit test for the increment logic.
- Write a component test to verify the UI and click event.

**Step 1: Write the LikeButton component**

```tsx
import React, { useState } from "react";

export function incrementLike(count: number): number {
  return count + 1;
}

export default function LikeButton() {
  const [likes, setLikes] = useState(0);

  const handleClick = () => {
    setLikes(incrementLike(likes));
  };

  return (
    <button onClick={handleClick} aria-label="like-button">
      Likes: {likes}
    </button>
  );
}
```

**Step 2: Write a unit test for the incrementLike function**

```ts
import { incrementLike } from "@/components/LikeButton";

test("incrementLike increases value by 1", () => {
  expect(incrementLike(0)).toBe(1);
  expect(incrementLike(5)).toBe(6);
});
```

**Step 3: Write a component test for LikeButton**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import LikeButton from "@/components/LikeButton";

test("LikeButton displays likes and increments on click", () => {
  render(<LikeButton />);
  const btn = screen.getByRole("button", { name: /like-button/i });
  expect(btn).toHaveTextContent("Likes: 0");

  fireEvent.click(btn);
  expect(btn).toHaveTextContent("Likes: 1");

  fireEvent.click(btn);
  expect(btn).toHaveTextContent("Likes: 2");
});
```

**Analysis:**

- Separated the logic function `incrementLike` for easier testing.
- Used state to store the like count.
- UI test ensures the like count displays accurately and updates on click.
- Used `aria-label` to easily target the element in the test.

## 🔑 Key Points to Remember

- **Tests should be isolated:** Write small, clear, and focused tests.
- **Prioritize behavioral testing:** Testing Library encourages testing the UI as a user would interact with it, avoiding implementation details.
- **Mock APIs and side effects:** In integration and E2E tests, mock data or use a test environment to avoid dependency on live environments.
- **Distinguish Server and Client Components:** Server Components are harder to test for interaction; Client Components need tests for events and state.
- **Test coverage isn't everything:** Test quality is more important than quantity.
- **Integrate testing into the development process:** To ensure stability and quickly detect bugs.

## 📝 Homework

### Task: Write tests for a simple Login Form

**Requirements:**

- Build a `LoginForm` component with 2 inputs (email and password) and a submit button.
- When submitted, call a mock function `onLogin(email, password)`.
- Write tests for:

  - Correct form rendering.
  - Inputting data into the fields.
  - Verifying the submit event is called with the correct values.

**Hint:** Use React Testing Library and mock the `onLogin` function with `jest.fn()`.
