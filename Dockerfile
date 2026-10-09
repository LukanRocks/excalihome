FROM node:22-alpine AS base
RUN corepack enable

FROM base AS client-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter excalihome-web
COPY apps/web/ ./apps/web/
RUN pnpm -C apps/web build

FROM base AS server-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter excalihome-backend
COPY apps/backend/ ./apps/backend/
RUN pnpm -C apps/backend build

FROM base AS production
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter excalihome-backend --prod
COPY --from=server-build /app/apps/backend/dist ./apps/backend/dist
COPY --from=client-build /app/apps/web/dist ./apps/backend/public
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

EXPOSE 3000
WORKDIR /app/apps/backend
CMD ["node", "dist/index.js"]
