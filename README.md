# Casefile Â· AI Mystery Room

A fictional, AI-generated detective investigation game. Build a mystery, examine evidence, connect clues, and make an accusation. The dark, editorial interface is designed to feel like a private case archive rather than a chatbot.

## What's here

- React + TypeScript responsive web app with case creation, suspect profiles, searchable/filterable evidence, timeline, persisted field notes, reviewed clue tracking, hint prompts, accusation flow, and verdict review.
- Express + TypeScript API using the official Google Gen AI SDK. It validates generated case structure and suspect/evidence references before saving a case.
- MongoDB stores the public case separately from its private culprit and solution. Those private fields are omitted from case retrieval responses.
- The opening screen and investigation room include a built-in fictional Blackwood Manor case so you can explore the interface before setting up the AI service. Its progress and notes are kept in this browser.

## Run locally

Requirements: Node.js 20+ and MongoDB (local or Atlas).

1. Copy `.env.example` to the project root as `.env`. Set `MONGODB_URI`, `GEMINI_API_KEY`, and a long random `SESSION_SECRET` there. The API loads this root file explicitly even when started from the `apps/api` workspace. Keep the key server-side; do not add a `VITE_` prefix.
2. Install dependencies from the project root: `npm install`.
3. Start both services: `npm run dev`.
4. Open `http://localhost:5173`.

The API listens on port 4001. Vite proxies API requests to the backend in development. `GEMINI_MODEL` defaults to the stable `gemini-3.5-flash-lite` model, which supports structured output. If Gemini is unavailable, the create page shows a specific retryable error; it never substitutes a fake generated case. The API uses the configured MongoDB database for case persistence.

## API

- `GET /api/v1/health` â€” service configuration status.
- `POST /api/v1/cases` â€” validate a scenario and generate a case.
- `GET /api/v1/cases/:caseId` â€” return player-safe case details.
- `POST /api/v1/cases/:caseId/accusations` â€” deterministically evaluate an accusation against the stored culprit.

Every response uses `{ success, data, error }`. Generation requires both a Gemini key and MongoDB connection. Rate limiting and request size limits are enabled. This first vertical slice has no account/session ownership layer yet, so it is intended for local development and review rather than public deployment; implement authentication and per-case ownership before exposing it publicly.

## Build

`npm test` runs deterministic generation-schema and error-mapping tests. `npm run build` compiles both workspaces.
# AI-Mystery
