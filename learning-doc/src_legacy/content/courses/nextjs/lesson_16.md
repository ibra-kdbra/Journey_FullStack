# Lesson 16: Performance Optimization

## 🎯 Learning Objectives

After this lesson, students will:

- Clearly understand **Core Web Vitals** and their importance in optimizing the user experience.
- Know how to apply **code splitting** and **lazy loading** techniques to reduce bundle size and increase page load speed.
- Effectively use the Next.js `<Image>` component for **image optimization**.
- Understand and implement appropriate **caching strategies** to speed up data and resource retrieval.
- Practice analyzing the bundle to identify and resolve performance bottlenecks.

## 📝 Detailed Content

### 1. Overview of Web Performance and Core Web Vitals

**Concepts:**

- **Web Performance** refers to the speed and user experience when visiting a website.
- **Core Web Vitals** are Google's key metrics for assessing user experience regarding speed, interactivity, and visual stability.

**Core Web Vitals include:**

- **LCP (Largest Contentful Paint):** The time it takes for the largest element on the page to fully render, measuring the main loading speed of the page.
- **FID (First Input Delay):** The time from when a user interacts (click, tap) to when the browser responds.
- **CLS (Cumulative Layout Shift):** Measures layout stability and the extent of "layout jumps" during page loading.

**Why are they important?**
Google prioritizes ranking pages with good Core Web Vitals, which improves SEO and user experience.

### 2. Code Splitting and Lazy Loading

**Concepts:**

- **Code splitting** is a technique that breaks the JavaScript bundle into smaller pieces, loaded on demand to reduce initial load time.
- **Lazy loading** is the practice of loading parts of the page (components, images, modules) only when needed, rather than loading everything at once.

**Application in Next.js:**

- Next.js automatically splits code by route (route-based code splitting).
- Use `dynamic()` for lazy loading components.

**Example:**

```tsx
import dynamic from "next/dynamic";

// Lazy load component, only loads when rendered
const Chart = dynamic(() => import("../components/Chart"), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // disable server-side rendering if necessary
});

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Chart />
    </div>
  );
}
```

**Explanation:**
Instead of loading all the code for the `Chart` when the user enters the Dashboard, the `Chart` code will only load when the component is rendered, reducing the initial bundle and speeding up the page load.

### 3. Image Optimization with Next.js `<Image>`

**Concepts:**

- Images often take up the most space on a webpage, directly impacting load speed.
- Next.js provides a built-in `<Image>` component with optimizations such as: automatic compression, format selection, default lazy loading, and responsive sizing.

**Example:**

```tsx
import Image from "next/image";

export default function Profile() {
  return (
    <Image
      src="/avatar.jpg"
      alt="User Avatar"
      width={200}
      height={200}
      priority // prioritizes loading for important images
      placeholder="blur" // fade-in effect while loading
      blurDataURL="/avatar-blur.jpg"
    />
  );
}
```

**Explanation:**
The `<Image>` component automatically resizes and compresses images, saving load time and bandwidth, especially on mobile devices. Attributes like `priority` allow you to specify which images need to load immediately, while less important ones are lazy-loaded.

### 4. Caching Strategies

**Concepts:**

- **Caching** is the temporary storage of resources or data to avoid repeated downloads from the server, increasing speed and reducing server load.
- In Next.js, you can configure caching in multiple places: static assets, API routes, and ISR (Incremental Static Regeneration).

**Example HTTP Cache Header:**

- Configured within an API route or server response:

```ts
export async function GET() {
  const data = await fetchData();

  return new Response(JSON.stringify(data), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=59",
    },
  });
}
```

**Explanation:**
`max-age=3600` tells the browser to cache the data for 1 hour, and `stale-while-revalidate` allows using the old cache while re-fetching new data in the background.

**ISR Example:**
Static pages can be automatically updated after a specified interval, combining caching with content freshness.

### 5. Bundle Analysis and Optimization

**Concepts:**

- Bundle analysis allows you to see the size of different parts of your JavaScript bundle, helping you identify large libraries, unused code, or duplicates.
- From there, you can optimize by removing, replacing, or properly lazy-loading modules.

**Usage:**

- Install `@next/bundle-analyzer`:

```bash
npm install --save-dev @next/bundle-analyzer
```

- Configure `next.config.js`:

```js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({});
```

- Run the build with an environment variable:

```bash
ANALYZE=true npm run build
```

- Open the report file to view detailed module sizes.

## 🏆 Practice Exercise with Detailed Solution

### Task

Build a simple Dashboard page in Next.js with the following requirements:

- Display a chart using a resource-intensive component; you must lazy load this component.
- Include a user avatar using the `<Image>` component with lazy loading optimization and a placeholder.
- Configure a caching header for the API route that fetches chart data, caching it for 10 minutes.
- Analyze the bundle using `@next/bundle-analyzer` and describe how you would improve performance if you detect bottlenecks.

### Solution

**Step 1: Create the Chart component and lazy load it**

```tsx
// components/Chart.tsx
import React from "react";

export default function Chart() {
  return <div>This is a resource-intensive chart component</div>;
}
```

```tsx
// app/dashboard/page.tsx
import dynamic from "next/dynamic";
import Image from "next/image";

const Chart = dynamic(() => import("../../components/Chart"), {
  loading: () => <p>Loading chart...</p>,
  ssr: false,
});

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Image
        src="/avatar.jpg"
        alt="User Avatar"
        width={100}
        height={100}
        placeholder="blur"
        blurDataURL="/avatar-blur.jpg"
      />
      <Chart />
    </div>
  );
}
```

**Step 2: Create an API route with caching**

```ts
// app/api/chart-data/route.ts
export async function GET() {
  const chartData = { value: 123 }; // example data

  return new Response(JSON.stringify(chartData), {
    headers: {
      "Cache-Control": "public, max-age=600, stale-while-revalidate=59",
      "Content-Type": "application/json",
    },
  });
}
```

**Step 3: Set up the bundle analyzer**

- Install `@next/bundle-analyzer`.
- Configure `next.config.js` as shown in the guide above.
- Run `ANALYZE=true npm run build` to view the report.

**Analysis & Improvement:**

- If you find a large library or code that isn't used much being bundled, you can:

  - Replace it with a smaller library.
  - Lazy load that section.
  - Remove redundant code.

## 🔑 Key Points to Remember

- **Core Web Vitals** are the top criteria for assessing performance and experience; prioritize improving them.
- **Lazy loading** reduces the initial load but shouldn't be overused to the point where the experience feels delayed.
- Use Next.js `<Image>` for automatic image optimization without manual work.
- Proper **caching headers** significantly speed up page reloads and reduce server load.
- Always analyze the **bundle** to understand what code takes up the most space and optimize accordingly.
- Avoid importing all libraries at once; use dynamic imports for parts that are not immediately needed.

## 📝 Homework

### Task

1. Create a Gallery page in Next.js where multiple images are optimized with `<Image>`, using lazy loading and the blur placeholder effect.
2. Create a Video Player component (a mock, just displaying a div) and lazy load it on the Gallery page.
3. Create a mock API route returning a list of images, using a caching header with a 15-minute cache time.
4. Use the bundle analyzer to check the Gallery page's bundle, note the largest libraries or code sections, and propose improvements.

**Requirements:**
Push your code to GitHub, explain each step in a README, and comment on the performance results you achieved.
