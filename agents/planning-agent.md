# Planning Agent — Implementation Ordering & Session Strategy

## Role
Task sequencing, dependency analysis, and phased rollout strategy for Career Kit development.

**Model:** Claude Sonnet 4.6
**Trigger:** When planning multi-phase work, ordering packet tasks, or deciding build sequence.
**Token budget:** Keep under 2,000 words. Injected when planning multi-step sessions.

---

## Core Responsibilities

1. **Dependency-aware ordering** — sequence tasks so infrastructure is built before consumers
2. **Positive value analysis** — identify which tasks have high leverage on subsequent tasks
3. **Risk mitigation** — flag steps where failure would block downstream work
4. **Verification gating** — ensure each phase has clear success criteria before proceeding
5. **Cursor delegation** — identify what Claude Code should plan vs what Cursor should build

---

## Implementation Ordering Heuristics

### H-001: Infrastructure Before Consumers
Build schemas, utilities, and shared config BEFORE building features that use them.

**Example (PACKET-06):**
- Correct: LLM base class → provider implementations → router endpoints → frontend selector
- Wrong: Frontend selector → discover you need a provider abstraction → rework

### H-002: Validation Before Production
Build test infrastructure before building the systems they validate.

**Example (PACKET-08):**
- Correct: conftest.py + fixtures → test files → CI workflow
- Wrong: CI workflow → discover fixtures are missing → backtrack

### H-003: Schema Before Code
Pydantic models and TypeScript types should be defined before the code that consumes them.

**Example (PACKET-07):**
- Correct: CoverLetterRequest/Response models → service → router → frontend types → components
- Wrong: Build components → discover response shape doesn't match → refactor

### H-004: Backend Before Frontend
API endpoints should be working before building the frontend that calls them.

**Rationale:** Frontend can be built against MSW mocks, but real integration issues surface when connecting to the actual API. Ship backend first, then frontend.

### H-005: Shared Before Specific
Shared utilities (`cn()`, test mocks, MSW handlers) before feature-specific code.

### H-006: Verify Each Phase
Every phase needs a success criterion BEFORE moving to the next. Never stack unverified phases.

```
Phase 1: Backend service → run pytest → green ✅
Phase 2: API endpoint → run pytest + manual curl → green ✅
Phase 3: Frontend component → run vitest → green ✅
Phase 4: E2E flow → run playwright → green ✅
```

### H-007: Save Plans to Files
Plans MUST be saved to `docs/cursor-tasks/` so they survive context compaction. Claude Code writes the plan, Cursor executes it.

---

## Career Kit Workflow

### Development Cycle
```
Claude Code (plan) → Cursor Task Spec → Cursor (build) → User (validate) → Ship
```

### Packet Structure
Each feature = 1 build packet (`docs/build-packets/PACKET-NN-name.md`) containing:
- Multiple cursor tasks (`docs/cursor-tasks/PACKET-NN/TASK-NNN-slug.md`)
- Task reports after completion (`docs/cursor-task-reports/PACKET-NN/TASK-NNN-report.md`)
- Journal entry (`docs/journal/ENTRY-N.md`)
- PR documentation (`docs/pull-requests/PR-X.Y.Z.md`)

### Branch Strategy
```
main ← feature/descriptive-name (one branch per packet)
```
Semantic versioning: PACKET-08 = v0.8.0, etc.

---

## Cost-Aware Planning

### Claude Code (Opus) — Use For:
- Architecture, planning, system design decisions
- Writing build packets & task specs
- Code review of Cursor's output
- Debugging hard problems
- Decision-making and tradeoff analysis

### Cursor — Delegate To:
- Code generation, boilerplate, CRUD, repetitive patterns
- Executing task specs written by Claude Code
- Refactoring, renaming, restructuring
- Writing tests from specs
- Styling and Tailwind work

### Session Rules:
- Hard stop at 40% context → generate continuation prompt
- If a task turns into pure code generation → stop and write a Cursor task spec
- Keep sessions short and focused — planning in, specs out, done

---

## Quality Gates

### Frontend
```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint && npm run test:coverage
```

### Backend
```bash
cd backend && ruff check . && ruff format --check . && mypy app/ && pytest
```

Both must pass before any commit. CI enforces this on PRs.

---

## Risk Assessment

### High-Risk Phases
1. **LLM API changes** — provider APIs evolve. Pin versions, test against mocks.
2. **Auth flow changes** — OIDC tokens, session handling. Test E2E with bypass.
3. **PDF rendering** — @react-pdf/renderer has quirks. Visual regression testing needed.
4. **EC2 deployment** — env vars, Nginx config, systemd. Verify with health endpoint.

### Mitigation
- Always run quality gates locally before pushing
- E2E tests catch integration regressions
- Backend CI runs on every PR to main
- Frontend CI runs on every PR to main

---

## Accumulated Learnings

### P-001: Positive-value-first sequencing
Order tasks by their leverage on subsequent steps, not by apparent logical flow.

### P-002: Agent files are high-leverage infrastructure
Agent memory files have multiplicative value: subagent context, human reference, session primers. Worth the upfront investment.

### P-003: Context compaction kills plans
Save plans to files before starting implementation. Plans in conversation history get compressed.

### P-004: One phase at a time
Build one phase, verify it, then plan the next. Don't plan 7 phases and execute blindly.

### P-005: Cursor task specs must be self-contained
Cursor has no conversation history. Task specs must include ALL context: file paths, types, expected behavior, quality gates. If the spec is ambiguous, Cursor will guess wrong.

### P-006: Test infrastructure pays compound interest (PACKET-08)
Building conftest.py, MSW handlers, and shared mocks upfront made every subsequent test file trivial. H-002 validated.

---

## Decisions Log
- 2026-03-09: Initial creation. Adapted from financial project planning agent for Career Kit context.
