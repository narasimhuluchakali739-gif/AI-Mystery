# AI MYSTERY ROOM
## Product Requirements & Technical Specification (SSOT)

**Document Type:** Single Source of Truth for Spec-Driven Development  
**Project Name:** AI Mystery Room  
**Version:** 1.0.0  
**Status:** Ready for implementation  
**Primary Development Agent:** OpenAI Codex  
**Frontend:** React.js  
**Backend:** Node.js + Express.js  
**Database:** MongoDB  
**AI Provider:** Google Gemini API  
**Architecture:** MERN Stack

---

# 1. Project Overview

## 1.1 Product Description

AI Mystery Room is an interactive, AI-powered detective investigation website where users solve fictional mysteries by examining evidence, analyzing suspects, and identifying the culprit.

The user begins by entering a short story, scenario, or mystery idea. The application uses Gemini AI to transform that input into a complete fictional investigation containing:

- A mystery scenario and crime description.
- A list of suspects, including the actual culprit.
- AI-generated WhatsApp-style conversations.
- Witness statements and interrogation reports.
- Fictional CCTV recordings or descriptions of footage.
- Images, photographs, and other investigation documents.
- A timeline of events.
- Contradictions, clues, red herrings, and hidden connections.
- A final accusation and case verdict.

The user reviews the evidence, forms a theory, selects a suspect, and submits a final accusation. The backend checks the accusation against the original, privately stored solution and returns a verdict with an explanation.

The application should feel like a detective investigation game, not a simple chatbot.

## 1.2 Problem Statement

Traditional mystery games often provide fixed stories and limited replayability. AI Mystery Room aims to let users create different mysteries from their own ideas, with new suspects, clues, and investigation scenarios.

The main challenge is generating engaging stories while ensuring that clues remain logically consistent and that the correct culprit can be determined fairly.

## 1.3 Project Objectives

1. Allow users to generate mysteries from custom scenarios.
2. Generate multiple fictional suspects with distinct motives and alibis.
3. Provide interactive evidence that players can inspect.
4. Make players reason from clues instead of guessing randomly.
5. Ensure every case has one predetermined culprit.
6. Provide a final verdict with an understandable explanation.
7. Support multiple cases per user and multiple difficulty levels.
8. Deliver a responsive, polished, detective-themed web experience.
9. Keep API credentials, solutions, and private case data secure.

## 1.4 Target Users

- Mystery and detective-story enthusiasts.
- Students who enjoy logic and reasoning challenges.
- Casual gamers.
- Users interested in AI-generated interactive stories.

## 1.5 Product Scope

### Included in Version 1.0

- Landing page and navigation.
- Mystery creation form.
- AI-powered case generation.
- Case investigation dashboard.
- Suspect profiles.
- Evidence viewer.
- Evidence categories and filtering.
- Investigation notes.
- Suspect accusation and verdict.
- Case history for authenticated users.
- Guest investigation support.
- Difficulty selection.
- Loading, error, empty, and retry states.
- Responsive desktop and mobile layouts.

### Excluded from Version 1.0

- Real-world criminal investigations.
- Real WhatsApp, CCTV, or surveillance integrations.
- Actual video surveillance processing.
- Multiplayer investigations.
- Real-time collaborative detective rooms.
- Paid subscriptions and billing.
- Public user-generated case marketplace.
- Voice-based interrogation.
- User-uploaded evidence analysis.

These features may be considered for future versions but must not block the initial release.

---

# 2. Product Principles

Codex must follow these rules throughout implementation.

### 2.1 One Case, One Truth

Every case must have exactly one correct culprit.

The culprit, crime facts, event timeline, motives, alibis, and essential evidence must be finalized before the case is made available to the player.

### 2.2 Evidence-Based Investigation

The game must provide sufficient evidence for a logical conclusion. The correct answer must not depend on an unexplained fact, an arbitrary AI decision, or information unavailable to the player.

### 2.3 Backend Authority

The frontend must never determine the correct culprit. The backend is the authoritative source for case state, verdicts, and completion status.

### 2.4 Fictional Content Only

All generated cases, identities, conversations, images, and recordings must be clearly fictional. The system must not present fabricated evidence as authentic real-world evidence.

### 2.5 Graceful AI Failure

If Gemini fails, produces invalid output, or generates inconsistent evidence, the system must validate, retry within limits, or reject the generated case. It must never publish a partially generated or logically broken case.

---

# 3. User Roles and Authentication

## 3.1 Guest User

A guest can:

- Open the landing page.
- Generate a mystery.
- Investigate the generated case.
- Inspect suspects and evidence.
- Submit an accusation.
- View the verdict.
- Restart or create another case.

Guest cases should be associated with a secure, random session identifier or equivalent server-managed session mechanism.

Guests do not receive permanent cross-device case history.

## 3.2 Registered User

A registered user can:

- Perform all guest actions.
- Sign up and log in.
- Access saved cases.
- Continue eligible unfinished investigations.
- View completed cases.
- Review previous verdicts.
- Delete their account and associated personal data.

Authentication should use secure server-managed sessions or properly implemented token-based authentication. If cookies are used, apply `HttpOnly`, `Secure` in production, and appropriate `SameSite` settings.

Use established password hashing such as Argon2id or bcrypt if password authentication is implemented. Never store plaintext passwords.

Authentication must not be required to play a basic mystery.

---

# 4. Core User Journey

The standard investigation flow is:

1. The user visits the landing page.
2. The user selects **Create a Mystery**.
3. The user enters a story or scenario.
4. The user selects difficulty, mystery category, and optional settings.
5. The frontend submits the request to the backend.
6. The backend validates the request and starts case generation.
7. Gemini generates a structured case proposal.
8. The backend validates the case, resolves contradictions, and ensures one unique culprit.
9. The case and its evidence are saved to MongoDB.
10. The user enters the investigation room.
11. The user examines suspects, evidence, timelines, and contradictions.
12. The user records notes and builds a theory.
13. The user selects a suspect and submits an accusation.
14. The backend evaluates the accusation against the stored solution.
15. The frontend displays the verdict, reasoning, and case summary.
16. The user can replay, return to the dashboard, or create another mystery.

