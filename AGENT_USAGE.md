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
| **System Architecture** | Boilerplate generation, API route structure, TypeScript interface definitions | Chose the two-stage defense model — deterministic rules first, then AI — because calling Gemini on every keystroke would waste quota and money. The AI should only see listings that already pass basic sanity checks. |
| **Marketplace Policy** | Initial markdown outline | Wrote the actual policy clauses myself — counterfeit bans, medical cure restrictions, bait pricing rules. These needed real editorial judgment, not just structure. |
| **Testing** | Test case boilerplate | Chose which edge cases actually mattered: regex bypass with spaced phone numbers, duplicate seller collisions, boundary lengths at exactly 5 and 80 characters. The agent would not have known which gaps were real risks. |
| **History & Inspect UI** | Component scaffolding | Decided to add live search, status filtering, and a collapsible listing inspector — none of these were in the spec. I added them because a moderation tool without these features would not be usable in a real environment. |

---

## 4. Important Agent Mistakes & Rejected Suggestions

These are the moments where I had to step in and course-correct. I'm documenting them honestly because they show where human judgment still matters in AI-assisted development.

### Mistake 1: Native Binary Conflict on Windows
The agent set up Vitest as the test runner. First run immediately crashed — Windows blocked the native DLL binary that Vitest depends on (`@rollup/rollup-win32-x64-msvc.node`). The agent's instinct was to try reinstalling with different flags. I rejected that path because the problem was not the install — it was bringing in a native binary at all. I switched to Node.js 26's built-in test runner with `tsx --test`. No native binaries, no OS conflicts. All 16 tests now run in under a second.

### Mistake 2: Hardcoded Deprecated Gemini Model
The review screen kept returning a blank error. Opening the server console showed a raw `404` coming back from the Gemini API. The agent had hardcoded `gemini-1.5-flash` — a model name that no longer exists in the 2026 API version. I wrote a quick standalone Node script to call `ListModels` on my API key and see what was actually available. Found the correct endpoint, updated the config, and verified it with a live test before wiring it back into the UI. The lesson: never trust hardcoded model names in fast-moving AI APIs.

### Mistake 3: Mobile Navigation Overlap at 320px
On narrow screens, the navigation header broke completely — "New Review" wrapped onto two lines and the active pill badge pushed other links out of view. The agent had built each page with its own separate header, so fixing one did not fix the others. I consolidated everything into a single shared `Navbar` component with responsive label folding — full label on desktop, shorter label on mobile. Verified with headless browser recordings at exactly 320x600 resolution.

### Mistake 4: Hard Dependency on API Key for Evaluators
The review screen would throw a hard 500 error if `GEMINI_API_KEY` was not set. That is a bad evaluator experience — someone cloning the repo to review it should not have to get an API key just to see the app work. I built a local heuristic fallback engine (`simulatePolicyReview`) that activates automatically when the key is missing or rate-limited. It flags real policy sections with realistic scores, so the human review workflow is fully testable without any external API.

---

## 5. How the Output Was Verified

I did not just run the build and call it done. Verification had multiple layers:

1. **Automated Rule Tests:** Ran `npm test` — 16 test cases covering title limits, URL detection, negative prices, and duplicate detection. All pass in under 1 second.

2. **Production Build Check:** Ran `npm run build` with Turbopack and TypeScript strict mode. Zero errors, zero warnings.

3. **Live API Verification:** Tested real Gemini API calls with the JSON schema mode active, then verified that removing the key gracefully switches to the offline engine without breaking any UI state.

4. **Browser UX Testing at Multiple Sizes:** Manually tested the full workflow on desktop and at 320px mobile width — form submission, validation banners, AI review loading, approve/edit/reject decisions, and history filtering.

5. **Negative-Path Security Testing:** Tried to break the validator intentionally — submitted phone numbers with spaces, bare `www.` URLs, decimal prices, and blank edit approvals. Found 4 bypasses, patched all of them, re-ran the full test suite to confirm nothing regressed.
