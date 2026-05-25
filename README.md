# ⚖️ JurisAI – AI Powered Multilingual Legal Assistant

<div align="center">

## 🚀 Full Stack Development Company Training Project  
### 🏢 IndiaSpan

<br/>

<img src="https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Multilingual-Support-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/Legal-Tech-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/Full%20Stack-Project-purple?style=for-the-badge" />

<br/><br/>

### 🌐 Empowering Citizens Through AI-Driven Legal Assistance

</div>

---

# 📌 Project Introduction

**JurisAI** is an AI-powered multilingual legal assistant designed to improve legal awareness and access to justice across India. The platform aims to help rural, semi-urban, and marginalized communities understand legal rights and procedures using simple, user-friendly language.

The system leverages Artificial Intelligence, Natural Language Processing, and Speech Technologies to provide legal guidance through both text and voice interaction.

---

# ❗ Problem Statement

Many citizens face difficulties understanding legal procedures due to:

- ⚠️ Complex legal terminology  
- 🌍 Language barriers  
- 💰 Expensive legal consultation fees  
- 📚 Lack of legal awareness  
- 🏘️ Limited access to legal support in underserved communities  

As a result, many individuals are unable to effectively understand or exercise their legal rights.

---

# 🎯 Project Objectives

✅ Simplify legal information for common citizens  
✅ Support multilingual communication  
✅ Provide voice and text-based legal assistance  
✅ Increase legal awareness and accessibility  
✅ Reduce dependency on expensive legal consultations  

---

# 💡 Proposed Solution

JurisAI provides chatbot-based legal guidance powered by Artificial Intelligence.

Users can:

- 💬 Ask legal questions through text  
- 🎤 Use voice-based interaction  
- 🌐 Communicate in multiple languages  
- 📖 Receive simplified legal explanations  
- 🛡️ Access guidance for common legal issues  

The platform acts as a digital legal assistant that improves accessibility and legal literacy.

---

# ✨ Key Features

## 🔹 Legal Rights Awareness
Provides simplified explanations of citizen rights and legal protections.

## 🔹 Complaint Filing Guidance
Guides users on filing complaints and legal applications.

## 🔹 Cybercrime Reporting Support
Assists users with cybercrime reporting procedures and safety measures.

## 🔹 Consumer Protection Guidance
Helps users understand consumer rights and complaint processes.

## 🔹 Domestic Violence Reporting Support
Provides awareness and guidance for domestic violence reporting.

## 🔹 Legal Documentation Guidance
Explains legal documents, procedures, and filing steps.

---

# 🛠️ Technology Stack

<div align="center">

| Technology | Usage |
|------------|-------|
| ⚛️ React.js | Frontend Development |
| 🌐 HTML5 | Structure & Markup |
| 🎨 CSS3 | Styling & Responsive UI |
| 🟢 Node.js | Backend Runtime |
| 🚀 Express.js | Backend API Framework |
| 🍃 MongoDB | Database Management |
| 🤖 GPT Models | AI Legal Assistance |
| 🤗 Hugging Face Transformers | NLP & Language Processing |
| 🎤 Speech-to-Text APIs | Voice Recognition |
| 🔊 Text-to-Speech APIs | Voice Responses |

</div>

---

# 🏗️ System Architecture

```text
User
   ↓
Frontend Interface (React.js)
   ↓
Backend API (Node.js + Express.js)
   ↓
AI Processing Engine
   ↓
MongoDB Database
   ↓
Response Generation
```

---

# 📊 Business Model

JurisAI follows a **service provider model** with future opportunities including:

- 🤝 NGO partnerships  
- 🏛️ Government legal aid collaborations  
- 💎 Freemium subscription plans  
- 🧩 White-label licensing solutions  

---

# 🌍 Social Impact

JurisAI contributes to:

✅ Digital Inclusion  
✅ Legal Literacy  
✅ Equal Access to Justice  
✅ Citizen Empowerment  
✅ Technology-Driven Social Development  

---

# 🇮🇳 Alignment with National Initiatives

This project aligns with several Indian government initiatives:

- 📲 Digital India  
- 🏛️ e-Governance Initiatives  
- 🧠 NITI Aayog – Responsible AI for All  
- 💻 MeitY AI Policy Frameworks  

---

# 🚀 Future Scope

Future enhancements may include:

- ⚖️ Court system integration  
- 📄 AI-powered legal document generation  
- 📈 Legal analytics and insights  
- 🌐 Expanded regional language support  
- 📱 Mobile application deployment  
- 🧠 Advanced AI legal recommendation systems  

---

# 📷 Project Screenshots

> Add your project screenshots here

```md
📌 Homepage UI  
📌 Chatbot Interface  
📌 Voice Assistant Feature  
📌 Legal Guidance Dashboard  
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Bhawana0218/JurisAI.git
```

## 2️⃣ Navigate to Project Directory

```bash
cd jurisai
```

## 3️⃣ Install Frontend Dependencies

```bash
npm install
```

## 4️⃣ Start Frontend Server

```bash
npm start
```

## 5️⃣ Setup Backend

```bash
cd backend
npm install
npm run dev
```

---

# 📂 Project Folder Structure

```bash
juris-ai/
│
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   ├── (dashboard)/             # Protected dashboard routes
│   ├── api/                     # API route handlers
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                  # Reusable UI components
│   ├── ui/                      # shadcn/ui components
│   ├── shared/                  # Shared components
│   ├── layout/                  # Navbar, Sidebar, Footer
│   ├── chat/                    # Chat related components
│   └── forms/                   # Form components
│
├── features/                    # Feature-based modules
│   ├── auth/
│   ├── chatbot/
│   ├── voice-assistant/
│   ├── legal-search/
│   ├── document-analysis/
│   └── user-dashboard/
│
├── ai/                          # AI logic & prompt engineering
│   ├── prompts/
│   ├── chains/
│   ├── embeddings/
│   ├── translators/
│   └── speech/
│
├── services/                    # External/API services
│   ├── openai/
│   ├── auth/
│   ├── storage/
│   └── analytics/
│
├── lib/                         # Utility libraries & configs
│   ├── prisma.ts
│   ├── db.ts
│   ├── utils.ts
│   ├── validators.ts
│   └── constants.ts
│
├── hooks/                       # Custom React hooks
│
├── store/                       # Zustand state management
│
├── prisma/                      # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
│
├── types/                       # Global TypeScript types
│
├── config/                      # App configuration
│
├── middleware/                  # Middleware logic
│
├── public/                      # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/                      # Additional styling files
│
├── tests/                       # Testing setup
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                        # Project documentation
│
├── .env
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```
---

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