## 4.1 Core Flow Diagram

    Scenario Input
          |
          v
    Backend Validation
          |
          v
    Gemini Case Generation
          |
          v
    Structural + Logic Validation
          |
          v
    Save Valid Case to MongoDB
          |
          v
    Investigation Dashboard
          |
          v
    Examine Evidence and Suspects
          |
          v
    Submit Accusation
          |
          v
    Backend Verdict Evaluation
          |
          v
    Reveal Correct Culprit and Explanation

---

# 5. Functional Requirements

## FR-01: Landing Page

The landing page must communicate the product concept immediately.

Required sections:

- Navigation bar.
- Hero section.
- Project description.
- Primary **Create a Mystery** action.
- Secondary **How It Works** action.
- Three-step explanation of the investigation process.
- Feature highlights.
- Example mystery preview.
- Footer with About, Privacy, and Terms links.

The main call to action must navigate to the mystery creation page.

## FR-02: Mystery Creation

The mystery creation page must contain the following inputs.

| Field | Type | Requirement |
|---|---|---|
| Scenario | Multiline text | Required |
| Mystery category | Select | Optional |
| Difficulty | Select | Required, default Medium |
| Number of suspects | Select | Default 4 |
| Case title | Text | Optional |
| Include red herrings | Toggle | Default On |
| Include image evidence | Toggle | Default On |
| Include CCTV evidence | Toggle | Default On |

Suggested categories:

- Murder mystery.
- Theft.
- Missing person.
- Cybercrime.
- Secret or betrayal.
- General detective mystery.

Use fictional scenarios only. If a selected category involves violence or sensitive subject matter, keep the content within appropriate fictional and non-graphic boundaries.

Difficulty options:

- **Easy:** 3 suspects, obvious clues, minimal ambiguity.
- **Medium:** 4 suspects, multiple evidence types, some contradictions.
- **Hard:** 5 suspects, interconnected clues, subtle contradictions, more complex deductions.

The number of suspects should be configurable within a supported range of 3–5.

### Scenario validation

- Minimum scenario length: 30 characters.
- Maximum scenario length: 2,000 characters.
- Trim leading and trailing whitespace.
- Reject empty or excessively long input.
- Display a clear validation message.
- Disable duplicate submissions while a generation request is in progress.

The backend must independently enforce these rules.

## FR-03: Case Generation

When the user submits the form:

1. Validate all fields.
2. Create a generation job or equivalent tracked operation.
3. Generate a structured case blueprint.
4. Establish the culprit and complete solution.
5. Generate suspects, timeline, evidence, and reasoning.
6. Validate references between suspects and evidence.
7. Validate that the evidence supports one unique culprit.
8. Retry a bounded number of times if validation fails.
9. Persist the complete valid case.
10. Return the case identifier and safe case metadata.

Generation must be asynchronous where appropriate so the user is not blocked by a long-running request.

The interface must display a loading screen with rotating status messages, such as:

- Building the case.
- Identifying suspects.
- Collecting evidence.
- Checking the timeline.
- Preparing the investigation room.

These messages represent progress stages and must not falsely imply that a particular backend operation has completed unless it actually has.

If generation fails, show an understandable error and a retry action. Do not expose Gemini API errors, internal prompts, or the hidden solution.

## FR-04: Investigation Dashboard

The investigation room is the primary application screen.

It must include:

- Case title and case ID.
- Case summary.
- Difficulty indicator.
- Investigation status.
- Suspect list.
- Evidence library.
- Evidence detail viewer.
- Timeline.
- Investigation notes.
- Suspect selection for accusation.
- Final accusation action.
- Case progress indicator.

Suggested desktop layout:

- Left panel: suspects and evidence categories.
- Center panel: selected evidence and investigation details.
- Right panel: timeline, notes, or case information.

On mobile, panels should become tabs, stacked cards, or a drawer-based interface.

The user must be able to navigate between evidence items without losing their investigation notes.

## FR-05: Suspect Profiles

Each suspect must contain:

- Unique suspect ID.
- Full fictional name.
- Age or approximate age where appropriate.
- Role or relationship to the case.
- Profile image or avatar.
- Short biography.
- Relationship to the victim or central event.
- Possible motive.
- Stated alibi.
- Relevant known facts.
- Optional personality or interrogation notes.

The actual culprit must be represented among the suspects.

Suspect descriptions must not reveal the answer directly before the player submits an accusation.

Suspect IDs must be stable throughout the case.

## FR-06: Evidence Library

The evidence library must group items by category.

Required categories:

- Messages.
- Images and photographs.
- CCTV or recordings.
- Witness statements.
- Documents.
- Timeline events.
- Other clues.

Each evidence item must include:

- Evidence ID.
- Title.
- Evidence type.
- Short description.
- Detailed content or media reference.
- Discovery location or source.
- In-world timestamp when applicable.
- Related suspect IDs.
- Importance or relevance metadata.
- Optional access requirements.
- Display order.

The importance field may help the interface organize clues, but it must not disclose the culprit or act as an obvious correctness label.

### Message evidence

Display AI-generated conversations in a fictional chat interface.

Include:

- Fictional sender and recipient names.
- Message content.
- In-world timestamps.
- Conversation ordering.
- Optional missing or deleted message indicators when justified by the story.

Do not use actual WhatsApp branding in a way that implies the messages are authentic exports from WhatsApp. Prefer a clearly fictional interface labelled **Recovered Chat Log**.

### Image evidence

Examples include:

