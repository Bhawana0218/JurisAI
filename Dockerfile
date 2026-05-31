FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# --------------------------
# Install dependencies
# --------------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY juris-ai/package.json ./juris-ai/package.json
COPY packages/shared/package.json ./packages/shared/package.json

COPY juris-ai/prisma ./juris-ai/prisma
COPY packages ./packages

RUN pnpm install --frozen-lockfile


# --------------------------
# Build stage
# --------------------------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate
RUN pnpm prisma generate --schema=juris-ai/prisma/schema.prisma

# Build shared first
RUN pnpm --filter @jurisai/shared build

# Build Next.js app
RUN pnpm run build:web


# --------------------------
# Runner stage (PRODUCTION)
# --------------------------
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=builder /app/juris-ai/public ./juris-ai/public
COPY --from=builder /app/juris-ai/.next ./juris-ai/.next
COPY --from=builder /app/juris-ai/package.json ./juris-ai/package.json
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["pnpm", "--filter", "juris-ai", "start"]