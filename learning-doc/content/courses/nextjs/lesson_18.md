# Lesson 18: Deployment and DevOps

## 🎯 Learning Objectives

After this lesson, students will be able to:

- Understand the basic concepts of **web application deployment** and **DevOps** in the context of Next.js.
- Know how to configure **environment variables** securely and according to Next.js standards.
- Perform a Next.js App Router deployment to **Vercel** and other platforms (e.g., Netlify, AWS Amplify).
- Set up a basic **CI/CD (Continuous Integration & Continuous Deployment)** pipeline using GitHub Actions to automate building and deploying.
- Understand how to set up **staging and production environments** for a Next.js project.
- Grasp the basics of **monitoring** and **logging**, and how to connect tools like Google Analytics to track performance and user behavior.
- Identify key considerations when deploying a real-world Next.js project.

## 📝 Detailed Content

### 1. Concepts of Deployment and DevOps

- **Web Application Deployment**: The process of moving an application from a development environment (local) to a server or hosting platform so it can be accessed by users.

  - Deployment usually involves: building the code (compiling, bundling), configuring the environment, uploading source code, and running the application.

- **DevOps**: A methodology that combines development (Dev) and operations (Ops) to automate and optimize the software development and deployment process, ensuring application stability, rapid updates, and easy maintenance.

### 2. Popular Platforms for Deploying Next.js

- **Vercel** (the creator of Next.js) – free, easy, and specifically optimized for Next.js.
- **Netlify** – also popular for front-end deployment, supporting various frameworks.
- **AWS Amplify, Firebase Hosting** – suitable for applications with complex backends.
- **DigitalOcean, Heroku, Railway** – server or platform-as-a-service options.

### 3. Environment Variables

- Help store sensitive information (API keys, secrets) or specific configurations for different environments (dev, staging, production).
- In Next.js with App Router, environment variables must be placed in `.env.local` or `.env.production` files and must start with `NEXT_PUBLIC_` if they are to be used on the client side.

**Example:**

```env
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_PASSWORD=yourpassword
```

- Usage in code:

```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

- Note: Never commit `.env.local` files to GitHub if they contain sensitive information.

### 4. Deploying Next.js App Router to Vercel

- Register an account at [vercel.com](https://vercel.com).
- Connect your GitHub (or GitLab, Bitbucket) repository to Vercel.
- Vercel automatically detects the Next.js project and configures the build and deployment.
- Configure environment variables in the Vercel Dashboard (Settings > Environment Variables).
- Deploy to staging and production by creating corresponding branches or using preview deployments.
- Vercel provides auto-scaling, a CDN, and free HTTPS.

### 5. CI/CD with GitHub Actions for Next.js

**CI (Continuous Integration)**: Automatically checks code and builds whenever changes are pushed to the repository.

**CD (Continuous Deployment)**: Automatically deploys the verified code to the hosting environment.

**Basic Workflow Example:**

```yaml
name: Deploy Next.js to Vercel

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Build Next.js app
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: .
          prod: true
```

- How to retrieve secrets (token, org-id, project-id) from the Vercel Dashboard.
- The workflow will automatically run on push to `main`, building the app and deploying it to Vercel.

### 6. Setting up Staging and Production Environments

- Create separate branches on GitHub: `main` (production), `staging`.
- Configure distinct environment variables on Vercel for each branch.
- Use preview deployments on Vercel to test before merging code into `main`.
- This helps minimize deployment errors and allows for thorough testing before a formal launch.

### 7. Basic Monitoring and Logging

- **Monitoring**: Tracking performance, uptime, and errors within the application.
- **Logging**: Recording events, errors, or activities for debugging and analysis.
- Vercel provides dashboard logs where you can view build and runtime logs.
- Connect to external services like Sentry for error tracking or Datadog for advanced monitoring.

### 8. Implementing Google Analytics and SEO Optimization

- Install Google Analytics to track traffic and user behavior.
- In Next.js, add the GA script in `app/layout.tsx` or use a package like `nextjs-google-analytics`.
- SEO: Set up metadata, sitemap, and robots.txt for the website.
- Use the metadata API in App Router to optimize SEO.

## 🏆 Practice Exercise with Detailed Solution

**Task:**

Deploy your Next.js App Router project to Vercel with two environments: `staging` and `production`. Create a CI/CD pipeline using GitHub Actions to automatically build and deploy the application when changes occur on the corresponding branches (`staging` and `main`). Configure environment variables for each environment and integrate Google Analytics to track visits.

**Solution and Analysis:**

1. **Prepare the Project:**

   - Ensure the Next.js project is complete, including an `.env.local` file for local variables (do not commit this file).
   - Create environment variables on Vercel:

     - In the Vercel Dashboard, create variables for Production (associated with the `main` branch).
     - Create variables for Staging (associated with the `staging` branch).

2. **Connect GitHub to Vercel:**

   - Go to Vercel and link your repository.
   - Configure branch-based deployments for preview and production.

3. **Create the GitHub Actions Workflow:**

   - Create the file `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy Next.js

   on:
     push:
       branches:
         - main
         - staging

   jobs:
     build_and_deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3

         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "18"

         - name: Install dependencies
           run: npm install

         - name: Build Next.js app
           run: npm run build

         - name: Deploy to Vercel
           uses: amondnet/vercel-action@v20
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
             vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
             working-directory: .
             prod: ${{ github.ref == 'refs/heads/main' }}
   ```

   - Explanation: Pushing to `main` triggers a production deployment; pushing to `staging` triggers a staging (preview) deployment.

4. **Configure Google Analytics:**

   - Create a GA account and get your Tracking ID.
   - Add the GA code snippet to `app/layout.tsx`:

   ```tsx
   import Script from "next/script";

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <head>
           <Script
             src={`https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID`}
             strategy="afterInteractive"
           />
           <Script id="google-analytics" strategy="afterInteractive">
             {`
               window.dataLayer = window.dataLayer || [];
               function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date());
               gtag('config', 'GA_TRACKING_ID');
             `}
           </Script>
         </head>
         <body>{children}</body>
       </html>
     );
   }
   ```

   - Replace `GA_TRACKING_ID` with your actual ID.

5. **Testing:**

   - Push code to the `staging` and `main` branches.
   - Verify automatic building and deployment on Vercel.
   - Confirm that environment variables are correctly applied.
   - Monitor traffic in Google Analytics.

## 🔑 Key Points to Remember

- **Environment Variables:** Always distinguish between client-side (`NEXT_PUBLIC_`) and server-side variables to prevent leaking secrets.
- **Vercel** is the ideal platform for Next.js, offering Preview Deployments for thorough testing before production.
- **GitHub Actions** enables deployment automation, reducing manual errors.
- When deploying, **never commit the `.env.local` file** containing secrets.
- Always test thoroughly in the staging environment before pushing to production.
- Ensure Google Analytics is correctly placed to collect accurate data without impacting performance.
- Maintain a clear separation between build and deployment steps in your CI/CD pipeline for easier maintenance.

## 📝 Homework

**Task:**

1. Set up a CI/CD pipeline on GitHub Actions to automatically deploy a Next.js project to Netlify or AWS Amplify instead of Vercel.

2. Configure environment variables for both `development` and `production` in your project, ensuring no sensitive information is exposed.

3. Integrate an error monitoring tool (like Sentry) into the Next.js application and test error log delivery.

4. Write a short blog post (approx. 200-300 words) summarizing your steps and experience with Next.js deployment, sharing important tips for beginners.