- Fictional crime-scene illustrations.
- A suspect's fictional photograph.
- An object found at a location.
- A fictional document or note.
- A room or location image.

Images must be clearly presented as generated fictional evidence. Do not depict real identifiable individuals as criminals or fabricate realistic evidence intended to accuse actual people.

### CCTV evidence

Version 1.0 should support two forms:

1. A fictional CCTV still image.
2. A generated textual recording transcript or sequence of observed events.

Optional short generated video clips may be added later if a suitable video-generation provider is integrated.

Gemini text generation alone must not be treated as a video-generation service.

CCTV items should include the camera label, in-world time, location, observations, and any relevant uncertainty.

### Witness statements

Witness statements must identify:

- Witness ID.
- Statement text.
- In-world statement time.
- Relevant event or location.
- Any known inconsistency with other evidence.

A witness may lie or misremember events, but the case must provide clues that make important contradictions discoverable.

## FR-07: Evidence Interactions

Users must be able to:

- Open an evidence item.
- Read its full contents.
- View images in an expanded viewer.
- Play supported generated media.
- Filter by evidence category.
- Search evidence by title or content.
- Mark evidence as reviewed.
- Add or edit personal notes.
- Return to the previous evidence item.

Reviewed status and notes must persist during the investigation.

The frontend must not modify the original evidence content or the hidden solution.

## FR-08: Investigation Notes

Users can create personal notes such as:

- Suspect A may be lying.
- The timeline conflicts with the message.
- The witness saw someone near the room.
- The key was found after the reported time.

Notes should be stored separately from generated case evidence.

Notes must not be sent to Gemini unless an explicitly implemented feature requires it and the user has been informed.

## FR-09: Accusation

The accusation interface must show all eligible suspects.

The user must:

1. Select one suspect.
2. Optionally enter a short explanation.
3. Confirm the accusation.
4. Submit it to the backend.

The backend must validate:

- The case exists.
- The case belongs to the current session or user.
- The case is not already completed, unless replay is supported.
- The suspect belongs to that case.
- The request has not already been processed as a duplicate.

The backend evaluates the selected suspect against the stored culprit ID.

The verdict must not be determined by asking Gemini to decide who is guilty at submission time.

## FR-10: Verdict Screen

After an accusation, display:

- Correct or incorrect result.
- Selected suspect.
- Actual culprit.
- Explanation of the crime.
- Key supporting evidence.
- Explanation of misleading evidence.
- Timeline of important events.
- Final case summary.
- Replay or create-new-case action.

If the accusation is incorrect, explain the correct answer after submission.

The player should not see the actual culprit, solution, or solution-specific evidence explanations before the accusation is finalized.

## FR-11: Case History

Authenticated users must be able to view:

- Case title.
- Creation date.
- Difficulty.
- Case status.
- Accused suspect.
- Final outcome.
- Completion date.

Users must be able to reopen completed cases in review mode, subject to access controls.

Guest history may remain available within the same valid session.

## FR-12: Restart and Replay

A user can create a new case from the same scenario.

A replay should generate a new case with a new case ID. If deterministic replay is desired later, the system may store a seed or versioned generation configuration.

Do not overwrite the original case or its verdict when a new case is created.

---

# 6. AI and Gemini Integration

## 6.1 Provider

Use the official Google Gemini API through a supported Google Gen AI SDK.

The model name must be configurable through environment variables rather than hard-coded throughout the application.

Example:

`GEMINI_MODEL=your-supported-model-id`

Use a currently supported Gemini model suitable for structured text generation. Confirm the model ID and supported capabilities during setup.

Do not expose the Gemini API key in frontend code, browser requests, source control, or public logs.

## 6.2 AI Responsibilities

Gemini is responsible for generating:

- Mystery story content.
- Suspect descriptions.
- Motives and alibis.
- Fictional conversations.
- Witness statements.
- Evidence descriptions.
- Timeline proposals.
- Clues and red herrings.
- Solution explanations.
- Image-generation prompts, when image generation is enabled.

Gemini may propose the culprit and solution during generation. The backend must then validate and freeze the case solution before publishing the case.

## 6.3 Source of Truth for Case Logic

The case-generation pipeline must separate private solution data from player-visible content.

Recommended pipeline:

**Stage A: Case blueprint**

Generate:

- Core incident.
- Exact event timeline.
- Suspect roster.
- Culprit ID.
- Motive.
- Method or explanation of the incident.
- Opportunity and alibi facts.
- Essential evidence needed to solve the case.

**Stage B: Evidence generation**

Generate messages, witness statements, documents, and media descriptions based on the approved blueprint.

**Stage C: Consistency validation**

Check:

- All suspect references exist.
- Every evidence item belongs to the correct case.
- Event timestamps do not contradict the canonical timeline without an intentional explanation.
- Statements attributed to characters match their known roles.
- The culprit is included in the suspect roster.
- At least two independent clues support the intended conclusion where the scenario allows it.
- The evidence provides a defensible route to one unique culprit.
- Red herrings are explainable and do not accidentally establish another suspect as the only viable culprit.

**Stage D: Publication**

Only a validated, complete case can be marked ready for investigation.

If validation fails, regenerate or repair the affected content with bounded retries. If the case remains invalid, return a generation failure and do not publish it.

## 6.4 Structured Output

Require Gemini to return structured JSON matching a defined schema.

Do not depend on Markdown headings, free-form prose parsing, or fragile regular expressions to extract important case fields.

Use server-side schema validation, such as Zod, for all generated output.

Reject:

- Missing required fields.
- Invalid types.
- Unknown suspect references.
- Duplicate IDs.
- Missing culprit IDs.
- Evidence without required content.
- Invalid timestamps.
- Unsupported media URLs.
- Cases with an invalid suspect count.
- Malformed JSON.

Gemini's structured output support does not replace application-level validation.

