# Lesson 14: Video Management and Player in Next.js App Router

## 🎯 Learning Objectives

After this lesson, students will:

- Understand the basic concepts of web video players and how to integrate them into Next.js.
- Know how to optimize video display and playback within a Next.js application.
- Become familiar with video optimization techniques such as streaming, lazy loading, and thumbnails.
- Build a video list page and a video detail page with a smoothly functioning integrated player.
- Understand and apply basic video upload and processing techniques.
- Know how to build simple video search and categorization features.
- Apply the above knowledge to build a complete video management module in a Next.js project.

## 📝 Detailed Content

### 1. Concept of Web Video Players

A **video player** is a UI component that allows users to watch videos in a browser. While HTML5 provides a built-in `<video>` tag, real-world projects often use advanced player libraries (e.g., react-player, video.js) for a better user experience (play, pause, seek, fullscreen, quality control, etc.).

_Example:_ Basic `<video>` tag:

```tsx
<video controls width="600" src="/videos/sample.mp4" />
```

_Explanation:_

- `controls`: displays the control bar (play, pause, etc.).
- `width`: set the video width.
- `src`: the video source.

### 2. Integrating a Video Player in Next.js with React Player

`react-player` is a popular library that supports various video sources (YouTube, Vimeo, local files, etc.). Its advantages include ease of use and customization.

- Installation: `npm install react-player`
- Basic Usage:

```tsx
"use client";
import React from "react";
import ReactPlayer from "react-player";

export default function VideoPlayer() {
  return (
    <div className="player-wrapper">
      <ReactPlayer
        url="/videos/sample.mp4"
        controls={true}
        width="100%"
        height="360px"
      />
    </div>
  );
}
```

_Explanation:_

- `url`: video link.
- `controls`: enables the control bar.
- `width`, `height`: responsive video dimensions.

### 3. Video Streaming and Performance Optimization

- **Streaming** is a technique that transmits video in small chunks rather than loading the entire file at once, allowing viewers to start watching almost immediately.
- In Next.js, we can apply lazy loading to only load the video when the user scrolls to it (using the `react-intersection-observer` library).
- Additionally, use lightweight video formats like MP4 (H.264) or WebM to optimize bandwidth.

### 4. Video Thumbnails and Previews

- A **thumbnail** is a representative image for a video, helping users choose videos more easily.
- Creation methods: upload a separate image or use a static frame extracted from the video.
- In Next.js, use `next/image` to optimize thumbnail loading:

```tsx
import Image from "next/image";

<Image
  src="/thumbnails/sample.jpg"
  alt="Video Thumbnail"
  width={320}
  height={180}
  className="rounded-md cursor-pointer"
/>;
```

### 5. Building a Video List Page

- Display a list of videos with thumbnails, titles, and short descriptions.
- Each video links to its corresponding detail page.
- Use `app/videos/page.tsx` for listing and a `VideoCard` component for each video.

### 6. Video Detail Page and Player

- Display the video player, title, and detailed description.
- Allow direct video playback on the page.
- Add basic features: share, like, view count (simplified).

### 7. Video Upload and Processing (Basics)

- Understand how to create a video upload form with `<input type="file" />`.
- Restrict video size and format.
- Handle file uploads (backend or API route) for storage.
- (Advanced suggestion: use Cloudinary or AWS S3 for video storage).

### 8. Search and Categorization Features

- Search videos by title or description (filtering a data array).
- Categorize videos by topic (categories).
- Display filters to make it easier for users to search.

## 🏆 Practice Exercise

### Task

Build a simple video management page in Next.js App Router:

- A video list page displaying sample videos (use static data or a mock API).
- Each video displays a thumbnail, title, and short description.
- Clicking a video navigates to a detail page with an integrated video player (using `react-player`).
- Add a search bar to filter videos by title.
- The video player should have basic controls (play, pause).
- Videos should be lazy-loaded (only loaded when the detail page is opened).

### Detailed Solution

1. **Prepare Sample Video Data:**
   Create a `data/videos.ts` file containing an array of video objects with fields: id, title, description, thumbnail, url.

2. **Video List Page:**

   - Create `app/videos/page.tsx` to display the list by mapping through the video array.
   - Use `next/image` to load thumbnails.
   - Create a search input and filter the array based on the entered keyword.

3. **Video Detail Page:**

   - Create `app/videos/[id]/page.tsx` using the `id` param to retrieve the corresponding video.
   - Integrate `react-player` for playback.
   - Display the title and description.

4. **Lazy Loading Videos:**

   - Ensure the video player only renders when the detail page is opened.
   - Improve performance using React Suspense or `react-intersection-observer`.

5. **Optimization:**

   - Use TypeScript to define a `Video` data type.
   - Use Tailwind CSS for responsive styling.

## 🔑 Key Points to Remember

- The HTML5 `<video>` tag is basic; use a specialized library (like `react-player`) for advanced features.
- Video streaming enables faster loading by avoiding the download of the entire file at once.
- Thumbnails are crucial for helping users select videos; optimize these images (size and quality).
- Lazy loading videos is an effective technique for improving page load speed and user experience.
- Search and filtering can be implemented on the client or server depending on project scale.
- Distinguish clearly between list and detail components.
- Handle video uploads carefully regarding size, format, and security.

## 📝 Homework

### Task

Extend the practice exercise with the following features:

- Add categorization for videos (e.g., Education, Entertainment, Technical).
- Display a filter so users can view videos by category.
- Implement a view counter for each video and display it on the detail page.
- Add a "Like" button for each video, storing the like status locally in the browser (`localStorage`).
- Optimize the video player and list UI for responsive standards.
