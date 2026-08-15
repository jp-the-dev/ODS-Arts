# ODSArts — Deployment Runbook

How this application gets from the repository to taking real money. Written
against the state of `master` on 15 August 2026.

Nothing here is containerised. Both halves deploy from GitHub: Vercel builds the
storefront, Forge pulls and runs the API on a VPS.

---

## 1. What runs where

| Piece | Host | Domain | Deploy trigger |
|---|---|---|---|
| Storefront (Next.js 16) | Vercel | `odsarts.in` | push to `master` |
| API + admin (Laravel 13, Filament v4) | VPS via Forge | `api.odsarts.in` | push to `master` |
| Database (MySQL) | Same VPS | — | — |
| Uploaded images | VPS disk, `storage/app/public` | served at `api.odsarts.in/storage` | — |
| Queue worker | Same VPS, Supervisor | — | — |
| Scheduler | Same VPS, cron | — | — |

The storefront never talks to the database. Everything it needs comes through
`api.odsarts.in/api/v1`, which is why the two can live on different providers.

**One repository, two deploy targets.** Vercel must be told to build from the
`frontend/` subdirectory — see §4.

---

## 2. Before you start

Accounts needed:

- **Vercel** — free tier is sufficient at launch
- **Hetzner** (CX22, ~€4/mo) or **DigitalOcean** ($12 droplet)
- **Laravel Forge** (~$12/mo) — provisioning, SSL, deploys, Supervisor
- **Razorpay** — live keys, KYC approved
- **Shiprocket** — account with a pickup address configured
- **Resend** or **Postmark** — transactional mail
- Domain `odsarts.in` with DNS you control

Do not send mail directly from the droplet. A fresh VPS IP has no sending
reputation and order confirmations land in spam.

---

## 3. Backend — VPS via Forge

### 3.1 Provision

1. In Forge, connect your server provider and create a server:
   - **PHP 8.5** (the app uses 8.5 syntax; 8.4 will not boot)
   - **MySQL 8**
   - Region close to your customers — Mumbai/Bangalore for an Indian storefront
2. Create a site: `api.odsarts.in`, web directory `/public`
3. Install the repository: `jp-the-dev/ODS-Arts`, branch `master`
4. Enable **Let's Encrypt** SSL for `api.odsarts.in`

### 3.2 Raise the PHP upload limits

The default `upload_max_filesize` is 2MB. The admin resizes images in the
browser before upload, so most photos land well under that — but a detailed
1600×2000 PNG can exceed it, and PHP rejects an oversized upload *before*
Laravel sees it.

The app now derives its own limit from these values (`App\Services\UploadLimits`),
so it will never promise more than the server accepts — but the ceiling is still
whatever you set here.

In Forge → Server → PHP → edit `php.ini`:

```ini
upload_max_filesize = 10M
post_max_size = 12M
```

Restart PHP-FPM afterwards. Verify with:

```bash
php artisan tinker --execute 'echo App\Services\UploadLimits::describe();'
```

### 3.3 Environment

Forge → Site → Environment. Every value below matters; the ones marked **⚠**
fail silently when wrong.

```dotenv
APP_NAME=ODSArts
APP_ENV=production
APP_KEY=                          # php artisan key:generate --show
APP_DEBUG=false                   # ⚠ leaks stack traces and config if true
APP_URL=https://api.odsarts.in    # ⚠ every image URL is built from this

FRONTEND_URL=https://odsarts.in   # ⚠ CORS origin + every link in order email

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=odsarts
DB_USERNAME=forge
DB_PASSWORD=                      # from Forge

FILESYSTEM_DISK=local

QUEUE_CONNECTION=database         # ⚠ 'sync' runs mail and fulfilment inline
SESSION_DRIVER=database
CACHE_STORE=database

MAIL_MAILER=resend                # ⚠ 'log' silently discards order confirmations
RESEND_API_KEY=
MAIL_FROM_ADDRESS=orders@odsarts.in
MAIL_FROM_NAME=ODSArts

RAZORPAY_KEY=                     # live key, not rzp_test_
RAZORPAY_SECRET=
RAZORPAY_WEBHOOK_SECRET=          # ⚠ without it a closed tab leaves paid orders pending

SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
SHIPROCKET_PICKUP_POSTCODE=360002
SHIPROCKET_DRY_RUN=false          # ⚠ true means nothing is ever booked
```