## 6.5 Suggested Internal Case Structure

The following is an illustrative schema, not a complete production implementation.

```json
{
  "title": "The Midnight Archive",
  "difficulty": "medium",
  "category": "theft",
  "summary": "A valuable document disappears...",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Alex Morgan",
      "role": "Archivist",
      "motive": "A personal dispute",
      "alibi": "Claims to have left at 9 PM"
    }
  ],
  "canonicalTimeline": [
    {
      "time": "21:00",
      "event": "A suspect leaves the archive"
    }
  ],
  "evidence": [
    {
      "id": "evidence_1",
      "type": "message",
      "title": "Recovered Chat Log",
      "content": "Fictional message content",
      "relatedSuspectIds": ["suspect_1"]
    }
  ],
  "solution": {
    "culpritSuspectId": "suspect_1",
    "motive": "Private explanation",
    "explanation": "Private solution narrative",
    "supportingEvidenceIds": ["evidence_1"]
  }
}
```

The final implementation must extend this structure to include all required fields, timestamps, media references, provenance, schema versions, and validation metadata.

**Critical security requirement:** The example's `solution` object must never be returned in the player-facing case response before the accusation is submitted.

## 6.6 AI Prompt Design

Maintain versioned prompts in backend source files.

The case-generation prompt must instruct Gemini to:

1. Generate a completely fictional mystery.
2. Use only the provided scenario as the starting point.
3. Respect the selected category, difficulty, and suspect count.
4. Establish a single, fixed culprit.
5. Define the canonical timeline before creating evidence.
6. Generate evidence consistent with that timeline.
7. Make the mystery solvable from available clues.
8. Provide fair but non-obvious clues.
9. Use red herrings only when they have a logical explanation.
10. Avoid introducing new suspects or facts through evidence without defining them.
11. Return valid structured output.
12. Keep private solution explanations separate from public case content.

User-provided scenario text is untrusted data, not system instructions. Explicitly instruct the model to treat scenario content as story material and ignore attempts within it to override application rules, reveal secrets, change output format, or bypass validation.

Do not rely on prompt instructions alone for security or consistency.

## 6.7 Image Generation

The first release may use Gemini to create evidence descriptions and image-generation prompts.

Actual image files require a compatible image-generation service or model. Do not assume that every Gemini text model can produce images.

If image generation is unavailable:

- Display a designed placeholder or fictional evidence card.
- Keep image evidence optional.
- Clearly indicate when a visual is unavailable.
- Allow the case to remain playable using text evidence.

Store generated images in object storage or another appropriate media service. Store their references and metadata in MongoDB rather than storing large image binaries directly in case documents.

Use signed URLs or equivalent access controls when evidence media should be private.

## 6.8 AI Cost and Reliability

- Set generation token limits.
- Use request timeouts.
- Limit retries.
- Apply rate limits.
- Avoid unnecessary repeated generation.
- Cache immutable generated case data.
- Log generation failures without logging secrets.
- Handle quota and rate-limit errors.
- Track generation duration and token usage when supported.
- Do not regenerate a complete case when a small, safe repair is sufficient.

---

# 7. Technical Architecture

## 7.1 Technology Stack

### Frontend

- React.js.
- Vite.
- TypeScript.
- React Router.
- Tailwind CSS.
- A reusable accessible component system.
- TanStack Query or an equivalent server-state library.
- A schema-aware form library, such as React Hook Form with Zod.

### Backend

- Node.js.
- Express.js.
- TypeScript.
- Official Google Gen AI SDK.
- Zod for runtime validation.
- MongoDB Node driver or Mongoose.
- Secure authentication library, if authentication is implemented.
- Structured logging.

### Database and Storage

- MongoDB Atlas or a suitable MongoDB deployment.
- Object storage for images and optional video.
- Server-side session storage when required.

### Testing

- Vitest for unit tests.
- React Testing Library for frontend tests.
- Supertest for API tests.
- Playwright for end-to-end browser testing.

Use compatible, stable package versions at implementation time. Pin dependencies through the package manager lockfile.

## 7.2 System Architecture

    React Frontend
          |
          | HTTPS / JSON
          v
    Express REST API
          |
          +---- Authentication / Session
          |
          +---- Request Validation
          |
          +---- Case Generation Service
          |            |
          |            v
          |       Gemini API
          |
          +---- Case Validation Service
          |
          +---- Verdict Service
          |
          +---- MongoDB
          |
          +---- Media Storage

All Gemini requests, solution access, verdict evaluation, and database mutations must occur on the server.

## 7.3 Recommended Repository Structure

