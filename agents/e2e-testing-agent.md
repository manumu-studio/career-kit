# E2E Testing Agent — Playwright Patterns & Conventions

## Role
Codifies E2E testing patterns for Career Kit. Ensures consistent Playwright test structure, selector strategy, fixture management, and auth handling across all specs.

**Model:** Claude Sonnet 4.6
**Trigger:** When writing or reviewing E2E tests, adding test-ids to components, or debugging Playwright failures.
**Token budget:** Keep under 2,000 words. Injected when working on E2E specs.

---

## Infrastructure

### Config
**File:** `frontend/playwright.config.ts`
- Base URL: `http://localhost:3010`
- Projects: Desktop Chrome (1280×720) + Pixel 5 mobile (393×851)
- Retries: 2 in CI, 0 locally
- Web servers: backend on 8000, frontend on 3010
- Auth bypass: `NEXT_PUBLIC_E2E_BYPASS_AUTH=true`

### Directory Structure
```
frontend/
├── e2e/
│   ├── fixtures/
│   │   └── sample_cv.pdf        # Test PDF for upload flows
│   ├── optimize.spec.ts          # Core upload → optimize → results flow
│   ├── cover-letter.spec.ts      # Cover letter generation
│   ├── comparison.spec.ts        # Provider comparison (needs 2+ LLM keys)
│   ├── history.spec.ts           # Analysis history
│   ├── auth.spec.ts              # Auth gate + bypass verification
│   ├── errors.spec.ts            # Error states (non-PDF, disabled buttons)
│   └── responsive.spec.ts        # Mobile viewport checks
├── playwright.config.ts
└── package.json                  # Scripts: test:e2e, test:e2e:ui
```

### Running Tests
```bash
# All E2E tests
cd frontend && npx playwright test

# Specific spec
npx playwright test e2e/optimize.spec.ts

# With UI mode (debugging)
npx playwright test --ui

# Headed browser (watch it run)
npx playwright test --headed
```

---

## Auth Bypass Strategy

Career Kit uses M2 OIDC auth. E2E tests bypass this via environment variable:

```typescript
// In playwright.config.ts
use: {
  baseURL: 'http://localhost:3010',
},
webServer: {
  command: 'NEXT_PUBLIC_E2E_BYPASS_AUTH=true npx next dev -p 3010',
  // ...
}
```

**In the app layout** (`frontend/src/app/(app)/layout.tsx`):
- When `NEXT_PUBLIC_E2E_BYPASS_AUTH=true`, the layout injects a mock session
- The mock session must satisfy the `Session` type (including `expires` field)
- No real OIDC flow runs during E2E tests

### Auth Test Patterns
```typescript
// Test that auth gate works (no bypass)
test('landing page shows sign-in', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Sign in')).toBeVisible();
});

// Test that bypass works (with bypass env)
test('home page accessible with bypass', async ({ page }) => {
  await page.goto('/home');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

---

## Selector Strategy

### Priority Order (most to least preferred)
1. **`getByRole()`** — accessible roles: `button`, `heading`, `textbox`, `link`
2. **`getByText()`** — visible text content
3. **`getByLabel()`** — form labels
4. **`getByPlaceholder()`** — input placeholders
5. **`getByTestId()`** — `data-testid` attribute (last resort)

### When to Use `data-testid`
- Dynamic content where text changes (e.g., score values)
- Containers with no semantic role (e.g., results panel)
- Elements that are structurally important but not user-facing text

### Naming Convention for test-ids
```
data-testid="[component]-[element]"

Examples:
data-testid="optimization-results"
data-testid="keyword-chip-missing"
data-testid="cover-letter-output"
data-testid="provider-selector"
data-testid="history-card-0"
data-testid="export-cv-button"
```

---

## Test Structure Patterns

### Standard Flow Test
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home');
  });

  test('happy path description', async ({ page }) => {
    // Arrange — set up state
    // Act — user interactions
    // Assert — verify outcomes
  });
});
```

### File Upload Pattern
```typescript
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('e2e/fixtures/sample_cv.pdf');
await expect(page.getByText('sample_cv.pdf')).toBeVisible();
```

### Waiting for API Responses
```typescript
// Wait for the optimization API to respond
const responsePromise = page.waitForResponse(
  (resp) => resp.url().includes('/optimize') && resp.status() === 200
);
await page.getByRole('button', { name: /optimize/i }).click();
await responsePromise;

// Now assert on results
await expect(page.getByTestId('optimization-results')).toBeVisible();
```

### Error State Pattern
```typescript
test('rejects non-PDF files', async ({ page }) => {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('e2e/fixtures/not_a_pdf.txt');
  // Assert error message or that upload is rejected
  await expect(page.getByText(/pdf/i)).toBeVisible();
});
```

---

## Fixture Management

### Current Fixtures
| File | Purpose | Location |
|------|---------|----------|
| `sample_cv.pdf` | Valid PDF for upload flows | `frontend/e2e/fixtures/` |

### Adding New Fixtures
- Keep fixtures minimal (small file size)
- Name descriptively: `sample_cv_minimal.pdf`, `job_description_tech.txt`
- Store in `frontend/e2e/fixtures/`
- Backend also has fixtures in `backend/tests/fixtures/` (for pytest, not Playwright)

---

## Environment Requirements

### For All E2E Tests
- Backend running on port 8000
- Frontend running on port 3010 with `NEXT_PUBLIC_E2E_BYPASS_AUTH=true`
- Backend `.env` with at least `ANTHROPIC_API_KEY`

### For Provider Comparison Tests
- **Minimum 2 LLM provider keys** configured in backend `.env`:
  - `ANTHROPIC_API_KEY` (required)
  - `OPENAI_API_KEY` or `GOOGLE_GEMINI_API_KEY` (at least one more)
- If only 1 provider is configured, "Run comparison" button stays disabled → test fails

### For History Tests
- `DATABASE_URL` configured (Neon PostgreSQL)
- May need seed data or a previous optimization run

---

## Anti-Patterns

### Never Do
- **Hard-coded waits** — use `waitForResponse()`, `waitForSelector()`, or Playwright auto-waiting
- **CSS selectors for content** — use role/text/label selectors instead of `.class-name`
- **Flaky assertions on timing** — don't assert loading spinners disappeared; wait for the final state
- **Test interdependence** — each test must work in isolation; no shared state between tests
- **Screenshots in assertions** — visual regression testing is a separate concern; E2E tests assert behavior

### Debugging Tips
- Use `--ui` mode for interactive debugging
- Use `page.pause()` to freeze execution and inspect
- Use `--headed` to watch the browser
- Check `test-results/` folder for failure screenshots (auto-captured)

---

## Coverage Map

| Page/Feature | Spec File | Flows Covered |
|---|---|---|
| Upload + Optimize | `optimize.spec.ts` | Upload PDF → paste JD → optimize → view results |
| Cover Letter | `cover-letter.spec.ts` | Generate cover letter with tone selection |
| Provider Comparison | `comparison.spec.ts` | Select 2 providers → compare → view results |
| History | `history.spec.ts` | View past analyses, navigate history |
| Auth | `auth.spec.ts` | Sign-in gate, E2E bypass verification |
| Error States | `errors.spec.ts` | Non-PDF rejection, disabled buttons |
| Responsive | `responsive.spec.ts` | Mobile viewport layout checks |

### Missing Coverage (candidates for future specs)
- PDF export download verification
- Company research flow (search → view report)
- Keyboard navigation / accessibility
- Multi-language (when i18n lands in PACKET-10)

---

## Decisions Log
- 2026-03-09: Initial creation. Codifies patterns from PACKET-08 testing suite implementation.
