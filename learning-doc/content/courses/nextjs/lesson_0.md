# Next.js Course

## Lesson 1: Introduction and Environment Setup

### Core Content

- Course overview and what students will learn
- Introduction to ReactJS, Next.js, TypeScript, Tailwind CSS, and ShadcnUI
- Comparison between Pages Router and App Router in Next.js
- Advantages of TypeScript in ReactJS development
- Prerequisites and workspace installation

### Activities

- Install Node.js, npm/yarn, and VS Code
- Install useful VS Code extensions for Next.js development
- Create the first Next.js project with App Router
- Understand the basic folder structure of a Next.js project with App Router
- Set up linting and formatting with ESLint and Prettier

## Lesson 2: Project Structure and Basic Routing in App Router

### Core Content

- Hierarchical folder structure in App Router
- File system and routing conventions
- Special files: page.tsx, layout.tsx, loading.tsx, error.tsx
- Dynamic routing with parameters and segments
- Server Components vs. Client Components

### Activities

- Set up the Vievlog project structure according to the diagram
- Create basic routes: home page, login page, registration page
- Implement common layouts and nested layouts
- Practice with dynamic routes and parameters
- Create a 404 error page and a loading page

## Lesson 3: Basic TypeScript for React and Next.js

### Core Content

- Overview of TypeScript and benefits of using it with React
- Basic types in TypeScript
- Interfaces and Types in React
- Generic Types and when to use them
- Typing Props, State, and Event Handlers

### Activities

- Set up tsconfig.json for the project
- Create interfaces/types for data models
- Practice with Props and State typing
- Handle common TypeScript errors
- Refactor JavaScript code into TypeScript

## Lesson 4: Tailwind CSS and Styling in Next.js App Router

### Core Content

- Install and configure Tailwind CSS in Next.js
- Utility-first CSS and its benefits
- Responsive design with Tailwind CSS
- Dark mode and theme switching
- CSS modules vs. Tailwind in Next.js

### Activities

- Configure tailwind.config.js
- Create global.css with Tailwind settings
- Build a responsive layout
- Implement dark/light mode with Tailwind
- Customize themes and extend Tailwind CSS configuration

## Lesson 5: ShadcnUI - UI Component Library

### Core Content

- Introduction to ShadcnUI and benefits over other UI libraries
- Install and configure ShadcnUI
- Common components and how to use them
- Customize theme and styling of ShadcnUI components
- Combine ShadcnUI with Tailwind CSS

### Activities

- Install ShadcnUI CLI and add basic components
- Set up theme provider
- Build a login form with ShadcnUI
- Customize ShadcnUI components
- Create animations for components

## Lesson 6: Building Layouts and Navigation

### Core Content

- Layout nesting in App Router
- Template and Group Layouts
- Navigation between pages with next/link
- Using useRouter and usePathname
- Metadata and SEO in App Router

### Activities

- Build a common layout for the entire application
- Create a special layout for authentication pages
- Design a responsive navigation menu
- Set up dynamic metadata for pages
- Implement breadcrumbs and navigation indicators

## Lesson 7: Server Components vs. Client Components

### Core Content

- Differences between Server Components and Client Components
- "use client" directive and when it's needed
- Data fetching in Server Components
- Hydration and Streaming
- Interactivity and event handling in Client Components

### Activities

- Differentiate and organize Server and Client Components
- Fetch data in Server Components
- Handle events in Client Components
- Stream Server Components with Suspense
- Optimize code splitting with dynamic imports

## Lesson 8: State Management in Next.js App Router

### Core Content

- Local state with useState and useReducer
- Context API in Next.js
- Server state and caching
- Global state management with Zustand or Redux
- State persistence and hydration

### Activities

- Build a theme context for dark/light mode
- Create an authentication context
- Manage form state with React Hook Form
- Implement a global data store
- Handle cache and prefetching data

## Lesson 9: Data Fetching and API Integration

### Core Content

- Data fetching patterns in App Router
- Using fetch in Server Components
- Route Handlers (API Routes) in App Router
- SWR and React Query for client-side data fetching
- Error handling and loading states

### Activities

- Connect to the existing Gin Golang API
- Build API route handlers
- Implement cache and revalidation
- Use SWR for real-time data
- Handle loading and error states

## Lesson 10: Authentication and Authorization (Auth)

### Core Content

- Authentication in Next.js App Router
- Middleware in Next.js
- JWT, Session, and Cookie-based authentication
- OAuth and Social login
- Role-based access control

### Activities

- Set up an auth system connected to the Golang API
- Build login and registration pages
- Implement middleware to protect routes
- Create context and hooks for authentication
- Control access based on roles

## Lesson 11: Building the Profile Page

### Core Content

- Profile page and user information management
- Form handling with React Hook Form
- File uploads and image management
- Client-side and server-side data validation
- Optimistic updates

### Activities

- Design the profile page UI with ShadcnUI
- Build a profile edit form with validation
- Implement avatar upload
- Handle personal information updates
- Integrate with the Golang API

## Lesson 12: Chat Feature (Real-time)

### Core Content

- Real-time communications in Next.js
- WebSockets and Server-Sent Events
- Integration with Pusher or Socket.io
- Optimistic UI with Chat
- Message read receipts and typing indicators

### Activities

- Design chat UI with ShadcnUI
- Connect WebSocket to Golang backend
- Build chat interface
- Implement typing indicators and read receipts
- Handle new message notifications

## Lesson 13: Article and Media Management

### Core Content

- CRUD operations with Server Actions
- Media handling and optimization
- Dynamic routes for articles
- Rich text editor integration
- Comments and reactions system

### Activities

- Build the article list page
- Design the article detail page
- Implement create/edit article form
- Integrate a rich text editor
- Build a comments system

## Lesson 14: Video Management and Player

### Core Content

- Video players in Next.js
- Video streaming and optimization
- Video thumbnails and previews
- Video analytics
- Video categories and search

### Activities

- Integrate a video player
- Build the video list page
- Design the video detail page
- Implement video upload and processing
- Build a video search feature

## Lesson 15: Internationalization (i18n)

### Core Content

- Internationalization in Next.js App Router
- Strategies for i18n: Translations and Localization
- Formatting numbers, dates, and currencies
- RTL language support
- Language detection and switching

### Activities

- Configure i18n with next-intl or react-i18next
- Set up language routing
- Create a language switcher
- Implement translations for the UI
- Handle dynamic content with i18n

## Lesson 16: Performance Optimization

### Core Content

- Core Web Vitals and metrics
- Code splitting and lazy loading
- Image optimization with next/image
- Caching strategies
- Bundle analysis and optimization

### Activities

- Check and improve Core Web Vitals
- Configure caching and revalidation
- Optimize images and media
- Lazy load components
- Bundle analysis and code splitting

## Lesson 17: Testing in Next.js

### Core Content

- Unit testing with Jest and React Testing Library
- Integration testing in Next.js App Router
- End-to-end testing with Cypress or Playwright
- Testing Server Components and Client Components
- Test coverage and CI/CD integration

### Activities

- Set up Jest and React Testing Library
- Write unit tests for utility functions
- Write component tests
- Set up e2e tests with Cypress
- Integrate tests into the CI/CD pipeline

## Lesson 18: Deployment and DevOps

### Core Content

- Deploying Next.js app to Vercel and other platforms
- Environment variables and configuration
- CI/CD pipelines
- Monitoring and logging
- SEO and analytics

### Activities

- Configure environment variables
- Set up GitHub Actions CI/CD
- Deploy to staging and production environments
- Configure monitoring and logging
- Implement Google Analytics and SEO optimization