```text
ai-mystery-room/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── case-creation/
│   │   │   │   ├── investigation/
│   │   │   │   ├── evidence/
│   │   │   │   ├── suspects/
│   │   │   │   └── verdict/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── main.tsx
│   │   ├── public/
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   │   ├── gemini/
│       │   │   ├── case-generation/
│       │   │   ├── case-validation/
│       │   │   └── verdict/
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── repositories/
│       │   ├── prompts/
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── server.ts
│       └── package.json
├── packages/
│   └── shared/
│       ├── types/
│       └── schemas/
├── tests/
│   ├── integration/
│   └── e2e/
├── docs/
│   └── SPEC.md
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

This structure is the recommended starting point. Codex may adjust internal filenames when necessary, but it must preserve the architecture, security boundaries, and functional requirements defined here.

---

# 8. Database Design

Use MongoDB collections with schema validation at the application layer. Every stored document must include appropriate creation and update timestamps.

## 8.1 Users Collection

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "passwordHash": "secure-hash",
  "displayName": "Detective",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Requirements:

- Email must be unique after normalization.
- `passwordHash` must never be returned in API responses.
- Do not store passwords in plaintext.
- Authentication provider fields should be added only when needed.

## 8.2 Cases Collection

```json
{
  "_id": "ObjectId",
  "ownerUserId": "ObjectId or null",
  "sessionIdHash": "secure-session-reference",
  "title": "The Midnight Archive",
  "scenario": "Original user-provided scenario",
  "category": "theft",
  "difficulty": "medium",
  "status": "ready",
  "schemaVersion": 1,
  "generationVersion": "1.0.0",
  "suspects": [],
  "canonicalTimeline": [],
  "publicEvidence": [],
  "solution": {
    "culpritSuspectId": "suspect_1",
    "motive": "Private motive",
    "explanation": "Private solution",
    "supportingEvidenceIds": ["evidence_1"]
  },
  "createdAt": "Date",
  "updatedAt": "Date",
  "completedAt": null
}
```

This document is a conceptual representation. The implementation may separate evidence and solution data into additional collections if needed.

Required statuses:

- `generating`
- `ready`
- `failed`
- `completed`

The solution must remain protected by backend access controls even if it is stored in the same document as public case data.

## 8.3 Evidence Collection

For larger cases, store evidence separately.

```json
{
  "_id": "ObjectId",
  "caseId": "ObjectId",
  "evidenceId": "evidence_1",
  "type": "message",
  "title": "Recovered Chat Log",
  "description": "A conversation recovered from a fictional device",
  "content": {},
  "media": [],
  "relatedSuspectIds": ["suspect_1"],
  "sortOrder": 1,
  "createdAt": "Date"
}
```

Requirements:

- Evidence IDs must be unique within a case.
- Evidence must belong to an existing case.
- Media metadata must not contain secret credentials.
- Private evidence explanations must be stored separately from player-facing evidence content.

## 8.4 Investigations Collection

```json
{
  "_id": "ObjectId",
  "caseId": "ObjectId",
  "userId": "ObjectId or null",
  "sessionIdHash": "secure-session-reference",
  "reviewedEvidenceIds": ["evidence_1"],
  "notes": [
    {
      "id": "note_1",
      "content": "The timeline does not match the alibi",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "selectedSuspectId": null,
  "status": "in_progress",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Use this collection to separate player progress from the generated case.

## 8.5 Accusations Collection

```json
{
  "_id": "ObjectId",
  "caseId": "ObjectId",
  "investigationId": "ObjectId",
  "selectedSuspectId": "suspect_2",
  "isCorrect": false,
  "attemptNumber": 1,
  "submittedAt": "Date"
}
```

Store verdict explanations or snapshots where needed for consistent review. Do not include the solution in public investigation responses before the accusation.

## 8.6 Database Indexes

Implement appropriate indexes:

- Unique normalized user email.
- Cases by owner and creation date.
- Cases by session reference and creation date.
- Evidence by case ID and evidence ID.
- Investigations by user/session and case ID.
- Accusations by investigation and submission time.
- Unique idempotency key for generation or accusation requests where applicable.

Use database transactions when required for related multi-document changes, provided the MongoDB deployment supports them.

---

# 9. REST API Specification

Base path: `/api/v1`

All API requests and responses must use JSON unless the endpoint explicitly serves media or health information.

## 9.1 Standard Response Format

Successful response:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Error response:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your input."
  }
}
```

Do not return stack traces, private prompts, database internals, or secrets.

## 9.2 Endpoints

### Health

`GET /api/v1/health`

Returns application health and basic service status without revealing environment secrets.

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Create a Case

`POST /api/v1/cases`

Example request:

```json
{
  "scenario": "A valuable painting disappears from a locked gallery.",
  "category": "theft",
  "difficulty": "medium",
  "suspectCount": 4,
  "options": {
    "redHerrings": true,
    "imageEvidence": true,
    "cctvEvidence": true
  }
}
```

Recommended response for asynchronous generation:

```json
{
  "success": true,
  "data": {
    "generationId": "generation_123",
    "status": "generating"
  },
  "error": null
}
```

The server must establish ownership or session access before processing the request.

### Check Generation Status

`GET /api/v1/cases/generations/:generationId`

Returns the generation status and, when ready, the case ID.

The response must not expose the solution.

### List Cases

`GET /api/v1/cases`

Supports pagination and optional filters for status and difficulty.

### Get a Case

`GET /api/v1/cases/:caseId`

Returns public case details, suspects, timeline information intended for the player, and safe evidence metadata.

Must exclude:

- Culprit ID.
- Private motive or solution narrative.
- Hidden clue explanations.
- Internal generation prompts.
- Validation metadata that reveals the answer.

### List Case Evidence

`GET /api/v1/cases/:caseId/evidence`

Supports category filtering and pagination if needed.

### Get Evidence Detail

`GET /api/v1/cases/:caseId/evidence/:evidenceId`

Returns the player-visible content of the selected evidence item.

### Get Investigation State

`GET /api/v1/cases/:caseId/investigation`

Returns the current player's reviewed evidence, notes, status, and other permitted progress data.

### Update Reviewed Evidence

`PATCH /api/v1/cases/:caseId/investigation/evidence/:evidenceId`

Example:

```json
{
  "reviewed": true
}
```

### Update Notes

`PUT /api/v1/cases/:caseId/investigation/notes`

Example:

```json
{
  "notes": [
    {
      "id": "note_1",
      "content": "The alibi conflicts with the camera time."
    }
  ]
}
```

Validate note length, ownership, and payload size.

### Submit Accusation

`POST /api/v1/cases/:caseId/accusations`

Example request:

```json
{
  "suspectId": "suspect_2",
  "reasoning": "The messages contradict the suspect's alibi."
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "correct": false,
    "selectedSuspectId": "suspect_2",
    "verdict": "incorrect",
    "completed": true
  },
  "error": null
}
```

The initial response may omit the full solution. A separate authorized endpoint can return the full verdict after completion.

### Get Verdict

`GET /api/v1/cases/:caseId/verdict`

Returns the correct culprit, explanation, supporting evidence, and case conclusion only when the investigation has reached an eligible completed state.

### Restart Case

`POST /api/v1/cases/:caseId/replay`

Creates a new case or investigation according to the replay policy. It must not modify the original case's verdict.

### Delete Account

`DELETE /api/v1/auth/me`

Deletes or appropriately anonymizes the user's personal data and associated records according to the documented retention policy.

## 9.3 HTTP Status Codes

Use consistent status codes:

- `200` — successful retrieval or update.
- `201` — resource created.
- `202` — asynchronous generation accepted.
- `400` — invalid request.
- `401` — unauthenticated request.
- `403` — insufficient permission.
- `404` — resource not found or intentionally concealed.
- `409` — conflicting state or duplicate operation.
- `413` — payload too large.
- `422` — semantically invalid input.
- `429` — rate limit exceeded.
- `500` — unexpected server failure.
- `502` or `503` — upstream AI or service failure, as appropriate.

Document the exact error codes and ensure the frontend handles them.

---

# 10. Frontend Design Specification

## 10.1 Visual Direction

Use a premium detective investigation aesthetic.

Design keywords:

- Dark.
- Cinematic.
- Mysterious.
- Minimal.
- Professional.
- Evidence-driven.
- Immersive.

Avoid a childish game interface or an excessively crowded dashboard.

## 10.2 Suggested Design Tokens

| Element | Specification |
|---|---|
| Main background | `#0B0F14` |
| Secondary background | `#121922` |
| Card background | `#18212B` |
| Primary text | `#F3F4F6` |
| Secondary text | `#9CA3AF` |
| Accent | `#D6A85F` |
| Danger | `#D9534F` |
| Success | `#45B37A` |
| Border | `#2B3642` |

