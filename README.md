Welcome to Esox Biologics' web app project! This project is built using Next.js, a powerful framework for building modern web applications.

## Getting Started

To run the development server, use the following command:

# Esox Web App

A Next.js + TypeScript web application.

## Quick start

- Install dependencies:

```bash
npm install
```

- Run development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Build & run (production)

```bash
npm run build
npm run start
```

## Important files

- `src/app` — App Router pages and top-level `layout.tsx`.
- `src/components` — UI components (navbar, sidebar, etc.).
- `src/contexts` — React contexts (Firebase auth, settings).
- `src/hooks` — Custom hooks used across the app.
- `lib/client` — API client code.
- `public` — Static assets and prebuilt pages.

## Environment variables

This project expects runtime configuration and secrets to be provided via environment variables. Typical entries (check `private-config.ts`) include:

- `NEXT_PUBLIC_API_URL` — public API base URL
- `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, etc. — Firebase config

Create a `.env.local` in the project root (do not commit it) with values for the variables above. Example:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
FIREBASE_API_KEY=your_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

## Scripts

See `package.json` for the full list, commonly:

- `dev` — run development server
- `build` — build for production
- `start` — run production server
- `lint` — lint the codebase

## Deployment

This app is compatible with Vercel and other Node.js hosting platforms. Ensure environment variables are set in your hosting provider's dashboard.

## Security & recommendations

- Do not commit secrets or `private-config.ts` with real credentials. Use environment variables.
- Add basic CI (GitHub Actions) to run `npm run build` and tests on PRs.
- Add tests for critical components and API flows.

If you'd like, I can also generate a `.env.example`, CI workflow, or a minimal `Dockerfile` for container deployments.