`APP_NAME` reaches customers — it is the sender name on every order
confirmation. Leaving it as `Laravel` is treated as a launch blocker by
`odsarts:preflight`.

`SESSION_DOMAIN` and `SANCTUM_STATEFUL_DOMAINS` can stay at their defaults. The
admin panel is same-origin session auth, and the storefront authenticates with
bearer tokens, so no cross-domain cookie is involved.

### 3.4 Deploy script

Forge → Site → Deploy Script:

```bash
cd /home/forge/api.odsarts.in
git pull origin $FORGE_SITE_BRANCH

composer install --no-dev --optimize-autoloader --no-interaction

php artisan migrate --force
php artisan storage:link --force
php artisan filament:assets

php artisan config:cache
php artisan route:cache
php artisan view:cache

php artisan queue:restart
```

Notes:

- **No `npm` step.** The only Blade view using `@vite` is `welcome.blade.php`,
  and `routes/web.php` redirects `/` to the storefront, so it never renders.
- **`storage:link --force`** — the plain form prints a red `ERROR: link already
  exists` on every redeploy. It exits 0, but it is noise you will learn to
  ignore, and then you will miss a real error behind it.
- **`queue:restart`** is not optional. Workers hold code in memory; without it a
  deploy leaves the previous release processing jobs.
- **Do not** put `odsarts:preflight` in this script. It exits non-zero on
  blockers, which would fail the deploy *after* migrations have run. Run it by
  hand — see §6.

### 3.5 Queue worker

Forge → Site → Queue. Create a worker:

- Connection `database`, queue `default`
- Processes: 1
- Timeout: 60
- Tries: 3
- **Sleep**: 3

This is what sends order confirmations and books shipments
(`App\Jobs\CreateShiprocketOrderJob`). With no worker, checkout still returns
201 and the customer simply never hears from you — the failure is completely
silent from the outside.

### 3.6 Scheduler

Forge → Server → Scheduler, or add the cron by hand:

```
* * * * * cd /home/forge/api.odsarts.in && php artisan schedule:run >> /dev/null 2>&1
```

Without it `odsarts:release-abandoned-stock` never runs. Stock is decremented
when an order is created, before payment, so every abandoned cart and declined
card holds its units until that job returns them. Nothing errors — the catalogue
just drifts towards reporting items sold out that nobody bought, and you find
out when a real customer is turned away.

`ORDER_RELEASE_STOCK_AFTER_MINUTES` sets how long an order may go unpaid first
(default 60). Check what it would do before trusting it:

```bash
php artisan odsarts:release-abandoned-stock --dry-run
```

### 3.7 Images

With a VPS you have a persistent disk, so uploads in `storage/app/public`
survive deploys and **no code changes are needed**.

If you later move to multiple app servers or an ephemeral host, switch the
`public` disk to the `s3` driver (Cloudflare R2 is a good fit — no egress fees)
and change `asset('storage/'.$path)` to `Storage::disk('public')->url()`. That
rule now lives in one place, `App\Services\ImageUrl`, so it is a single edit.

Catalogue images seeded from the frontend's public folder need moving onto the
disk once, so the admin can manage them:

```bash
php artisan odsarts:images-to-disk --dry-run   # inspect first
php artisan odsarts:images-to-disk
```

It is idempotent and safe to re-run.

---

## 4. Frontend — Vercel

### 4.1 Project setup