Use these as initial design tokens, not rigid requirements. Maintain adequate contrast and consistent theme usage.

## 10.3 Typography

Use a modern sans-serif font for UI text and an optional editorial serif font for case titles.

Typography must support clear hierarchy:

- Large hero title.
- Medium case title.
- Clear section headings.
- Readable evidence content.
- Small, muted metadata.

Do not use overly small text for timestamps or clue details.

## 10.4 Components

Create reusable components for:

- Navigation bar.
- Primary and secondary buttons.
- Text fields and select fields.
- Difficulty badge.
- Case card.
- Suspect card.
- Evidence card.
- Evidence type icon.
- Evidence detail modal or panel.
- Timeline event.
- Notes editor.
- Confirmation dialog.
- Loading skeleton.
- Toast notifications.
- Error state.
- Empty state.
- Verdict result.
- Pagination controls, if needed.

## 10.5 Required Pages

### `/`

Landing page.

### `/create`

Mystery creation form.

### `/investigation/:caseId`

Main investigation room.

### `/investigation/:caseId/verdict`

Completed case verdict.

### `/dashboard`

Registered user's case history.

### `/login`

Login page.

### `/register`

Registration page.

### `/about`

Product information.

### `/privacy`

Privacy policy.

### `/*`

Not-found page.

Guest access must work without requiring a login redirect.

## 10.6 Responsive Behavior

Desktop:

- Multi-column investigation workspace.
- Persistent case navigation where space allows.
- Large evidence viewer.

Tablet:

- Reduced column widths.
- Collapsible side panels.

Mobile:

- Single-column layout.
- Tabbed suspect and evidence navigation.
- Touch-friendly controls.
- Full-width forms.
- Accessible modal behavior.
- No horizontal overflow.

## 10.7 Accessibility

Follow WCAG 2.2 AA principles where practical.

Requirements:

- Semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Accessible form labels.
- Meaningful image alternative text.
- Accessible dialogs.
- Sufficient color contrast.
- Error messages associated with inputs.
- Status announcements for asynchronous actions.
- No reliance on color alone to communicate a verdict.

---

# 11. Security and Privacy Requirements

Security requirements are mandatory.

## 11.1 Secrets

Store secrets only in environment variables or an approved secret manager.

Required environment variables:

```text
NODE_ENV=development
PORT=5000
MONGODB_URI=
GEMINI_API_KEY=
GEMINI_MODEL=
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=
```

Add only applicable optional variables for authentication, media storage, and logging.

Provide `.env.example` with empty placeholders. Never commit `.env`.

The frontend must not contain `GEMINI_API_KEY` or `MONGODB_URI`.

## 11.2 Access Control

- Validate case ownership on every protected request.
- Bind guest cases to secure sessions.
- Do not trust a user-supplied owner ID.
- Check that selected suspects belong to the target case.
- Do not expose private solutions through API payloads, browser state, source maps, or static files.
- Prevent unauthorized access to private evidence media.
- Enforce appropriate access checks on verdict endpoints.

## 11.3 Input Validation

- Validate request bodies with schemas.
- Limit scenario and note lengths.
- Reject malformed identifiers.
- Sanitize any content rendered as HTML.
- Use parameterized database operations.
- Do not render AI output as executable HTML.
- Treat user-generated text and AI-generated content as untrusted input.

## 11.4 API Protection

Implement:

- Rate limiting.
- CORS allowlisting.
- Secure HTTP headers.
- Request size limits.
- Request timeouts.
- Appropriate session protections.
- Authentication attempt throttling.
- Generation concurrency limits.
- Idempotency protection for critical operations.

## 11.5 AI Security

- Treat model output as untrusted.
- Validate every generated object.
- Do not let the model choose access permissions.
- Never use model-generated URLs without validation.
- Do not execute generated code.
- Do not expose internal prompts.
- Keep secret-bearing configuration outside the model context.
- Ensure user-provided story text cannot override server rules.
- Never rely on the AI to authorize a request.

## 11.6 Privacy

