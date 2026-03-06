# Learning-Doc: Modular Engineering Academy

A professional, full-stack learning platform built with Nuxt 4, Nuxt Content, and Tailwind CSS. This project serves as a comprehensive documentation and course management system with a discipline-centric architecture.

## 🚀 Key Features

- **Discipline-Centric Navigation**: Content organized by professional engineering fields (Frontend, Backend, Mobile, Systems, etc.).
- **Nuxt Content v3**: Powerful file-based CMS with custom Prose component overrides.
- **Interactive UI**: Custom-built Roadmap cards, Progress bars, and interactive code elements.
- **Modular Architecture**: Clean separation of concerns between components, services, and composables.
- **Local Development Backend**: Integrated PocketBase via Docker for authentication and progress tracking.

## 🛠️ Project Structure

- `components/`: Modular UI system (Common, Custom, Content, and UI Primitives).
- `pages/`: Discipline-aware routing and LMS interfaces.
- `composables/`: Reusable logic for Auth, Theme, and Progression.
- `services/`: Backend API integration (PocketBase, Comments, Translations).
- `assets/`: Global styling and design tokens.
- `utils/`: Core business logic and academy configuration constants.
- `pocketbase-docker/`: Local backend infrastructure.

## 🛠️ Setup & Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Local Backend (PocketBase)

Start the local backend services using Docker:

```bash
cd pocketbase-docker
docker-compose up -d
```

### 3. Run Development Server

```bash
pnpm dev
```

### 4. Build for Production

```bash
pnpm build
```

## 📜 Documentation

Detailed changelogs and implementation plans are stored in the `.gemini/antigravity/brain/` directory for historical tracking.

- [Changelog (Uncommitted)](changelog.md)
- [Verification Results](walkthrough.md) (Generated per task)
