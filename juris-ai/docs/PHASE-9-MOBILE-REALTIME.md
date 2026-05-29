# Phase 9 — AI-Native Mobile + Real-Time Intelligence

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Clients: Web (Next.js) · Mobile (Expo) · Voice              │
├─────────────────────────────────────────────────────────────┤
│  @jurisai/shared — types, API client, realtime protocol      │
├─────────────────────────────────────────────────────────────┤
│  Real-time layer                                             │
│  · SSE  GET /api/realtime/stream (Vercel-safe)               │
│  · WS   server/realtime/ws-server.ts (dedicated deploy)      │
│  · Redis pub via lib/realtime/publisher.ts                   │
│  · Supabase Realtime lib/realtime/supabase-realtime.ts       │
├─────────────────────────────────────────────────────────────┤
│  Offline sync POST /api/sync · AsyncStorage (mobile)         │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL + Prisma — cases, tasks, notes, devices, presence│
└─────────────────────────────────────────────────────────────┘
```

## Monorepo

```
JurisAI/
├── package.json          # npm workspaces
├── juris-ai/             # Web app (Next.js 16)
├── apps/mobile/          # Expo React Native
├── packages/shared/      # Shared TS
└── docs/
```

## Real-time events

| Event | Channel | Use |
|-------|---------|-----|
| message.created | chat:{id} | New messages |
| typing.start/stop | chat:{id} | Live typing |
| presence.update | org:{id} | Team online |
| sync.push | user:{id} | Offline sync done |

## Mobile app

```bash
cd apps/mobile
EXPO_PUBLIC_API_URL=https://your-api.com npm start
```

Features: AI chat, offline queue, voice STT, cases/tasks tabs, biometric settings, push-ready device registration.

## APIs (new)

| Endpoint | Purpose |
|----------|---------|
| GET /api/realtime/stream | SSE subscription |
| POST /api/presence | Online/away status |
| POST /api/typing | Typing indicators |
| GET/POST /api/sync | Offline sync |
| POST /api/devices/register | Push + biometric |
| GET/POST /api/cases | Case tracking |
| GET/POST /api/tasks | Tasks + AI generation |
| GET/POST /api/notes | AI notes |
| POST /api/meetings/summarize | Meeting AI |

## Deploy

1. `npx prisma migrate deploy`
2. Set `UPSTASH_REDIS_REST_URL` + token
3. Optional: `NEXT_PUBLIC_SUPABASE_URL` for Supabase Realtime
4. Run WS server: `npx tsx server/realtime/ws-server.ts` on Railway
5. Mobile: EAS Build for iOS/Android

## Security

- Session auth on all private routes
- Rate limits via Redis (`lib/security/rate-limit.ts`)
- Public search rate-limited by IP hash
- Biometric flag on `UserDevice` (client-side Expo LocalAuthentication)
