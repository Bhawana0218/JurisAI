FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
COPY juris-ai/package.json ./juris-ai/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate --schema=juris-ai/prisma/schema.prisma
RUN npm run build:web

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/juris-ai/public ./juris-ai/public
COPY --from=builder --chown=nextjs:nodejs /app/juris-ai/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/juris-ai/.next/static ./juris-ai/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "juris-ai/server.js"]
