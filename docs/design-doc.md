# PhysPlay — Software Architecture Design Document

**Status:** Draft
**Date:** 2026-03-03
**PRD Reference:** [prd.md](./prd.md) | [prd-phase-1.md](./prd-phase-1.md) | [product-brief.md](./product-brief.md)

---

## 1. Context & Scope

### 1.1 Problem Statement

PhysPlay is a 3D science gamification platform that turns physics concepts into a "Predict, Play, Discover" game. Users predict outcomes, run 3D simulations via God Hand interaction (first-person tabletop manipulation), and discover scientific principles through the gap between expectation and reality. The system must deliver real-time physics simulation at 60fps on PC and 30fps on mobile, entirely in the browser, with no installation.

Phase 1 ships the Mechanics Lab (3 stations, 26 challenges) as a client-only web application — no backend, no accounts, all data stored locally in SQLite (WASM + OPFS). This validates the core loop before investing in server infrastructure.

### 1.2 System Context

```
┌─────────────────────────────────────────────────────────────┐
│                        PhysPlay Web App                      │
│                                                              │
│  ┌─────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Site   │  │  Experience  │  │  Engine (Simulation) │   │
│  │  (2D)   │  │  (3D + HUD)  │  │  (ECS + Physics)     │   │
│  └─────────┘  └──────────────┘  └──────────────────────┘   │
│                         │                                    │
│                    ┌────┴────┐                               │
│                    │ SQLite  │                               │
│                    │ (OPFS)  │                               │
│                    └─────────┘                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────┼──────────┐
            │          │          │
     ┌──────┴───┐     │    ┌──┴───────────┐
     │ Analytics│     │    │ CDN / Static │
     │ Service  │     │    │ Hosting      │
     │(PostHog) │     │    │(Vercel/CF    │
     └──────────┘     │    │ Pages)       │
                      │    └──────────────┘
```

**Actors:**
- **Students (B2C):** Primary users. Access via URL, no account required. Run challenges, build local progress.
- **External services:** Analytics (PostHog), static hosting (Vercel).

**Phase evolution:**
- **Phase 1:** Pure client-side SPA. No backend. SQLite WASM + OPFS for persistence.
- **Phase 3+:** Backend API (accounts, teacher dashboard, progress sync). Server introduced only when validated need exists.

### 1.3 Assumptions

1. **Client-only is viable for Phase 1.** Local storage (SQLite WASM + OPFS) suffices for user progress without accounts. Users accept data loss risk from browser cache clearing.
2. **Browser 3D performance is sufficient.** WebGPU (with WebGL fallback) can deliver 60fps physics simulation on mid-range PCs and 30fps on mid-range mobile.
3. **Rapier WASM provides adequate physics.** Educational accuracy (not research-grade) is sufficient. Custom physics solvers are not needed for Phase 1 engines.
4. **JSON-driven challenges are extensible.** The engine + params + predict + discover data model supports all Phase 1 challenge types and can accommodate future engines and UGC.
5. **Static hosting handles Phase 1 scale.** 10K UV/month is well within CDN-served SPA capacity. No SSR required for the app itself.
6. **WebGPU adoption is sufficient.** Chrome, Edge, and Safari (preview) support WebGPU. Firefox fallback to WebGL is acceptable with reduced visual quality.

---

## 2. Goals & Non-Goals

### 2.1 Goals

- **G1:** Deliver 60fps 3D physics simulation on mid-range PC (GTX 1060 / M1 equivalent), 30fps on mid-range mobile (Snapdragon 7xx / A14 equivalent).
- **G2:** Initial page load under 3 seconds on 50Mbps connection. First interactive challenge within 5 seconds.
- **G3:** Support 3 simulation engines (projectile, collision-energy, wave) executing JSON-defined challenges with 4 prediction types (trajectory, binary, pattern, placement).
- **G4:** Persist user progress locally (SQLite WASM + OPFS) with no account requirement. Support data migration path to server in Phase 3.
- **G5:** Architecture supports XR mode addition (Phase 2+) without rewriting scene/interaction code — input abstraction from day one.
- **G6:** i18n (en/ko) for all user-facing text, Light/Dark theme, responsive layout (PC-first, mobile-supported).
- **G7:** Client-side analytics capturing core loop funnel (predict → play → discover) with sufficient granularity for Phase 1 validation metrics.

### 2.2 Non-Goals

- **NG1:** No backend API in Phase 1. Server-side compute, authentication, and database are deferred to Phase 3.
- **NG2:** No multiplayer or real-time sync. Single-user experience only.
- **NG3:** No XR runtime implementation. Architecture readiness only — `@react-three/xr` integration deferred to Phase 2.
- **NG4:** No ML-based adaptive engine. Rule-based challenge selection only (metadata filtering + priority rules).
- **NG5:** No UGC editor. Challenge JSON structure supports future UGC but no creation UI is built.
- **NG6:** No Service Worker / PWA offline mode. Offline simulation works naturally (client-only), but asset caching via Service Worker is Phase 2.
- **NG7:** No native app. Web-only, accessed via URL.

---

## 3. High-Level Architecture

### 3.1 Architecture Style

**System architecture:** Client-only SPA (Phase 1) → Client + API (Phase 3+).

Phase 1 has no backend — the entire application is a statically hosted SPA. This is the correct choice because:

1. **No server-side state exists.** Progress is local, challenges are bundled JSON, physics runs client-side. A backend would add complexity with zero value.
2. **Operational cost is near-zero.** Static hosting (Vercel/Cloudflare Pages) scales to 10K+ UV/month with no infrastructure management.
3. **Fastest path to validation.** Eliminating backend development cuts scope by ~40%, letting us validate the core loop sooner.

**Trade-off:** No server means no cross-device sync, no teacher analytics, no abuse prevention. These are acceptable Phase 1 non-goals. Phase 3 introduces a backend when account/B2B features are needed.

**Frontend framework:** Next.js on Vercel.

Next.js over TanStack Start because:
- Landing page and hub need SSR/SSG for SEO (educational product discovery happens via search)
- Static export for the 2D site pages, client-side rendering for the 3D experience
- Vercel deployment provides zero-config CDN, image optimization, and edge delivery
- The 3D experience is a client-side React Three Fiber canvas — framework choice doesn't affect 3D rendering performance

**Code structure:** Feature-Sliced Design for `site/` (2D), domain-driven for `experience/` (3D) and `engine/`, as defined in [client-structure.md](./client-structure.md).

