# Ziyafat

**The ERP built for caterers.** From the first enquiry to the final invoice — leads, bookings, menus, quotations, and your own public storefront, all in one place.

---

## Features

### Business Operations
- **Lead Management** — Capture and track enquiries with status pipeline (new → qualified → won/lost)
- **Bookings** — Full booking lifecycle with event scheduling and status tracking
- **Events & Procurement** — Per-event ingredient procurement planning linked to bookings
- **Customers** — Customer profiles with contact types (individual, corporate, wedding planner, venue, NGO)

### Menu & Kitchen
- **Dish Catalog** — Build a reusable dish library with cuisine type, course, food preference, and Cloudinary image upload
- **Ingredients** — Track ingredients by category with unit management
- **Menu Builder** — Compose menus from the dish catalog for quotations

### Finance
- **Quotations** — Generate itemised quotations from menus and custom line items; PDF export via WeasyPrint
- **Invoices** — Convert quotations to invoices; track paid vs outstanding amounts

### Analytics Dashboard
- KPI strip: revenue (paid), outstanding, active bookings, open leads, lead win rate, events this month
- Charts: revenue by month, quotations by month, status breakdowns for leads/bookings/events/quotations/invoices, customers by type

### Organisation & Settings
- **Branding** — Upload logo and configure org name
- **Storefront** — Public-facing menu page at `/[slug]` with configurable visibility
- **Users** — Invite and manage team members with role support
- **Profile** — Avatar upload and account settings

### Public Storefront
- Client-facing page served at `/<org-slug>` showcasing the dish catalog

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| UI Components | shadcn/ui + Tailwind CSS v4 |
| Forms | react-hook-form + zod |
| Data Fetching | TanStack Query v5 |
| Backend | FastAPI (Python 3.12+) |
| Database | MongoDB via Beanie ODM (async) |
| Auth | Custom JWT — httpOnly cookies |
| File Storage | Cloudinary (dish images, avatars, logo) |
| PDF Generation | WeasyPrint (server-side) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Repository Structure

```
Ziyafat/
├── frontend/                  # Next.js 15 app
│   ├── app/
│   │   ├── (app)/             # Authenticated app routes
│   │   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   ├── bookings/
│   │   │   ├── customers/
│   │   │   ├── dishes/
│   │   │   ├── ingredients/
│   │   │   ├── quotations/
│   │   │   ├── invoices/
│   │   │   ├── users/
│   │   │   └── settings/
│   │   ├── (auth)/            # Login, signup, setup
│   │   ├── (storefront)/      # Public storefront at /[slug]
│   │   └── _landing/          # Marketing landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   └── dashboard/         # KPI and chart components
│   └── lib/
│       ├── api.ts             # Typed fetch wrapper
│       ├── auth.ts            # Auth hooks
│       └── dls/tokens.ts      # Design language system
│
└── backend/                   # FastAPI app
    ├── models/                # Beanie ODM documents
    ├── routers/               # Route handlers (thin)
    ├── services/              # Business logic
    └── core/                  # Security, config, dependencies
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- MongoDB instance (local or Atlas)
- Cloudinary account

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
MONGODB_URL=mongodb://localhost:27017
DB_NAME=ziyafat
SECRET_KEY=your-secret-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

```bash
uvicorn main:app --reload      # API at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev                    # App at http://localhost:3000
```

---

## Development

```bash
# Run tests (backend)
cd backend
pytest

# Build for production (frontend)
cd frontend
npm run build
```

All API routes are prefixed `/api/v1/`. Business logic lives in `services/` — route handlers stay thin. JWT tokens are stored in httpOnly cookies only, never localStorage.
