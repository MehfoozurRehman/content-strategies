# Content Strategies

A web workspace for content strategy teams: sign in, browse voice-of-customer, voice-of-market and voice-of-business views, chat with an AI assistant over uploaded documents, and manage categories and users.

**Status:** In progress. The app has real authentication, several dashboards, an AI chat assistant and admin screens wired to a backend API, but the repo has no tests, no deployment notes, and placeholder text in the document-generation area.

## The problem

Content strategy work draws on customer research, market research and business documents that are hard to search and reuse. The code shows a single app that gathers these sources into categories, lets a team ask questions against them, and keeps company users and roles in one place.

## What it does

- Authentication flows: login, sign-up under a company slug, forgot-password and reset-password pages (`src/app/(auth)`, `src/app/[companySlug]/sign-up`), with an `AuthGurad` wrapper for protected pages.
- Insight views: `voice-of-customer`, `voice-of-market` and `voice-of-business` pages, including a manage-library screen for business content.
- An AI assistant (`src/app/assistant/page.jsx`) with conversation history, file attachments, source and context document selection, and a prompt optimizer (`optimizePrompt` in `src/lib/services/chatServices.js`).
- Category and user administration: category management, company user management, and an AI navigator users screen with role and status updates (`src/lib/services/adminServices.js`).
- Reusable UI pieces such as a draggable table, filter multi-select, comment and detail modals, and a toast system (`src/app/customComponents`).

## How it's built

- Next.js 15 with the App Router and React 19, styled with Tailwind CSS and small Radix/shadcn-style UI primitives in `src/components/ui`.
- Supabase (`@supabase/supabase-js`) for auth and data access from the browser, alongside an Axios client (`src/lib/axiosMiddleware.js`) that adds a bearer token from localStorage to every request to a separate backend API.
- Feature code is grouped by service: one module per area under `src/lib/services`, so pages call functions such as `sendChats` or `updateUserRoles` rather than building requests inline.
- Configuration comes from `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`, read through `process.env`.

## Running it locally

```bash
pnpm install      # or npm install
pnpm dev          # next dev
pnpm build        # next build
pnpm start        # next start
pnpm lint         # next lint
```

Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in a `.env.local` file before running. The backend API is not in this repo.

## What's left

- The admin Supabase client in `src/lib/services/adminServices.js` is created with a `NEXT_PUBLIC_` service-role key, which would be bundled into browser code. This needs to move to server-side code and a non-public variable.
- `axiosMiddleware.js` hard-codes the backend base URL and should read it from configuration.
- Several document types in `CustomCrud.jsx` show "Coming soon: a button to auto-create this document" instead of a working action.
- `CustomCrud.jsx` is over 9,000 lines and should be split into smaller components.
- There are no automated tests.
- The README was a generated template until this rewrite; no deployment is documented.

## License

See `LICENSE`.