### 3.2 Container Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    PhysPlay Web Application                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     Next.js App                          │ │
│  │                                                          │ │
│  │  ┌──────────┐     ┌──────────────────────────────────┐  │ │
│  │  │  site/   │     │         experience/               │  │ │
│  │  │          │     │                                   │  │ │
│  │  │ Landing  │     │  ┌─────────┐  ┌───────────────┐  │  │ │
│  │  │ Hub      │     │  │ canvas/ │  │    scene/      │  │  │ │
│  │  │ Settings │     │  │ WebGPU  │  │  objects/      │  │  │ │
│  │  │          │     │  │ detect  │  │  environments/ │  │  │ │
│  │  │ (SSG/    │     │  │ WebGL   │  │  cameras/      │  │  │ │
│  │  │  CSR)    │     │  │ fallbk  │  │  materials/    │  │  │ │
│  │  └──────────┘     │  └─────────┘  └───────────────┘  │  │ │
│  │       │           │       │                           │  │ │
│  │       │           │  ┌────┴────┐  ┌───────────────┐  │  │ │
│  │       │           │  │  hud/   │  │     xr/       │  │  │ │
│  │       │           │  │controls │  │  (stub only   │  │  │ │
│  │       │           │  │overlays │  │   Phase 1)    │  │  │ │
│  │       │           │  │panels   │  │               │  │  │ │
│  │       │           │  └─────────┘  └───────────────┘  │  │ │
│  │       │           └──────────────────────────────────┘  │ │
│  │       │                          │                       │ │
│  │  ┌────┴──────────────────────────┴──────────────────┐   │ │
│  │  │                   shared/                         │   │ │
│  │  │  stores/ (Zustand)  │  types/  │  lib/  │  i18n/ │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │                                  │
│  ┌─────────────────────────┴───────────────────────────────┐ │
│  │                      engine/                             │ │
│  │                                                          │ │
│  │  ┌───────────┐  ┌────────────┐  ┌───────────────────┐  │ │
│  │  │   ecs/    │  │  physics/  │  │   adapters/       │  │ │
│  │  │  Koota    │  │  Rapier    │  │  rapier → ECS     │  │ │
│  │  │  World    │  │  WASM      │  │  sync bridge      │  │ │
│  │  └───────────┘  └────────────┘  └───────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │                                  │
│  ┌─────────────────────────┴───────────────────────────────┐ │
│  │                    domains/                              │ │
│  │                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │ mechanics-   │  │  challenge/  │  │  adaptive/   │  │ │
│  │  │ lab/         │  │              │  │              │  │ │
│  │  │ projectile   │  │  loader      │  │  rule-engine │  │ │
│  │  │ collision    │  │  validator   │  │  tag-tracker  │  │ │
│  │  │ wave         │  │  runner      │  │  difficulty   │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │                                  │
│                    ┌───────┴───────┐                          │
│                    │  SQLite WASM  │                          │
│                    │  (OPFS)       │                          │
│                    └───────────────┘                          │
└──────────────────────────────────────────────────────────────┘

External:
  ┌──────────┐  ┌──────────┐
  │  Vercel  │  │ PostHog  │
  │  CDN +   │  │ Analytics│
  │  Edge    │  │          │
  └──────────┘  └──────────┘
```

**Container responsibilities:**

| Container | Technology | Responsibility |
|-----------|-----------|----------------|
| **Next.js App** | Next.js 15, React 19, TypeScript | App shell, routing, SSG for landing/hub, CSR for 3D experience |
| **site/** | React, FSD pattern | 2D pages: landing, research hub, settings. SSG/CSR as appropriate |
| **experience/** | React Three Fiber, Drei, TSL shaders | 3D viewport, HUD overlays, camera control, visual effects |
| **engine/** | Koota ECS, Rapier WASM | Physics simulation, ECS world, entity management. **No React dependency** |
| **domains/** | TypeScript | Domain logic: challenge loading/validation/execution, adaptive rule engine, station/space management |
| **shared/** | Zustand, i18next | Cross-layer state (theme, locale, user progress), shared types, utilities |
| **SQLite (OPFS)** | `@sqlite.org/sqlite-wasm`, SAHPool VFS | Local persistence: user profile, challenge results, tag accuracy, station progress |

### 3.3 Component Overview

**Domain modules** (bounded contexts within `domains/`):

| Module | Responsibility | Critical Path? |
|--------|---------------|---------------|
| **mechanics-lab/** | Mechanics Lab space: 3 station configurations, space theme definition, station navigation logic | Yes — the only space in Phase 1 |
| **challenge/** | Challenge lifecycle: load JSON → validate schema → configure engine → run simulation → judge prediction → record result | Yes — core loop execution |
| **adaptive/** | Next-challenge selection: tag accuracy tracking, difficulty adjustment, repetition prevention, discover depth selection | Yes — determines challenge sequencing |
| **onboarding/** | First-visit flow: guided first challenge, progressive hint system, hub reveal | Yes — first-time user retention |
| **progress/** | SQLite CRUD: read/write user profile, challenge results, tag accuracy, station progress | Yes — all local state |
| **analytics/** | Event dispatch: core loop events, navigation events, settings changes. Adapter pattern for swapping analytics providers | No — fires and forgets |

**Engine modules** (within `engine/`):

| Module | Responsibility |
|--------|---------------|
| **ecs/components/** | Data definitions: Position, Velocity, Mass, Drag, Spin, GravitySources, etc. |
| **ecs/systems/** | Per-frame logic: GravitySystem, DragSystem, MagnusSystem, CollisionSystem, WaveSystem |
| **ecs/prefabs/** | Entity templates: Projectile, Track, Pendulum, WaveSource, etc. |
| **physics/rapier/** | Rapier WASM initialization, world creation, rigid body management, collision detection |
| **adapters/rapier/** | Bridge: sync Rapier simulation state → ECS components each frame |

---

## 4. Data Architecture

### 4.1 Data Flow

**Flow 1: Core Loop (Predict → Play → Discover)**

```
Challenge JSON (static bundle)
  → domains/challenge/loader validates schema (Zod)
  → domains/challenge/runner configures engine/ecs with params
  → experience/scene renders initial state
  → User submits prediction (HUD → domains/challenge)
  → User triggers simulation (God Hand interaction)
  → engine/ecs/systems run per-frame physics (Rapier)
  → engine/adapters/rapier syncs → ECS → experience/scene renders
  → Simulation completes → domains/challenge/judge evaluates prediction
  → domains/adaptive selects discover depth (tag accuracy lookup)
  → HUD shows Discover content
  → domains/progress writes result to SQLite
  → domains/adaptive selects next challenge (rule engine)
  → analytics/ fires events at each stage transition
