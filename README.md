# TutaPass

**TutaPass is an unofficial AZ-900 study coach that turns mistakes into a simple revision loop.**

Answer an original scenario question, see why every option is right or wrong, get a clear local-life analogy, and automatically review the missed concept with spaced repetition.

## The problem

Beginners can memorise Azure service names and still struggle with questions that ask them to distinguish similar concepts. Most quiz tools only say “correct” or “wrong”. TutaPass explains the distinction and helps learners practise the exact idea they missed.

## The five-minute demo

1. Open the dashboard and choose **Start 5-question check**.
2. Answer a question and read the feedback. A wrong answer becomes a Mistake Card automatically.
3. Open **Mistake Cards** and review the card using English, an African real-life analogy, or optional Sheng.
4. Return to the dashboard to see the updated readiness estimate and the reason behind the recommendation.
5. Open **Prompt X-Ray** to inspect the live prompt, guardrails, output format, and whether Gemini or the offline fallback supplied the result.

## What makes it different

- **Distractor Autopsy:** explains why an option is wrong, when it would be right, and the trap it represents.
- **Mistake-to-memory loop:** missed questions become SM-2 spaced-repetition cards without manual entry.
- **Simple explanations:** learners can switch between formal English, African everyday examples, and optional Kenyan/Sheng phrasing.
- **Transparent readiness:** the estimate shows the evidence behind it instead of pretending to be an exam guarantee.
- **Original content:** questions are written from the public AZ-900 skills outline, not copied exam dumps.
- **Study track creator:** learners can add another subject with its own optional source link, while AZ-900 remains the polished flagship experience.

## Learning sources and compliance

TutaPass is independent and unofficial. It is not affiliated with, sponsored by, or endorsed by Microsoft. It does not use Microsoft logos or reproduce proprietary exam questions.

The AZ-900 topic structure is based on the [Microsoft Learn AZ-900 study guide](https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-900). The product links learners back to that public outline so explanations can be checked against an authoritative source.

## Architecture

- `client/`: React 18, Vite, Tailwind CSS, and Lucide icons
- `server/`: Node.js, Express, PostgreSQL, and Google Gemini
- `server/db/`: schema and original AZ-900 seed questions
- Gemini responses use JSON output requirements, anti-dumping constraints, syllabus grounding, and a safe offline fallback for demos without an API key.

## Run locally

```powershell
cd server
npm install
npm run seed
npm start
```

In another terminal:

```powershell
cd client
npm install
npm run dev
```

Set the server environment values required by your PostgreSQL connection and, optionally, `GEMINI_API_KEY`. Without the key, the seeded questions and explicit simulated fallback keep the demo usable.

## Current limitations

- The demo uses a single learner profile (`demo-learner`) rather than full authentication.
- Readiness is a learning signal based on practice evidence, not a prediction of an official exam result.
- AI-generated questions should be reviewed before being treated as authoritative study material.

## Product direction

The next step is expanding the same mistake-to-mastery loop to more certifications, adding reviewed source citations per topic, and supporting learner accounts while preserving the simple experience.
