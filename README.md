# JurisAI — AI-Powered Legal Intelligence Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-purple?style=for-the-badge&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4.1--mini-green?style=for-the-badge&logo=openai)](https://openai.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-teal?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

**AI-native legal intelligence platform: chat, documents, case management, and enterprise AI workflows**

</div>

---

## Architecture

```
JurisAI/
├── package.json                  # npm workspaces monorepo root
├── juris-ai/                     # Next.js 16 web application
│   ├── app/                      # App Router (pages, API routes, layouts)
│   ├── components/               # React components (shadcn/ui + custom)
│   ├── features/                 # Domain feature modules
│   │   ├── auth/                 # Authentication & authorization
│   │   ├── realtime/             # Real-time presence & typing
│   │   ├── sync/                 # Offline sync engine
│   │   └── productivity/        # AI productivity tools
│   ├── lib/                      # Core libraries
│   │   ├── rag/                  # RAG engine (embeddings, vector search, chunking)
│   │   ├── rag/                  # Vector + hybrid search
│   │   ├── cache/               # Redis caching layer
│   │   ├── security/            # Rate limiting
│   │   ├── realtime/            # Event publishing (Redis, SSE, WS)
│   │   ├── documents/           # Document text extraction
│   │   └── errors/              # API error handling
│   ├── ai/                       # AI layer
│   │   ├── agents/              # Multi-agent orchestrator
│   │   └── prompts/             # Legal assistant prompts
│   ├── store/                    # Zustand state management
│   ├── server/realtime/         # WebSocket server
│   ├── prisma/                   # Database schema & migrations
│   └── middleware/               # Auth middleware
├── apps/mobile/                  # Expo React Native mobile app
│   ├── app/                      # Screens (Chat, Cases, Tasks, Settings)
│   ├── hooks/                    # Custom hooks (sync-on-reconnect)
│   └── stores/                   # Zustand offline-first stores
├── packages/shared/              # Shared TypeScript package
│   └── src/
│       ├── types/               # Shared types
│       ├── api/                 # API client
│       └── realtime/            # Protocol definitions
├── Dockerfile                    # Production Docker image
└── docker-compose.yml           # Local infrastructure
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 (strict mode) |
| **UI** | Tailwind CSS 4 + shadcn/ui (Radix) |
| **Database** | PostgreSQL 16 + pgvector |
| **ORM** | Prisma 7 |
| **Auth** | NextAuth.js v5 (JWT, credentials) |
| **AI/LLM** | OpenAI GPT-4.1-mini, text-embedding-3-small |
| **AI SDK** | Vercel AI SDK v6 |
| **Vector Search** | pgvector (cosine similarity) + hybrid keyword |
| **Cache** | Upstash Redis |
| **Real-time** | SSE + WebSockets + Redis Pub |
| **Mobile** | Expo React Native 52 |
| **State** | Zustand + React Query |
| **Testing** | Vitest + React Testing Library |
| **Monitoring** | Sentry |
| **Infrastructure** | Docker, docker-compose |

## Key Features

### AI Chat System
- Multi-agent legal assistant with 9 domain-specialized agents (Cybercrime, Consumer Rights, Employment Law, Women Safety, Court Procedure, Document Review, Legal Research)
- Real-time streaming responses via AI SDK
- Chat persistence with PostgreSQL
- Agent routing based on query intent

### RAG Engine (Retrieval-Augmented Generation)
- Document ingestion pipeline (PDF, DOCX, TXT, MD)
- Text chunking with configurable overlap
- OpenAI embeddings (text-embedding-3-small, 1536 dimensions)
- Hybrid search: vector cosine similarity + keyword scoring
- Citation-backed responses

### Enterprise Features
- Multi-tenant organization support
- Role-based access control (USER, LAWYER, ADMIN)
- Organization-level permissions
- Rate limiting
- Session management

### Real-Time Collaboration
- WebSocket server for low-latency messaging
- SSE fallback for serverless environments
- Presence tracking (online/away/offline)
- Typing indicators
- Redis-backed event publishing

### Mobile App (Expo)
- Native chat interface
- Offline message queue with sync-on-reconnect
- Biometric authentication
- Case and task tracking
- Push notification ready

### Productivity Tools
- AI-powered note summarization
- Automated task generation from case descriptions
- Meeting summary with action items
- Legal email drafting

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL 16 with pgvector extension
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Bhawana0218/JurisAI.git
cd JurisAI

# Install dependencies
npm install

# Set up environment variables
cp juris-ai/.env.example juris-ai/.env
# Edit .env with your credentials

# Run database migrations
cd juris-ai
npx prisma migrate deploy

# Start development server
npm run dev:web
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jurisai"

# OpenAI
OPENAI_API_KEY="sk-..."

# Auth
NEXTAUTH_SECRET="generate-a-secure-secret"
NEXTAUTH_URL="http://localhost:3000"

# Redis (optional, for real-time features)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Stripe (optional, for billing)
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
```

### Docker Deployment

```bash
docker-compose up -d
```

This starts PostgreSQL (with pgvector), Redis, the Next.js web app, and the WebSocket server.

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | GET, POST | NextAuth authentication |
| `/api/chat` | POST | Streaming chat with RAG |
| `/api/chats` | GET, POST | List / create conversations |
| `/api/chats/:id/messages` | GET | Get chat messages |
| `/api/documents` | GET, POST | Document management + ingestion |
| `/api/cases` | GET, POST | Legal case tracking |
| `/api/tasks` | GET, POST, PATCH | Task management |
| `/api/notes` | GET, POST | AI-powered notes |
| `/api/analytics` | GET | Platform analytics |
| `/api/sync` | GET, POST | Offline sync operations |
| `/api/presence` | GET, POST | User presence |
| `/api/typing` | POST | Typing indicators |
| `/api/realtime/stream` | GET | SSE event stream |

# 👩‍💻 Developer Information

<div align="center">

## 💻 Developed as a Full Stack Development Training Project

### 🏢 IndiaSpan

<br/>

### 👩‍💻 Developer: Bhawana Bisht

</div>

---

# 📜 Conclusion

JurisAI aims to create an inclusive legal ecosystem where every citizen can understand and exercise their legal rights through AI-powered assistance.

By combining Artificial Intelligence, multilingual communication, and accessible technology, the platform promotes legal empowerment and social inclusion across India.

---

<div align="center">

## ⭐ Empowering Justice Through Technology ⭐

</div>