```

**Flow 2: Adaptive Challenge Selection**

```
domains/adaptive reads from SQLite:
  - station_progress.completedChallenges (filter completed)
  - station_progress.consecutiveCorrect/Wrong (difficulty range)
  - tag_accuracy (weakness prioritization)
  → Step 1: Filter uncompleted challenges with satisfied prerequisites
  → Step 2: Filter by difficulty range (current ±1, adjusted by streak)
  → Step 3: Sort by weakest tag accuracy (< 0.5 → 70% priority)
  → Step 4: Exclude same God Hand pattern / 3x same predict type
  → Step 5: Return top candidate challenge ID
  → domains/challenge/loader loads challenge JSON
```

**Flow 3: Hub → Lab Transition**

```
site/hub (2D React) user clicks station
  → shared/stores/navigation sets target station
  → Next.js route transition to /lab
  → experience/canvas initializes WebGPU (or WebGL fallback)
  → experience/environments loads mechanics-lab theme (skybox, lighting, particles)
  → experience/cameras transitions to station viewpoint (0.5s tween)
  → domains/challenge/loader loads next challenge for station
  → HUD activates PREDICT phase
```

### 4.2 Storage Strategy

**SQLite WASM (`@sqlite.org/sqlite-wasm`)** — `physplay.sqlite3`, persisted via OPFS SAHPool VFS

| Table | Schema | Access Pattern | Consistency |
|-------|--------|----------------|-------------|
| `user_profile` | Single row: locale, theme, sound, onboarding state | Read on app init, write on settings change | Strong (single writer) |
| `challenge_results` | Append-only log of challenge completions | INSERT after each challenge, SELECT for analytics/export | Strong (single writer) |
| `tag_accuracy` | Running aggregates per concept tag | SELECT/UPDATE after each challenge completion | Strong — must be accurate for adaptive engine |
| `station_progress` | Per-station state: completed challenges, difficulty, streaks | SELECT/UPDATE after each challenge | Strong — drives challenge selection |
| `session_meta` | Session start metadata | INSERT on session start | Eventual (analytics only) |

**Why SQLite WASM + OPFS (SAHPool VFS):**
- **SQL queries** — adaptive engine aggregation (tag accuracy JOIN, GROUP BY) is natural SQL instead of imperative IndexedDB cursor iteration
- **Phase 3 migration** — client SQLite schema maps directly to server PostgreSQL. Queries are portable with minimal changes. IndexedDB → PostgreSQL would require a complete data access rewrite.
- **SAHPool VFS** — uses OPFS `createSyncAccessHandle()` in a dedicated Worker. **No SharedArrayBuffer required**, therefore **no COOP/COEP headers needed**. This avoids cross-origin resource restrictions that would complicate Three.js asset loading (glTF, KTX2, fonts, PostHog SDK).
- **Single-tab constraint is acceptable** — SAHPool VFS allows only one tab to open the DB at a time. PhysPlay is a 3D simulation game; users don't multi-tab it. If a second tab attempts to open, show a "already open in another tab" message.
- **Browser support** — OPFS with `createSyncAccessHandle()` is supported in Chrome 102+, Safari 15.2+, Firefox 111+. As of 2026, this covers all target browsers.

**Why not IndexedDB (Dexie.js):**
- Verbose cursor-based API for aggregation queries the adaptive engine needs
- Unreliable in Safari private browsing (known issue)
- No schema portability to server PostgreSQL in Phase 3

**Architecture:**
```
Main thread (React/R3F)
  ↕ postMessage
Dedicated Worker (SQLite WASM + SAHPool VFS)
  ↕ synchronous file I/O
OPFS (physplay.sqlite3)
```

All DB access goes through `domains/progress/`, which sends messages to the Worker. The Worker runs `@sqlite.org/sqlite-wasm` with SAHPool VFS and executes SQL synchronously. Results return via `postMessage`. This keeps the main thread unblocked — critical for 60fps rendering.

**Bundle size:** SQLite WASM adds ~300KB gzipped (WASM binary). Loaded lazily on first lab entry alongside Rapier WASM (~200KB). Landing page and hub (pure 2D) load no WASM.

**Retention:** Phase 1 data is small (hundreds of KB per user for 26 challenges). No cleanup needed. `session_meta` is lowest priority for deletion if capacity issues arise.

**Migration path (Phase 3):** All tables have `created_at`/`updated_at` timestamps. `user_profile.id` (crypto.randomUUID) serves as temporary identifier. On account creation, Worker exports all tables as JSON → uploads to server API → server merges with conflict resolution by timestamp. User consent flow required. Schema alignment between client SQLite and server PostgreSQL minimizes transformation logic.

### 4.3 Static Content

**Challenge JSON files** are bundled at build time:

```
content/challenges/
├── projectile/
│   ├── monkey-hunter.json
│   ├── newtons-cannon.json
│   └── ... (10 files)
├── collision-energy/
│   └── ... (8 files)
└── wave/
    └── ... (8 files)
```

Build-time validation with Zod ensures all 26 challenge files conform to the schema defined in Phase 1 PRD §5.1. Invalid challenges fail the build.

**Discover content** (concept explanations, Level 1/2/3 text) is co-located in challenge JSON `discover` field. No separate content CMS for Phase 1.

**3D assets** (glTF models, KTX2 textures, audio) are in `experience/shared/assets/`, served via Vercel CDN with immutable cache headers.

### 4.4 Caching Strategy

| Asset Type | Cache Policy | Rationale |
|-----------|-------------|-----------|
| JS/CSS bundles | Immutable (content-hashed filenames) | Standard Next.js output |
| glTF/KTX2/audio | `Cache-Control: public, max-age=31536000, immutable` | 3D assets don't change between deploys. Content-hash filenames via build pipeline |
| Challenge JSON | Bundled in JS (tree-shaken per route) | Small enough to inline. No runtime fetch needed |
| SQLite (OPFS) | N/A (local) | Persistent until user clears browser data |

**No CDN edge caching layer needed** — Vercel's built-in CDN handles static assets. No dynamic content exists in Phase 1.

---

## 5. Infrastructure & Deployment

### 5.1 Compute Platform

**Vercel** (static + edge) for Phase 1.

Why Vercel:
- Next.js is built by Vercel. Zero-config deployment, automatic optimizations.
- Global CDN for static assets (critical for 3D asset delivery latency).
- Free tier covers Phase 1 traffic (10K UV/month).
- Automatic preview deployments for PR-based development.

Why not Cloudflare Pages:
- Next.js SSG/SSR features work best on Vercel. Cloudflare's Next.js support requires @cloudflare/next-on-pages adapter with limitations.
- Phase 1 doesn't need Workers compute at the edge.

Why not self-hosted:
- Zero operational benefit for a static site. CDN + CI/CD for free on Vercel beats any self-hosted setup.

**Scaling model:** Static assets are CDN-cached globally. No compute to scale. Vercel handles traffic spikes automatically.

### 5.2 Deployment Strategy

```
PR created → Vercel preview deployment (automatic)
  → Manual QA on preview URL (3D + mobile testing)
  → PR merged to main → Vercel production deployment (automatic)
  → Instant rollback via Vercel dashboard if needed
