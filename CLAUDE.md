# Ziyafat ERP — Claude Instructions

## Project Overview

Ziyafat is a single-tenant SaaS ERP for Hyderabadi catering businesses. It covers leads, bookings, events, dish catalogs, quotations, invoices, and a public storefront. Built with Next.js 15 (frontend) and FastAPI (backend).

## Repository Structure

```
Ziyafat/
├── frontend/     ← Next.js 15 + shadcn/ui + Tailwind v4
└── backend/      ← FastAPI + Beanie + MongoDB
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| Forms | react-hook-form + zod |
| Data fetching | TanStack Query v5 |
| Backend | FastAPI (Python 3.12+) |
| Database | MongoDB via Beanie ODM (async) |
| Auth | Custom JWT — httpOnly cookies |
| PDF | WeasyPrint (server-side) |
| Storage | Cloudinary |
| Deployment | Vercel (frontend) + Render (backend) |

## Git Commit Rules

**NEVER add `Co-Authored-By` or any Claude attribution to commit messages.**

Commit messages must contain only:
- The conventional commit subject line (e.g. `feat: add login page`)
- An optional body if needed for context

No trailers, no signatures, no AI attribution of any kind.

## Development Workflow

### Backend (FastAPI)

```bash
cd backend
venv\Scripts\activate          # Windows
uvicorn main:app --reload      # dev server on :8000
pytest                         # run all tests
```

> **Planned:** Migrate to `uv` for package management (`uv sync`, `uv run`).

### Frontend (Next.js)

```bash
cd frontend
npm run dev                    # dev server on :3000
npm run build                  # production build
```

### Package manager

- Backend: pip + venv (migrating to `uv`)
- Frontend: npm

## Code Conventions

### Backend

- All routes prefixed `/api/v1/`
- Business logic in `services/`, route handlers stay thin
- Beanie models in `models/`, routers in `routers/`, shared deps in `dependencies.py`
- JWT tokens stored in httpOnly cookies — never localStorage
- Tests use `mongomock-motor` for in-memory MongoDB, `pytest-asyncio` with `asyncio_mode = auto`
- `JWTError` re-exported from `core/security.py` — callers import from there, not from `jwt` directly

### Frontend

- All shadcn components in `components/ui/`
- All forms use `react-hook-form` + `zod` via shadcn `Form`
- API calls use `lib/api.ts` typed fetch wrapper (sets `credentials: "include"`)
- DLS colors via CSS variables — use Tailwind classes like `bg-surface`, `text-on-surface`, `border-outline`
- Org theme injected at runtime via `lib/dls/tokens.ts` `applyOrgTheme()`
- No direct `fetch()` calls in components — always go through `lib/api.ts`

### Design Language System (DLS)

M3-style surface token naming — use these Tailwind classes:

| Class | Use |
|---|---|
| `bg-surface-lowest` to `bg-surface-highest` | Background elevations |
| `bg-surface-dim` / `bg-surface-bright` | Special surface states |
| `text-on-surface` | Primary text |
| `text-on-surface-medium` | Secondary text |
| `text-on-surface-low` | Muted/placeholder text |
| `border-outline` | Default borders |
| `border-outline-low` | Subtle dividers |
| `bg-primary` / `text-on-primary` | Brand/accent buttons |

## What NOT to do

- Do not add `Co-Authored-By` or Claude attribution to any commit
- Do not push `docs/` or `pre-plan.MD` to git (they are in `.gitignore`)
- Do not use `localStorage` for JWT tokens — httpOnly cookies only
- Do not add GST compliance or payments — out of scope for Phase A
- Do not add WhatsApp/SMS integration — out of scope for Phase A
- Do not use multi-tenancy patterns — single-tenant for now
- Do not add `@media print` styles outside `globals.css`
- Do not call FastAPI directly from Next.js Server Components — thin client pattern only (TanStack Query from client components)
