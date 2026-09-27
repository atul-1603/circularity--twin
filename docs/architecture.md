# Architecture — Circularity Twin

## System Overview

Single-page React app (Vite + Tailwind) calling a FastAPI backend. No database
yet — all data is in-memory or seeded statically. The page is divided into six
sections that all react to the same Input state.

```
┌─────────────┐        POST /api/match       ┌──────────────┐
│  React SPA  │ ──────────────────────────── → │   FastAPI    │
│  (Vite)     │ ← ─────────────────────────── │   Backend    │
│             │        POST /api/allocate     │              │
│  Sections:  │ ──────────────────────────── → │  Services:   │
│  Input      │        POST /api/emissions    │  matching ✅ │
│  Matching   │ ──────────────────────────── → │  allocation  │
│  Allocation │        POST /api/comparison   │  emissions   │
│  Ledger     │ ──────────────────────────── → │              │
│  Comparison │                                └──────────────┘
│  About      │
└─────────────┘
```

## Section Status

| Section | Frontend | Backend | Status |
|---------|----------|---------|--------|
| **Input** | ✅ Real interactive form | N/A (client-side state) | **Fully implemented** |
| **Matching** | ✅ Real UI with live API calls | ✅ Real eligibility engine | **Fully implemented** |
| **Allocation** | ✅ Styled UI | ⚠️ Returns mock data | Mock — TODO: linear optimizer |
| **Emissions Ledger** | ✅ Styled UI | ⚠️ Returns mock data | Mock — TODO: real calculation |
| **Comparison** | ✅ Styled UI | ⚠️ Returns mock data | Mock — TODO: wire to real allocation + emissions |
| **About/Methodology** | ✅ Static content | N/A | Complete |

## Data Flow

1. User edits Input section (waste type, quantity, location, composition, moisture).
2. After 300ms debounce, frontend fires `POST /api/match` with the `WasteStream` payload.
3. Backend `matching.py` evaluates each seeded `Pathway` against the composition
   and moisture, returning eligibility status + fit score.
4. Frontend simultaneously fires mock endpoints (`/api/allocate`, `/api/emissions`,
   `/api/comparison`) which return realistic but static data — these will be
   replaced with real implementations in future sessions.

## Key Design Decisions

- **Deterministic scoring:** `fit_score` and `confidence_band` use explicit formulas
  (documented in `matching.py`) with no randomness, so demo results are reproducible.
- **Composition redistribution:** When one composition slider moves, the delta is
  redistributed proportionally across the remaining sliders to maintain sum ≈ 100%.
- **Error shape:** All API errors return `{ "error": string, "field": string }` for
  consistent frontend handling.