```

No blue-green or canary needed — static sites are atomically deployed. Vercel maintains previous deployments for instant rollback.

**Build pipeline additions:**
1. Zod validates all challenge JSON files at build time
2. Lighthouse CI checks performance budget (LCP < 3s, TBT < 200ms)
3. Bundle size check (fail if JS bundle exceeds 500KB gzipped, excluding WASM)

### 5.3 Environment Topology

| Environment | Purpose | Differences |
|------------|---------|-------------|
| **Local dev** | Development | Vite dev server, HMR, WebGPU (or WebGL if GPU unavailable) |
| **Preview** | PR review | Vercel preview deployment, production build, unique URL per PR |
| **Production** | Live users | Vercel production, CDN-optimized, analytics active |

No staging environment needed — preview deployments serve this purpose. Analytics is disabled in preview (environment variable toggle).

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization [Phase 3+]

Phase 1 has no authentication. No user identity exists — all data is anonymous and local.

**Phase 3 plan (noted for architecture awareness):**
- Social login (Google OAuth2) + self-issued JWT
- RBAC: student (default), teacher (dashboard access), admin
- Local SQLite data migrated to server on first login with user consent
- Backend enforces authorization — frontend is untrusted

### 6.2 Observability

**Analytics (user behavior):**

| Provider | Role | Phase |
|----------|------|-------|
| **PostHog** (primary) | Page views, UTM tracking, custom events, basic funnels. 2D screens (landing, hub) tracking only for Phase 1 | Phase 1 |
| **Custom event layer** | Core loop events (predict_submit, play_complete, discover_view, etc.) dispatched to SQLite event log + PostHog custom events | Phase 1 |
| **PostHog** (expanded) | Session replay, feature flags, complex funnels when user base warrants it | Phase 2+ |

**Phase 1 PostHog scope:** Track 2D screens (landing page, hub) and core loop funnel events only. Session replay and feature flags are disabled in Phase 1 to minimize performance impact on the 3D experience. PostHog JS SDK is lazy-loaded and excluded from the critical rendering path.

**Error tracking:**
- **Sentry** with source maps. Captures JavaScript errors, unhandled promise rejections, WebGPU/WebGL initialization failures.
- Custom breadcrumbs for challenge lifecycle: `challenge_load`, `engine_init`, `simulation_start`, `simulation_complete`.
- Performance monitoring: Web Vitals (LCP, CLS, FID) + custom FPS counter reporting.

**Performance monitoring:**
- Built-in FPS counter (development + opt-in production via URL param)
- `PerformanceObserver` for Long Tasks (>50ms) on main thread
- Rapier WASM step timing (logged if >16ms, indicating simulation bottleneck)
- WebGPU/WebGL renderer info logged to Sentry context (GPU model, API version, fallback status)

### 6.3 Error Handling & Resilience

**WebGPU → WebGL fallback:**
```
App init → detect WebGPU support (navigator.gpu)
  → Supported: initialize WebGPU renderer (Three.js WebGPURenderer)
  → Not supported: fallback to WebGL2 renderer (Three.js WebGLRenderer)
  → Neither: show "browser not supported" message with Chrome/Edge recommendation
```

Visual quality differences in WebGL mode:
- TSL shaders compiled to GLSL (automatic via Three.js)
- Reduced post-processing (no compute shaders)
- Particle count reduction (configurable per quality tier)

**Challenge loading errors:**
- JSON validation failure at build time → build fails (prevented from reaching production)
- Runtime schema migration (version mismatch) → attempt migration, fallback to skip challenge + Sentry alert
- Missing 3D asset → placeholder geometry + Sentry alert. Never block the entire experience for one missing asset.

**SQLite / OPFS errors:**
- WASM initialization failure → fallback to in-memory SQLite (session-only, progress lost on close), show warning toast
- OPFS write failure (quota exceeded) → purge oldest `session_meta` records, retry
- DB locked (second tab) → show "PhysPlay is already open in another tab" message, block lab entry
- Private browsing mode detection → show persistent banner ("Progress won't be saved in private mode"). OPFS may be unavailable — fallback to in-memory SQLite.

**Physics simulation errors:**
- Rapier WASM initialization failure → show "simulation unavailable" with browser recommendation
- NaN/Infinity in physics state → clamp values, reset simulation, allow user to retry
- Simulation step exceeds 32ms → reduce physics substeps, log performance warning

### 6.4 Security

**Threat model for Phase 1 is minimal** — no server, no user data transmission, no authentication. Key considerations:

- **XSS:** React's JSX escaping handles most vectors. CSP headers via Vercel config: `script-src 'self'`, `style-src 'self' 'unsafe-inline'` (required by Three.js).
- **Supply chain:** Lock file (`pnpm-lock.yaml`), Dependabot for dependency updates, `npm audit` in CI.
- **Data exposure:** SQLite/OPFS data is local-only and contains no PII (no names, emails, or identifiers beyond a random UUID).
- **WASM integrity:** Rapier WASM binary is bundled and served from same origin with SRI hash.
- **Content Security Policy:** Strict CSP preventing inline scripts, limiting asset origins to `self` and PostHog domain.

### 6.5 Performance & Scalability

**Load profile:** 10K UV/month Phase 1 target. Pure CDN traffic — no compute scaling concern.

**Client-side performance budget:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial JS bundle (gzipped) | < 300KB (excluding WASM) | Build-time check |
| Rapier WASM (gzipped) | ~200KB (fixed) | One-time load, lazy on lab entry |
| SQLite WASM (gzipped) | ~300KB (fixed) | One-time load, lazy on lab entry |
| LCP (landing page) | < 2.5s | Lighthouse CI |
| LCP (lab entry) | < 3s (including 3D init) | Custom perf mark |
| FPS (PC, mid-range) | 60fps sustained | Runtime FPS counter |
| FPS (mobile, mid-range) | 30fps sustained | Runtime FPS counter |
| Memory (PC) | < 512MB | DevTools monitoring |
| Memory (mobile) | < 256MB | DevTools monitoring |

**3D performance strategy:**

| Strategy | Impact | When Applied |
|----------|--------|-------------|
| **Asset compression** (KTX2 textures, Draco/Meshopt glTF) | 60-80% smaller assets, faster decode | Always |
| **LOD (Level of Detail)** | Reduce polygon count at distance | Objects with >10K triangles |
| **Instanced rendering** | Single draw call for repeated objects | Particles, grid elements, track pieces |
| **Frustum culling** | Skip rendering off-screen objects | Automatic via Three.js |
| **Quality tiers** | Particle count, shadow resolution, post-processing | Auto-detect by GPU capability + manual override |
| **Lazy 3D init** | Don't initialize WebGPU/Rapier/SQLite WASM until lab entry | Landing and hub are pure 2D |
| **Code splitting** | engine/ and experience/ loaded only on lab route | Next.js dynamic import |

**Rapier WASM performance:**
- Fixed timestep (1/60s) with interpolation for rendering
- Max 4 substeps per frame to prevent spiral of death
- Object pooling for frequently created/destroyed entities (projectiles, particles)

---

## 7. Integration Points

### 7.1 Analytics Service (PostHog) [Phase 1]

- **Provides:** Page view tracking, custom event tracking, UTM campaign attribution, basic funnels
- **Protocol:** PostHog JS SDK, lazy-loaded. `POST` events to PostHog Cloud
- **Failure mode:** Events silently dropped. No impact on user experience. Ad-blockers may block — accept this limitation for Phase 1.
- **Fallback:** SQLite event log captures all events locally. Can be batch-exported for analysis.
- **Phase 1 config:** Session replay OFF, feature flags OFF, autocapture OFF (custom events only). Minimizes SDK overhead.

### 7.2 NASA Open API [Phase 4]

- **Provides:** Real planetary/orbital data for Space Observatory
- **Protocol:** REST API, API key required (free tier)
- **Failure mode:** Cache last-known data. Observatory challenges work with bundled default data.
- **Phase 1 impact:** None. Architecture note only.

### 7.3 PDB / PubChem [Phase 3]

- **Provides:** Real molecular structure data for Molecular Lab
- **Protocol:** REST API, free access
- **Failure mode:** Cache last-known data. Bundled default molecule set as fallback.
- **Phase 1 impact:** None. Architecture note only.

---

## 8. Migration & Rollout

### 8.1 Phase 1 → Phase 3 Migration (Client → Client+Server)

When accounts are introduced in Phase 3:

**Strategy:** Additive migration. The client-only architecture remains functional. Server sync is layered on top.

```
Phase 1: SQLite (OPFS) ←→ Worker ←→ App (local only)
Phase 3: SQLite (OPFS) ←→ Worker ←→ App ←→ API Server ←→ PostgreSQL
                                      (local-first, server-sync)
