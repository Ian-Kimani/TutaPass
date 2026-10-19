# TutaPass — Adaptive Exam Mastery Engine
> **Disclaimer:** *Unofficial AZ-900 Study Companion built for the #1MillionDevs Vibe Coding Hackathon. Not affiliated with or endorsed by Microsoft. Uses zero Microsoft logos and 100% original scenario questions based on the public Microsoft Learn skills outline.*

## 1. What Is TutaPass
Most exam apps only tell you *"Wrong! You got 6/10."* They don't tell you **why** your brain fell for the trap, and cloud terms feel abstract to beginners.

**TutaPass** is a "Smart Exam Doctor." It comes pre-loaded with **Microsoft Azure Fundamentals (AZ-900)** as our flagship exam, plus a **Universal Syllabus Importer** that lets learners paste *any* exam syllabus (AWS, CompTIA, KCSE, or University courses) to generate a custom prep course in seconds.

## 2. How It Wins All 5 Hackathon Challenges in 1 Loop
Instead of 5 disconnected tools, TutaPass connects all 5 challenges into a single database-driven loop:

1. **Personal Study Planner:** Enter your exam date and daily study hours. TutaPass prioritizes your weakest exam domains first.
2. **Smart Quiz + "Distractor Autopsy":** When you pick a wrong option (e.g., clicking Option B instead of Option A), Gemini 3.8 Flash analyzes the exact mental mix-up between your choice and the right answer.
3. **African Context Switcher (AI Study Buddy):** Inside every explanation, 1-click buttons translate abstract cloud jargon into **Nairobi/African Street Analogies** (e.g., M-Pesa agents, Matatu Saccos, KPLC grid fallback) and **Swahili/Sheng breakdowns**.
4. **Auto-Generated Weak-Spot Flashcards:** Every question you fail automatically generates a targeted flashcard in your PostgreSQL spaced-repetition queue for tomorrow.
5. **Live Exam Readiness Tracker:** A real-time dashboard calculates your true Exam Pass Probability (%) weighted by official syllabus domains:
   - *Cloud Concepts (25–30%)*
   - *Azure Architecture & Services (35–40%)*
   - *Azure Management & Governance (30–35%)*

## 3. The 3 Simple Screens (+ 1 Judge X-Ray Drawer)
We keep the UI ultra-clean with only 3 main tabs and 1 special drawer for judges:
- **Tab 1: Readiness Dashboard & Planner** — Pass probability gauge, domain mastery bars, daily study plan, and the `+ Import Any Exam Syllabus` button.
- **Tab 2: Smart Practice Arena** — Scenario questions with instant Distractor Autopsy and the **[Local African Analogy / Sheng]** switcher.
- **Tab 3: Weak-Spot Flashcard Deck** — Auto-populated revision cards from missed quiz concepts.
- **Slide-Out Drawer: "Judge's Prompt X-Ray"** — A toggle in the navbar that exposes the live System Prompt, Syllabus Grounding Context, and Strict JSON Schema sent to Gemini (built specifically for the 20% Prompt Engineering rubric).

## 4. Tech Stack (PERN + Gemini 3.8 Flash)
- **Database:** PostgreSQL (`pg`)
- **Backend:** Node.js + Express REST API (`/server`)
- **AI Engine:** Google Gemini (`gemini-3.8-flash` via `@google/genai` with strict JSON schema output)
- **Frontend:** React + Vite + Tailwind CSS + Lucide Icons (`/client`)