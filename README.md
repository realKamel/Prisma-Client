# Prisma Client — Prisma

**Prisma Client** is the frontend application for **Prisma** — an Arabic-first educational platform connecting a specialised teacher with students and their parents. It provides interactive video lessons, quizzes, progress tracking, and role-based dashboards for students, teachers, assistants, and administrators.

Built with **Angular 22** (standalone components), **TypeScript**, **TailwindCSS 4**, and **Vitest**.

---

## Table of Contents

- [Prisma Client — Prisma](#prisma-client--prisma)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Requirements](#requirements)
  - [Getting Started](#getting-started)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
  - [Environment Variables](#environment-variables)
  - [Testing](#testing)
  - [Linting \& Formatting](#linting--formatting)
  - [Deployment](#deployment)
    - [Vercel](#vercel)
    - [GitHub Pages](#github-pages)
  - [Internationalisation (i18n)](#internationalisation-i18n)
  - [License](#license)

---

## Tech Stack

| Category         | Technology                                                           |
| ---------------- | -------------------------------------------------------------------- |
| **Language**     | [TypeScript](https://www.typescriptlang.org/) ~6.0                   |
| **Framework**    | [Angular](https://angular.dev/) 22 (standalone, no NgModules)        |
| **Package Mgr**  | npm 11.12.1                                                          |
| **Styling**      | [TailwindCSS](https://tailwindcss.com/) 4 + PostCSS                  |
| **Testing**      | [Vitest](https://vitest.dev/) 4 (via `@angular/build:unit-test`)     |
| **Linting**      | [ESLint](https://eslint.org/) 10 + [angular-eslint](https://github.com/angular-eslint/angular-eslint) 22 |
| **Formatting**   | [Prettier](https://prettier.io/) 3                                   |
| **Icons**        | [@ng-icons](https://ng-icons.github.io/ng-icons/) (Bootstrap & Lucide) |
| **Charts**       | [ApexCharts](https://apexcharts.com/) + [ng-apexcharts](https://github.com/apexcharts/ng-apexcharts) |
| **Video**        | [Vidstack](https://www.vidstack.io/) + [hls.js](https://github.com/video-dev/hls.js) |
| **i18n**         | [ngx-translate](https://github.com/ngx-translate/core)               |
| **HTTP**         | Angular `HttpClient` with cookie-auth & error interceptors           |
| **Build system** | `@angular/build` application builder (Vite / ESBuild under the hood) |
| **Deploy**       | [Vercel](https://vercel.com/) / [GitHub Pages](https://pages.github.com/) |

---

## Requirements

- **Node.js** — see `.nvmrc` or the `engines` field in `package.json` (TODO: verify minimum version). Angular 22 typically requires Node.js ≥ 22.
- **npm** — version 11.12.1 (recommended); managed via `packageManager` field.

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd Prisma-Client

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The app is now running at `http://localhost:4200/`. It will automatically reload when source files change.

---

## Available Scripts

| Script            | Command                                                             | Description                               |
| ----------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| `start`           | `ng serve`                                                          | Start the development server              |
| `build`           | `ng build`                                                          | Build for production (into `dist/`)       |
| `watch`           | `ng build --watch --configuration development`                      | Build in development mode with watch      |
| `test`            | `ng test`                                                           | Run unit tests with Vitest                |
| `lint`            | `ng lint`                                                           | Lint TypeScript and HTML files            |
| `deploy`          | Build with production config + `gh-pages` publish                   | Deploy to GitHub Pages                    |
| `ng`              | `ng`                                                                | Direct Angular CLI access                 |

> **Note:** There is no end-to-end (e2e) test runner configured yet.

---

## Project Structure

```
├── public/                      # Static assets (served at root)
│   ├── assets/
│   │   ├── config/
│   │   │   └── platform.config.json   # Platform branding & content
│   │   ├── data/                      # Mock JSON data for development
│   │   ├── fonts/
│   │   └── images/
│   ├── fonts/
│   ├── i18n/                    # Translation files
│   │   ├── ar.json              # Arabic
│   │   └── en.json              # English
│   └── lesson-data.json
├── src/
│   ├── app/
│   │   ├── app.ts               # Root standalone component
│   │   ├── app.config.ts        # App-wide providers & configuration
│   │   ├── app.routes.ts        # Route definitions (lazy-loaded)
│   │   ├── app.html / app.css   # Root component template & styles
│   │   ├── core/
│   │   │   ├── Services/        # API services, auth, config, etc.
│   │   │   ├── guards/          # Route guards (auth, role, policy, etc.)
│   │   │   ├── interceptors/    # HTTP interceptors (cookie-auth, error)
│   │   │   ├── Models/          # TypeScript interfaces & types
│   │   │   ├── enums/           # Enums (roles, question types, etc.)
│   │   │   ├── pipes/           # Custom pipes (Arabic numbers, dates, etc.)
│   │   │   └── stores/          # Signal-based state stores
│   │   ├── features/
│   │   │   ├── admin/           # Admin dashboard feature
│   │   │   ├── assistant/       # Assistant dashboard feature
│   │   │   ├── auth/            # Authentication (login, register, etc.)
│   │   │   ├── common/          # Public pages (home, lessons, etc.)
│   │   │   ├── dashboard-shared/# Shared dashboard routes & components
│   │   │   ├── student/         # Student-facing pages
│   │   │   └── teacher/         # Teacher dashboard feature
│   │   ├── layouts/
│   │   │   ├── dashboard-layout/# Layout for admin/teacher/assistant
│   │   │   └── main-layout/     # Public-facing layout
│   │   ├── shared/
│   │   │   └── validators/      # Custom form validators
│   │   └── Utils/
│   │       └── pagination.utils.ts
│   ├── environments/
│   │   ├── environment.ts               # Production environment config
│   │   └── environment.development.ts   # Development environment config
│   ├── index.html
│   ├── main.ts                  # Application bootstrap entry point
│   └── styles.css               # Global styles (TailwindCSS)
├── angular.json                 # Angular CLI configuration
├── tsconfig.json                # Root TypeScript config
├── tsconfig.app.json            # TypeScript config for the app
├── tsconfig.spec.json           # TypeScript config for tests
├── eslint.config.js             # ESLint flat config
├── tailwind.config.js           # TODO: verify location (Tailwind v4 uses CSS-based config)
├── db.json                      # JSON Server mock data (for local dev)
├── vercel.json                  # Vercel deployment config
├── package.json
└── README.md
```

---

## Environment Variables

Configuration is managed via Angular file replacements in `src/environments/`:

| File                            | Used In       | `apiUrl`                                  |
| ------------------------------- | ------------- | ----------------------------------------- |
| `environment.ts`                | Production    | `https://prisma.runasp.net/api/v1`        |
| `environment.development.ts`    | Development   | `http://localhost:5117/api/v1`            |

Both files also expose a `teacherEmail` field (`ahmed@gmail.com`).

> **TODO:** Document any additional environment variables (e.g., feature flags, third-party keys).

---

## Testing

Unit tests are run with **Vitest** via the Angular CLI:

```bash
npm test
# or
ng test
```

Test files follow the `*.spec.ts` naming convention and are co-located with their source files. The test configuration in `tsconfig.spec.json` includes `vitest/globals` types.

> **TODO:** Add a code-coverage threshold and a coverage badge once configured.

---

## Linting & Formatting

```bash
# Lint both TypeScript and HTML
npm run lint

# Format code with Prettier (TODO: add a format script)
npx prettier --write "src/**/*.{ts,html,css,json}"
```

- **ESLint** enforces Angular style rules (component selectors prefixed `app-`, directive selectors camelCase, template accessibility).
- **Prettier** is configured for 100-print-width, single quotes, and an Angular HTML parser.

---

## Deployment

### Vercel

The project includes a `vercel.json` that rewrites all routes to `index.html` (SPA fallback). Connect the repo to Vercel — no additional configuration is needed.

### GitHub Pages

```bash
npm run deploy
```

This builds the app with `--base-href /Prisma-Client/`, copies `index.html` to `404.html` (for SPA routing), and publishes to the `gh-pages` branch.

---

## Internationalisation (i18n)

The app uses **@ngx-translate/core** for translations. Translation files are located in `public/i18n/`:

- `public/i18n/ar.json` — Arabic (default)
- `public/i18n/en.json` — English

The default language is Arabic (`ar`), persisted in `localStorage` under the key `lang`.

---

## License

**All Rights Reserved — Showcase Only.**

This source code is provided **solely for demonstration and portfolio purposes**. You may view and study the code, but you are **not permitted** to copy, distribute, modify, sublicense, or use it — or any part of it — for commercial purposes without explicit prior written agreement from the author.

If you'd like to discuss collaboration, licensing, or commercial use, please reach out.
