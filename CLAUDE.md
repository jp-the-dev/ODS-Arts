@AGENTS.md

# ODSArts — Repository Guide

## Layout

One repository holding both stacks. Work directly in it.

```
ODS-Arts/              ← repo root; Laravel 13 + Filament v4; git lives here
├── app/               ← models, Api controllers (Filament admin at /admin)
├── routes/api.php     ← the storefront API contract — source of truth
├── database/          ← migrations, factories, seeders
├── frontend/          ← Next.js 16 + React 19 + Tailwind v4
│   └── agents/        ← frontend-specific rules, data layer, mock flags
├── .env               ← Laravel env (gitignored)
└── frontend/.env.local ← frontend env (gitignored)
```

**We own both stacks.** Frontend code lives in `frontend/`, backend code in
`app/`/`routes/`/`database/`, but they are one codebase and one job — a feature
is done when it works end to end. If the UI needs an endpoint that does not
exist, build it rather than mocking around it or calling it blocked. Edit in
place and commit from the root; a change spanning both stacks is one commit.

**Superseded:** the old `odsarts/` → `rsync` → `temp_repo/` sync flow is gone.
Ignore any instruction to run `sync.sh` or to commit from `temp_repo/`.

## Running

| What | Where | Command |
|---|---|---|
| Laravel API (`:8000`) | root | `php artisan serve` |
| Next.js (`:3000`) | `frontend/` | `npm run dev` |
| Backend stack (server + queue + logs + vite) | root | `composer run dev` |
| Tests | root | `php artisan test --compact` |

Start Laravel **before** `npm run build` in `frontend/` — the build prerenders
pages that fetch from the API, so a stopped API surfaces as a build failure.

## Frontend ↔ Backend Contract

`routes/api.php` is the source of truth for what exists — check it before wiring
a frontend call, since a missing route returns 404 and breaks the production
build, not just the page.

**Live today:** collections, products, frame options, testimonials, enquiries,
newsletter, framing price calculation.
**Still to build:** art, search, orders, custom-framing quotes. The frontend
runs these on mock data behind per-vertical `*_API_READY` flags so the app stays
green; those flags mark our remaining backend work, not a permanent design.
`frontend/agents/AGENTS.md` has the flag table and what each one needs.

Build a feature as one vertical slice, in dependency order:

```
migration → model + factory → API controller + Eloquent resource
  → route in routes/api.php → Pest feature test
  → frontend types → service function → UI
```

Design the Eloquent resource against the existing `frontend/src/lib/types/` and
`lib/mock/` shapes — those are the de facto contract the UI already renders.
Changing one side means changing the other in the same commit.

After PHP changes run `vendor/bin/pint --dirty --format agent` and
`php artisan test --compact`; after frontend changes run `npm run build` in
`frontend/` with Laravel up.

## Deploying

`DEPLOYMENT.md` is the runbook: Forge/VPS for the API, Vercel for the storefront,
both from git — nothing is containerised. Read it before changing anything that
touches environment configuration, image storage, or the queue.

Two traps it exists to prevent: the frontend's `*_API_READY` flags fall back to
**mock data** when unset, so a forgotten Vercel variable ships a fake checkout;
and the seeders use `create()`, so `db:seed` run twice duplicates the catalogue.

Run `php artisan odsarts:preflight` after any environment change — it fails on
anything that would stop a real order going through.

## Env Files

Both env files are gitignored and do not travel with the repo; recreate them when
cloning. `frontend/.env.local` is the one that is easy to forget — without it the
frontend falls back to `http://localhost:8000/api/v1` and mock data.
