# Repo structure

This repo is a pnpm workspace that uses the `/apps` + `/packages` layout. Keep it that way: do not move an app
back into the repo root.

## Apps (`/apps`)

- `/apps/backend`: Node API (Express + Socket.IO, SQLite via Drizzle); serves the built web app in production
- `/apps/web`: React + Vite frontend (Excalidraw, Tailwind)

## Packages (`/packages`)

No shared packages yet. Create `/packages/<name>` when code needs to be shared between apps (for example shared Zod schemas).

## Conventions

- Every deployable application lives in its own `/apps/<name>` folder.
- Code shared between apps lives in `/packages/<name>` (for example shared Zod schemas) and is consumed
  through the workspace, not copied between apps.
- New deployable units go under `/apps`. New shared code goes under `/packages`.
- When you add, rename, or remove an app or package, update the lists above in the same change. This file
  must always describe the repo as it is today.

# Scripts

Run everything from the repo root. The apps keep only the internal scripts the root delegates to; don't add
per-app entry points.

- `pnpm dev`: backend (`tsx watch`, port 3001) and web (Vite, port 5173, proxies `/api` and `/socket.io` to the
  backend) in parallel
- `pnpm build`: builds both apps and copies `apps/web/dist` into `apps/backend/public`
- `pnpm start`: runs the built backend, which also serves the frontend (same as the Docker image)
- `pnpm db:generate`: generates a Drizzle migration after changing `apps/backend/src/db/schema.ts`

# Formatting

Prettier is the only enforced formatter. ESLint is not part of the baseline.

- `pnpm prettier:format`: format the whole repo
- `pnpm prettier:check`: check formatting without changing any file (run it before finishing a task)

Both run from the repo root. Staged files are also formatted automatically on commit (Husky + lint-staged),
and commit messages must follow Conventional Commits.

# Workspace security settings (`pnpm-workspace.yaml`)

This repo pins these supply-chain hardening settings:

- `strictDepBuilds: true`
- `minimumReleaseAge: 2880`: 48h cooldown before a newly published package version can be installed
- `trustPolicy: no-downgrade`
- `trustPolicyIgnoreAfter: 129600`: 90 days; versions older than this skip trust checks (the 48h cooldown
  already covers the fresh end)

Don't loosen these without discussing why first.