- Do not log passwords, API keys, session tokens, or complete private solution objects.
- Document how long guest sessions and case records are retained.
- Provide a deletion process for registered users.
- Collect only data necessary to operate the service.
- Disclose that scenarios and case-generation inputs are sent to Gemini.
- Avoid sending account details or unrelated personal data to the AI provider.

---

# 12. Error Handling

The application must handle errors without crashing or losing saved investigation progress.

| Situation | Expected Behavior |
|---|---|
| Invalid scenario | Show field-level validation |
| Gemini timeout | Retry within limits or show retry action |
| Gemini quota exceeded | Show temporary unavailability message |
| Malformed AI output | Validate, retry, then fail safely |
| Inconsistent case | Reject case publication |
| MongoDB unavailable | Show service error and log details securely |
| Evidence not found | Show not-found state |
| Unauthorized case access | Deny access |
| Duplicate accusation | Return consistent existing result or conflict |
| Network disconnect | Preserve local unsaved notes where possible |
| Image generation unavailable | Use a clear placeholder |
| Invalid route | Display not-found page |

The frontend must not display raw stack traces or raw Gemini error messages.

Use structured server logs with request IDs to support debugging.

---

# 13. Testing Requirements

## 13.1 Unit Tests

Test:

- Scenario validation.
- Difficulty rules.
- Suspect count rules.
- AI output schema validation.
- Duplicate ID detection.
- Evidence reference validation.
- Timeline consistency rules.
- Culprit membership in suspect list.
- Verdict evaluation.
- Ownership checks.
- Note validation.

The verdict service must be testable without calling Gemini.

## 13.2 Integration Tests

Test:

- API validation.
- Database persistence.
- Case generation workflow.
- Evidence retrieval.
- Investigation progress updates.
- Accusation submission.
- Verdict retrieval.
- Authentication and access control.
- AI-provider failure handling.

Use mocked Gemini responses for deterministic automated tests. Do not require a paid AI API call for every test run.

## 13.3 End-to-End Tests

At minimum, automate the following flow:

1. Open the homepage.
2. Open the creation form.
3. Submit a valid scenario.
4. Receive a generated case.
5. Inspect suspects and evidence.
6. Add an investigation note.
7. Submit an accusation.
8. View the verdict.
9. Return to the dashboard or create another case.

Also test:

- Invalid input.
- Generation failure.
- Mobile navigation.
- Unauthorized access.
- Duplicate submission.
- Missing media.
- Empty history.

## 13.4 AI Quality Tests

Use a collection of test scenarios covering different categories and difficulties.

Verify that:

- Every published case has one culprit.
- The culprit is included in the suspect list.
- All evidence references are valid.
- The case has a coherent timeline.
- Essential clues are available to the player.
- The correct answer is supported by evidence.
- Red herrings have logical explanations.
- The public API does not reveal the culprit before accusation.
- Invalid generated cases are not published.

Automated checks should be complemented by manual review of representative generated cases. A model-based reviewer may help flag contradictions, but it must not replace deterministic validation or guarantee logical uniqueness by itself.

---

# 14. Non-Functional Requirements

## Performance

- Landing and navigation pages should render quickly.
- Use loading skeletons for asynchronous content.
- Paginate large collections.
- Lazy-load nonessential images.
- Avoid unnecessary AI calls.
- Cache immutable case and evidence data when safe.
- Do not block the interface while the AI generates a case.

Initial target: ordinary non-AI API requests should typically complete within 500 ms at the 95th percentile under the agreed test environment, excluding external dependencies and database cold starts. Measure and revise targets using real deployment data.

AI generation duration is provider- and scenario-dependent. Display progress and handle long-running requests rather than promising a fixed generation time.

## Reliability

- Failed generation must not leave a case marked ready.
- A repeated request must not accidentally create duplicate operations.
- Case and verdict data must persist.
- The system must recover gracefully from temporary AI-provider failure.
- Store sufficient logs to diagnose failures without exposing secrets.

## Maintainability

- Use TypeScript throughout the application where practical.
- Keep AI prompts separate from route handlers.
- Keep verdict logic separate from UI and Gemini code.
- Define shared types and schemas.
- Use reusable React components.
- Document non-obvious decisions.
- Avoid giant components and duplicated business logic.

## Scalability

- Use asynchronous case generation for longer tasks.
- Keep API servers stateless where practical.
- Support a background job queue when generation volume requires it.
- Store media separately from MongoDB documents.
- Apply appropriate indexes.
- Enforce per-user and per-session resource limits.

## Browser Support

Support current stable versions of Chrome, Edge, Firefox, and Safari. Test responsive layouts on modern mobile browsers.

---

# 15. Implementation Plan

Codex should implement the project in the following order.

## Phase 1: Project Foundation

- Create the monorepo structure.
- Configure React, Vite, TypeScript, Tailwind, and Express.
- Configure environment variables.
- Connect MongoDB.
- Add health endpoint.
- Add shared types and schemas.
- Create the README and development commands.

**Exit criteria:** Frontend and backend run locally, and the backend can connect to the database.

## Phase 2: UI Foundation

- Implement navigation.
- Build the landing page.
- Build the creation form.
- Build reusable components.
- Add responsive styles.
- Add form validation and accessible states.

**Exit criteria:** All core pages render and the creation form validates input.

## Phase 3: Case Generation

- Integrate the official Gemini SDK.
- Implement structured generation prompts.
- Implement Zod schemas.
- Implement canonical timeline and solution validation.
- Save complete valid cases.
- Add generation status handling.
- Add failure and retry behavior.

**Exit criteria:** A valid case can be generated, persisted, and retrieved without exposing the solution.

## Phase 4: Investigation Experience

- Implement suspect profiles.
- Implement evidence library and filters.
- Implement evidence detail viewer.
- Implement fictional message displays.
- Implement image placeholders and media references.
- Implement timeline.
- Implement notes and reviewed status.