1. Import `jp-the-dev/ODS-Arts`
2. **Root Directory: `frontend`** ⚠

That second step is not optional. The repository has two `package-lock.json`
files — one at the root for Laravel's own Vite assets, one in `frontend/`.
Vercel defaults to the root and will build the wrong thing.

Framework preset auto-detects as Next.js. Leave the build command alone.

### 4.2 Environment variables

Set these for **Production** *and* **Preview**. They are read at **build time**,
not runtime — changing one requires a redeploy, not a restart.

```dotenv
NEXT_PUBLIC_API_URL=https://api.odsarts.in/api/v1
NEXT_PUBLIC_SITE_URL=https://odsarts.in

NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ART_API_READY=true
NEXT_PUBLIC_SEARCH_API_READY=true
NEXT_PUBLIC_ORDERS_API_READY=true
```

> **⚠ The readiness flags fail dangerously when unset.**
>
> Each is read as `process.env.NEXT_PUBLIC_X_API_READY !== 'true'` — meaning
> **anything other than the exact string `true` falls back to mock data.** A
> forgotten variable does not error; it ships a storefront that looks correct,
> lists invented products, and runs a checkout that takes no money and creates
> no order.
>
> After the first deploy, verify against §7 rather than trusting the build log.

`NEXT_PUBLIC_FRAMING_API_READY` is deliberately absent. The custom-framing quote
endpoint does not exist yet, so that page stays on mock data. Do not set it to
`true` until the route ships.

`NEXT_PUBLIC_API_URL` is also what `next.config.ts` derives the allowed image
host from. Build without it and every product image returns **400** in
production while the rest of the site looks fine.

---

## 5. DNS

| Record | Name | Value |
|---|---|---|
| A | `api` | droplet IPv4 |
| AAAA | `api` | droplet IPv6 (if enabled) |
| A / CNAME | `@` and `www` | as Vercel instructs |

Plus the SPF, DKIM and DMARC records your mail provider gives you — on the
sending domain, `odsarts.in`.

Issue SSL for `api.odsarts.in` in Forge only after the A record resolves.

---

## 6. First deploy

Run in order. Every step is verifiable; do not skip to the next on a failure.

```bash
# 1. Deploy from Forge, then SSH in
cd /home/forge/api.odsarts.in

# 2. Catalogue data — collections, products, frame options, testimonials.
#    ⚠ RUN EXACTLY ONCE. The seeders use create(), not updateOrCreate(), so a
#    second run duplicates the entire catalogue rather than doing nothing.
php artisan db:seed --force

# 3. Confirm it landed, and landed once
php artisan tinker --execute '
  printf("collections=%d products=%d frame options=%d\n",
    App\Models\Collection::count(),
    App\Models\Product::count(),
    App\Models\FrameOption::count());'

# 4. Move seeded images onto the disk so the admin can manage them
php artisan odsarts:images-to-disk

# 5. Create your admin account, then grant it panel access
php artisan tinker --execute 'App\Models\User::create([
  "name" => "Your Name",
  "email" => "you@odsarts.in",
  "password" => bcrypt("<a strong password>"),
]);'
php artisan user:admin you@odsarts.in --grant
php artisan user:admin --list

# 6. Prove mail actually delivers (queues it, exactly as checkout does)
php artisan odsarts:mail-test you@odsarts.in --queue

# 7. The gate. Fix every blocker before opening the shop.
php artisan odsarts:preflight
```

`odsarts:preflight` checks environment, debug mode, app key, app name,
storefront URL, database connectivity, pending migrations, catalogue contents,
frame options, admin access, mail driver, queue driver and backlog, Razorpay
keys and webhook secret, and Shiprocket configuration. It exits non-zero if any
of them would stop you taking a real order.

### 6.1 Webhooks

**Razorpay** → Dashboard → Settings → Webhooks:

- URL: `https://api.odsarts.in/api/v1/webhooks/razorpay`
- Secret: the same value as `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured`, `payment.failed`

