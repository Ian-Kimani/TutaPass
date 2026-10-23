# TutaPass — Adaptive Exam Mastery Engine

**Live Application:** https://tuta-pass.vercel.app/  
**Event:** Power Learn Project (#1MillionDevs) Vibe Coding Hackathon — AZ-900 Exam Prep Edition  
**Architecture:** PERN Stack (PostgreSQL, Express.js, React, Node.js) + Google Gemini Flash  

> **Unofficial Compliance Notice:** TutaPass is an independent, unofficial educational preparation platform. It is not affiliated with, sponsored by, or endorsed by Microsoft Corporation. No proprietary Microsoft logos or leaked examination dumps are used. All scenario questions, explanations, and study plans are synthetically generated and grounded strictly in the publicly available Microsoft Learn AZ-900 Skills Outline (https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-900).

---

## 1. Executive Summary and Problem Statement

Learners preparing for Microsoft Azure Fundamentals (AZ-900) and similar technical certifications consistently face four core barriers:

1. **Superficial Practice Feedback:** Standard multiple-choice question banks only tell learners whether an option is right or wrong. They fail to explain *why* a tempting distractor is wrong, or the specific architectural scenario where that wrong option *would* actually be the correct answer.
2. **Cultural and Conceptual Abstraction:** Enterprise cloud terminology (such as CapEx vs. OpEx, Availability Sets vs. Availability Zones, and Azure Policy vs. RBAC) often feels abstract and disconnected from everyday African realities.
3. **Stateless Mistake Amnesia:** Learners fail questions during practice sessions and move on without a systematic mechanism to capture, schedule, and reinforce those exact weak spots over time.
4. **Readiness Blindness:** Candidates struggle to allocate daily study hours effectively across weighted exam domains and rarely know if their practice performance translates into a passing exam score.

**TutaPass** solves these four challenges by connecting planning, scenario assessment, localized mental models, and spaced-repetition memory reinforcement into a single closed-loop state machine backed by PostgreSQL.

---

## 2. Core Features and Closed-Loop Architecture

Rather than treating the hackathon problem statements as isolated tools, TutaPass unifies all five challenges into an automated learner pipeline:

### 2.1 Smart Practice Arena with Distractor Autopsy
* **Scenario-Grounded Questions:** Every question presents a realistic organizational scenario mapped to official exam domain weights.
* **Three-Part Distractor Autopsy:** Selecting any option (or inspecting options A, B, C, and D) reveals:
  1. *Why this option is right or wrong for the given scenario.*
  2. *When this exact option WOULD be the correct architectural choice.*
  3. *The common exam trap or misconception that lures candidates into picking it.*
* **5-Question Readiness Sprint:** A focused quick-diagnostic modal (`ReadinessSprintModal`) on the home screen that evaluates baseline readiness and highlights immediate weak topics.

### 2.2 Tri-Linguistic Cultural Context Switcher (AI Study Buddy)
* **One-Click Mode Switching:** Every quiz explanation, flashcard, and on-demand concept query can be toggled instantaneously across three pedagogical modes:
  * **Standard English:** Formal enterprise cloud terminology for exam precision.
  * **African Everyday Life:** Relatable real-world analogies grounded in African commerce and infrastructure (for example, M-Pesa agent networks, matatu SACCO operations, KPLC grid fallback, and solar microgrids).
  * **Nairobi Sheng Mode:** High-retention urban tech vernacular that removes intimidation from complex cloud concepts.
* **Persistent Floating Study Buddy:** An always-accessible bottom dock (`StudyBuddyFloatingBar`) allowing learners to query any term or select preset topics without leaving their current screen.

### 2.3 Automated Mistake Harvesting and SM-2 Spaced Repetition
* **Zero-Friction Card Creation:** Whenever a learner submits an incorrect answer in the Practice Quiz or Readiness Sprint, the backend (`srs.service.js`) automatically synthesizes or resets a targeted Mistake Card in PostgreSQL.
* **SuperMemo-2 (SM-2) Scheduling:** Learners rate their recall (`Again`, `Hard`, `Good`, `Easy`), dynamically recalculating the card's `ease_factor`, `repetition_count`, `interval_days`, and `next_review_at` timestamp.

### 2.4 Weighted Readiness Tracker and Adaptive Study Planner
* **Official Domain Weighting:** Calculates composite exam readiness (`readiness.service.js`) by weighting domain accuracy and flashcard retention against the official AZ-900 distribution:
  * *Cloud Concepts (25–30%)*
  * *Azure Architecture and Services (35–40%)*
  * *Azure Management and Governance (30–35%)*
* **Dynamic Study Agenda:** Generates a day-by-day checklist based on the learner's target exam date, daily available study hours, and lowest-scoring domains.

### 2.5 Universal Syllabus Importer (Multi-Certification Scalability)
* While pre-seeded with **Microsoft Azure Fundamentals (AZ-900)** as the flagship track, TutaPass includes a **Universal Syllabus Importer** (`POST /api/syllabus/import`).
* Learners or educators can paste any course outline (or use 1-click presets for **AWS Cloud Practitioner CLF-C02**, **CompTIA Security+ SY0-701**, or **KCSE Mathematics**) to automatically extract weighted domains, generate a tailored study plan, and synthesize starter scenario questions.

### 2.6 Judge's Prompt X-Ray Drawer (20% Prompt Engineering Transparency)
* Accessible directly from the sidebar, the **Judge's Prompt X-Ray Drawer** (`PromptXRayDrawer.jsx`) exposes live telemetry for every AI operation:
  * Active Gemini model and fallback state
  * Calibrated temperature setting
  * Applied prompt engineering techniques
  * Exact `systemInstruction` guardrails and dynamically injected `userPrompt` payloads

---

## 3. System Architecture

```text
+-------------------------------------------------------------------+
|                   React + Vite Frontend (/client)                 |
|  - MainLayout & 4 Core Views (Home, Plan, Quiz, Mistake Cards)    |
|  - 5-Question Readiness Sprint Modal                              |
|  - Persistent Floating AI Study Buddy Bar                         |
|  - Judge's Prompt X-Ray Telemetry Drawer                          |
+---------------------------------+---------------------------------+
                                  |
                                  | REST API (JSON + promptTelemetry)
                                  v
+-------------------------------------------------------------------+
|                  Node.js + Express API (/server)                  |
|  - Request Validators & Error Handling Middleware                 |
|  - gemini.service.js (Structured JSON + Offline Fallback)         |
|  - srs.service.js (SM-2 Algorithm & Auto-Card Harvesting)         |
|  - readiness.service.js (Weighted Domain Mastery Engine)          |
+-----------------+-------------------------------+-----------------+
                  |                               |
                  v                               v
+-----------------------------------+   +---------------------------+
|   Neon Serverless PostgreSQL      |   |  Google Gemini Flash API  |
|   (6 Relational Tables)           |   |  (@google/genai SDK)      |
+-----------------------------------+   +---------------------------+
```

---

## 4. Prompt Engineering Architecture

To satisfy the **Prompt Engineering (20%)** evaluation criteria, `server/src/services/gemini.service.js` implements four deterministic design patterns:

1. **Strict JSON Schema Enforcement:** All calls configure `responseMimeType: 'application/json'` paired with explicit structural schemas and fence stripping (`cleanAndParseJson`), ensuring the frontend renders structured UI components rather than raw walls of text.
2. **Distractor Autopsy Anatomy Framing:** Question generation prompts enforce a strict 4-option schema where every option must include `why_wrong`, `right_scenario` (when the distractor would be correct), and `trap` (the underlying cognitive misconception), validated server-side by `isValidGeneratedQuestion`.
3. **Curriculum Grounding and Negative Constraints:** System instructions explicitly forbid proprietary exam dumping, trademark misuse, or cross-domain contamination (ensuring non-cloud imported syllabi never receive cloud questions).
4. **Multi-Model Failover and Offline Resilience:** `executeGemini` attempts primary Gemini Flash models sequentially and includes a deterministic domain-aware fallback generator so live demonstrations remain 100% operational even under network constraints or rate limits.

---

## 5. Project Structure

```text
TutaPass/
├── SPEC.md                                 # Product and technical specification
├── README.md                               # Project documentation
├── server/                                 # Node.js + Express Backend
│   ├── db/
│   │   ├── schema.sql                      # 6-table PostgreSQL relational schema
│   │   └── seed.js                         # Idempotent AZ-900 flagship seeder
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                       # Neon PostgreSQL connection pool
│   │   │   └── env.js                      # Environment variable configuration
│   │   ├── controllers/
│   │   │   ├── ai.controller.js            # Study Buddy concept explanations
│   │   │   ├── dashboard.controller.js     # Readiness telemetry, plans, demo reset
│   │   │   ├── flashcard.controller.js     # Due cards query & SM-2 review updates
│   │   │   ├── quiz.controller.js          # Quiz runner, attempt grading, AI synthesis
│   │   │   └── syllabus.controller.js      # Track listing & Universal Syllabus Importer
│   │   ├── middleware/
│   │   │   ├── errorHandler.js             # Global Express error formatting
│   │   │   └── validateRequest.js          # Request body validation wrapper
│   │   ├── routes/                         # Modular Express route definitions
│   │   ├── services/
│   │   │   ├── gemini.service.js           # Google GenAI SDK + Prompt Telemetry
│   │   │   ├── readiness.service.js        # Weighted pass probability calculation
│   │   │   └── srs.service.js              # SuperMemo-2 interval math & card harvesting
│   │   ├── utils/
│   │   │   ├── apiResponse.js              # Standardized JSON + telemetry envelope
│   │   │   └── asyncHandler.js             # Async controller error wrapper
│   │   ├── validators/
│   │   │   └── api.validators.js           # Zero-dependency payload validators
│   │   ├── app.js                          # Express app & route mounting
│   │   └── server.js                       # HTTP server entry point
│   └── package.json
└── client/                                 # React + Vite + Tailwind CSS Frontend
    ├── src/
    │   ├── components/
    │   │   ├── PromptXRayDrawer.jsx        # Live prompt engineering telemetry inspector
    │   │   ├── ReadinessSprintModal.jsx    # 5-question diagnostic sprint modal
    │   │   ├── StudyBuddyFloatingBar.jsx   # Persistent AI concept explainer dock
    │   │   └── SyllabusImportModal.jsx     # Universal syllabus parser modal
    │   ├── constants/
    │   │   └── navigation.js               # Tab definitions, tone modes, compliance text
    │   ├── context/
    │   │   └── AppContext.jsx              # Global state & prompt telemetry synchronization
    │   ├── hooks/
    │   │   └── useApi.js                   # Reusable async API hook
    │   ├── layouts/
    │   │   └── MainLayout.jsx              # Responsive sidebar shell & header controls
    │   ├── lib/
    │   │   └── apiClient.js                # Normalized fetch client
    │   ├── pages/
    │   │   ├── DashboardPage.jsx           # Readiness overview, topic posters, agenda
    │   │   ├── PlannerPage.jsx             # Adaptive study schedule generator
    │   │   ├── QuizArenaPage.jsx           # Scenario quiz & Distractor Autopsy viewer
    │   │   └── FlashcardsPage.jsx          # Interactive SM-2 mistake card deck
    │   ├── routes/
    │   │   └── AppRoutes.jsx               # View switcher
    │   ├── services/
    │   │   └── api.service.js              # Backend API abstraction & telemetry emitter
    │   └── utils/
    │       └── formatters.js               # Date, score, and badge helpers
    ├── vercel.json                         # SPA routing configuration
    └── package.json
```

---

## 6. Relational Database Schema (PostgreSQL)

TutaPass uses six core relational tables in PostgreSQL (`server/db/schema.sql`):

1. **`syllabi`**: Stores certification tracks (`id`, `title`, `code`, `description`, `is_flagship`, `created_at`).
2. **`domains`**: Stores weighted exam domains linked via `syllabus_id` (`id`, `syllabus_id`, `name`, `weight_min`, `weight_max`, `description`).
3. **`study_plans`**: Stores personalized daily schedules per learner and syllabus (`id`, `user_id`, `syllabus_id`, `target_exam_date`, `daily_hours`, `schedule_data`).
4. **`quiz_questions`**: Stores scenario questions, JSONB `options` (including embedded `autopsy` objects), and JSONB `context_translations` (`standard`, `african_context`, `sheng`).
5. **`user_attempts`**: Records every question attempt (`id`, `user_id`, `question_id`, `selected_option_id`, `is_correct`, `attempted_at`) to power real-time readiness calculations.
6. **`flashcards`**: Stores auto-harvested mistake cards and SM-2 state (`id`, `user_id`, `domain_id`, `topic_tag`, `front_prompt`, `back_explanation`, `context_notes`, `interval_days`, `repetition_count`, `ease_factor`, `next_review_at`).

---

## 7. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server status, architecture metadata, and timestamp. |
| `GET` | `/api/syllabus` | Returns all available syllabi along with their nested domains and weights. |
| `POST` | `/api/syllabus/import` | Parses raw curriculum text via Gemini, creates domains, seeds starter questions, and builds an initial study plan. |
| `GET` | `/api/dashboard` | Computes domain mastery percentages, composite readiness score, and active study plan for the selected `syllabusId`. |
| `POST` | `/api/dashboard/plan` | Generates and persists an adaptive day-by-day study roadmap weighted by weak areas. |
| `POST` | `/api/dashboard/reset-demo` | Resets the `demo-learner` profile to its baseline state (64% readiness, 11 attempts, 3 due mistake cards) for clean judge testing. |
| `GET` | `/api/quiz` | Fetches scenario questions filtered by `syllabusId` and/or `domainId`. |
| `POST` | `/api/quiz/attempt` | Grades an answer choice, returns the Distractor Autopsy, auto-creates/resets a Mistake Card if wrong, and recalculates readiness. |
| `POST` | `/api/quiz/generate` | Synthesizes new scenario questions with full autopsies and cultural translations for a specific domain. |
| `GET` | `/api/flashcards` | Retrieves the learner's spaced-repetition flashcards ordered by `next_review_at`. |
| `POST` | `/api/flashcards/:id/review` | Applies an SM-2 recall rating (`again`, `hard`, `good`, `easy`) and updates the next review interval. |
| `POST` | `/api/ai/explain` | Generates an on-demand concept breakdown in `standard`, `african_context`, or `sheng` mode. |

---

## 8. Local Setup and Installation

### Prerequisites
* Node.js (v18 or higher)
* PostgreSQL database (Local instance or Neon Serverless PostgreSQL)
* Google Gemini API Key (from Google AI Studio)

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/TutaPass.git
cd TutaPass
```

### Step 2: Configure and Start the Backend (`/server`)
```bash
cd server
npm install
```

Create a `.env` file inside the `/server` directory:
```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
GEMINI_API_KEY=your_google_gemini_api_key
```

Initialize the PostgreSQL schema and seed the flagship AZ-900 dataset:
```bash
npm run seed
```

Start the Express API server:
```bash
npm run dev
```

### Step 3: Configure and Start the Frontend (`/client`)
Open a second terminal window:
```bash
cd client
npm install
```

Optional: Create a `.env` file in `/client` if pointing to a custom backend URL (defaults to `http://localhost:5000/api`):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```

---

## 9. How ToTest TutaPass in 2 Minutes

No login wall or account registration is required. Open https://tuta-pass.vercel.app/ and follow this 5-step evaluation flow:

1. **Inspect Baseline Readiness & Topic Posters (Home):** View the composite readiness score, official AZ-900 domain weightings, and daily study agenda. Click **Start 5-question check** for a rapid diagnostic sprint, or click any of the three domain poster cards to jump straight into targeted practice.
2. **Trigger a Distractor Autopsy & Mistake Card (Practice Quiz):** Select any answer choice on a scenario question. Inspect options `A`, `B`, `C`, and `D` in the **Why Each Option Is Right or Wrong** panel to see when wrong answers *would* be right. Notice that missing a question automatically adds it to the **Mistake Cards** deck.
3. **Switch Cultural Contexts Live:** Use the top segmented control (`English | African Life | Sheng`) or the bottom-right **AI Study Buddy** bar to see explanations switch instantaneously between formal enterprise terminology, M-Pesa/SACCO analogies, and Nairobi Sheng.
4. **Review Spaced-Repetition Cards (Mistake Cards):** Flip a due card to view the technical resolution and cultural analogy, then rate recall (`Again`, `Hard`, `Good`, `Easy`) to trigger the SM-2 scheduling algorithm.
5. **Test Scalability & Prompt Transparency (Sidebar Tools):**
   * Click **+ Add an exam** in the bottom-left sidebar and select a 1-click preset (`AWS Sample`, `KCSE Math`, or `CompTIA Sec+`) to watch TutaPass build a complete new course track dynamically.
   * Click **See how the AI works (20%)** in the bottom-left sidebar to open the **Judge's Prompt X-Ray Drawer** and inspect the live system instructions, user prompt payloads, and schema constraints.
   * Click **Reset demo** at any time to restore the baseline demo state.
