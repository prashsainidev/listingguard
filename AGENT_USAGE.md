# AGENT_USAGE.md — AI Agent Collaboration & Verification Log

> **Repository Requirement:** Transparent disclosure of AI agent tools, representative prompts, delegated work, critical mistakes/corrections, and verification processes.

---

## 1. Tools & Models Used

- **Primary Agentic Environment:** Google Antigravity Agentic IDE
- **Core Models:**
  - Claude Sonnet 4.6 (Thinking) — Used for architectural planning, system design, and component decomposition.
  - Gemini 3.1 Pro (High) — Used for debugging, terminal verification, and Gemini API integration refinement.
- **Underlying Capabilities:**
  - File generation & AST-based multi-file editing
  - Integrated terminal execution with non-blocking background workers
  - Static analysis & TypeScript type-checker feedback loops

---

## 2. Representative Prompts

### Phase 1: Problem Decomposition & Architectural Scoping
```text
"Here are the company requirements for a marketplace listing quality reviewer.
We need:
1. Usable frontend, working backend, data persistence
2. Functional AI agent / LLM workflow with human review / approval for important AI actions
3. Clear loading, empty, validation, success, and failure states
4. Structured logging and focused tests for important behaviour
5. Ready for deployment

What architecture should we use to avoid wasting LLM tokens on trivial bugs, and how do we ensure the human reviewer always maintains executive authority?"
```

### Phase 2: Dual-Stage Defense Implementation
```text
"Create a deterministic validator in `src/lib/validator.ts` that enforces Section 2.1 (Title length 5-80, no phone numbers), Section 2.2 (Description length > 50, no URLs), and Section 2.3 (Price must be positive numeric). 
Ensure it runs before calling the Gemini AI API, saving cost and eliminating unnecessary latency."
```

### Phase 3: Structured Gemini AI Policy Review
```text
"Integrate Gemini with strict JSON schema mode (`responseMimeType: 'application/json'`) and low temperature (0.2). Send both the listing data and the hardcoded 6-section Marketplace Policy document. 
Require Gemini to cite the exact policy section and output actionable suggestions for each finding."
```

### Phase 4: Human-in-the-Loop Review Workflow
```text
"Build a review screen (`/review`) that displays AI findings with clear severity badges (Critical, Warning, Info). 
Each finding must have Approve, Edit, and Reject actions. The user must be able to change status and commit the finalized review to persistent storage."
```

---

## 3. Delegated Work vs. Human Engineering Decisions

| Dimension | Delegated to AI Agent | Human Engineering Decisions |
|---|---|---|
| **System Architecture** | Boilerplate generation, API route structure, TypeScript interface definitions | Decided on the two-stage defense (Deterministic Regex -> LLM Semantic Review); Mandated strict Human-in-the-Loop decision flow |
| **Marketplace Policy** | Initial markdown outline | Defined strict clauses: counterfeit bans, medical cures, bait pricing, mandatory attributes |
| **Testing** | Test case boilerplate generation | Selected business-critical edge cases (regex bypass, duplicate seller collisions, boundary lengths) |
| **Styling & UI** | Shadcn UI component installation & Tailwind dark mode styling | Preserved high-contrast accessibility and clean badge visual hierarchy |

---

## 4. Important Agent Mistakes & Rejected Suggestions (Pivots)

During development, several agent suggestions were caught, rejected, or re-engineered:

### ⚠️ Mistake 1: Rollup Native Dependency Conflict with OS Policies
- **What happened:** The agent initially installed Vitest for unit testing. When running `npm test`, Windows Application Control (WDAC / AppLocker) blocked the native DLL binary (`@rollup/rollup-win32-x64-msvc.node`), returning `ERR_DLOPEN_FAILED`.
- **Agent's initial reaction:** Attempted to reinstall npm packages with `--legacy-peer-deps`.
- **Engineer correction:** Rejected the bloated external runner. Instead, leveraged Node.js 26's built-in `node:test` and `tsx --test`. This eliminated all native binary bloat, resulting in **16 tests running in 0.9 seconds** with zero external dependencies.

### ⚠️ Mistake 2: Deprecated / Mismatched Gemini Model Endpoint
- **What happened:** The agent hardcoded `gemini-1.5-flash` in the API URL. In the active 2026 API version, this returned `404 Not Found`.
- **Engineer correction:** Ran an introspection query on `ModelService.ListModels` to inspect the active models on the key. Updated the configuration to `gemini-flash-latest` with `generationConfig: { responseMimeType: "application/json" }`. Verified the live API with a standalone Node script before deploying it to the UI.

### ⚠️ Mistake 3: Mobile Viewport Collision on 320px Constraints
- **What happened:** On narrow viewports (320px width), duplicate navigation headers across routes wrapped "New Review" onto two vertical lines (`New \n Review`) while active pills crowded out adjacent links.
- **Engineer correction:** Extracted a unified `<Navbar />` component with `whitespace-nowrap`, icon symmetry (`Plus` and `History`), and responsive label folding (`New` on mobile, `New Review` on desktop). Verified via headless browser recordings at exact 320x600 resolution.

### ⚠️ Mistake 4: Hard API Key Dependency Blocking Offline Evaluators
- **What happened:** Evaluators cloning the repository without an immediate Gemini API key would receive blocking 500 error boundaries on the review screen.
- **Engineer correction:** Architected `simulatePolicyReview`, an offline deterministic heuristic policy engine that automatically activates when `GEMINI_API_KEY` is omitted or rate-limited. Flags exact policy sections and realistic scores without network dependency.

---

## 5. How the Output Was Verified

Verification followed an empirical multi-step pipeline:

1. **Automated Rule Verification:**
   - Ran `npm test` verifying 16 test cases across title limits, description URLs, negative prices, and duplicate detection in <1s.
2. **Production Build Integrity:**
   - Executed `npm run build` with Turbopack and TypeScript strict mode. Zero build errors or warnings.
3. **Live API End-to-End Simulation & Heuristic Fallback:**
   - Tested live queries against Google Gemini API with structured JSON schema mode, and verified that removing the API key smoothly falls back to local heuristic policy audit without breaking the UI.
4. **Interactive Browser UX Audits (320px to Desktop):**
   - Verified **Deterministic Validation Layer**: Immediate red banners on contact numbers and links.
   - Verified **Original Listing Context**: Tested the new collapsible listing inspector on `/review`.
   - Verified **Human-in-the-Loop Decisions**: Approved, rejected, and edited findings with state persistence.
   - Verified **Audit History Management**: Tested live search, status filtering, and 1-click JSON report export.
5. **Negative-Path Security Testing:**
   - Ran a structured bypass audit against the deployed app. Identified and patched 4 vulnerabilities: phone regex bypass (spaced digits evading `\d{10}`), URL bypass (bare `www.` without `http://`), decimal price truncation (`parseInt` → `parseFloat`), and blank-edit approval guard. All fixes re-verified with `npm run check` (16/16 tests passing) before final submission.
