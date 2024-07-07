# Next-Prisma-Starter

Next-Prisma-Starter is a boilerplate project designed to help you quickly set up a well-organized development environment for building web applications using Next.js, Prisma, Redux Toolkit, RTK Query, and Tailwind CSS for styling. This starter template provides a solid foundation for your projects, making it easier to get started with popular technologies and best practices.

## Tech Stack

- **Next.js**: A popular React framework for building server-rendered and statically generated applications.
- **Prisma**: A modern database toolkit for Node.js and TypeScript, making database access and management more efficient and developer-friendly.
- **Redux Toolkit**: A library that simplifies state management in React applications, enabling you to write scalable and maintainable code.
- **RTK Query**: A powerful data-fetching library that simplifies fetching, caching, and updating data in your React components.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces with minimal CSS code.

## Getting Started

To get started with Next-Prisma-Starter, follow these steps:

1. **Install Dependencies**: Navigate to the project directory and install the required dependencies.

   ```bash
   cd next-prisma-starter
   npm install
   ```

2. **Set Up the Database**: Configure your database connection in the `prisma/schema.prisma` file. You can use PostgreSQL, MySQL, SQLite, or another supported database.

3. **Run Migrations**: Apply database migrations to create the database schema.

   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

   For existing schema you can update your schema changes without creating an migration folder with following command:

   ```bash
   npm run push
   ```

4. **Seed Database**: To seed your database with dummy data.

   ```bash
   npm run seed
   ```

   also you can set limit of dummy data you need from the `config` file located at `src/config/default.ts`

5. **Start the Development Server**: Start the Next.js development server.

   ```bash
   npm run dev
   ```

6. **Open Your App**: Your application should now be running at [http://localhost:3000](http://localhost:3000). You can start building your project by modifying the source code located in the `src` directory.

## Folder Structure

Next-Prisma-Starter follows a well-organized folder structure to keep your codebase clean and maintainable. Here's a brief overview:

- `src`: Contains the application's source code, including pages, components, Redux Toolkit setup, and React Query API endpoints.
- `prisma`: Contains Prisma-related files, including the database schema (`schema.prisma`) and migrations.
- `public`: Public assets such as images and fonts can be placed in this directory.
- `styles`: Styling files, including Tailwind CSS configurations and global styles.
- `pages`: Next.js pages for routing and rendering components.
- `api`: Custom API routes for server-side logic.

```bash
next-prisma-starter/
├── prisma/
├── public/
├── src/
│   ├── config/
│   ├── pages/
│   ├── redux/
│   │   ├── api/
│   │   ├── features/
│   ├── styles/
│   ├── types/
│   └── utils/
├── ...
├── package.json
├── tsconfig.json
├── ...

```
