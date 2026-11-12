# Pinned by digest; Dependabot (docker ecosystem) keeps it current
FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS base
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
# better-sqlite3 13+ installs via an implicit `node-gyp rebuild` (a no-op when its bundled
# prebuild matches), but node-gyp still needs Python to run
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter excalihome-backend
COPY apps/backend/ ./apps/backend/
RUN pnpm -C apps/backend build

# Production dependencies, built here so the final image doesn't need compilers
FROM base AS prod-deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter excalihome-backend --prod

FROM base AS production
WORKDIR /app
RUN apk add --no-cache su-exec
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=server-build /app/apps/backend/dist ./apps/backend/dist
COPY --from=client-build /app/apps/web/dist ./apps/backend/public
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN mkdir -p /app/data && chown node:node /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

EXPOSE 3000
WORKDIR /app/apps/backend
# Starts as root only to fix ownership of the data dir, then runs the server as `node`
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
