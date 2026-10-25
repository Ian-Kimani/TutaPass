# TutaPass

> **Learn the idea, not just the answer.**

TutaPass is a human-first AI study coach for learners preparing for **AZ-900: Microsoft Azure Fundamentals**. It helps learners understand *why* an answer is right, explain their own reasoning, and turn uncertainty into a focused revision plan.

**Live demo:** [tuta-pass.vercel.app](https://tuta-pass.vercel.app)
**Repository:** [github.com/Ian-Kimani/TutaPass](https://github.com/Ian-Kimani/TutaPass)

TutaPass was built for the **Power Learn Project #1MillionDevs Vibe Coding Hackathon**.

> TutaPass is an independent, unofficial educational tool. It is not affiliated with, sponsored by, or endorsed by Microsoft. It does not reproduce proprietary exam questions or use Microsoft logos.

## The problem

Many learners can recognise Azure service names but still struggle when an exam question asks them to distinguish similar ideas. Most quiz tools stop at:

> “Correct” or “Wrong.”

That leaves three unanswered questions:

- Why was the answer correct?
- Why was the tempting alternative wrong?
- Did the learner understand the concept, or did they guess correctly?

TutaPass is built around those questions.

## The TutaPass Mastery Loop

```text
Answer → Explain → Understand the mistake → Review → Improve
```

Every practice question becomes a small learning cycle:

1. **Answer** an original, scenario-based question.
2. **Inspect the Distractor Autopsy** to understand every option, including when a wrong option would actually be correct.
3. **Use Teach-Back** to explain the reasoning in your own words.
4. **Review the Mistake Card** when the explanation shows uncertainty or a misconception.
5. **Return stronger** with spaced repetition and a clear next step.

## What makes TutaPass different

### Teach-Back Mode

A correct selection can still be a lucky guess. Teach-Back asks the learner to explain why they chose an answer and classifies the reasoning as:

- **Understood**
- **Possible lucky guess**
- **Needs another look**

When a concept needs work, TutaPass adds it to Mistake Cards for review.

### Distractor Autopsy

TutaPass does not only reveal the correct answer. It explains:

- Why the correct option fits the scenario
- Why each wrong option is tempting
- When a wrong option would be the right choice
- What mental trap the learner should watch for

### Misconception Map

The dashboard turns weak areas into an understandable action list:

> What I missed → Why it matters → What to practise next

### Mistake-to-memory revision

Missed concepts become **Mistake Cards** automatically. The built-in SM-2 spaced-repetition flow schedules reviews so learners do not keep repeating the same mistake.

### Explanations that feel familiar

Learners can switch between:

- **Standard English** for exam-precise terminology
- **African real-life analogies** using familiar systems and everyday experiences
- **Optional Nairobi Sheng** for memorable, informal explanations

### AI Transparency Lab

This is an **evaluation-only panel for hackathon judges**, not a required learner workflow. It lets judges and technically curious users inspect how TutaPass uses AI without making the normal learner experience complicated. The lab shows:

- The learning outcome produced by the AI
- The prompt-engineering techniques being used
- Teach-Back and misconception detection
- Structured output and safety constraints
- The live model or offline fallback state
- Full technical prompt details when needed

## The five-minute demo

For a reliable presentation:

1. Open the dashboard and click **Reset demo**.
2. Choose a weak topic from **Your progress by topic**.
3. Answer one question and open the **Distractor Autopsy**.
4. Use **Teach-Back** to explain the reasoning.
5. Show the result: understood, lucky guess, or needs another look.
6. Open **Mistake Cards** and show the concept ready for spaced review.
7. Return to the dashboard and show the **Misconception Map** and progress story.
8. Open **AI Transparency Lab** and show the learner outcome before expanding the technical prompt details.


> “Most quiz apps tell learners whether they are right. TutaPass checks whether they understand why.”

## Who it is for

TutaPass is designed for:

- Beginners preparing for AZ-900
- Learners who find cloud terminology abstract
- Students who repeatedly miss questions about similar services
- Learners who need a clearer revision path after a quiz
- Future learners preparing for other certifications and subjects

## Built to grow

AZ-900 is the flagship experience, but the learning loop is not tied to one exam. The Study Track Creator can accept another subject or syllabus with an optional official source link. The same product can grow toward:

- AWS, security, data, and other certification tracks
- Reviewed sources for every topic
- Learner accounts and personal history
- Cohorts for schools, bootcamps, and study groups
- More accessible language and explanation modes

## Trust and responsible AI

TutaPass is designed to be useful without pretending to be an official exam authority:

- Practice questions are original and grounded in public learning outlines.
- The app does not use exam dumps or reproduce proprietary questions.
- Official source links are shown for the active study track when available.
- AI responses use structured JSON so the interface receives predictable fields.
- A safe fallback keeps the demo usable when the AI service is slow or unavailable.
- The readiness score is a learning signal, not a promise of an exam result.

## How the AI is designed

TutaPass uses AI for a specific learning job, not as a generic chatbot:

1. **Structured output:** Gemini responses are requested and validated as JSON so the interface receives predictable fields instead of an unstructured wall of text.
2. **Distractor Autopsy rules:** Every generated option is expected to explain why it fits or fails, when it would be correct, and what misconception it represents.
3. **Curriculum grounding:** Questions are tied to the active study track and its public learning outline.
4. **Responsible boundaries:** Prompts explicitly prohibit exam dumps, proprietary question copying, and Microsoft branding.
5. **Fallback behavior:** If the AI service is unavailable, deterministic fallback content keeps the core demo usable.

The **AI Transparency Lab** makes these decisions visible to judges without forcing learners to read technical prompt details.

## Tech stack

- **Client:** React 18, Vite, Tailwind CSS, Lucide React
- **Server:** Node.js, Express, PostgreSQL
- **AI:** Google Gemini through `@google/genai`, with an explicit offline fallback
- **Learning engine:** SM-2 spaced repetition for Mistake Cards

## Architecture

```text
React + Vite client
        │
        │ REST/JSON API
        ▼
Express + Node.js server
        ├── Gemini service with structured output and fallback
        ├── Readiness and domain mastery engine
        └── SM-2 spaced-repetition service
        │
        ├── PostgreSQL
        └── Google Gemini API
```

The client is organised around four simple views:

- **Home:** readiness evidence, topic progress, Misconception Map, and study plan
- **Study Plan:** a daily checklist based on the learner's weak areas
- **Practice Quiz:** scenarios, Distractor Autopsy, cultural explanations, and Teach-Back
- **Mistake Cards:** due reviews and SM-2 recall ratings

## API highlights

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Confirms that the deployed API is awake |
| `GET` | `/api/syllabus` | Lists available study tracks and domains |
| `POST` | `/api/syllabus/import` | Creates a study track from a learner's outline |
| `GET` | `/api/dashboard` | Returns readiness evidence, domain progress, and the active plan |
| `POST` | `/api/dashboard/plan` | Saves an adaptive study plan |
| `POST` | `/api/dashboard/reset-demo` | Restores the seeded presentation state |
| `GET` | `/api/quiz` | Fetches questions for a track or domain |
| `POST` | `/api/quiz/attempt` | Grades an answer and returns Distractor Autopsy feedback |
| `POST` | `/api/ai/teach-back` | Evaluates a learner's explanation |
| `POST` | `/api/ai/explain` | Explains a concept in the selected language mode |
| `GET` | `/api/flashcards` | Lists Mistake Cards and due reviews |
| `POST` | `/api/flashcards/:id/review` | Applies an SM-2 recall rating |

## Data model

The PostgreSQL schema keeps the learning loop explicit:

- `syllabi` and `domains` define a study track and its weighted topics.
- `quiz_questions` stores original scenario questions, options, autopsies, and context translations.
- `user_attempts` records practice evidence used for progress and readiness.
- `flashcards` stores Mistake Cards and their SM-2 review state.
- `study_plans` stores personalised daily agendas.

## Run locally

### Requirements

- Node.js 18 or newer
- PostgreSQL database
- Optional Gemini API key

### Start the server

```powershell
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/database
GEMINI_API_KEY=your_gemini_key
```

Seed the database and start the API:

```powershell
npm run seed
npm start
```

The API runs at `http://localhost:5000`. Its health check is:

```text
http://localhost:5000/api/health
```

### Start the client

In a second terminal:

```powershell
cd client
npm install
```

For local development, the client defaults to `http://localhost:5000/api`. To use another API URL, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start Vite:

```powershell
npm run dev
```

The client will print its local URL, usually `http://localhost:5173`.

## Deployment notes

The backend exposes `/api/health` for Render health checks. Free Render instances can sleep after inactivity, so the client:

- Sends a non-blocking health request on startup
- Shows the last successful dashboard view immediately
- Falls back to a safe demo baseline on a first visit
- Replaces cached data when the API wakes and responds

For a judging session, open the deployed app a few minutes early and use **Reset demo** before recording.

## Project structure

```text
TutaPass/
├── client/                 # React application
│   └── src/
│       ├── components/     # Quiz, Teach-Back, cards, AI Transparency Lab
│       ├── context/        # Shared learner and dashboard state
│       ├── pages/          # Dashboard, quiz, planner, Mistake Cards
│       └── services/       # API client and feature requests
├── server/                 # Express API
│   ├── db/                 # Schema and seed data
│   └── src/
│       ├── controllers/    # Feature endpoints
│       ├── routes/         # API routes
│       └── services/       # Gemini, readiness, and spaced repetition
├── README.md
└── SPEC.md                # Deeper technical and product notes
```

## Current limitations

- The demo uses one learner profile, `demo-learner`, rather than full authentication.
- Readiness is based on practice evidence and should not be interpreted as an official pass prediction.
- AI-generated questions and explanations should be checked against authoritative sources.
- Production use would need stronger user isolation, authentication, rate limits, and operational monitoring.

## Why this matters

TutaPass is not trying to add more questions to the internet. It is trying to make each question teach something.

**TutaPass helps learners prove understanding, not just collect correct answers.**
