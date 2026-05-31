<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1e3a70,100:c9a84c&height=200&section=header&text=JurisAI&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=AI-Powered%20Legal%20Intelligence%20Platform&descAlignY=58&descSize=20&animation=fadeIn" width="100%"/>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4.1--mini-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![Vercel AI SDK](https://img.shields.io/badge/AI%20SDK-v6-black?style=for-the-badge&logo=vercel&logoColor=white)](https://sdk.vercel.ai)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Redis](https://img.shields.io/badge/Upstash-Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Sentry](https://img.shields.io/badge/Sentry-Monitoring-362D59?style=for-the-badge&logo=sentry&logoColor=white)](https://sentry.io)

<br/>

> **Democratizing legal intelligence for every Indian citizen.**
> Multi-agent AI · RAG · Real-time · Enterprise-grade · Full-stack

<br/>

</div>

---

## 🌟 What is JurisAI?

**JurisAI** is a production-grade, AI-native legal intelligence platform built for the Indian legal ecosystem. It combines a multi-agent AI orchestration layer, retrieval-augmented generation (RAG), real-time collaboration, and enterprise workflow automation — all in a single, cohesive platform.

Whether you're a citizen trying to understand your rights, a lawyer managing cases, or an enterprise deploying legal AI workflows, JurisAI has you covered.

<br/>

---

## ✨ Feature Highlights

<table>
<tr>
<td width="50%">