**Exit criteria:** Users can investigate a saved case and retain their progress.

## Phase 5: Verdict System

- Implement accusation endpoint.
- Implement deterministic verdict evaluation.
- Implement completion state.
- Implement verdict explanation.
- Implement replay behavior.

**Exit criteria:** The backend evaluates the accusation against the fixed culprit ID, and the verdict remains consistent after reload.

## Phase 6: Authentication and History

- Implement registration and login.
- Implement secure session handling.
- Implement case ownership.
- Implement dashboard history.
- Implement account deletion.

**Exit criteria:** Registered users can safely access their own cases and history.

## Phase 7: Testing and Hardening

- Add unit tests.
- Add integration tests.
- Add end-to-end tests.
- Test invalid AI responses.
- Test authorization boundaries.
- Test responsive behavior.
- Check dependencies and security configuration.
- Verify deployment configuration.

**Exit criteria:** All critical acceptance criteria pass and no known critical security issue remains.

## Phase 8: Deployment

- Deploy the frontend to a suitable static hosting platform.
- Deploy the backend to a suitable Node.js hosting platform.
- Configure MongoDB.
- Configure secrets.
- Configure HTTPS and CORS.
- Configure media storage if required.
- Verify production health checks.
- Test the complete live workflow.

**Exit criteria:** A production deployment can create, investigate, and complete a mystery.

---

# 16. Acceptance Criteria

The project is complete only when the following conditions are satisfied.

### AC-01: Mystery Creation

- A valid scenario can be submitted.
- Invalid scenarios are rejected.
- Selected options affect the generated case.
- The interface shows generation status.
- Generation errors can be retried safely.

### AC-02: Case Integrity

- Every published case has a fixed culprit.
- The culprit is a valid suspect.
- Suspect and evidence IDs are consistent.
- The timeline and essential clues pass validation.
- Invalid cases are not made available to players.

### AC-03: Investigation

- All suspects are displayed.
- Evidence can be opened and filtered.
- Messages, documents, and available images display correctly.
- The timeline is accessible.
- Notes and reviewed evidence persist.

### AC-04: Accusation

- A valid suspect can be selected.
- The backend evaluates the accusation.
- The verdict does not depend on a new AI decision.
- Duplicate requests do not create inconsistent outcomes.
- The correct solution is not leaked before submission.

### AC-05: Verdict

- Correct and incorrect accusations are handled properly.
- The correct culprit is revealed after completion.
- Supporting evidence and reasoning are displayed.
- Completed case state persists after refresh.

### AC-06: Security

- Gemini credentials are server-side only.
- Unauthorized users cannot access another user's private cases.
- The public case response excludes the solution.
- Inputs and AI outputs are validated.
- API access is rate-limited.

### AC-07: User Experience

- The website is responsive.
- All essential actions are keyboard accessible.
- Loading, empty, error, and success states are implemented.
- No major page has horizontal overflow on mobile.
- No primary action is decorative or nonfunctional.

### AC-08: Delivery

- The application starts using documented commands.
- `.env.example` exists.
- Database configuration is documented.
- Automated tests pass.
- Deployment instructions are included.
- There are no placeholder implementations for core generation, investigation, accusation, or verdict workflows.

---

# 17. Definition of Done

A feature is considered done only when:

1. Its frontend interface is implemented.
2. Its backend behavior is implemented when required.
3. Input validation is implemented.
4. Authorization is checked where necessary.
5. Loading, empty, and error states are handled.
6. Tests cover the important behavior.
7. The feature is integrated with the actual database or service.
8. No secrets are exposed.
9. Documentation is updated.
10. The feature has been verified in the running application.

A visual mockup or hard-coded demonstration is not sufficient for a feature that is expected to work with real backend data.

---

# 18. Instructions for OpenAI Codex

Treat this document as the authoritative product specification.

Before implementation:

1. Read this entire document.
2. Inspect the existing repository, if one exists.
3. Identify the current implementation state.
4. Create a task checklist based on the implementation phases.
5. Identify configuration or integration details that require environment setup.
6. Preserve existing working code unless a change is necessary.

During implementation:

- Follow the functional requirements and acceptance criteria.
- Prefer TypeScript and shared schemas.
- Use real API calls between frontend and backend.
- Keep Gemini calls on the backend.
- Keep the case solution private until an accusation is finalized.
- Implement actual database persistence.
- Use deterministic verdict evaluation.
- Add automated tests for important behavior.
- Avoid unnecessary dependencies.
- Avoid building features outside the defined MVP until the core workflow is complete.
- Do not silently change API contracts or data models.
- Update this specification if an approved architectural decision changes a requirement.

When a detail is not specified:

1. Choose the simplest secure implementation consistent with this document.
2. Prefer established libraries and standard practices.
3. Document significant assumptions.
4. Avoid blocking implementation for minor design choices.
5. Do not invent integrations, API capabilities, or environment credentials.

When a required service is unavailable, implement the appropriate interface, validation, error handling, and a clearly documented configuration requirement. Never simulate a successful production integration without disclosing that it is a mock.

Before marking the project complete, run the tests, verify the full user journey, check for leaked solution data, and provide a summary of completed work, setup instructions, test results, and any remaining limitations.

---

# 19. Final Product Vision

AI Mystery Room should give users the feeling of entering a real detective investigation, examining clues, connecting evidence, and solving a unique fictional mystery.

The core experience must combine:

- AI-generated storytelling.
- Consistent evidence.
- Interactive investigation.
- Logical deduction.
- Secure backend-controlled solutions.
- A cinematic, responsive interface.

**The most important technical rule:** Gemini generates the mystery content; the backend validates and stores the canonical case; the player investigates only public evidence; and the verdict service determines the outcome using the stored solution.

This specification is the project's primary reference for implementation, testing, and future development. All code, API contracts, database models, and UI behavior should remain consistent with it.