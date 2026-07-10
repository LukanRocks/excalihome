<div align="center">
  <img src="./web/public/logo.svg" alt="ExcaliHome Logo" width="100" height="100" />
  <h1>ExcaliHome</h1>
  <p><strong>Self-hosted Excalidraw board manager</strong></p>
  <p>Create and organize your Excalidraw boards on your own hardware.</p>
</div>

<div align="center">
  <a href="https://github.com/LukanRocks/excalihome/actions/workflows/docker-publish.yml">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/LukanRocks/excalihome/docker-publish.yml" />
  </a>
  <a href="https://github.com/LukanRocks/excalihome/releases">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/LukanRocks/excalihome" />
  </a>
  <a href="https://github.com/LukanRocks/excalihome/stargazers">
    <img alt="GitHub Stars" src="https://img.shields.io/github/stars/LukanRocks/excalihome?style=flat&logo=github" />
  </a>
  <img alt="Docker" src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat&logo=docker&logoColor=white" />
</div>

---

## Tech stack

| Layer     | Technology                |
| --------- | ------------------------- |
| Backend   | Node.js + Express.js      |
| Frontend  | React + Vite + Excalidraw |
| UI        | Tailwind CSS              |
| Database  | SQLite via Drizzle ORM    |
| Container | Docker (single container) |

## Running with Docker

```bash
docker run -d \
  -p 3000:3000 \
  -v ./data:/app/data \
  ghcr.io/lukanrocks/excalihome:latest
```

Or with Docker Compose:

```bash
docker compose up -d
```

The app starts on [http://localhost:3000](http://localhost:3000). On first run, the database schema is initialized automatically. All data is persisted in the mounted `/app/data` volume.

## Local development

```bash
# Install all dependencies
pnpm install

# Start backend and web in watch mode
pnpm dev
```

The API server runs on port `3001` and the Vite dev server on port `5173` by default.

### Database migrations

The schema lives in `backend/src/db/schema.ts`. After changing it, generate a migration with:

```bash
pnpm -C backend db:generate
```

Pending migrations are applied automatically when the server starts.

---

<div align="center">

**⭐ If you find ExcaliHome useful, please consider giving it a star!**

[![Stars](https://img.shields.io/github/stars/LukanRocks/excalihome?style=social&logo=github)](https://github.com/LukanRocks/excalihome/stargazers)

Made with 💛 for the homelabbing community

</div>
