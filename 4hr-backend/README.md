# 🎓 University AI Assistant — 4hr Hackathon

Secure, production-aligned AI system with RAG + Embeddings, JWT auth, automated tests, and CI/CD.

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Axios |
| Backend | Node.js + Express |
| AI / RAG | OpenAI GPT-4o-mini + text-embedding-3-small |
| Vector Search | In-memory cosine similarity (FAISS-style) |
| Auth | JWT (jsonwebtoken) |
| Logging | Winston |
| Testing | Jest + Supertest |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
uni-assist-4hr/
├── .github/workflows/ci.yml        ← GitHub Actions CI/CD pipeline
├── backend/
│   ├── server.js                   ← Express entry + RAG init
│   ├── .env                        ← Add OpenAI key here
│   ├── package.json
│   ├── data/
│   │   ├── students_data_60.xlsx
│   │   ├── university_policies.xlsx
│   │   └── University_Handbook_Complete_Detailed.pdf
│   ├── routes/
│   │   ├── auth.js                 ← POST /api/auth/login
│   │   ├── student.js              ← GET /api/student/attendance|marks|profile
│   │   └── chat.js                 ← POST /api/chat
│   ├── services/
│   │   └── ragService.js           ← OpenAI embeddings + cosine similarity + GPT
│   ├── middleware/
│   │   ├── auth.js                 ← JWT verification
│   │   └── guardrails.js           ← Injection detection + query routing
│   ├── utils/
│   │   ├── dataLoader.js           ← Excel reader + PII masking
│   │   └── logger.js               ← Winston structured logging
│   └── tests/
│       └── app.test.js             ← 20+ Jest tests covering all criteria
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js                  ← Layout + sidebar
        ├── index.js
        ├── services/api.js         ← Axios → localhost:5000
        └── pages/
            ├── Login.js            ← Student ID + demo accounts
            ├── Dashboard.js        ← Stats + eligibility criteria
            └── Chat.js             ← RAG chat with confidence scores
```

---

## ⚙️ Step-by-Step Execution

### Prerequisites
```bash
node --version    # v18+
npm --version     # v8+
```

### STEP 1 — Get OpenAI API Key
- Go to https://platform.openai.com/api-keys
- Create key → copy `sk-proj-...`

### STEP 2 — Configure Backend
Open `backend/.env` and set your key:
```env
OPENAI_API_KEY=sk-proj-your-key-here
```

### STEP 3 — Run Backend
```bash
cd backend
npm install
node server.js
```

You will see:
```
🚀 University Assistant API → http://localhost:5000
🔨 Building vector index for RAG...
✅ RAG pipeline ready!
```
> ⚠️ First startup takes ~30–60 seconds to build embeddings for all PDF chunks + policies.

### STEP 4 — Run Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

### STEP 5 — Run Tests
```bash
cd backend
npm test
```
Expected output: **20+ tests passing** covering:
- Auth (login, token validation)
- Attendance API (status logic, PII masking)
- Marks API (internship eligibility)
- PII masking (maskStudentId)
- Guardrails (injection detection, query routing)
- Authorization (cross-student access prevention)

---

## 🔑 Login Credentials

| Student ID | Name | Dept | Attendance | CGPA | Internship |
|-----------|------|------|-----------|------|-----------|
| 1001 | Tarun | ECE | 80% | 9.41 | ✗ (has backlog) |
| 1002 | Sneha | CSE | 100% | 7.07 | ✓ Eligible |
| 1044 | Nakul | ME | 98% | 9.44 | ✓ Eligible |
| 1007 | Kiran | ECE | 65% | 5.58 | ✗ Multiple issues |

**Password for all:** `password123`

---

## 🤖 RAG Architecture

```
User Query
    ↓
[GuardrailsService]  → blocks prompt injection
    ↓
[Query Classifier]   → PERSONAL_DATA or POLICY_RAG
    ↓
If POLICY_RAG:
  → getEmbedding(query)         ← OpenAI text-embedding-3-small
  → cosineSimilarity(all docs)  ← vector search
  → top-5 relevant chunks
  → GPT-4o-mini generates answer with citations
  → confidence score returned
    ↓
If PERSONAL_DATA:
  → Load student from Excel (JWT identity)
  → GPT-4o-mini answers from student context
    ↓
JSON response to React
```

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| JWT Auth | All routes protected, token validated on every request |
| PII Masking | Student ID 1001 → `1**1` in all responses |
| Prompt Injection | 13 regex patterns, logs blocked attempts |
| RBAC | JWT student_id enforces own-data-only access |
| Rate Limiting | 100 req/15min global, 20 msg/min on chat |
| Helmet | HTTP security headers |

---

## 🧪 Test Coverage

```
Auth Tests (5)       → login, invalid creds, token rejection
Attendance Tests (4) → data accuracy, PII masking, status logic
Marks Tests (4)      → CGPA, backlogs, internship eligibility
PII Tests (3)        → maskStudentId, API responses
Guardrail Tests (10) → injection patterns, query classification, API blocking
Auth Tests (1)       → cross-student access prevention
```

---

## 🚀 CI/CD Pipeline (GitHub Actions)

Push to `main` or `develop` → auto runs:
1. `npm ci` — install dependencies
2. `npm run lint` — ESLint check
3. `npm test` — full Jest test suite
4. `npm run build` — build validation
5. Frontend build check
6. npm security audit
