<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working Flow

## 📁 Single Repository

Frontend and backend now live in **one Git repository**. Work directly in it —
there is no separate dev copy and no sync step.

```
ODS-Arts/                  ← repo root, Laravel 13 + Filament v4, git lives here
├── app/  routes/  database/  config/     ← backend
├── frontend/                             ← Next.js 16 + React 19 + Tailwind v4
│   ├── src/
│   ├── agents/                           ← these docs
│   └── .env.local                        ← frontend env (gitignored)
└── .env                                  ← Laravel env (gitignored)
```

## 🚀 Guidelines for AI Agents

1. **Edit in place.** Change files where they live: frontend work in `frontend/`,
   backend work in `app/`, `routes/`, `database/`. Both are part of the same
   commit — no copying between directories.
2. **Git from the repo root.** One repo, one history. Stage and commit from the
   root; a change touching both stacks belongs in a single commit.
3. **We own both stacks.** There is no backend teammate and no frontend-only
   restriction — a feature is finished when it works end to end. If the UI needs
   an endpoint that does not exist, build it in Laravel rather than mocking
   around it or reporting it as blocked.
4. **Build features as vertical slices**, in dependency order:
   migration → model + factory → API controller + Eloquent resource →
   route in `backend/routes/api.php` → Pest feature test → frontend types →
   service function → UI. Land it as one commit.
5. **Follow each stack's own rules.** PHP work obeys the Laravel Boost
   guidelines in the root `AGENTS.md` (artisan generators, Pint, Pest) and runs
   from `backend/`; frontend work obeys this file and runs from `frontend/`.
   Check `backend/routes/api.php` and sibling controllers for existing
   convention before adding anything.

> **Superseded:** the old `odsarts/` → `rsync` → `temp_repo/` flow and its
> `sync.sh` script are gone. Ignore any instruction to run a sync script or to
> commit from `temp_repo/`. That script excluded `.env.local`, which is why the
> frontend env file went missing when this repo was assembled.

## 🖥️ Running the Stack

Both servers must be up for the frontend to render live data.

| What | Where | Command |
|---|---|---|
| Laravel API (`:8000`) | repo root | `php artisan serve` |
| Next.js (`:3000`) | `frontend/` | `npm run dev` |
| Full backend stack | repo root | `composer run dev` (server + queue + logs + vite) |
| Production build | `frontend/` | `npm run build` |

`npm run build` prerenders pages that fetch from the API, so **start Laravel
first** — otherwise the build fails on a fetch error rather than a code error.

## 🔌 Data Layer & Mock Flags

`frontend/.env.local` controls where the frontend reads data from. It is
gitignored, so it does not travel with the repo — recreate it when cloning.

- `NEXT_PUBLIC_API_URL` — Laravel origin (default `http://localhost:8000/api/v1`).
- `NEXT_PUBLIC_USE_MOCK_DATA` — governs only the verticals Laravel actually
  serves: **products** and **collections**.

The mock layer is scaffolding for endpoints **we have not built yet**, not a
permanent fixture. Three of the four verticals are now live (their routes exist
in `backend/routes/api.php` and their flags ship as `true` in `.env.local`).
Only one remains on mock, and it must keep defaulting to mock so the app stays
green until its backend lands:

| Service | Flag | Status |
|---|---|---|
| `lib/services/art.ts` | `NEXT_PUBLIC_ART_API_READY` | **Live** — `/art`, `/art/:slug` |
| `lib/services/search.ts` | `NEXT_PUBLIC_SEARCH_API_READY` | **Live** — `/search?q=` across frames + art |
| `services/orders.service.ts` | `NEXT_PUBLIC_ORDERS_API_READY` | **Live** — `POST /orders`, payment + tracking |
| `services/customFraming.service.ts` | `NEXT_PUBLIC_FRAMING_API_READY` | **To build** — `POST /custom-framing/quotes` (only `/framing/calculate-price` exists) |

Retiring the last one is a full-stack slice: build the Laravel route, point the
service at it, flip the flag to `true`, then delete the mock branch and its
fixture once nothing imports it. Leaving a flag on `true` with no route behind
it breaks `npm run build`, so land both halves together.

The mock shapes in `lib/mock/` and the types in `lib/types/` are the de facto
contract — match them when designing the Eloquent resource, or update both sides
deliberately. `frontend/agents/14-working-stack-and-progress.md` §3 has the
intended query-param spec for filtering and sorting.

Route handlers under `src/app/api/*` proxy to Laravel; import `API_BASE_URL` from
`@/lib/api/client` rather than reading `process.env.NEXT_PUBLIC_API_URL` directly,
so the localhost fallback applies when no env file is present.
