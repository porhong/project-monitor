# syntax=docker/dockerfile:1

# ─── Stage 1: install dependencies ────────────────────────────────────────────
# Uses Alpine + build tools to compile the better-sqlite3 native module.
FROM node:22-alpine AS deps

# libc6-compat: needed by some Node binaries on Alpine (musl vs glibc shim)
# python3, make, g++: required to compile better-sqlite3 native addon
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./
# ci install: clean, reproducible, respects package-lock
RUN npm ci

# ─── Stage 2: build the Next.js application ───────────────────────────────────
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Bring in compiled node_modules (including the native better-sqlite3 binary)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# next build emits .next/standalone thanks to output: "standalone" in next.config.mjs
RUN npm run build

# ─── Stage 3: minimal production image ────────────────────────────────────────
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root system user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Static assets (served directly by Next.js standalone server)
COPY --from=builder /app/public ./public

# Standalone server bundle (includes a minimal node_modules copy)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Pre-compiled client assets referenced by the standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drizzle migration files — applied automatically at startup via migrate()
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# better-sqlite3 native binary — outputFileTracingIncludes copies it into
# .next/standalone/node_modules, but we overwrite with the freshly-compiled
# version to guarantee the musl binary is present.
COPY --from=builder --chown=nextjs:nodejs \
    /app/node_modules/better-sqlite3 \
    ./node_modules/better-sqlite3

# Persistent volume mount point for the SQLite database file
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

# Must match the port passed to `next start` in package.json
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# node server.js is the standalone entry-point emitted by Next.js
CMD ["node", "server.js"]