### 🤖 Multi-Agent AI Chat
- **9 domain-specialized legal agents** — Cybercrime, Consumer Rights, Employment Law, Women Safety, FIR Assistant, Legal Research, Document Review, Court Procedure, General
- Intelligent query routing based on intent detection
- Real-time streaming responses via Vercel AI SDK v6
- Citation-backed answers with source attribution
- Multilingual support (respond in user's language)

</td>
<td width="50%">

### 📄 RAG Engine
- Document ingestion pipeline — **PDF, DOCX, TXT**
- Smart text chunking with configurable overlap
- OpenAI `text-embedding-3-small` (1536-dim vectors)
- **Hybrid search** — cosine vector similarity + keyword scoring
- pgvector-powered semantic retrieval

</td>
</tr>
<tr>
<td width="50%">

### 🏢 Enterprise Platform
- Multi-tenant organization support
- Role-based access control (USER · LAWYER · ADMIN)
- API Gateway with scope-based authorization
- Developer API keys with rate limiting
- Webhook delivery engine with retry logic
- SSO (SAML/OIDC) integration
- Audit logs & AI governance rules

</td>
<td width="50%">

### ⚡ Real-Time Infrastructure
- WebSocket server for low-latency messaging
- SSE fallback for serverless environments
- Supabase Realtime for live presence
- Typing indicators & online/away/offline status
- Redis-backed event pub/sub
- Kafka event streaming (optional)

</td>
</tr>
<tr>
<td width="50%">

### 🔬 AI Quality & Evaluation
- Automated response quality evaluation pipeline
- Hallucination detection scoring
- Citation validation
- Retrieval quality assessment
- A/B prompt experimentation engine
- User feedback loop integration

</td>
<td width="50%">

### 🛠️ Productivity Tools
- AI-powered note summarization
- Automated task generation from case descriptions
- Meeting transcript summarization with action items
- Legal email drafting assistant
- Calendar event management
- Legal case & task tracking

</td>
</tr>
</table>

<br/>

---

## 🏗️ Architecture

```
JurisAI/
├── juris-ai/                          # Next.js 16 — main application
│   ├── app/                           # App Router
│   │   ├── (auth)/                    # Login · Register
│   │   ├── (marketing)/               # Landing · Pricing · Docs · Legal · Support
│   │   ├── api/                       # REST API routes
│   │   │   ├── auth/[...nextauth]/    # Auth.js v5 handler
│   │   │   ├── chat/                  # Streaming AI chat (RAG)
│   │   │   ├── chats/                 # Chat CRUD + messages
│   │   │   ├── documents/             # Document upload + ingestion
│   │   │   ├── cases/                 # Legal case management
│   │   │   ├── analytics/             # Platform analytics
│   │   │   ├── v1/                    # API Gateway (external developer API)
│   │   │   │   ├── agents/            # Agent execution
│   │   │   │   ├── webhooks/          # Webhook management
│   │   │   │   ├── workflows/         # Workflow engine
│   │   │   │   ├── audit/             # Audit logs
│   │   │   │   ├── governance/        # AI governance
│   │   │   │   └── marketplace/       # Agent marketplace
│   │   │   └── ...                    # tasks · notes · presence · sync · typing
│   │   └── dashboard/                 # Protected dashboard
│   │       ├── chat/                  # AI chat interface
│   │       ├── documents/             # Document management
│   │       ├── cases/                 # Case tracker
│   │       ├── analytics/             # Usage analytics
│   │       ├── workflows/             # Workflow builder
│   │       ├── marketplace/           # Agent marketplace
│   │       ├── quality/               # AI quality dashboard
│   │       ├── prompts/               # Prompt registry
│   │       └── settings/              # API keys · Webhooks · SSO · Billing
│   ├── ai/
│   │   ├── agents/orchestrator.ts     # Multi-agent routing & RAG orchestration
│   │   └── prompts/                   # Agent system prompts
│   ├── components/                    # React UI components (shadcn/ui + custom)
│   ├── features/
│   │   ├── auth/                      # Auth utilities & password hashing
│   │   ├── realtime/                  # Typing indicators · presence
│   │   ├── sync/                      # Offline sync engine
│   │   └── productivity/              # Notes · tasks · calendar
│   ├── lib/
│   │   ├── rag/                       # Embeddings · vector store · chunking · processor
│   │   ├── cache/                     # Upstash Redis caching
│   │   ├── realtime/                  # SSE publisher · Supabase channels
│   │   ├── security/                  # Rate limiting
│   │   ├── documents/                 # PDF/DOCX text extraction
│   │   ├── stripe/                    # Billing integration
│   │   └── errors/                    # Typed API error handling
│   ├── platform/
│   │   ├── api-gateway/               # Auth · CORS · rate limit · audit middleware
│   │   ├── agent-marketplace/         # Agent registry & reviews
│   │   ├── ai-runtime/                # Agent execution runtime
│   │   ├── billing/                   # Stripe metering & usage alerts
│   │   ├── developer-sdk/             # API key management
│   │   ├── enterprise/                # SSO · org management
│   │   ├── evaluation/                # Quality evaluation orchestrator
│   │   ├── event-bus/                 # Kafka event streaming
│   │   ├── governance/                # AI governance rules engine
│   │   ├── knowledge-graph/           # Legal knowledge graph
│   │   ├── observability/             # Logging · metrics · tracing
│   │   ├── plugins/                   # Plugin registry
│   │   ├── webhooks/                  # Webhook delivery engine
│   │   ├── workers/                   # Background job workers
│   │   └── workflow-engine/           # Visual workflow automation
│   ├── prisma/schema.prisma           # Full database schema (50+ models)
│   ├── server/realtime/               # Standalone WebSocket server
│   └── store/                         # Zustand client state
├── infrastructure/
│   ├── k8s/                           # Kubernetes manifests (base + overlays)
│   ├── helm/                          # Helm chart
│   └── terraform/                     # IaC (PostgreSQL · Redis · Kafka modules)
├── Dockerfile                         # Multi-stage production image
└── docker-compose.yml                 # Local dev stack
```

<br/>

---

## 🧰 Tech Stack

<div align="center">

| Layer | Technology | Version |
|:------|:-----------|:--------|
| **Framework** | Next.js App Router | 16.2.6 |
| **Language** | TypeScript (strict) | 5.x |
| **UI Library** | React | 19.2.4 |
| **Styling** | Tailwind CSS + shadcn/ui (Radix) | 4.x |
| **Animations** | Framer Motion | 12.x |
| **Database** | PostgreSQL + pgvector | 16 |
| **ORM** | Prisma | 7.x |
| **Auth** | Auth.js (NextAuth) v5 — JWT + Credentials | 5.0.0-beta |
| **AI / LLM** | OpenRouter → OpenAI GPT-4.1-mini | — |
| **AI SDK** | Vercel AI SDK | 6.x |
| **Embeddings** | OpenAI text-embedding-3-small (1536-dim) | — |
| **Vector Search** | pgvector — cosine similarity + hybrid keyword | — |
| **LangChain** | @langchain/core + @langchain/openai | 1.x |
| **Cache** | Upstash Redis | — |
| **Realtime** | Supabase Realtime + WebSockets + SSE | — |
| **Event Streaming** | Kafka (Confluent) | — |
| **Workflow** | Temporal | — |
| **File Upload** | UploadThing | 7.x |
| **Forms** | React Hook Form + Zod | — |
| **State** | Zustand + TanStack React Query | 5.x |
| **Testing** | Vitest + React Testing Library | 4.x |
| **Monitoring** | Sentry | 10.x |
| **Infrastructure** | Docker · Kubernetes · Helm · Terraform | — |
| **CI/CD** | GitHub Actions | — |

</div>

<br/>

---

## 🤖 AI Agents

JurisAI routes every query to the most relevant specialized agent:

| Agent | Domain | Trigger Keywords |
|:------|:--------|:----------------|
| 🔐 **Cybercrime** | Hacking, phishing, data breaches, ransomware | cyber, hack, phishing, data breach |
| 🛒 **Consumer Rights** | Refunds, warranties, defective products | consumer, refund, warranty, defect |
| 👩 **Women Safety** | Domestic violence, dowry, harassment | women, domestic violence, dowry, safety |
| 💼 **Employment Law** | Workplace disputes, termination, salary | employment, workplace, salary, termination |
| ⚖️ **Court Procedure** | Hearings, petitions, affidavits, orders | court, hearing, petition, affidavit |
| 📋 **Document Review** | Contract analysis, clause review | review, clause, agreement, contract |
| 🔍 **Legal Research** | Case law, statutes, legal analysis | (default for research queries) |
| 📝 **FIR Assistant** | Police complaints, FIR filing | FIR, complaint, police |
| 🌐 **General** | All other legal queries | (fallback) |

<br/>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22+
- **PostgreSQL 16** with `pgvector` extension
- **OpenRouter API key** (for chat)
- **OpenAI API key** (for embeddings — optional, enables semantic search)

### 1. Clone & Install

```bash
git clone https://github.com/Bhawana0218/JurisAI.git
cd JurisAI/juris-ai
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jurisai"

# Auth (Auth.js v5)
AUTH_SECRET="generate-with: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

# AI — Chat via OpenRouter
OPENROUTER_API_KEY="sk-or-..."
OPENAI_BASE_URL="https://openrouter.ai/api/v1"

# AI — Embeddings via OpenAI directly (enables semantic search)
OPENAI_DIRECT_API_KEY="sk-..."

# Supabase (Realtime)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Redis (optional — real-time features)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 3. Database Setup

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run Development Server

```bash
# Web app
npm run dev

# WebSocket server (separate terminal — for real-time features)
npm run dev:ws
```

Open [http://localhost:3000](http://localhost:3000)

<br/>

### 🐳 Docker (Full Stack)

Starts PostgreSQL (pgvector), Redis, Kafka, Temporal, the Next.js web app, WebSocket server, and background worker:

```bash
# From repo root
docker-compose up -d
```

| Service | Port |
|:--------|:-----|
| Web App | `3000` |
| WebSocket Server | `3001` |
| PostgreSQL | `5432` |
| Redis | `6379` |
| Kafka | `9092` |
| Temporal | `7233` |

<br/>

---

## 📡 API Reference

### Internal (Session Auth)

| Endpoint | Method | Description |
|:---------|:-------|:------------|
| `/api/auth/*` | GET · POST | Auth.js v5 authentication |
| `/api/chat` | POST | Streaming AI chat with RAG |
| `/api/chats` | GET · POST | List / create conversations |
| `/api/chats/:id/messages` | GET | Fetch chat messages |
| `/api/documents` | GET · POST | Document upload & ingestion |
| `/api/cases` | GET · POST | Legal case management |
| `/api/tasks` | GET · POST · PATCH | Task management |
| `/api/notes` | GET · POST | AI-powered notes |
| `/api/analytics` | GET | Platform usage analytics |
| `/api/presence` | GET · POST | User presence tracking |
| `/api/typing` | POST | Typing indicators |
| `/api/sync` | GET · POST | Offline sync operations |
| `/api/realtime/stream` | GET | SSE event stream |

### External Developer API (`/api/v1/*` — API Key Auth)

| Endpoint | Scope | Description |
|:---------|:------|:------------|
| `/api/v1/agents` | `AGENT_EXECUTE` | Execute AI agents |
| `/api/v1/webhooks` | `WEBHOOKS_READ` · `WEBHOOKS_MANAGE` | Webhook CRUD |
| `/api/v1/workflows` | `WORKFLOW_EXECUTE` | Workflow management |
| `/api/v1/audit` | `READ` | Audit log access |
| `/api/v1/governance` | `ADMIN` | Governance rules |
| `/api/v1/marketplace` | `READ` | Agent marketplace |
| `/api/v1/api-keys` | `ADMIN` | API key management |
| `/api/v1/analytics` | `READ` | Usage analytics |
| `/api/v1/health` | — | Health check |

<br/>

---

## 🗄️ Database Schema

The Prisma schema covers **50+ models** across all platform domains:

```
Core          → User · Session · Organization · OrganizationMember
Chat          → Chat · Message
Documents     → Document · DocumentChunk · LegalKnowledge
Cases         → LegalCase · LegalTask · AINote · CalendarEvent
AI Platform   → AIUsageLog · AgentSession · AgentExecution
Workflows     → Workflow · WorkflowStep · WorkflowExecution
Marketplace   → AgentSubmission · AgentReview · PluginInstallation
Enterprise    → ApiKey · WebhookConfig · SsoConnection · AuditLog
Billing       → Subscription · BillingProfile · UsageMeter
Quality       → QualityEvaluation · CitationValidation · HallucinationDetection
Prompts       → PromptRegistry · PromptVersion · PromptExperiment
Governance    → GovernanceRule · FeatureFlag · DistributedLock
```

<br/>

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage

# Visual UI
npm run test:ui
```

Tests live in `tests/unit/` and `tests/integration/` using **Vitest** + **React Testing Library**.

<br/>

---

## 🚢 Deployment

### Kubernetes

```bash
# Apply base manifests
kubectl apply -k infrastructure/k8s/base

# Production overlay
kubectl apply -k infrastructure/k8s/overlays/production
```

### Terraform

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

Modules available: `postgres` · `redis` · `kafka`

<br/>

---

## 📁 Key Scripts

```bash
npm run dev           # Start Next.js dev server
npm run dev:ws        # Start WebSocket server
npm run build         # prisma generate + next build
npm run start         # Production server
npm run lint          # ESLint
npm run test          # Vitest
npm run test:coverage # Coverage report
```

<br/>

---

## 👩‍💻 Developer Information

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1e3a70,100:c9a84c&height=4&section=header" width="100%"/>

<br/>

### 🏢 Developed as a Full Stack Development Training Project

**IndiaSpan**

<br/>

### 👩‍💻 Developer

**Bhawana Bisht**

[![GitHub](https://img.shields.io/badge/GitHub-Bhawana0218-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Bhawana0218)

<br/>

<img src="https://github-readme-stats.vercel.app/api?username=Bhawana0218&show_icons=true&theme=tokyonight&hide_border=true&bg_color=050d1a&title_color=c9a84c&icon_color=4a72c4&text_color=7aa0d8" alt="GitHub Stats" />

<br/>

<img src="https://github-readme-streak-stats.herokuapp.com/?user=Bhawana0218&theme=tokyonight&hide_border=true&background=050d1a&ring=c9a84c&fire=4a72c4&currStreakLabel=c9a84c" alt="GitHub Streak" />

<br/>

<img src="https://github-readme-activity-graph.vercel.app/graph?username=Bhawana0218&theme=tokyo-night&bg_color=050d1a&color=c9a84c&line=4a72c4&point=ffffff&hide_border=true" alt="Contribution Graph" width="100%"/>

<br/>

</div>

---

## 📜 Conclusion

<div align="center">

JurisAI is built on the belief that **legal knowledge should be accessible to everyone** — not just those who can afford expensive legal counsel.

By combining cutting-edge AI, multilingual communication, and enterprise-grade infrastructure, JurisAI empowers Indian citizens to understand and exercise their legal rights with confidence.

<br/>

*"Justice delayed is justice denied — JurisAI makes justice accessible."*

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:c9a84c,100:1e3a70&height=120&section=footer&text=⚖️%20Empowering%20Justice%20Through%20Technology&fontSize=18&fontColor=ffffff&fontAlignY=65&animation=fadeIn" width="100%"/>

</div>
