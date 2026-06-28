# Design: Server-Side Tables & Form Pages

**Date:** 2026-06-16
**Status:** Approved

## Overview

Replace all 8 plain shadcn table pages with TanStack Table v8-powered tables that support server-side sort, search, pagination, and filters. Move all forms that currently open in Sheet/Dialog overlays to dedicated full-page routes.

## Scope

### Tables upgraded (8 pages)
`/leads`, `/customers`, `/bookings`, `/dishes`, `/ingredients`, `/users`, `/quotations`, `/invoices`

### Form pages created (6 new routes)
- `/dishes/new` — replaces DishSheet add mode
- `/dishes/[id]/edit` — replaces DishSheet edit mode (Details + Recipe tabs)
- `/ingredients/new` — replaces IngredientSheet add mode
- `/ingredients/[id]/edit` — replaces IngredientSheet edit mode
- `/users/new` — replaces AddUserDialog
- `/users/[id]/edit` — replaces EditUserDialog + ViewUserDialog (merged)

---

## Section 1: Backend

### Shared paginated response

New file: `backend/schemas/pagination.py`

```python
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int       # total matching documents
    page: int        # 1-indexed current page
    page_size: int
    pages: int       # ceil(total / page_size)
```

### New query params on all 8 list endpoints

Added to every `GET ""` handler:

| Param | Type | Default |
|---|---|---|
| `page` | `int` (≥1) | `1` |
| `page_size` | `int` (1–100) | `20` |
| `sort_by` | `str` | entity-specific (see below) |
| `sort_dir` | `"asc" \| "desc"` | `"desc"` |
| `search` | `str \| None` | `None` |

Existing filters stay:
- leads: `status`
- dishes: `is_veg`, `active_only`
- ingredients: `active_only`
- quotations / invoices: `booking_id`, `status`

### Default sort fields per entity

| Entity | Default `sort_by` |
|---|---|
| leads | `created_at` |
| customers | `created_at` |
| bookings | `created_at` |
| dishes | `name` |
| ingredients | `name` |
| users | `name` |
| quotations | `created_at` |
| invoices | `created_at` |

### Sortable fields per entity

- **leads:** `name`, `created_at`, `approx_date`, `status`
- **customers:** `name`, `created_at`
- **bookings:** `title`, `status`, `created_at`
- **dishes:** `name`, `category`, `selling_price`, `per_plate_cost`
- **ingredients:** `name`, `cost_per_unit`, `stock_on_hand`
- **users:** `name`, `email`, `role`
- **quotations:** `created_at`, `total`, `status`
- **invoices:** `created_at`, `total`, `status`

### Search fields per entity

| Entity | Fields searched |
|---|---|
| leads | `name`, `phone`, `email` (already exists, keep) |
| customers | `name`, `phone`, `email` (already exists, keep) |
| bookings | `title` (new) |
| dishes | `name`, `category` (new) |
| ingredients | `name`, `supplier` (new) |
| users | `name`, `email` (new) |
| quotations | — (no search; filter by status/booking_id is enough) |
| invoices | — (no search; filter by status/booking_id is enough) |

### MongoDB query pattern

```python
skip = (page - 1) * page_size
direction = 1 if sort_dir == "asc" else -1

total = await Model.find(filter).count()
items = (
    await Model.find(filter)
    .sort([(sort_by, direction)])
    .skip(skip)
    .limit(page_size)
    .to_list()
)
pages = math.ceil(total / page_size) if total > 0 else 1

return PaginatedResponse(
    items=[_response(i) for i in items],
    total=total,
    page=page,
    page_size=page_size,
    pages=pages,
)
```

### Validation

`sort_by` values are validated against a per-entity allowlist; unknown field returns HTTP 400. `page_size` clamped to 1–100.

---

## Section 2: Frontend — Shared Infrastructure

### Install

```
npm install @tanstack/react-table
```

### `lib/use-data-table-state.ts`

Hook that reads/writes URL search params via Next.js `useSearchParams` + `useRouter`.

**Exposes:**
```ts
{
  page: number           // 1-indexed
  pageSize: number
  sortBy: string
  sortDir: "asc" | "desc"
  search: string
  setPage: (n: number) => void
  setPageSize: (n: number) => void
  setSort: (by: string, dir: "asc" | "desc") => void
  setSearch: (q: string) => void
}
```

URL example: `?page=2&page_size=20&sort_by=name&sort_dir=asc&search=biryani`