```

**Data migration approach:**
1. User creates account (Google OAuth)
2. Worker exports all SQLite tables as JSON
3. Bulk upload to server with `user_profile.id` as dedup key
4. Server merges into PostgreSQL: if conflict (same challenge, different timestamps), latest wins. Schema alignment between client SQLite and server PostgreSQL minimizes transformation.
5. After successful sync, app switches to server-primary with SQLite as offline cache
6. User consent required before any data leaves the device

**Architecture preparation (Phase 1):**
- All SQLite access goes through `domains/progress/` → Worker message layer — single module to add server sync later
- Data schemas include `id`, `timestamp`, `version` fields for conflict resolution
- Analytics event schema is provider-agnostic (adapter pattern) — swapping PostHog for another provider requires only a new adapter

### 8.2 Phase 1 → Phase 2 Migration (3D → 3D+XR)

**Strategy:** Input abstraction enables XR addition without scene rewrites.

```
Phase 1: Mouse/Touch → InputAdapter → God Hand actions
Phase 2: Mouse/Touch → InputAdapter → God Hand actions
         HandTracking → InputAdapter → God Hand actions (same actions)
```

**Architecture preparation (Phase 1):**
- All God Hand interactions are defined as semantic actions (`throw`, `place`, `grab`, `drag`), not raw input events
- `experience/scene/` components never reference `MouseEvent` or `TouchEvent` directly — they consume actions from an input adapter
- `xr/` directory exists as a stub with session management interface — no implementation
- Camera system supports both orbit (web) and XR-tracked modes via configuration

---

## 9. Risks & Open Questions

### 9.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Rapier WASM physics doesn't handle wave simulation adequately | High — wave station blocked | Medium | Wave engine may need custom solver (grid-based wave equation). Spike in Discovery milestone. Rapier for rigid-body engines (projectile, collision), custom for wave. |
| WebGPU browser coverage gaps (Firefox, older Safari) | Medium — reduced user reach | Medium | WebGL fallback is automatic. Accept visual quality reduction. Test on Firefox WebGL path. |
| 3D asset loading exceeds 3s budget on mobile | High — onboarding abandonment | High | Progressive loading: show 2D loading screen → load minimal scene → stream remaining assets. Split assets per station (only load active station). |
| OPFS unavailable in some private browsing modes | Low — progress loss for private-mode users | Medium | Detect OPFS availability at init. Fallback to in-memory SQLite for session (progress lost on close). Show persistent warning banner. Lower risk than IndexedDB: OPFS is more consistently available across browsers. |
| God Hand trajectory drawing UX is unintuitive | High — core loop breaks at prediction | Medium | Discovery milestone: user test trajectory drawing with 3 users. Implement alternative: click-point-based path, pre-drawn curve adjustment. |
| Bundle size exceeds budget (Three.js + Rapier + SQLite WASM + React) | Medium — slow load | Medium | Tree-shake Three.js (import only used modules), code-split engine per station, lazy load all WASM (Rapier + SQLite) on lab entry. Landing/hub load no WASM. |

### 9.2 Open Questions

1. **Wave engine implementation:** Does Rapier's rigid body simulation support wave propagation, or do we need a custom grid-based wave solver? Needs spike during Discovery. Options: (A) Rapier for all engines, (B) Custom 2D wave grid + Rapier for rigid-body, (C) Full custom physics for all engines.

2. **Trajectory prediction judgment:** DTW (Dynamic Time Warping) vs area-based vs point-distance for `trajectory` type accuracy scoring? Needs prototyping with real user-drawn curves. The `tolerance: 0.15` default needs user testing validation.

3. **WebGPU → WebGL visual parity:** How much visual degradation is acceptable in WebGL mode? Options: (A) Near-parity with shader compilation differences only, (B) Distinct "quality tiers" with visible differences, (C) WebGPU-only features disabled entirely in WebGL.

4. **Asset pipeline tooling:** glTF + KTX2 compression pipeline for 3D assets. Options: (A) Manual (Blender export + gltf-transform CLI), (B) Automated build step (gltf-transform in CI), (C) Third-party asset pipeline (PlayCanvas, Needle).

5. **i18n for challenge content:** Challenge `predict.question` and `discover.level1/2/3` fields contain educational text. Options: (A) Inline i18n keys in JSON, resolved at runtime, (B) Separate locale files per challenge, (C) Duplicate challenge JSON per locale.

6. ~~**Plausible vs self-hosted analytics**~~ → Resolved: PostHog Cloud (free tier, 1M events/month) from Phase 1. No provider migration needed.

---

## 10. Architecture Decision Records (ADRs)

### ADR-1: Client-Only Architecture for Phase 1

- **Status:** Accepted
- **Context:** Phase 1 needs to validate the core learning loop with minimal infrastructure overhead. No server-side features (accounts, sync, teacher dashboard) are in scope. A backend would add 40% more development work with zero user-facing value.
- **Decision:** Phase 1 is a pure client-side SPA with SQLite WASM (OPFS) for persistence, served as static files from a CDN.
- **Alternatives Considered:**
  - *Thin API + database from day one:* Rejected — adds operational complexity (hosting, monitoring, security) for features that don't exist yet. Over-engineering for the problem at hand.
  - *BaaS (Supabase/Firebase):* Rejected — introduces vendor dependency and client-side SDK weight for features not needed until Phase 3. Supabase's real-time and auth are valuable but premature.
- **Consequences:**
  - (+) Zero infrastructure cost and ops burden
  - (+) Fastest development velocity — focus entirely on 3D experience
  - (+) No privacy concerns — no data leaves the device
  - (-) No cross-device sync
  - (-) Data loss if browser data cleared
  - (-) Must design clean migration path to server (Phase 3)

### ADR-2: Next.js on Vercel for Frontend

- **Status:** Accepted
- **Context:** The app has two distinct surface areas: (1) landing page and hub that benefit from SSG/SEO, and (2) 3D experience that is entirely client-side. Need a framework that handles both well.
- **Decision:** Next.js 15 with App Router, deployed on Vercel.
- **Alternatives Considered:**
  - *TanStack Start on Cloudflare Workers:* Rejected — landing page SEO is critical for educational product discovery. TanStack Start's SSG story is less mature than Next.js. Cloudflare's Next.js adapter has limitations. TanStack Start would be ideal if the entire app were post-auth (it isn't — landing page is the entry point).
  - *Vite SPA (no framework):* Rejected — no SSG for landing page, no built-in routing, would need to assemble equivalent capabilities manually. The 3D portion doesn't benefit from React Server Components, but the 2D portion benefits from Next.js's static generation and routing.
  - *Astro + React islands:* Considered — good SSG + client-side islands model. Rejected because the 3D experience is a heavy client-side app, not a "island" — Astro's content-first model doesn't align with a primarily interactive application.
- **Consequences:**
  - (+) SSG for landing page = fast load, good SEO
  - (+) Zero-config Vercel deployment with CDN, preview deploys, rollback
  - (+) Mature ecosystem, large community, good TypeScript support
  - (-) React Server Components complexity is unnecessary for 3D — must use `"use client"` for all experience/ components
  - (-) Next.js bundles more framework code than a bare Vite SPA

### ADR-3: Three.js (WebGPU-first) + React Three Fiber for 3D Rendering

- **Status:** Accepted
- **Context:** Need real-time 3D rendering with physics in the browser. Must support WebGPU for performance with WebGL fallback for compatibility. Must integrate with React for HUD overlays and state management.
- **Decision:** Three.js with WebGPU renderer (primary) and WebGL renderer (fallback), wrapped in React Three Fiber (R3F) with Drei helpers. TSL (Three.js Shading Language) for custom shaders.
- **Alternatives Considered:**
  - *Babylon.js:* Mature 3D engine with built-in physics and XR. Rejected because: (1) smaller React integration ecosystem (no equivalent to R3F + Drei), (2) larger bundle size, (3) Three.js + R3F has become the dominant web 3D stack with the largest community and plugin ecosystem.
  - *PlayCanvas:* Good editor and runtime. Rejected because: (1) editor-centric workflow doesn't fit code-first development, (2) weaker React integration, (3) fewer community resources.
  - *Raw WebGPU:* Maximum performance and control. Rejected — massive development effort for rendering pipeline, no ecosystem leverage. Only justified for AAA-quality real-time rendering.
- **Consequences:**
  - (+) Largest web 3D ecosystem: R3F, Drei, react-three/xr, post-processing
  - (+) WebGPU-first with automatic WebGL fallback via Three.js renderer abstraction
  - (+) TSL compiles to both WGSL (WebGPU) and GLSL (WebGL) automatically
  - (+) R3F's declarative model integrates cleanly with React state and HUD
  - (-) Three.js is large (~150KB min+gzip) — must tree-shake aggressively
  - (-) R3F adds overhead vs raw Three.js — acceptable for developer productivity

### ADR-4: Koota ECS + Rapier WASM for Simulation Engine

- **Status:** Accepted
- **Context:** Physics simulation must run deterministically, support multiple engine types (projectile, collision, wave), and maintain 60fps. The simulation layer must be React-independent for testability and future extraction (WASM worker, native port).
- **Decision:** Koota ECS for entity management and game logic. Rapier WASM for rigid-body physics (projectile, collision-energy engines). Custom grid solver for wave engine. Engine layer has zero React imports.
- **Alternatives Considered:**
  - *Rapier only (no ECS):* Simpler but couples all logic to Rapier's API. Rejected because: (1) wave engine doesn't use rigid bodies — Rapier alone doesn't cover all engines, (2) ECS provides a uniform data model for all engines, (3) ECS systems are independently testable.
  - *cannon-es:* Lighter physics library. Rejected — Rapier's Rust/WASM performance is ~3x faster for complex scenes, deterministic simulation, and better maintained.
  - *Jolt Physics:* Performant WASM physics. Rejected — smaller ecosystem, less documentation, Rapier has established dominance in web physics.
  - *bitECS / miniplex:* Alternative ECS libraries. Rejected — Koota is designed for R3F integration with React hooks bridge while keeping the core React-free. bitECS is lower-level; miniplex has similar goals but smaller community.
- **Consequences:**
  - (+) Clean separation: engine/ (pure logic, no React) ↔ experience/ (rendering, React)
  - (+) Rapier WASM: near-native physics performance, deterministic simulation
  - (+) ECS data model fits challenge variety: same components (Position, Velocity) composed differently per engine
  - (+) Testable: ECS systems are pure functions on component data
  - (-) Two physics approaches: Rapier for rigid-body, custom for wave — additional complexity
  - (-) Koota is newer than alternatives — smaller community, less battle-tested

### ADR-5: SQLite WASM + OPFS (SAHPool VFS) for Local Persistence [Phase 1]

- **Status:** Accepted (supersedes previous IndexedDB + Dexie.js decision)
- **Context:** Phase 1 stores user progress locally. Need a structured storage API that supports aggregation queries (e.g., tag accuracy GROUP BY, challenge results JOIN), is available in all target browsers, and provides a migration path to server PostgreSQL in Phase 3.
- **Decision:** `@sqlite.org/sqlite-wasm` (SQLite team official package) with SAHPool VFS for OPFS persistence. Runs in a dedicated Web Worker. No COOP/COEP headers required.
- **Alternatives Considered:**
  - *IndexedDB + Dexie.js:* Thin wrapper (~8KB gzip), broad browser support. Rejected because: (1) cursor-based API is verbose for aggregation queries the adaptive engine needs (tag accuracy rollups, difficulty-filtered challenge lists), (2) no schema portability to server PostgreSQL — Phase 3 migration requires complete data access rewrite, (3) unreliable in Safari private browsing.
  - *localStorage:* Simpler API but 5MB limit, no indexing, synchronous (blocks main thread). Rejected — challenge result history can grow beyond 5MB with repeated plays.
  - *OPFS VFS (default sqlite-wasm VFS):* Supports multi-tab concurrent access. Rejected because: (1) requires SharedArrayBuffer → COOP/COEP headers mandatory, (2) COOP/COEP (`Cross-Origin-Embedder-Policy: require-corp` or `credentialless`) restricts loading of external resources (CDN fonts, PostHog SDK, glTF assets), adding integration complexity with Three.js, (3) multi-tab DB access is unnecessary for a 3D simulation game.
  - *cr-sqlite / wa-sqlite:* Community WASM builds with additional features (CRDT sync, custom VFS). Rejected — `@sqlite.org/sqlite-wasm` is the official SQLite team package with long-term maintenance guarantee. Community builds add features not needed in Phase 1.
- **Key design choice — SAHPool VFS:**
  - Uses OPFS `createSyncAccessHandle()` for synchronous file I/O in a Worker
  - **No SharedArrayBuffer required** → no COOP/COEP headers → no cross-origin resource restrictions
  - Single-tab constraint: only one browser tab can open the DB at a time. Acceptable for PhysPlay — users don't multi-tab a 3D physics game. Second-tab detection shows a clear error message.
  - Reference: Notion encountered similar trade-offs and chose SharedWorker architecture for multi-tab. PhysPlay's single-tab model is simpler and sufficient.
- **Consequences:**
  - (+) SQL queries for adaptive engine aggregation (JOIN, GROUP BY, window functions)
  - (+) Schema portability: client SQLite → server PostgreSQL with minimal query changes in Phase 3
  - (+) No COOP/COEP headers — zero impact on Three.js asset loading, CDN fonts, PostHog SDK
  - (+) Official SQLite team package — long-term maintenance and correctness guarantees
  - (+) More reliable than IndexedDB in Safari private browsing
  - (+) Standard SQL migration tooling (version-numbered `.sql` files)
  - (-) ~300KB gzipped WASM binary (vs Dexie.js ~8KB) — mitigated by lazy loading on lab entry
  - (-) Requires dedicated Worker — additional architecture complexity (postMessage bridge)
  - (-) Single-tab limitation — must detect and handle gracefully
  - (-) Data lost if user clears browser data — must communicate clearly

### ADR-6: Static Hosting (Vercel) for Phase 1 Deployment

- **Status:** Accepted
- **Context:** Phase 1 is a client-only SPA. Need hosting with global CDN, automatic HTTPS, CI/CD integration, and preview deployments.
- **Decision:** Vercel for static hosting with CDN delivery.
- **Alternatives Considered:**
  - *Cloudflare Pages:* Free tier is generous, global edge. Rejected for Phase 1 — Next.js has first-class Vercel support. Cloudflare's Next.js adapter (@cloudflare/next-on-pages) has edge cases. Would reconsider if cost becomes a factor at scale.
  - *Netlify:* Comparable to Vercel. Rejected — no meaningful advantage over Vercel for Next.js, and Vercel's Next.js integration is tighter (same company).
  - *GCP Cloud Storage + CDN:* Full control. Rejected — more ops overhead for no benefit. CI/CD must be configured manually.
- **Consequences:**
  - (+) Zero-config deployment from GitHub
  - (+) Automatic preview deploys per PR
  - (+) Global CDN, automatic HTTPS, edge functions if needed later
  - (+) Generous free tier for Phase 1 traffic
  - (-) Vendor lock-in for deployment (mitigated: Next.js is portable, can deploy elsewhere)

### ADR-7: PostHog for Analytics (All Phases)

- **Status:** Accepted (revised from Plausible)
- **Context:** Need client-side analytics to measure Phase 1 success metrics (core loop funnel, prediction engagement, station completion). Want a single analytics platform that scales from Phase 1 through Phase 5+ without provider migration.
- **Decision:** PostHog (Cloud) for all analytics from Phase 1. Phase 1 uses lightweight config: custom events only, session replay OFF, autocapture OFF, feature flags OFF. SQLite event log as local backup.
- **Alternatives Considered:**
  - *Plausible:* Lightweight (~1KB script), privacy-friendly. Rejected — would require migration to PostHog in Phase 2 when funnels, session replay, and feature flags are needed. One-time SDK weight (~30KB) is acceptable with lazy loading.
  - *Google Analytics 4:* Free, powerful. Rejected — privacy concerns (GDPR consent required), heavy SDK, cookie-dependent, blocked by many ad-blockers.
  - *Self-hosted Umami:* Free, privacy-friendly. Rejected — requires hosting a server, contradicting Phase 1's zero-backend goal. Limited funnel analysis.
  - *SQLite event log only:* Zero external dependency. Rejected — no real-time dashboard, manual export required. Used as supplement, not primary.
- **Consequences:**
  - (+) Single analytics platform from Phase 1 through all phases — no provider migration
  - (+) PostHog free tier (1M events/month) is sufficient for Phase 1 scale (10K UV)
  - (+) Custom events API + basic funnels sufficient for core loop tracking
  - (+) Real-time dashboard for monitoring post-launch
  - (+) Session replay, feature flags, A/B testing available when needed (just enable)
  - (-) ~30KB SDK (mitigated: lazy-loaded on first page interaction, not in critical path)
  - (-) Heavier than Plausible — acceptable trade-off for avoiding future migration

### ADR-8: Rule-Based Adaptive Engine (No ML) [Phase 1]

- **Status:** Accepted
- **Context:** The adaptive engine selects the next challenge based on user performance. Phase 1 has 26 challenges across 3 stations. ML models need training data that doesn't exist yet.
- **Decision:** Metadata-based rule engine as defined in Phase 1 PRD §6. Tag accuracy tracking → difficulty filtering → weakness prioritization → repetition prevention. No ML.
- **Alternatives Considered:**
  - *Simple sequential ordering:* Challenges in fixed order. Rejected — doesn't adapt to user, misses the adaptive learning value proposition.
  - *Bandit algorithm (Thompson Sampling):* Lightweight ML for exploration/exploitation. Rejected — still needs bootstrapping data, adds complexity beyond what 26 challenges warrant.
  - *LLM-based selection:* Use Claude/GPT to analyze user patterns and select challenges. Rejected — adds API latency and cost for a decision that rule-based logic handles well. Over-engineering.
- **Consequences:**
  - (+) Deterministic, debuggable, no external dependencies
  - (+) Phase 1 data (tag accuracy, streaks) becomes training data for Phase 2 ML model
  - (+) Cheap to implement and test
  - (-) Less sophisticated personalization — may feel "mechanical" for advanced users
  - (-) Must manually tune rules (threshold values like 0.5 accuracy cutoff)

### ADR-9: Input Abstraction for XR Readiness [Phase 1]

- **Status:** Accepted
- **Context:** Phase 1 is web-only (mouse/touch). Phase 2 adds XR (hand tracking). If 3D interaction code is tightly coupled to mouse events, XR addition requires rewriting scene interaction logic.
- **Decision:** All God Hand interactions are abstracted through semantic actions (`throw`, `place`, `grab`, `drag`, `shake`). An input adapter maps raw events (mouse/touch in Phase 1, hand tracking in Phase 2) to these actions. Scene components consume actions, never raw input.
- **Alternatives Considered:**
  - *Direct event binding, refactor later:* Faster Phase 1 development. Rejected — XR refactoring cost increases exponentially with codebase size. The abstraction cost now is low (one adapter module), the refactoring cost later is high (every interaction component).
  - *Build XR support now:* Complete input system with hand tracking. Rejected — violates Phase 1 scope. Architecture readiness is sufficient.
- **Consequences:**
  - (+) Phase 2 XR adds a new InputAdapter implementation, no scene changes
  - (+) Clean separation of input parsing from interaction semantics
  - (+) Easier testing — mock actions without simulating mouse events
  - (-) Small upfront abstraction cost
  - (-) May over-abstract if XR plans change — but the abstraction is thin enough that cost is minimal

---

## 11. AI/LLM Architecture [Phase 2+]

Phase 1 uses no AI/LLM. The adaptive engine is rule-based (ADR-8). This section documents the planned Phase 2+ architecture.

**Phase 2 — ML-based Adaptive Engine:**
- Train a lightweight model on Phase 1 behavioral data (tag accuracy, response patterns, session length)
- Model predicts: (1) optimal next challenge, (2) expected accuracy, (3) recommended discover depth
- Run client-side via TensorFlow.js or ONNX Runtime Web — no server round-trip for challenge selection
- Fallback to rule engine if model fails to load or produces low-confidence prediction

**Phase 3+ — LLM-enhanced Discover Content:**
- LLM generates contextual explanations: "You predicted the ball would go straight, but it curved because..." combining user's specific prediction with concept knowledge
- Architecture: server-side generation (not client) → cache per (challenge, prediction_pattern) → serve cached content
- LLM as content generation pipeline (batch), not real-time chat — no streaming needed for this use case

**Phase 5+ — AI Challenge Generation:**
- LLM proposes new variable combinations for engines
- Human review → approved combinations become new challenges
- Same JSON schema as manual challenges — the engine doesn't know if a challenge was human- or AI-authored

---

## Phase Implementation Summary

### Phase 1 (Mechanics Lab) — Current

**Components:**
- `site/`: Landing page (SSG), Research Hub (CSR), Settings
- `experience/`: 3D viewport (WebGPU/WebGL), HUD system, mechanics-lab environment
- `engine/`: Koota ECS, Rapier WASM (projectile + collision-energy), custom wave solver
- `domains/`: mechanics-lab, challenge (loader/runner/judge), adaptive (rule engine), progress (SQLite Worker), analytics, onboarding
- `shared/`: Zustand stores, i18n (en/ko), theme, types

**Infrastructure:**
- Vercel (static hosting + CDN)
- PostHog (analytics)
- Sentry (error tracking)

**Key ADRs:** 1 (client-only), 2 (Next.js), 3 (Three.js + R3F), 4 (Koota + Rapier), 5 (SQLite WASM + OPFS), 6 (Vercel), 7 (PostHog), 8 (rule engine), 9 (input abstraction)

### Phase 2 (Mechanics Expansion + AI)

**New components:**
- `xr/`: WebXR session, hand tracking input adapter, spatial UI panels
- `domains/adaptive/`: ML model (TensorFlow.js/ONNX) replacing rule engine
- New stations in mechanics-lab: sound/light, electromagnetic

**New infrastructure:**
- PostHog expanded: session replay ON, feature flags ON, autocapture ON
- Service Worker for offline asset caching

### Phase 3 (Molecular Lab + Accounts)

**New components:**
- Backend API: Rust (Axum) on GCP Cloud Run [ADR needed]
- Database: Neon (PostgreSQL) [ADR needed]
- `domains/auth/`: Google OAuth, JWT, RBAC
- `domains/sync/`: SQLite ↔ server bidirectional sync
- `domains/molecular-lab/`: New space with molecular engine
- Teacher dashboard (separate frontend or embedded view)
- UGC Stage 1: teacher challenge editor

**New infrastructure:**
- GCP Cloud Run (backend)
- Neon (database)
- Resend (teacher notification emails)

**New integrations:**
- PDB / PubChem (molecular structure data)

### Phase 4+ (Space Observatory, Quantum Lab)

**New components:**
- `domains/space-observatory/`: Orbit engine, space theme
- `domains/quantum-lab/`: Quantum engine, quantum theme
- UGC Stages 2-3: station/mission editor, space editor
- Multiplayer/social features

**New integrations:**
- NASA Open API (orbital data)
