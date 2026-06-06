# ODSArts — Full Application Workflow

> **Last updated:** June 7, 2026  
> **Stack:** Laravel 13 (API + Filament Admin) · Next.js 16 (Turbopack) · Sanctum SPA Auth · MySQL (MariaDB 11)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema & Models](#2-database-schema--models)
3. [API Routes & Controller Flow](#3-api-routes--controller-flow)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Data Flow: Page-by-Page](#6-data-flow-page-by-page)
7. [Admin Panel](#7-admin-panel)
8. [Glossary](#8-glossary)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (User)                           │
│  nextjs.odsarts.in:3000                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
              HTTP (credentials: include)
              CSRF cookie → X-XSRF-TOKEN header
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js 16 Frontend (SPA)                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   React Context Layer                     │   │
│  │  AuthProvider  │  CartProvider  │  WishlistProvider      │   │
│  │  QuickViewProvider                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│              ┌──────────┴──────────┐                            │
│              │   Service Layer     │                            │
│              │  (10 services)      │                            │
│              └──────────┬──────────┘                            │
│                         │ apiFetch()                            │
│                         ▼                                       │
│              ┌──────────────────────┐                           │
│              │  api/client.ts       │                           │
│              │  - CSRF cookie fetch │                           │
│              │  - JSON body/accept  │                           │
│              │  - Error unwrapping  │                           │
│              │  - Laravel envelope  │                           │
│              └──────────┬───────────┘                           │
└─────────────────────────┼───────────────────────────────────────┘
                          │
         http://localhost:8000/api/v1/*
         http://localhost:8000/sanctum/csrf-cookie
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Laravel 13 Backend                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  routes/api.php       routes/web.php                     │   │
│  │  32 API routes        2 social auth routes               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│              ┌──────────┴──────────┐                            │
│              │  Controllers         │                            │
│              │  (storefront, auth,  │                            │
│              │   orders, admin)     │                            │
│              └──────────┬──────────┘                            │
│                         │                                       │
│              ┌──────────┴──────────┐                            │
│              │  Eloquent Models    │                            │
│              │  (18 models)        │                            │
│              └──────────┬──────────┘                            │
│                         │                                       │
│              ┌──────────┴──────────┐                            │
│              │  MySQL (MariaDB 11) │                            │
│              │  26 tables          │                            │
│              └─────────────────────┘                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Filament Admin (Panel ID: admin)                        │   │
│  │  /admin — 7 Resources, 3 RelationManagers               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Sanctum SPA (cookie) auth** | No token management on frontend; works with SSR; secure (HttpOnly cookies) |
| **Monetary values in paise** | Integers avoid floating-point precision errors (1 INR = 100 paise) |
| **Two independent product domains** | Frame products (Collection → Product → Variant) and Art products (ArtCategory → ArtProduct → MaterialVariant) are structurally similar but semantically distinct |
| **JSON snapshot for addresses on orders** | Addresses can change; orders need a point-in-time copy |
| **Web routes for social auth** | Google OAuth callback needs `StartSession` middleware, which only runs in the `web` group |

---

## 2. Database Schema & Models

### 2.1 Core Tables

```
users
├── id (PK)
├── name
├── email (unique)
├── phone (nullable)
├── email_verified_at (nullable)
├── password (hashed)
└── remember_token

collections
├── id (PK)
├── name
├── slug (unique)
├── display_number (nullable)
├── tagline (nullable)
├── eyebrow (nullable)
├── description (nullable)
├── long_description (nullable)
├── materials (json, nullable)
├── features (json, nullable)
├── cover_image (nullable)
├── image_path (nullable)
├── image_alt (nullable)
├── image_position (default: 'left')
├── is_active (boolean)
└── sort_order

products
├── id (PK)
├── collection_id (FK → collections)
├── name
├── tagline (nullable)
├── slug (unique)
├── description (nullable)
├── delivery_days (default: 14)
├── care_instructions (json, nullable)
├── materials (json, nullable)
├── material (nullable)
├── dimensions (nullable)
├── price_in_paise (unsigned int)
├── is_featured (boolean)
├── is_active (boolean)
└── sort_order

product_variants
├── id (PK)
├── product_id (FK → products)
├── sku (unique)
├── size_label (e.g. '8" × 10"')
├── dimensions_cm (e.g. '20 × 25 cm')
├── base_price_paise (unsigned int)
├── stock_qty (default: 10)
├── weight_grams (default: 0)
└── sort_order

finish_options
├── id (PK)
├── collection_id (FK → collections)
├── name
├── slug
├── swatch_hex (nullable)
├── price_delta_paise (can be negative)
└── sort_order
```

### 2.2 Art Domain Tables

```
art_categories
├── id (PK)
├── slug (unique)
├── display_number (nullable)
├── eyebrow (nullable)
├── title
├── tagline (nullable)
├── description (nullable)
├── cover_image (nullable)
├── cover_image_alt (nullable)
├── accent_color (nullable)
├── is_active (boolean)
└── sort_order

art_products
├── id (PK)
├── art_category_id (FK → art_categories)
├── slug (unique)
├── name
├── tagline (nullable)
├── description (nullable)
├── artist (default: 'ODSArts Studio')
├── medium (nullable)
├── delivery_days (default: 10)
├── tags (json, nullable)
├── is_featured (boolean)
├── is_active (boolean)
└── sort_order

art_material_variants
├── id (PK)
├── art_product_id (FK → art_products)
├── sku (unique)
├── material (indexed)
├── size_label
├── dimensions_cm
├── price_paise (unsigned int)
├── stock_qty (default: 10)
├── weight_grams (default: 0)
└── sort_order

art_images
├── id (PK)
├── art_product_id (FK → art_products)
├── path
├── alt (nullable)
├── role (default: 'hero')
└── sort_order
```

### 2.3 Auth & Customer Tables

```
oauth_providers
├── id (PK)
├── user_id (FK → users)
├── provider (e.g. 'google')
├── provider_id
├── avatar (nullable)
├── token (nullable)
├── refresh_token (nullable)
└── UNIQUE(provider, provider_id)

addresses
├── id (PK)
├── user_id (FK → users)
├── label (e.g. 'Home', 'Office')
├── type (e.g. 'shipping', 'billing', 'both')
├── is_default (boolean)
├── full_name
├── phone
├── address_line1
├── address_line2 (nullable)
├── city
├── state
├── postal_code
├── country (default: 'IN')
└── created_at

wishlist_items
├── id (PK)
├── user_id (FK → users)
├── product_id (FK → products)
└── UNIQUE(user_id, product_id)

orders
├── id (PK)
├── user_id (FK → users)
├── order_number (unique, format: ODS-YYYYMMDD-XXXX)
├── status (default: 'pending')
├── subtotal (unsigned int, paise)
├── tax (unsigned int, paise, default 0)
├── shipping_cost (unsigned int, paise, default 0)
├── discount (unsigned int, paise, default 0)
├── total (unsigned int, paise)
├── payment_status (default: 'pending')
├── payment_method (nullable)
├── billing_address (json, nullable) — snapshot
├── shipping_address (json, nullable) — snapshot
├── notes (nullable)
├── currency (default: 'INR')
├── ordered_at (timestamp)
└── created_at

order_items
├── id (PK)
├── order_id (FK → orders)
├── product_id (FK → products, nullable, SET NULL on delete)
├── product_variant_id (FK → product_variants, nullable, SET NULL on delete)
├── name — snapshot
├── sku (nullable) — snapshot
├── unit_price_paise
├── quantity (default: 1)
├── subtotal_paise (= unit_price × quantity)
└── options (json, nullable)
```

### 2.4 Ancillary Tables

```
frame_options       — Standalone: wood/mat/glass options for custom framing calculator
  │                   ENUM type (wood|mat|glass), price_modifier_in_paise
  │
testimonials        — Linked to products (nullable FK)
  │                   quote, author, city, is_active
  │
enquiries           — Standalone: contact/custom-framing/gifting form submissions
                    ENUM type, ENUM status (new|read|replied)
```

### 2.5 Laravel System Tables

```
sessions             — DB-driven sessions (SESSION_DRIVER=database)
cache + cache_locks  — Cache storage
jobs + job_batches + failed_jobs — Queue
personal_access_tokens — Sanctum token storage (unused for SPA auth)
password_reset_tokens — Password reset tokens
```

### 2.6 Entity Relationships (Text ERD)

```
User ──HasMany──▶ OAuthProvider
User ──HasMany──▶ Address
User ──HasMany──▶ WishlistItem ──BelongsTo──▶ Product
User ──HasMany──▶ Order ──HasMany──▶ OrderItem
                                       ├──BelongsTo──▶ Product (nullable)
                                       └──BelongsTo──▶ ProductVariant (nullable)
Collection ──HasMany──▶ Product ──HasMany──▶ ProductVariant
           │                        └──HasMany──▶ ProductImage
           └──HasMany──▶ FinishOption

ArtCategory ──HasMany──▶ ArtProduct ──HasMany──▶ ArtMaterialVariant
                                        └──HasMany──▶ ArtImage

Product ──HasMany──▶ Testimonial (nullable FK)
FrameOption (standalone)
Enquiry (standalone)
```

---

## 3. API Routes & Controller Flow

### 3.1 Route Map

All public API routes: `/api/v1/*` — no auth required.  
Authenticated API routes: `/api/v1/auth/*` — protected by `auth:sanctum`.

#### Public Storefront

| Method | URI | Controller | Returns |
|---|---|---|---|
| GET | `/collections` | `CollectionController@index` | All active collections with finish options |
| GET | `/collections/{slug}` | `CollectionController@show` | Single collection + products (variants, images, finish_options) |
| GET | `/products` | `ProductController@index` | All active products |
| GET | `/products/featured` | `ProductController@featured` | Featured products only |
| GET | `/products/{slug}` | `ProductController@show` | Single product |
| GET | `/art/categories` | `ArtCategoryController@index` | All active art categories (with count) |
| GET | `/art/categories/{slug}` | `ArtCategoryController@show` | Single category + art products |
| GET | `/art` | `ArtController@index` | All active art products |
| GET | `/art/featured` | `ArtController@featured` | Featured art only |
| GET | `/art/{slug}` | `ArtController@show` | Single art product |
| GET | `/frame-options` | `FrameOptionController@index` | Grouped by type (wood/mat/glass) |
| POST | `/framing/calculate-price` | `FramingController@calculatePrice` | Price breakdown for custom framing |
| GET | `/testimonials` | `TestimonialController@index` | Active testimonials |
| POST | `/enquiries` | `EnquiryController@store` | Submit contact/custom-framing/gifting form |
| POST | `/newsletter/subscribe` | `NewsletterController@subscribe` | Log email (placeholder) |

#### Authentication (public)

| Method | URI | Controller | Behavior |
|---|---|---|---|
| POST | `/auth/register` | `AuthController@register` | Create user, auto-login, return UserResource |
| POST | `/auth/login` | `AuthController@login` | Email/password attempt, session regeneration |
| POST | `/auth/forgot-password` | `AuthController@forgotPassword` | Send password reset link |
| POST | `/auth/reset-password` | `AuthController@resetPassword` | Execute password reset with token |

#### Authenticated Customer (`auth:sanctum`)

| Method | URI | Controller | Authorization |
|---|---|---|---|
| POST | `/auth/logout` | `AuthController@logout` | Session invalidation |
| GET | `/auth/user` | `AuthController@user` | Current user + addresses + oauth_providers |
| PUT | `/auth/user` | `AuthController@updateProfile` | Update name/email/phone |
| PUT | `/auth/user/password` | `AuthController@updatePassword` | Change password (requires current) |
| GET | `/auth/addresses` | `AddressController@index` | User's addresses |
| POST | `/auth/addresses` | `AddressController@store` | Create address (handles is_default) |
| PUT | `/auth/addresses/{address}` | `AddressController@update` | Ownership check |
| DELETE | `/auth/addresses/{address}` | `AddressController@destroy` | Ownership check |
| GET | `/auth/wishlist` | `WishlistController@index` | Items with product relation |
| POST | `/auth/wishlist` | `WishlistController@store` | Slug → product_id, no duplicates |
| DELETE | `/auth/wishlist/{wishlistItem}` | `WishlistController@destroy` | Ownership check |
| GET | `/auth/orders` | `OrderController@index` | Orders with items |
| GET | `/auth/orders/{orderNumber}` | `OrderController@show` | Single order by order_number |

#### Web Routes (session-based, browser redirect)

| Method | URI | Controller | Purpose |
|---|---|---|---|
| GET | `/auth/{provider}/redirect` | `SocialAuthController@redirect` | Redirect to Google OAuth |
| GET | `/auth/{provider}/callback` | `SocialAuthController@callback` | Handle callback, create/merge user, redirect to frontend |

### 3.2 Controller Pattern

Every storefront controller follows the same pattern:

```
1. Controller method receives request
2. Optional: FormRequest validates input (RegisterRequest, LoginRequest, etc.)
3. Query: Model::active()->with(relations)->ordered()
4. Return: new ModelResource($data) or ModelResource::collection($data)
```

Key conventions:
- **Eager loading** — Resources use `whenLoaded()` to conditionally include relations
- **404 handling** — `firstOrFail()` or manual `notFound()` for slug lookups
- **Ownership checks** — Address/Wishlist controllers manually check `user_id === auth()->id()`
- **Auth middleware** — Applied in route definition, not in controllers

### 3.3 Payment Flow (Current State)

**Order creation is NOT yet implemented in the API.** The frontend has checkout pages (`/cart`, `/checkout`) and the backend has `Order`/`OrderItem` models with migrations and factories, but:

- No `/checkout` or `/orders` POST endpoint exists
- Orders are currently created only via seeders/factories or directly in the database
- The frontend cart (`CartProvider`) only syncs with localStorage — no server-side cart

This is the next major piece of work: connecting the frontend cart → checkout → order creation pipeline.

---

## 4. Authentication & Authorization

### 4.1 Sanctum SPA Flow

```
Frontend                              Backend
   │                                     │
   │  GET /sanctum/csrf-cookie           │
   │────────────────────────────────────▶│  Sets XSRF-TOKEN cookie
   │◀────────────────────────────────────│  (encrypted, HttpOnly)
   │                                     │
   │  POST /api/v1/auth/login            │
   │  Headers: X-XSRF-TOKEN (decrypted)  │
   │  Body: { email, password }          │
   │────────────────────────────────────▶│  auth()->attempt()
   │◀────────────────────────────────────│  Sets session cookie
   │                                     │  Returns { user: UserResource }
   │                                     │
   │  GET /api/v1/auth/user              │
   │  (session cookie sent automatically)│
   │────────────────────────────────────▶│  Returns UserResource
   │◀────────────────────────────────────│  (with providers + addresses)
```

**Key details:**
- `statefulApi()` in `bootstrap/app.php` enables SPA auth for configured domains
- `SESSION_DRIVER=database` stores sessions in the `sessions` table
- Frontend reads `XSRF-TOKEN` from `document.cookie`, URL-decodes it, and sends as `X-XSRF-TOKEN` header
- Laravel's `VerifyCsrfToken::getTokenFromRequest()` decrypts the header value
- The `auth:sanctum` middleware uses the `web` guard (session-based, not token-based)

### 4.2 Google OAuth Flow

```
Frontend (/auth/login)                Laravel Web Routes              Google
   │                                      │                           │
   │  Click "Continue with Google"        │                           │
   │──window.location──▶ GET /auth/google/redirect                    │
   │                                      │──Socialite──▶ OAuth screen│
   │                                      │◀──callback───────┬────────│
   │                                      │                  │        │
   │                                      │  Find or create  │        │
   │                                      │  OAuthProvider   │        │
   │                                      │  by provider_id  │        │
   │                                      │                  │        │
   │                                      │  If not found:   │        │
   │                                      │  Lookup User by  │        │
   │                                      │  email (merge)   │        │
   │                                      │  or create new   │        │
   │                                      │                  │        │
   │                                      │  Auth::login()   │        │
   │                                      │  session.regen() │        │
   │                                      │                  │        │
   │  Redirect to:                        │                  │        │
   │  /auth/social-callback               │                  │        │
   │◀─────────────────────────────────────│                  │        │
   │                                      │                           │
   │  GET /api/v1/auth/user               │                           │
   │  (session cookie present)            │                           │
   │─────────────────────────────────────▶│                           │
   │◀──UserResource with avatar_url───────│                           │
   │                                      │                           │
   │  Redirect to / (or redirect param)   │                           │
```

**Email merging:** When a Google email matches an existing password-based account, the OAuth provider is linked (not an error). The user can log in with either method going forward.

### 4.3 Frontend Route Guards

| Guard | Component | Behavior |
|---|---|---|
| `AuthGuard` | Wraps `/account` | Redirects to `/auth/login?redirect={path}` if not authenticated |
| `GuestGuard` | Wraps `/auth/login`, `/auth/register` | Redirects to `/` if already authenticated |

### 4.4 Authorization Matrix

| Resource | View Own | Create | Update | Delete |
|---|---|---|---|---|
| Profile | ✅ (always own) | — | ✅ (always own) | — |
| Addresses | ✅ (always own) | ✅ (auto-assigned) | ✅ (ownership check) | ✅ (ownership check) |
| Wishlist | ✅ (always own) | ✅ (auto-assigned) | — | ✅ (ownership check) |
| Orders | ✅ (always own) | ❌ (not implemented) | ❌ | ❌ |

---

## 5. Frontend Architecture

### 5.1 React Context Layer

```
app/layout.tsx
└── AuthProvider
    ├── user: User | null
    ├── loading: boolean
    ├── login(input) → Promise
    ├── register(input) → Promise
    ├── logout() → void
    └── refreshUser() → Promise
    │
    └── CartProvider
    │   ├── items: CartItem[] (localStorage)
    │   ├── isDrawerOpen: boolean
    │   ├── subtotalPaise, totalItems
    │   ├── addItem, addArtItem, removeItem, updateQty, clearCart
    │   └── openDrawer, closeDrawer
    │
    └── WishlistProvider
    │   ├── slugs: string[] (localStorage + server sync)
    │   ├── count, isInWishlist
    │   ├── addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist
    │   └── Notes: Server-synced when authenticated; slug→id mapping for removal
    │
    └── QuickViewProvider
        ├── activeProduct: Product | null
        └── openQuickView, closeQuickView
```

### 5.2 Data Fetching Pattern

All frontend data fetching uses `apiFetch<T>()` from `@/lib/api/client.ts`:

```typescript
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // 1. Read NEXT_PUBLIC_API_URL (default: http://localhost:8000/api/v1)
  // 2. Always send credentials: 'include'
  // 3. Always send Accept + Content-Type: application/json
  // 4. For POST/PUT/DELETE: read XSRF-TOKEN cookie, send as X-XSRF-TOKEN header
  // 5. On server: attach next: { revalidate } from NEXT_PUBLIC_API_REVALIDATE
  // 6. If response has data key → unwrap and return json.data
  // 7. On 422 → throw ApiValidationError with errors object
  // 8. On other non-ok → throw ApiError with status
}
```

**Mock data switching:** Services check `NEXT_PUBLIC_USE_MOCK_DATA` env var. When `true`, they import from `@/lib/mock/` instead of calling the API. Currently set to `false` in `.env.local`.

### 5.3 Page Structure

#### Public Pages (`(marketing)` route group)

| Route | Page Type | Data Source | Key Components |
|---|---|---|---|
| `/` | Server | `collections.ts`, `products.ts`, `art.ts` | HeroSection, FeaturedCollectionsSection, ArtCollectionTeaser, CustomerHomesSection |
| `/collections` | Server | `getAllCollections()` | CollectionStoryBlock (per collection) |
| `/collections/[slug]` | SSG | `getCollectionBySlug()` | CollectionProductZone |
| `/products` | Server | `getAllProducts()` | FrameGrid, FilterPanel |
| `/products/[slug]` | SSG | `getProductBySlug()` | ProductConfigurator, ProductGallery |
| `/art` | Server | `getAllArt()` | ArtGrid |
| `/art/[categorySlug]` | SSG | `getArtByCategory()` | ArtGrid |
| `/art/[categorySlug]/[artSlug]` | SSG | `getArtBySlug()` | ArtConfigurator |
| `/about` | Static | — | AboutHero, CraftsmanshipSection |
| `/custom-framing` | Static | `getFrameOptions()` | CustomFramingWizard (multi-step) |
| `/gifting` | Static | — | GiftingBannerSection |
| `/inspiration` | Static | — | InspirationGallery |
| `/wishlist` | Client | `WishlistProvider.slugs` | FrameGrid (filtered) |

#### Auth Pages

| Route | Guard | Behavior |
|---|---|---|
| `/auth/login` | GuestGuard | Login form + SocialLoginButton |
| `/auth/register` | GuestGuard | Registration form + SocialLoginButton |
| `/auth/social-callback` | None | Gets user via `getUser()`, redirects to `/` |
| `/auth/forgot-password` | GuestGuard | Email form |
| `/auth/reset-password` | GuestGuard | Token + password form |
| `/account` | AuthGuard | 5 sections: Profile, Orders, Wishlist, Addresses, Password |

#### Shop Pages

| Route | Guard | Data Source |
|---|---|---|
| `/cart` | None | `CartProvider` (localStorage) |
| `/checkout` | AuthGuard | `CartProvider` + `getAddresses()` |

### 5.4 Service Layer (10 Files)

| File | Functions | Depends On |
|---|---|---|
| `auth.ts` | login, register, logout, getUser, updateProfile, updatePassword, forgotPassword, resetPassword | apiFetch |
| `collections.ts` | getAllCollections, getCollectionBySlug | apiFetch |
| `products.ts` | getAllProducts, getProductsByCollection, getProductBySlug, getFilteredProducts | apiFetch |
| `art.ts` | getAllArt, getArtByCategory, getArtBySlug, getFilteredArt, searchArt | apiFetch |
| `search.ts` | searchGlobal | apiFetch |
| `wishlist.ts` | getWishlist, addToWishlist, removeFromWishlist | apiFetch |
| `orders.ts` | getOrders, getOrder | apiFetch |
| `addresses.ts` | getAddresses, createAddress, updateAddress, deleteAddress | apiFetch |
| `frameOptions.ts` | getFrameOptions (inferred) | apiFetch |
| `enquiries.ts` | submitEnquiry (inferred) | apiFetch |

### 5.5 Supporting Type System

| File | Key Types |
|---|---|
| `@/lib/types/product.ts` | Product, ProductVariant, FinishOption, ProductImage, CartItem (FrameCartItem | ArtCartItem) |
| `@/lib/types/art.ts` | ArtProduct, ArtMaterialVariant, ArtImage, ArtCategorySummary |
| `@/lib/types/filters.ts` | ProductFilterParams, serializeFilters |
| `@/lib/data/collections.ts` | Collection (also used as canonical type) |
| `@/lib/data/artCategories.ts` | ArtCategorySummary |

---

## 6. Data Flow: Page-by-Page

### 6.1 Homepage (`/`)

```
1. Page renders (server component)
2. Calls:
   - getAllCollections() → GET /api/v1/collections
   - getAllProducts() → GET /api/v1/products (for featured/best-sellers)
   - getAllArt() → GET /api/v1/art
3. Transforms API responses through toFrontend*() mappers
4. Passes data to section components:
   - HeroSection (static)
   - FeaturedCollectionsSection → 3 CollectionStoryBlocks
   - ArtCollectionTeaser → art grid
   - BestSellersSection → product grid
   - CraftsmanshipSection (static)
   - TestimonialsSection → GET /api/v1/testimonials
   - CustomerHomesSection (static)
   - FinalCTASection (static)
```

### 6.2 Product Detail (`/products/[slug]`)

```
1. generateStaticParams: fetches all product slugs
2. Page receives slug param
3. Calls getProductBySlug(slug) → GET /api/v1/products/{slug}
4. ProductResource returns:
   - Product fields (name, description, price)
   - Collection summary (id, slug, name)
   - Variants (sku, size_label, base_price_paise, stock)
   - Finish options (via collection.finishOptions)
   - Images (url, alt, role)
5. Renders:
   - ProductConfigurator (variant selector + finish selector + qty + add to cart)
   - ProductGallery (image gallery with role-based layout)
```

### 6.3 Account Page (`/account`)

```
AuthGuard ensures user is authenticated.

ProfileSection:
  1. Reads user from AuthContext (already loaded)
  2. Editable: name, email, phone
  3. Save → PUT /api/v1/auth/user → refreshUser()

OrdersSection:
  1. GET /api/v1/auth/orders (on mount)
  2. Renders collapsible order list
  3. Each order: order_number, status, items count, total (INR), ordered_at

WishlistSection:
  1. Reads slugs from WishlistContext (already synced)
  2. Renders slug list with remove buttons + link to /wishlist

AddressesSection:
  1. GET /api/v1/auth/addresses (on mount)
  2. Inline add/edit/delete forms
  3. Each address: label, type, full_name, phone, full address, is_default

PasswordSection:
  1. Form: current_password, new_password, confirm
  2. Save → PUT /api/v1/auth/user/password
```

### 6.4 Wishlist Page (`/wishlist`)

```
1. Reads from WishlistProvider.slugs (array of product slugs)
2. Looks up each slug from:
   - If using mock data: filter on products mock array
   - If using API: would need to batch-fetch or rely on cached products
3. Renders FrameGrid with wishlist products
4. Each product card shows a filled heart (can remove)
```

### 6.5 Checkout Flow (Not Yet Connected)

```
1. Cart page (/cart) reads from CartProvider → localStorage
2. User clicks "Proceed to Checkout"
3. Checkout page (/checkout) - AuthGuard ensures login
4. Components:
   - CheckoutForm: shipping address selector/creator + payment info
   - CheckoutOrderSummary: cart items read from CartProvider
5. CURRENT STATE: No POST endpoint exists for placing orders
   - CartProvider is client-side only (no server cart)
   - Order creation is the next major feature to implement
```

---

## 7. Admin Panel

### 7.1 Panel Configuration

| Setting | Value |
|---|---|
| Panel ID | `admin` |
| Path | `/admin` |
| Auth | Eloquent login (admin@odsarts.in / password) |
| Color | Amber |
| Resource Discovery | Auto from `app/Filament/Resources/` |

### 7.2 Resources Summary

| Resource | Nav Group | Pages | Form Highlights |
|---|---|---|---|
| **Collections** | (none) | List, Create, View, Edit | Name, slug, materials (tags), features (tags), cover image upload, visibility |
| **Products** | (none) | List, Create, View, Edit | Category select, auto-slug, price in rupees → paise, image repeater, visibility |
| **Product Variants** | (Relation on Products) | Inline | SKU, size, dimensions, base_price_paise, stock, weight, sort |
| **Finish Options** | (Relation on Collections) | Inline | Name, slug, swatch_hex, price_delta_paise, sort |
| **Art Categories** | Art | List, Create, View, Edit | Title, slug, cover image, accent color, visibility |
| **Art Products** | Art | List, Create, View, Edit | Category, name, auto-slug, artist, medium, tags, image repeater, visibility |
| **Art Material Variants** | (Relation on Art Products) | Inline | SKU, material, size, dimensions, price_paise, stock, weight, sort |
| **Frame Options** | Framing | Manage (single-page) | Type (wood/mat/glass), name, slug, material, finish, price in rupees → paise |
| **Enquiries** | CRM | List, View | Read-only (status change via inline action), type badges, filters |
| **Testimonials** | (none) | Manage (single-page) | Product select, quote, author, city, active toggle |

### 7.3 Admin Navigation Groups

```
Art
├── Art Categories
└── Art Products

CRM
└── Enquiries

Framing
└── Frame Options

(no group)
├── Collections
├── Products
└── Testimonials
```

---

## 8. Glossary

| Term | Definition |
|---|---|
| **Paise** | Smallest unit of Indian Rupee (1 INR = 100 paise). All monetary values stored as integers to avoid floating-point errors. |
| **Sanctum SPA** | Laravel Sanctum's cookie-based authentication for single-page applications. Uses session cookies, not API tokens. |
| **Stateful API** | Sanctum configuration that treats certain domains as "stateful" — sessions and CSRF protection are enabled for API requests from these domains. |
| **Finish Option** | A collection-level configuration (e.g., wood color, mat color, glass type) that modifies the price of a product. |
| **Product Variant** | A specific size/SKU of a frame product with its own price, stock, and weight. |
| **Material Variant** | A specific material+size combination for an art print (e.g., Canvas 8×10, Fine Art 12×16). |
| **Mock Data** | Static JS arrays used in development (`NEXT_PUBLIC_USE_MOCK_DATA=true`) to test the UI without a running backend. |
| **`loadExists`** | Laravel method that adds a `{relation}_exists` boolean attribute to a model (e.g., `oauth_providers_exists`). Replaced by `load('oauthProviders')` for avatar support. |

---

## 9. Production Readiness — Missing Features

This section inventories everything that needs to be built, configured, or integrated before ODSArts can launch as a production e‑commerce store. Items are grouped by domain and priority.

### 9.1 Order & Checkout Pipeline (Critical — blocks revenue)

| Feature | Current Status | Effort | Notes |
|---|---|---|---|
| **Order creation endpoint** | ❌ Missing | Large | `POST /api/v1/checkout` or `POST /api/v1/orders` — validates cart, creates Order + OrderItems, decrements stock |
| **Cart persistence (server)** | ❌ Missing | Medium | `cart` table migration + `Cart` model + sync endpoints (`GET /cart`, `POST /cart/sync`). Prevents data loss across devices |
| **Cart merge on login** | ❌ Missing | Small | Merge guest localStorage cart into server cart after login |
| **Payment gateway integration** | ❌ Missing | Large | Razorpay (best for India), Stripe, or PhonePe. Webhook endpoint for payment status updates. Test mode + live mode |
| **Order confirmation page** | ❌ Missing | Small | `/order/confirmation/{orderNumber}` — shows order summary, payment status, next steps |
| **Order confirmation email** | ❌ Missing | Medium | Mail notification with invoice PDF attachment (or link) |
| **Order failure handling** | ❌ Missing | Medium | Retry payment, expired session handling, order status rollback |
| **Admin order management** | ❌ Missing | Medium | Filament `OrderResource` — view/update status, manual order creation, refund processing |
| **Invoice generation** | ❌ Missing | Medium | PDF invoice (e.g., Laravel DomPDF or Barryvdh Snappy) attached to order confirmation |

### 9.2 Shipping & Fulfillment (Critical)

| Feature | Current Status | Effort | Notes |
|---|---|---|---|
| **Shipping rate calculation** | ❌ Missing | Medium | By pincode (India Post / Shiprocket / Delhivery API), weight-based, or flat rate. `shipping_cost` field exists but unused |
| **Shipping address validation** | ❌ Missing | Small | Validate pincode, state, phone format for India |
| **Order tracking** | ❌ Missing | Medium | Tracking number input in admin, tracking page for customers, shipment status updates |
| **Admin order fulfilment workflow** | ❌ Missing | Medium | Status flow: pending → confirmed → processing → shipped → delivered. Mark as shipped with tracking number |
| **Returns / refunds** | ❌ Missing | Large | RMA flow: return request → admin approval → reverse pickup → refund → stock restore |

### 9.3 Authentication & Security (High)

| Feature | Current Status | Effort | Notes |
|---|---|---|---|
| **Email verification** | ❌ Missing | Medium | `MustVerifyEmail` interface + routes + frontend verification page. Prevents fake accounts |
| **Rate limiting** | ❌ Missing | Small | API rate limiter on auth routes (`login`, `register`, forgot-password) to prevent brute force |
| **Real Google OAuth credentials** | ⚠️ Placeholder | Small | Register app in Google Cloud Console, fill `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in `.env` |
| **Password reset email delivery** | ⚠️ Dev-only | Small | Currently uses Mailtrap/log. Switch to production mail driver (SES, SendGrid, Postmark, SMTP) |
| **CORS hardening** | ⚠️ Permissive | Small | Lock down `config/cors.php` to exact production domains only |
| **Session security** | ⚠️ Basic | Small | Configure `session.secure=true`, `session.http_only=true`, `session.same_site=lax` for production |
| **2FA / MFA** | ❌ Optional | Medium | Consider for admin accounts |

### 9.4 Admin Panel Enhancements (High)

| Feature | Current Status | Effort | Notes |
|---|---|---|---|
| **Order management resource** | ❌ Missing | Medium | Filament `OrderResource` — list with filters (status, date range, payment), view order items, update status |
| **User management resource** | ❌ Missing | Small | Filament `UserResource` — list users, view orders per user, disable accounts |
| **Inventory alerts** | ❌ Missing | Small | Low-stock badge/warning on Product Variant and Art Material Variant tables |
| **Dashboard widgets** | ❌ Missing | Small | Revenue chart, recent orders, low stock alerts, new enquiries count |
| **Activity log / audit trail** | ❌ Optional | Medium | Track admin actions on orders (status changes, refunds) |
| **Bulk product import/export** | ❌ Optional | Medium | CSV/Excel import for initial catalogue load |
| **Navigation group organization** | ⚠️ Partial | Small | Collections and Products currently have no nav group; assign to "Catalogue" or similar |

### 9.5 Catalogue & Content (Medium)

| Feature | Current Status | Effort | Notes |
|---|---|---|---|
| **Real product images** | ❌ Missing | Medium | Upload actual product/art photos to storage. Update seeders with real image paths |
| **Image optimization** | ❌ Missing | Medium | Use Spatie Media Library or manual thumbnails. Configure Next.js Image with remote CDN |
| **Image CDN** | ❌ Optional | Medium | Serve images from Cloudinary, Imgix, or S3 + CloudFront |
| **Product reviews / ratings** | ❌ Optional | Medium | Review model, frontend review form, admin moderation |
| **Related products** | ❌ Optional | Small | "You may also like" section on product detail page |
| **Search — full-text** | ❌ Missing | Medium | Integrate Meilisearch, Algolia, or Laravel Scout with database driver. Product/art search by name, description, tags |
| **Search — autocomplete** | ⚠️ Basic | Medium | Frontend SearchDrawer exists but backend search is limited |
| **Wishlist product data** | ⚠️ Partial | Small | `/wishlist` page shows slug names only; needs to fetch and display full product data (images, prices) |

### 9.6 Frontend Polish (Medium)

| Feature | Current Status | Effort | Notes |
|---|---|---|---|
| **Loading states** | ⚠️ Partial | Medium | Some pages lack skeleton loaders / suspense boundaries |
| **Error boundaries** | ❌ Missing | Medium | React error boundaries + friendly error pages |
| **SEO metadata** | ⚠️ Basic | Medium | Dynamic OG images, product schema.org JSON-LD, breadcrumbs |
| **PWA / offline support** | ❌ Optional | Large | Service worker, manifest, push notifications |
| **Analytics** | ❌ Missing | Small | GA4 / Plausible / Fathom integration |
| **Cookie consent** | ❌ Missing | Small | GDPR-compliant cookie banner |
| **Accessibility audit** | ❌ Not done | Medium | WCAG 2.1 AA compliance — keyboard nav, screen reader, contrast ratios |
| **Mobile responsiveness** | ⚠️ Partial | Medium | Some pages may need mobile layout tuning |
| **Custom 404/500 pages** | ❌ Missing | Small | Styled error pages matching brand |
| **Checkout loading states** | ❌ Missing | Small | Loading spinners during order submission |

### 9.7 Testing & Quality (Medium)

| Feature | Current Status | Effort | Notes |
|---|---|---|---|
| **Backend test coverage** | ⚠️ 25 tests | Medium | Only wishlist + orders tested. Need tests for: auth (login, register, logout, social), addresses (CRUD, ownership), collections (index, show), products (index, featured, show), art, frame options, framing calculator, enquiries |
| **Frontend tests** | ❌ Missing | Large | Component tests (Jest + React Testing Library) + E2E tests (Playwright/Cypress) for critical flows |
| **Load / performance testing** | ❌ Not done | Medium | Benchmark API endpoints, test with realistic catalogue (hundreds of products) |
| **Security audit** | ❌ Not done | Medium | Check for: mass assignment, SQL injection, XSS in admin, CSRF on all state-changing endpoints |

### 9.8 Infrastructure & DevOps (Medium)

| Feature | Current Status | Effort | Notes |
|---|---|---|---|
| **Production environment** | ❌ Not set up | Medium | VPS (DigitalOcean, Linode) or PaaS (Laravel Cloud, Forge, Railway) |
| **SSL / HTTPS** | ❌ Not configured | Small | Let's Encrypt via Certbot or Forge-managed SSL |
| **Database migration strategy** | ⚠️ Dev-only | Small | Plan for zero-downtime migrations in production |
| **Backup strategy** | ❌ Not configured | Small | Automated DB backups + media file backups |
| **CI/CD pipeline** | ❌ Not configured | Medium | GitHub Actions — run tests + lint + deploy on push to main |
| **Environment variable management** | ⚠️ .env files | Small | Use Laravel Vault, Forge env files, or GitHub secrets |
| **Logging & monitoring** | ❌ Not configured | Medium | Laravel logs → Papertrail/Logtail. Server monitoring with New Relic or Laravel Pulse |
| **Error tracking** | ❌ Not configured | Small | Sentry for both Laravel + Next.js |
| **Queue worker** | ❌ Not configured | Small | Supervisor config for `php artisan queue:work` (needed for emails, notifications) |
| **Storage for uploads** | ⚠️ Local disk | Medium | Switch from `public/` to S3 or Spaces for production file uploads |

### 9.9 Legal & Compliance (High)

| Feature | Current Status | Effort | Notes |
|---|---|---|---|
| **Privacy Policy page** | ❌ Missing | Small | Static page — data collection, cookies, third-party services |
| **Terms of Service page** | ❌ Missing | Small | Static page — terms of sale, returns policy, cancellation policy |
| **GDPR compliance** | ❌ Missing | Medium | Data export endpoint, account deletion, cookie consent |
| **Tax configuration** | ❌ Missing | Medium | GST calculation for India (CGST + SGST/IGST). `tax` field exists on orders but no calculator |
| **Legal business information** | ❌ Missing | Small | Business registration, address, contact on footer/about page |

### 9.10 Marketing & Growth (Optional / Post-launch)

| Feature | Effort | Notes |
|---|---|---|
| **Newsletter integration** | Medium | Connect Mailchimp / Brevo / Sendinblue to the existing `/newsletter/subscribe` endpoint |
| **Discount / coupon system** | Medium | `coupons` table + percentage/flat discount logic + admin coupon CRUD |
| **Abandoned cart emails** | Medium | Track cart state, email after X hours with cart link |
| **Wishlist price-drop alerts** | Small | Email user when a wished product goes on sale |
| **Referral program** | Medium | Referral codes, discount for both parties |
| **Blog / inspiration articles** | Medium | CMS-style posts (uses existing `/inspiration` route) |
| **Customer accounts dashboard** | ⚠️ Basic | Sales history, address book, payment methods — partially done |
| **Multi-language (i18n)** | Large | Laravel localization + Next.js i18n |
| **Multi-currency** | Medium | Display prices in USD/GBP/EUR alongside INR |

### 9.11 Feature Maturity Summary

```
Legend:
  ✅ Done       ⚠️ Partial / Needs work
  ❌ Missing    🔲 Optional (post-launch)

Catalogue & Browsing
  ✅ Collection pages (list + detail)
  ✅ Product pages (list + detail) with variants + finishes
  ✅ Art product pages with material variants
  ✅ Frame options API + custom framing calculator
  ✅ Testimonials on homepage
  ⚠️ Product images are placeholder paths
  ⚠️ Search drawer exists but backend search is basic
  ❌ Full-text search (Meilisearch/Algolia)
  ❌ Related products

Auth & Accounts
  ✅ Email/password registration + login
  ✅ Sanctum SPA session auth
  ✅ Google OAuth login (needs real credentials)
  ✅ Profile update (name, email, phone)
  ✅ Password change
  ✅ Address CRUD
  ✅ Wishlist with server sync
  ❌ Email verification
  ❌ Rate limiting on auth

Order & Payment
  ⚠️ Order + OrderItem DB tables exist
  ⚠️ Cart UI (drawer + /cart page + /checkout page)
  ❌ Order creation endpoint
  ❌ Server-side cart persistence
  ❌ Payment gateway (Razorpay / Stripe)
  ❌ Order confirmation email
  ❌ Invoice PDF

Admin (Filament)
  ✅ Collection, Product, Art Category, Art Product CRUD
  ✅ Product Variant + Finish Option + Art Material Variant relation managers
  ✅ Frame Options CRUD
  ✅ Testimonials CRUD
  ✅ Enquiries (read-only with status actions)
  ❌ Order management resource
  ❌ User management resource
  ❌ Dashboard widgets / analytics
  ❌ Inventory alerts

Frontend
  ✅ Brand design system (ivory/gold/obsidian)
  ✅ Responsive layout
  ✅ Animations (framer-motion)
  ✅ Auth guards (AuthGuard, GuestGuard)
  ⚠️ Loading states are partial
  ❌ Error boundaries
  ❌ SEO schema.org markup
  ❌ Accessibility audit
  ❌ Analytics
  ❌ Cookie consent

Infrastructure
  ❌ Production server / domain
  ❌ SSL certificate
  ❌ CI/CD pipeline
  ❌ Error monitoring (Sentry)
  ❌ Automated backups
  ❌ Queue worker

Legal
  ❌ Privacy Policy page
  ❌ Terms of Service page
  ❌ GDPR compliance
  ❌ GST tax setup
```