This is what saves an order when a customer closes the tab mid-payment. Without
it the browser is the only confirmation path and a paid order sits as pending.

**Shiprocket** → Settings → API → Webhooks:

- URL: `https://api.odsarts.in/api/v1/webhooks/shiprocket`

### 6.2 Remove the test admin

If `test-admin@odsarts.test` exists on this database:

```bash
php artisan user:admin test-admin@odsarts.test --revoke
```

---

## 7. Verify the launch

Do not trust a green build. Check the things that fail silently.

```bash
# API is up and serving real data
curl -s https://api.odsarts.in/api/v1/products | head -c 300

# Images resolve (must be 200 and an image content-type)
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' \
  "$(curl -s https://api.odsarts.in/api/v1/products \
     | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"][0]["images"][0]["url"])')"

# Debug mode is off — this must NOT return a stack trace
curl -s https://api.odsarts.in/api/v1/products/does-not-exist | head -c 200
```

In a browser:

1. **Storefront shows real products.** Compare a product name against the admin.
   If you see items that are not in `/admin/products`, a readiness flag is unset
   and you are looking at mock data.
2. **A product image loads.** A broken image means `NEXT_PUBLIC_API_URL` was
   missing at build time (§4.2).
3. **Place a real order** with a small live payment. Then confirm:
   - it appears in `/admin/orders`
   - status reaches `paid`
   - the confirmation email arrives
   - `php artisan queue:failed` is empty
   - a Shiprocket shipment was created
4. **Refund that order** in the Razorpay dashboard.

Step 3 is the only test that exercises payment, queue, mail and fulfilment
together. Nothing before it proves the shop works.

---

## 8. Rollback

Forge keeps previous releases. To revert:

```bash
git revert <bad-commit>
git push origin master
```

Prefer this over rolling back the deploy, because **migrations do not roll back
cleanly** — `migrate --force` has already changed the schema. If a migration is
the problem, write a new migration that corrects it rather than running
`migrate:rollback` against production data.

Always take a database snapshot before a deploy that includes a destructive
migration.

---

## 9. Ongoing

**Backups.** Set a daily cron in Forge:

```bash
mysqldump -u forge -p'<password>' odsarts | gzip > /home/forge/backups/odsarts-$(date +\%F).sql.gz
```

Copy them off the droplet — a backup on the same disk is not a backup. Also back
up `storage/app/public`; those uploads exist nowhere else.

**Logs.** `storage/logs/laravel.log` on the server; `php artisan pail` to tail
live. Watch `php artisan queue:failed` — a failed job is a customer who did not
get their email or shipment.

**Monitoring.** Point an uptime check at `https://api.odsarts.in/api/v1/products`
rather than the root, so it exercises the database rather than a redirect.

Re-run `php artisan odsarts:preflight` after any environment change.

---

## 10. Known gaps at launch

Carried over deliberately; none blocks taking orders.

- **Custom-framing quotes** run on mock data — no endpoint exists yet. The
  framing *price calculator* (`/api/v1/framing/calculate-price`) is live.
- **Collection hero images and art category covers** are shipped with the
  frontend build, not admin-managed. Changing them is a code deploy.
- **Checkout requires an account.** Guest checkout was removed: `POST /orders`
  is behind `auth:sanctum`, the cart refuses to accept items while signed out,
  and the checkout page shows a sign-in wall. Orders placed before that change
  still have `user_id = null` and remain trackable by reference.
- **Stock is reserved at checkout, not at payment.** An unpaid order holds its
  units until the scheduled release returns them, so a burst of abandoned carts
  can briefly show popular sizes as unavailable.
- **No CDN in front of `/storage`.** Fine at launch volume; revisit with R2 when
  image traffic grows.
- **Single server.** The database, queue worker and uploads share one droplet,
  so it is a single point of failure. Backups are what make that acceptable.
