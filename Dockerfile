FROM node:22-alpine AS base
RUN corepack enable

FROM base AS client-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web/package.json ./web/package.json
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter excalihome-web
COPY web/ ./web/
RUN pnpm -C web build

FROM base AS server-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web/package.json ./web/package.json
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter excalihome-backend
COPY backend/ ./backend/
RUN pnpm -C backend build

FROM base AS production
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web/package.json ./web/package.json
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter excalihome-backend --prod
COPY --from=server-build /app/backend/dist ./backend/dist
COPY --from=client-build /app/web/dist ./backend/public
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

EXPOSE 3000
WORKDIR /app/backend
CMD ["node", "dist/index.js"]
