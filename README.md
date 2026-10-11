# ListingGuard — Marketplace Listing Quality & Policy Reviewer

> **Production-grade AI-powered marketplace quality assurance system with Human-in-the-Loop approval workflows and deterministic safety rails.**

Built for the **Aggroso Take-Home Engineering Assessment**.

---

## 📑 Table of Contents
1. [Overview & Solution Architecture](#-overview--solution-architecture)
2. [Key Engineering Highlights](#-key-engineering-highlights)
3. [System Flow & Human-in-the-Loop Workflow](#-system-flow--human-in-the-loop-workflow)
4. [Completed vs Excluded Scope](#-completed-vs-excluded-scope)
5. [Local Setup & Environment](#-local-setup--environment)
6. [Testing Strategy](#-testing-strategy)
7. [Structured Logging & Observability](#-structured-logging--observability)
8. [Known Limitations & Production Roadmap](#-known-limitations--production-roadmap)
9. [Deployment Details](#-deployment-details)

---

## 🌟 Overview & Solution Architecture

In modern multi-seller marketplaces, low-quality or fraudulent listings degrade user trust, violate consumer protection guidelines, and incur legal risk. However, purely human moderation does not scale, while fully autonomous AI moderation risks false bans, hallucinated policy enforcement, and seller churn.

**ListingGuard** implements a **two-tier defense architecture**:
1. **Tier 1 — Deterministic Rule Validation (Zero-Cost, < 5ms):** Fast code-level checks (regex, string boundaries, numerical ranges, in-memory duplicate detection) that instantly reject invalid inputs before any LLM is called, protecting API quotas and reducing server costs.
2. **Tier 2 — Semantic AI Policy Engine (Google Gemini LLM):** Evaluates subjective claims (unverified medical cures, superlative guarantees, counterfeit cues, bait pricing) against a comprehensive 6-section Marketplace Policy document and returns structured findings citing exact policy clauses.
3. **Tier 3 — Human-in-the-Loop (HITL) Decisioning:** The AI *never* auto-punishes or auto-publishes. Human reviewers retain final authority to **Approve**, **Edit**, or **Reject** every AI finding before persisting the decision.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (Next.js React 19 + Shadcn UI + Tailwind CSS Dark Mode)   │
└──────────────┬──────────────────────────────▲───────────────┘
               │ Submit Listing               │ Render Review
               ▼                              │
┌──────────────────────────────┐              │
│ Stage 1: Deterministic Check │              │
│       /api/validate          │──[Errors]────┘ (Immediate Fix)
└──────────────┬───────────────┘
               │ Passed
               ▼
┌──────────────────────────────┐
│  Stage 2: Semantic AI Review │
│         /api/review          │
│   Google Gemini 3.8 Flash    │
│  (Strict JSON Schema Mode)   │
└──────────────┬───────────────┘
               │ Structured Findings + Citations
               ▼
┌──────────────────────────────┐
│  Stage 3: Human Review / HITL│
│   Approve / Edit / Reject    │
│   Data Persistence (Storage) │
└──────────────────────────────┘
```

---

## 💡 Key Engineering Highlights

- **Deterministic Defense:** Regex-based phone and URL detection, length boundaries, and positive price verification run server-side and client-side before any external API is touched.
- **Strict Structured Outputs:** Gemini prompt utilizes JSON response schema constraints (`responseMimeType: "application/json"`) with a low temperature (0.2) to eliminate hallucinations and markdown formatting artifacts.
- **Explainable Policy Citations:** Every AI finding includes the exact policy clause (e.g., `Section 3.2 — Unverifiable & Misleading Claims`) and actionable replacement suggestions.
- **Human Authority:** Decisions are recorded with granular status (`pending`, `approved`, `edited`, `rejected`) and reviewer metadata.
- **Resilient Offline Fallback:** If the external AI service suffers downtime or rate limits, the system provides structured error boundaries and fallback guidance.
- **Native Test Runner:** 16 unit tests running natively via `tsx --test` with zero native binary bloat in < 1 second.

---

## 🔄 System Flow & Human-in-the-Loop Workflow

1. **Submission (`/`):** The seller enters title, category, price, attributes, seller name, and description.
2. **Instant Validation (`POST /api/validate`):**
   - Title: 5–80 characters, no contact details.
   - Description: 50–2000 characters, no URLs or phone numbers.
   - Price: Positive numeric value.
   - Duplicate Check: Prevents identical titles from the same seller.
3. **AI Semantic Audit (`POST /api/review`):**
   - Listing payload is merged with the hardcoded marketplace policy document (`src/lib/policy.ts`).
   - Gemini identifies subtle policy violations: medical claims, bait pricing, missing mandatory attributes, brand authorization infringements.
   - Computes an **Overall Quality Score** (0–100) and issue severity (`critical`, `warning`, `info`).
4. **Human Decisioning (`/review?id=...`):**
   - Reviewer audits each finding individually.
   - Reviewer can **Approve** (agree with AI), **Reject** (override false positive), or **Edit** (modify the suggested text).
5. **Persistence & History (`/history`):**
   - Completed reviews are stored with timestamp, reviewer decisions, and final listing state.
   - Reviewers can inspect historical records or purge test audits.

---

## 📊 Completed vs Excluded Scope

### ✅ Completed Scope
- [x] Responsive Next.js 16 (Turbopack) frontend with dark aesthetic and unified symmetrical Navbar (`Navbar.tsx`).
- [x] Deterministic validation API (`/api/validate`) with granular field-level errors.
- [x] AI Review API (`/api/review`) powered by Google Gemini with strict structured JSON mode.
- [x] Resilient offline heuristic engine (`simulatePolicyReview`) providing seamless zero-key fallback for evaluators.
- [x] Human-in-the-loop review interface with Approve/Edit/Reject state transitions and original listing details inspector.
- [x] Full UI state coverage: Loading skeletons, Empty states, Field-level validation banners, Success states, and Error boundaries.
- [x] History audit center with live search, status filtering (Approved/Rejected/Partial), 1-click JSON export, and clear action.
- [x] Local storage data persistence for review logs and listings across browser reloads.
- [x] Structured logger emitting JSON audit trails for validation and AI cycles.
- [x] 16 automated unit tests covering all deterministic business rules in 0.8s.
- [x] Comprehensive documentation (`README.md`, `AGENT_USAGE.md`, `.env.example`) with security audit and bypass patch notes.

### ⏸️ Intentionally Excluded Scope (Rationale)
- **External PostgreSQL / Redis:** Excluded in favor of client-side local storage and in-memory caches to keep the repository self-contained, zero-dependency, and immediately runnable for reviewers without Docker setup.
- **Seller Auth / OAuth2 (JWT):** Excluded to prioritize the core AI review & human moderation workflow within the 48-hour assessment window.
- **Multimodal Image OCR / Computer Vision:** Image moderation was excluded to focus depth on text policy semantics, structured citations, and edge-case validation.

---

## 🚀 Local Setup & Environment

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node.js v26)
- **npm**: v9.0.0 or higher
- **Google Gemini API Key**: Free tier key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd aggroso-async-task
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and insert your Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_real_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🧪 Testing Strategy

Focused automated unit tests validate the deterministic business rules and edge cases without mocking external networks.

To run the test suite:
```bash
npm test
```

### Test Coverage Highlights (`src/__tests__/validator.test.ts`):
- **Title Rules (Section 2.1):** Empty titles, < 5 chars, > 80 chars, contact numbers in title, valid titles.
- **Price Rules (Section 2.3):** Empty price, non-numeric price, zero price, negative price, valid positive floating-point price.
- **Description Rules (Section 2.2):** Under 50 chars, descriptions containing URLs/links, valid compliant descriptions.
- **Duplicate Prevention (Section 4.2):** Duplicate listing by same seller rejected; same title by different seller permitted.
- **Full Clean Listing:** Complete end-to-end listing passing with 0 validation errors.

---

## 📈 Structured Logging & Observability

All operational actions emit structured logs to the console (`src/lib/logger.ts`) facilitating observability and audit tracking:

```json
[INFO] 2026-10-11T07:26:19.331Z — validate_request { "listingId": "1" }
[INFO] 2026-10-11T07:26:19.332Z — validate_complete { "listingId": "1", "errorsCount": 0 }
[AI]   2026-10-11T07:26:19.335Z — gemini_request_start { "listingId": "1", "title": "Apple iPhone..." }
[AI]   2026-10-11T07:26:26.720Z — gemini_request_success { "listingId": "1", "findingsCount": 5, "overallScore": 30 }
```

In production, these events map directly into Datadog, CloudWatch, or OpenTelemetry pipelines.

---

## ⚠️ Known Limitations & Production Roadmap

1. **In-Memory / LocalStorage Persistence:** In a production multi-tenant deployment, listing records and review history should be persisted to PostgreSQL (e.g., Supabase / Neon) with row-level security.
2. **Rate Limiting:** Production deployments require Redis-backed Token Bucket rate limiting on `/api/review` to prevent abusive automated traffic.
3. **Queue-Based Async Review:** For massive volume (> 100k listings/day), AI reviews should be offloaded to an asynchronous message queue (e.g., BullMQ / AWS SQS / Inngest) with Webhook notifications.
4. **Multimodal Analysis:** Extending the AI pipeline to analyze listing photos with Gemini Multimodal to detect counterfeit logos and prohibited physical items.

---

## 🌐 Deployment Details

### Deploying to Vercel (Recommended)
1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
4. Click **Deploy**. Vercel will detect Next.js Turbopack and build the production bundle automatically.
