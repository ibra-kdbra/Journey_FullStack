# Nubilum <img src="./public/lightbulb.png" alt="Nubilum Logo" width="48" height="48" style="vertical-align: middle;"/>


## Overview

Nubilum is a modern web application built on **Next.js**, designed to provide a seamless and intuitive user experience for creating, editing, and managing content similar to the functionalities found on [eraser.io](https://eraser.io). The project leverages powerful tools such as **Editor.js** for markdown editing and **Excalidraw** for diagram creation, enabling users to craft rich, interactive documents.

## Use Case

Nubilum is ideal for users who want to:

- Create and manage markdown documents effortlessly.
- Integrate rich media, such as diagrams and illustrations, into their content.
- Enjoy a user-friendly interface that promotes productivity and creativity.

With Nubilum, users can produce high-quality documentation, tutorials, and collaborative content without the steep learning curve often associated with traditional content management systems.

### Why Use Nubilum?

Nubilum combines the best features of existing platforms while offering a unique approach to document creation and management. Here’s why you should consider using Nubilum:

- **User-Friendly Interface:** Designed with simplicity in mind, making it easy for anyone to get started.
- **Flexible Markdown Editing:** Utilize Editor.js for a smooth editing experience with markdown support.
- **Powerful Diagram Creation:** Use Excalidraw to bring your ideas to life with intuitive diagramming tools.
- **Collaborative Features:** Share your work with others and collaborate in real-time.

## Kinde Authentication

Nubilum integrates **[Kinde](https://kinde.com)** for authentication, providing a secure and user-friendly sign-in experience. Kinde offers robust authentication features that help you manage user accounts efficiently.

### Why Use Kinde for Authentication?

- **Secure Authentication:** Kinde provides secure user authentication to protect your data and user privacy.
- **Easy Integration:** Quickly integrate Kinde into your application with minimal setup required.
- **User Management:** Manage user roles and permissions effectively.

## Technology Stack

Nubilum is built with a robust tech stack:

[![Tech Stack](https://skillicons.dev/icons?i=nextjs,ts,tailwindcss,svg)](https://skillicons.dev)
![Excalidraw Icon](https://excalidraw.com/favicon.ico)
![Convex Icon](https://convex.dev/favicon.ico)
<img src="https://kinde.com/favicon.ico" height="48" width="48" alt="Kinde Icon">

### Additional Technologies

- **[ShadCN](https://ui.shadcn.com)**: A component library for building user interfaces.
- **[Editor.js](https://editorjs.io)**: A block-styled editor for creating structured content.
- **[Excalidraw](https://excalidraw.com)**: A whiteboard tool for sketching diagrams.
- **[Convex](https://convex.dev)**: A backend-as-a-service platform for modern applications.
- **[Kinde](https://kinde.com)**: An authentication platform for modern applications.

## Getting Started

To get started with Nubilum, run the following command:

```bash
npm install
```
To synchronize the database, run the following command:
```bash
npx convex dev
```
To run the app in development mode, run the following command:
```bash
npm run dev
```

## Convex authentication

Every Convex function requires an authenticated caller. The browser sends the signed-in user's Kinde ID token (served by `/api/convex-token`) to Convex, which verifies it using `convex/auth.config.ts`. Set `KINDE_ISSUER_URL` and `KINDE_CLIENT_ID` as environment variables on the Convex deployment (see `.env.example`). The user's email is derived server-side from the verified token; teams and files are only accessible to the team's creator.
