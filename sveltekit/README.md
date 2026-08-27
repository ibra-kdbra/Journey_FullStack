# SvelteKit

<div align="center">
<a href="#getting-started">Quick Start</a> ·
<a href="#features">Features</a>
</div>

## Overview

#### Welcome to SvelteKit , the ultimate mise en place for your next SvelteKit project 🚀.

Inspired by the [Rails doctrine](https://rubyonrails.org/doctrine#omakase), this project embraces an opinionated approach—offering an opinionated selection of tools and a structured foundation while giving you the freedom to customize and extend as needed.
Whether you're a seasoned developer or just starting out, this starter kit is carefully curated to get you up and running with SvelteKit by providing everything you need to build modern, scalable web applications with ease.

## Table of Contents

- [SvelteKit](#sveltekit)
  - [Overview](#overview)
    - [Welcome to SvelteKit , the ultimate mise en place for your next SvelteKit project 🚀.](#welcome-to-sveltekit--the-ultimate-mise-en-place-for-your-next-sveltekit-project-)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
  - [Project Structure](#project-structure)

## Features

- 🎨 **Modern, Responsive & Accessible UI**
- 🔒 **Robust Authentication**
- 👥 **Teams/Accounts Management**
- 🎛️ **Customizable Dashboard**
- 📁 **File Storage**
- 📧 **Transactional Email**
- 🛠️ **Developer Utilities & DX Enhancements**

## Tech Stack

- [🟠 Svelte 5](https://svelte.dev/)
- [👍 SvelteKit](https://kit.svelte.dev/)
- [💨 TailwindCSS](https://tailwindcss.com/)
- [💾 Drizzle ORM](https://orm.drizzle.team/)
- [🐂 Turso](https://turso.tech/)
- [🎨 shadcn-svelte](https://www.shadcn-svelte.com/)
- [🇳🇴 Oslo](https://oslojs.dev/)
- [🇦🇶 Arctic](https://arcticjs.dev/)
- [⛵ SailKit](https://sailkit.xyz/)
- [📬 Resend](https://resend.com/)
- [⛔ Zod](https://zod.dev/)
- [📄 SuperForms](https://superforms.rocks/)
- [📁 Cloudflare R2](https://www.cloudflare.com/r2/)

## Getting Started

### Installation

```bash
# Install dependencies (SvelteKit  is tailored for pnpm, but you can use any package manager you like)
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the database locally
pnpm db:push

# Start the development server
pnpm dev
```

## Project Structure

```
src/
├── lib/             # Library code
│   ├── components/  # UI components
│   ├── db/          # Database models and queries
│   ├── server/      # Server-only code
│   └── utils/       # Utility functions
├── routes/          # SvelteKit routes
│   ├── (auth)/      # Authentication routes
│   └── (dashboard)/ # Protected dashboard routes
└── styles/          # Global styles
```