Each setter uses `router.push` with the new params merged, preserving other params. Browser back/forward navigates table state.

### `components/ui/data-table.tsx`

Shared headless TanStack Table wrapper around existing shadcn `Table` primitives.

**Props:**
```ts
{
  columns: ColumnDef<TData>[]
  data: TData[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSortChange: (by: string, dir: "asc" | "desc") => void
  sortBy: string
  sortDir: "asc" | "desc"
  isLoading?: boolean
  emptyState?: React.ReactNode
}
```

**Renders:**
- Column headers: clickable, show `ChevronUp` / `ChevronDown` / unsorted icon based on current sort
- Rows: same DLS tokens as current tables (`bg-surface-high` hover, `border-outline-low` dividers)
- Pagination row: `← Prev` · `Page X of Y` · `Next →` · rows-per-page `<Select>` (options: 10, 20, 50)
- Loading: shows `<TableSkeleton>` in place of rows
- Empty: renders `emptyState` prop in a full-width cell

---

## Section 3: Frontend — Updated List Pages

Each of the 8 list pages is refactored to:

1. Import `useDataTableState` and pass its values to the API hook
2. Declare a `columns` array with TanStack `ColumnDef`
3. Render `<DataTable>` instead of the raw `<Table>` block
4. Add a search `<Input>` above the table (where search is supported)
5. Keep existing status/filter tabs (leads, dishes, etc.)

### Column definitions summary

**Leads:** Name (sort), Phone, Event Type, Date (sort), Status (sort), Actions  
**Customers:** Name (sort), Phone, Email, Notes (truncated), Actions  
**Bookings:** Title (sort), Customer, Status (sort), Created (sort), Actions  
**Dishes:** Name (sort), Category (sort), Type (veg badge), Price (sort), Active, Actions  
**Ingredients:** Name (sort), Unit, Cost/Unit (sort), Supplier, Stock (sort + red if low), Actions  
**Users:** Name (sort), Email (sort), Role badge, Status badge, Actions  
**Quotations:** Booking, Status (sort), Total (sort), Valid Until, Created (sort), Actions  
**Invoices:** Booking, Status (sort), Total (sort), Due Date, Created (sort), Actions  

API hooks updated to accept `{ page, pageSize, sortBy, sortDir, search, ...existingFilters }` and return `PaginatedResponse<T>`.

---

## Section 4: Frontend — New Form Pages

### Route map

| Route | Component | Notes |
|---|---|---|
| `/dishes/new` | `DishNewPage` | Create form; on success → `/dishes` |
| `/dishes/[id]/edit` | `DishEditPage` | Details + Recipe tabs; fetches dish by ID |
| `/ingredients/new` | `IngredientNewPage` | Create form; on success → `/ingredients` |
| `/ingredients/[id]/edit` | `IngredientEditPage` | Edit form; fetches ingredient by ID |
| `/users/new` | `UserNewPage` | 4-field create form (owner only); on success → `/users` |
| `/users/[id]/edit` | `UserEditPage` | Name + role edit + deactivate action; on success → `/users` |

### Page layout pattern

Every new form page follows this structure:

```
← Back to [Entity]           (link, top-left)
[Page title]                 (h1)
[Form card]                  (max-w-xl, bg-surface-high)
  [Fields]
  [Cancel] [Save / Create]   (action row, right-aligned)
```

### Removed from list pages

- `dishes/page.tsx`: remove `DishSheet`, `sheetOpen`, `sheetMode` state
- `ingredients/page.tsx`: remove `IngredientSheet`, `sheetOpen`, `sheetMode` state
- `users/page.tsx`: remove `AddUserDialog`, `EditUserDialog`, `ViewUserDialog`

Add Button on each list page becomes `router.push("/entity/new")`.
Edit/View action buttons become `router.push("/entity/[id]/edit")`.

---

## Implementation Order

1. `backend/schemas/pagination.py` — shared generic
2. Backend: update all 8 list endpoints (add params + paginated response)
3. Frontend: install `@tanstack/react-table`
4. Frontend: `lib/use-data-table-state.ts`
5. Frontend: `components/ui/data-table.tsx`
6. Frontend: update API hooks (8 hooks) to pass params + consume `PaginatedResponse`
7. Frontend: update all 8 list pages to use `<DataTable>`
8. Frontend: create 6 new form pages
9. Frontend: remove Sheet/Dialog code from dishes, ingredients, users list pages
