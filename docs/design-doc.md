# PhysPlay — Software Architecture Design Document

**Status**: Draft
**Author**: --
**Date**: 2026-03-04
**PRD Reference**: [prd.md](./prd.md) | [prd-phase-1.md](./prd-phase-1.md)

---

## 1. Context & Scope

### 1.1 Problem Statement

PhysPlay is a browser-based 3D science gamification platform where users predict, experiment, and discover physics concepts through interactive simulations. The system runs real-time physics simulations in the browser, renders them in 3D (WebGPU/WebGL), and wraps them in a core loop (Predict → Play → Discover) designed to trigger cognitive conflict — the moment when "my prediction was wrong" becomes the driver of understanding.

The system must support 6 independent simulation engines, each generating infinite challenges from variable combinations. Phase 1 ships 3 engines (projectile, collision-energy, wave) in a single "Mechanics Lab" space. The architecture must support progressive extension: new engines, new spaces, user-generated content, XR mode, and a backend API — all without rewrites.

### 1.2 System Context Diagram

```d2
direction: right

user: {
  label: "Learner"
  shape: person
  style.fill: "#e8f4fd"
}

system: {
  label: "PhysPlay"
  style.stroke-dash: 5
  style.fill: "#f0f7ff"

  web: {
    label: "Web Client\n(TanStack Start + R3F + Physics WASM)"
    shape: rectangle
    style.fill: "#dbeafe"
  }
}

posthog: {
  label: "PostHog Cloud"
  shape: rectangle
  style.fill: "#fef3c7"
}

sentry: {
  label: "Sentry Cloud"
  shape: rectangle
  style.fill: "#fef3c7"
}

cdn: {
  label: "Cloudflare CDN"
  shape: rectangle
  style.fill: "#d1fae5"
}

user -> system.web: "Browser\n(HTTPS)"
system.web -> posthog: "Analytics events\n(HTTPS)"
system.web -> sentry: "Errors + perf\n(HTTPS)"
cdn -> system.web: "Static assets\n(glTF, textures, audio)"
```

Phase 1 is entirely client-side. No backend API, no database server, no user accounts. All state lives in the browser (IndexedDB). The only external integrations are analytics (PostHog) and error tracking (Sentry).

Phase 3+ adds: Rust (Axum) API on Cloud Run, Neon PostgreSQL, user accounts, and progress sync.

### 1.3 Assumptions

| # | Assumption | If Wrong |
|---|-----------|----------|
| A1 | WebGPU is available on 60%+ of target users' browsers by launch; WebGL fallback covers the rest | Must invest more in WebGL rendering path quality |
| A2 | Rapier WASM can run projectile + collision physics at 60fps on mid-range laptops | Need custom lightweight physics solver or reduce simulation fidelity |
| A3 | Wave equation solver runs acceptably in a Web Worker without Rust WASM | Must add custom Rust WASM solver for wave engine |
| A4 | IndexedDB storage is sufficient for Phase 1 progress data (<5MB per user) | Need to prune old data or compress |
| A5 | TanStack Start SSR on Cloudflare Workers provides adequate SEO for the landing page | Need prerendering or move to static export for marketing pages |
| A6 | A single-person team can ship 3 engines + 26 challenges in 12 weeks | Must cut to 2 engines or reduce challenge count |

---

## 2. Goals & Non-Goals

### 2.1 Goals

- Sustain 60fps on mid-range desktop and 30fps on mid-range mobile for all Phase 1 simulation engines
- Initial page load (landing to interactive) under 3 seconds on 4G connection
- Each simulation engine loads independently — switching engines costs <500ms
- Challenge data is pure JSON; adding a new challenge requires zero code changes to the engine
- Core loop state machine (Predict → Play → Discover) is engine-agnostic — new engines plug in without modifying the loop
- Input abstraction (God Hand) maps mouse, touch, and hand tracking through a single interface — XR mode requires no simulation code changes
- Offline-capable: all simulations run without network after initial load
- Client-side adaptive engine selects next challenges based on user performance history stored in IndexedDB

### 2.2 Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Backend API or database server [Phase 3+] | Phase 1 is fully client-side. Adding a backend doubles operational complexity for zero Phase 1 benefit |
| User accounts and server-synced progress [Phase 3+] | Local storage is sufficient for initial validation. Accounts add auth complexity |
| XR mode implementation [Phase 2+] | Architecture is XR-ready (God Hand abstraction, same scene graph), but XR implementation is deferred |
| ML-based adaptive engine [Phase 2+] | Rule-based engine first; collect behavioral data in Phase 1 to train ML in Phase 2 |
| UGC editor UI [Phase 3+] | Challenge-as-JSON structure enables future UGC. The editor is UI work on top of the data format |
| Multi-region deployment | Static site + CDN is inherently global. No regional compute needed in Phase 1 |
| Native mobile app | Browser-based with responsive layout. Native app adds build complexity without clear Phase 1 value |
| Multiplayer / real-time sync | Single-player experience. No networking beyond analytics |

---

## 3. High-Level Architecture

### 3.1 Architecture Style

**Phase 1: Client-Only SPA.** No backend services. The entire application — rendering, physics, game logic, state management, local storage — runs in the browser. TanStack Start provides SSR for the landing page (SEO) and client-side routing for the rest.

**Phase 3+: SPA + Request-Response API.** When accounts and progress sync are needed, add a Rust (Axum) API as a thin layer over Neon PostgreSQL. The client remains the primary compute surface — the server handles auth, persistence, and challenge metadata, not simulation.

**Code structure**: Hexagonal thinking applied at both levels:
- **Engine layer**: Physics backends (Rapier, custom solvers) are adapters behind ports. The ECS and simulation engines depend on port interfaces, not concrete physics libraries.
- **Client layer**: Local storage (IndexedDB) and analytics (PostHog) are adapters. Domain logic (core loop, adaptive engine) uses port interfaces, making it trivial to swap IndexedDB for an API client in Phase 3.

**Frontend**: TanStack Start on Cloudflare Workers. TanStack Start is already established in the codebase. Cloudflare Workers provides edge delivery with near-zero cold starts — ideal for a content-heavy interactive app. SSR handles the landing page for SEO; the 3D experience is client-rendered.

**Why TanStack Start over Next.js**: PhysPlay is primarily a client-side interactive application. TanStack Start is lighter, has type-safe routing, and runs on Cloudflare Workers (edge-first). Next.js's server component model adds complexity that provides no value for a client-rendered 3D experience. Landing page SSR works equally well with TanStack Start's Vinxi/Nitro SSR.

**Why not Vite-only (no SSR framework)**: The landing page needs SSR for SEO (10K UV target in first month requires organic discoverability). A plain Vite SPA would be invisible to search engines. TanStack Start adds SSR where needed without forcing it everywhere.

### 3.2 Container Diagram

```d2
direction: down

browser: {
  label: "Browser"
  style.stroke-dash: 5
  style.fill: "#f0f7ff"

  main: {
    label: "Main Thread"
    style.fill: "#dbeafe"

    app: {
      label: "TanStack Start App\n(SSR + Client Routing)"
      shape: rectangle
    }
    r3f: {
      label: "React Three Fiber\n(3D Rendering)"
      shape: rectangle
    }
    ecs: {
      label: "Koota ECS\n(Simulation State)"
      shape: rectangle
    }
    zustand: {
      label: "Zustand Stores\n(UI State)"
      shape: rectangle
    }
  }

  worker: {
    label: "Web Worker"
    style.fill: "#fef3c7"

    physics: {
      label: "Rapier WASM\n+ Custom Solvers"
      shape: rectangle
    }
  }

  idb: {
    label: "IndexedDB"
    shape: cylinder
    style.fill: "#e0e7ff"
  }
}

cf: {
  label: "Cloudflare Workers"
  shape: rectangle
  style.fill: "#d1fae5"
}

r2: {
  label: "Cloudflare R2\n(Large Assets)"
  shape: cylinder
  style.fill: "#d1fae5"
}

posthog: {
  label: "PostHog Cloud"
  shape: rectangle
  style.fill: "#fef3c7"
}

sentry: {
  label: "Sentry"
  shape: rectangle
  style.fill: "#fef3c7"
}

cf -> browser.main.app: "HTML + JS bundles\n(HTTPS)"
r2 -> browser.main.r3f: "glTF, textures, audio\n(HTTPS)"
browser.main.app -> browser.main.r3f: "Route-driven scene loading"
browser.main.r3f -> browser.main.ecs: "Render reads ECS state"
browser.main.ecs -> browser.worker.physics: "Physics step (postMessage)"
browser.main.zustand -> browser.idb: "Persist progress"
browser.main.app -> posthog: "Analytics events"
browser.main.app -> sentry: "Errors"
```

| Container | Technology | Responsibility |
|-----------|-----------|----------------|
| TanStack Start App | TanStack Start + Vite + React 19 | SSR for landing page, client-side routing, page composition |
| React Three Fiber | R3F + Drei + Three.js (WebGPU/WebGL) | 3D scene rendering, camera control, post-processing |
| Shaders | TSL (Three.js Shading Language) | WebGPU-native shader authoring. TSL compiles to WGSL (WebGPU) or GLSL (WebGL fallback) from a single source, eliminating dual-shader maintenance. Used for: wave field visualization, force field overlays, prediction trajectory rendering, portal transition effects |
| Koota ECS | Koota | Simulation entity state (position, velocity, forces), system execution order |
| Zustand Stores | Zustand | UI state (theme, language, modal), domain state (challenge progress, adaptive engine) |
| Rapier WASM + Solvers | @dimforge/rapier3d + custom Rust WASM | Rigid body physics (Rapier) and compute-heavy simulations (custom Rust WASM) in Web Worker |
| Rust WASM Compute | Custom crates → wasm-pack | CPU-bound computation offload: wave equation solver, large-scale particle systems, prediction trajectory calculation. Compiled from `crates/` to `wasm-out/`. Loaded in Web Worker alongside Rapier |
| XR Layer | @react-three/xr | [Phase 2+] WebXR session management, hand tracking input mapping. Same R3F scene graph — input adapters swap from mouse/touch to hand tracking |
| 3D Assets | glTF 2.0 (Draco-compressed) + KTX2 textures | Standard 3D asset format. Draco for geometry compression, KTX2 for GPU-compressed textures. Loaded via Drei's `useGLTF` |
| IndexedDB | idb (wrapper) | User progress, prediction history, adaptive engine state |
| Cloudflare Workers | Vinxi/Nitro on Workers | Edge SSR, static asset serving, i18n routing |
| Cloudflare R2 | S3-compatible object storage | Large static assets (skybox textures, audio, glTF models) |

### 3.3 Component Overview

The client follows the **Web 2D + 3D** pattern from the project's [client-structure.md](./client-structure.md):

```
src/
├── app/              # Providers, global styles, TanStack Start setup
├── routes/           # Route definitions → site/ (2D) or domains/ (3D)
│
├── site/             # 2D layer (FSD: views, widgets, features, entities, shared)
│   ├── views/        # Landing page, Hub, Settings
│   ├── widgets/      # Space cards, progress display
│   ├── features/     # Language switcher, theme toggle
│   └── shared/       # 2D-only utilities
│
├── experience/       # 3D layer
│   ├── canvas/       # WebGPU detect → WebGL fallback, renderer setup
│   ├── scene/        # Objects, environments, cameras, materials
│   ├── hud/          # In-scene overlays (prediction UI, discovery panel, controls)
│   ├── xr/           # [Phase 2+] WebXR session, hand tracking
│   └── shared/       # 3D-only hooks, assets
│
├── engine/           # Pure logic — never imports React
│   ├── ecs/          # Koota world, components, systems, queries, prefabs
│   ├── physics/      # Rapier adapter, custom Rust WASM solvers
│   ├── simulation/   # Pluggable simulation engines (see below)
│   ├── challenge/    # Challenge loader, validator, adaptive selector
│   ├── shaders/      # TSL shader modules (wave fields, force overlays, trajectories)
│   └── ports/        # Interfaces for storage, analytics, physics backends
│
├── domains/          # Composes experience + engine per domain
│   ├── mechanics-lab/ # 역학 실험실 — orchestrates 3 stations
│   ├── hub/           # 연구소 허브 — space/station selection
│   └── onboarding/    # First-visit flow
│
├── content/          # Static JSON data injected into scenes
│   ├── challenges/   # Challenge definitions per engine
│   └── concepts/     # Discover-phase concept library
│
└── shared/           # Cross-layer (site + experience)
    ├── stores/       # Auth [Phase 3+], theme, language, user progress
    ├── i18n/         # en/ko translations
    ├── types/        # Shared type definitions
    └── constants/    # Feature flags, config
```

**Core rule**: `site/` and `experience/` never import each other. Cross-layer data flows through `shared/stores/`.

**Critical path components**:
1. **Simulation Engines** (`engine/simulation/`): The heart of the product. Each engine implements a common `SimulationEngine` interface — setup, step, evaluate, cleanup. The engine processes challenge JSON, sets up ECS entities, and runs the physics loop.
2. **Core Loop State Machine** (`domains/*/use-cases/`): Orchestrates Predict → Play → Discover transitions. Engine-agnostic — it only calls the `SimulationEngine` interface.
3. **Adaptive Selector** (`engine/challenge/adaptive.ts`): Picks the next challenge from the pool based on user progress. A port — Phase 1 implements it as rule-based; Phase 2+ swaps for ML.
4. **God Hand Input** (`experience/scene/interactions/`): Abstraction over mouse/touch/hand-tracking. Produces engine commands (throw, place, pull) regardless of input device.

#### Simulation Engine Plugin Architecture

Each engine is a module that implements a common interface and registers itself:

```
engine/simulation/
├── types.ts          # SimulationEngine interface, ChallengeConfig, SimulationResult
├── registry.ts       # Engine registry — maps engineId to factory
├── projectile/       # Projectile engine [Phase 1]
│   ├── engine.ts     # Implements SimulationEngine
│   ├── systems/      # ECS systems (gravity, drag, magnus, coriolis)
│   └── prefabs/      # Entity templates (ball, cannon, target)
├── collision-energy/ # Collision/energy engine [Phase 1]
│   ├── engine.ts
│   ├── systems/
│   └── prefabs/
└── wave/             # Wave engine [Phase 1]
    ├── engine.ts
    ├── systems/      # Custom wave solver system
    └── prefabs/
```

Each engine:
1. Accepts a `ChallengeConfig` (parsed from JSON) with physics parameters
2. Spawns ECS entities via prefabs
3. Registers engine-specific ECS systems (gravity, wave propagation, etc.)
4. Exposes `evaluate(prediction, result)` for the Discover phase

Adding a new engine (e.g., molecular in Phase 3) means: create a new folder, implement the interface, register in the registry. Zero changes to core loop, HUD, or routing.

---

## 4. Data Architecture

### 4.1 Data Flow

**Flow 1: Core Loop (Predict → Play → Discover)**

```
1. User enters station → Domain loads challenge JSON for current engine
2. Adaptive Selector picks next challenge from pool
   - Reads: user progress (IndexedDB), challenge pool (static JSON)
   - Filters: difficulty range, weak tags, variety rules
3. [Predict] HUD renders prediction UI (type from challenge JSON)
   → User submits prediction → stored in memory
4. [Play] Engine sets up scene from challenge params
   → God Hand input → engine commands → ECS systems step → R3F renders
   → Simulation completes → engine produces SimulationResult
5. [Discover] Core loop compares prediction vs result
   → Loads concept explanation (from concept library JSON)
   → Depth level selected by adaptive engine
6. Challenge complete → progress written to IndexedDB
   → Adaptive Selector re-evaluates → next challenge
```

**Flow 2: First Visit (Onboarding)**

```
1. URL open → Cloudflare Workers serves SSR landing HTML
2. Client hydrates → router detects no progress in IndexedDB
3. Auto-navigate to mechanics-lab/projectile/challenge-1
4. Reduced HUD — minimal UI, guided prediction
5. After first challenge → hub route → show full space map
6. Progress initialized in IndexedDB
```

**Flow 3: Returning User**

```
1. URL open → read progress from IndexedDB
2. Show hub (2D) with unlocked/locked spaces
3. User selects space → portal transition → 3D experience loads
4. Resume from last position in station
```

### 4.2 Storage Strategy

#### Phase 1: Client-Only Storage

| Store | Technology | Data | Consistency | Rationale |
|-------|-----------|------|-------------|-----------|
| Challenge definitions | Static JSON (bundled, code-split per engine) | Engine params, prediction types, metadata, difficulty tags | Immutable (shipped with build) | Challenges are content — they don't change at runtime. Code-splitting per engine keeps initial bundle small |
| Concept library | Static JSON (bundled) | Discover explanations at 3 depth levels, per concept ID | Immutable | Same rationale as challenges |
| User progress | IndexedDB via `idb` | Per-challenge results, per-tag accuracy, streak, difficulty level, unlocked stations | Strong (single client) | Only writable store in Phase 1. ~2-5KB per user |
| UI preferences | IndexedDB or localStorage | Theme, language, audio volume, render quality | Strong (single client) | Small key-value data |
| Asset cache | Service Worker + Cache API | glTF models, textures, audio files | Cache-first | Enables offline simulation after first load |

#### Phase 3+: Backend Storage [Phase 3+]

| Store | Technology | Data | Consistency |
|-------|-----------|------|-------------|
| User accounts | Neon PostgreSQL | Profile, auth tokens, subscription | Strong |
| Progress sync | Neon PostgreSQL | Replicated from client IndexedDB | Eventual (client-first, sync on connectivity) |
| Challenge metadata | Neon PostgreSQL | Challenge pool with server-managed difficulty tuning | Strong |
| Static assets | Cloudflare R2 | glTF, textures, audio, skyboxes | Immutable (versioned) |

The Phase 3 migration strategy: IndexedDB remains the primary write target. A sync adapter periodically pushes local changes to the API when online. Conflict resolution: last-write-wins (progress data is append-only in nature — a user can't "un-complete" a challenge).

### 4.3 Content Pipeline

Challenge and concept content flows from authoring to runtime:

```
docs/contents/engines/*/     # Authored in markdown (human-readable source of truth)
        ↓ (build script)
web/src/content/             # Transformed to typed JSON, code-split per engine
        ↓ (Vite build)
dist/assets/challenges-*.js  # Bundled as lazy chunks
        ↓ (runtime)
engine/challenge/loader.ts   # Loads + validates at runtime
```

Challenge JSON schema (minimal required fields):
```
{
  "id": string,
  "engineId": "projectile" | "collision-energy" | "wave",
  "version": number,
  "params": { /* engine-specific variables */ },
  "predict": { "type": "trajectory" | "binary" | "pattern" | "placement", ... },
  "tags": string[],
  "difficulty": number (1-10),
  "discover": { "relatedConcepts": string[] }
}
```

---

## 5. Infrastructure & Deployment

### 5.1 Compute Platform

**Cloudflare Workers** for the web application. [Phase 1]

TanStack Start compiles to Vinxi/Nitro, which has native Cloudflare Workers support. Workers provide:
- Near-zero cold starts (V8 isolates, not containers)
- Global edge deployment by default
- Free tier covers early traffic (100K requests/day)
- Same-platform access to R2 (assets) and KV (edge config)

**Why Workers over Vercel**: TanStack Start is the established framework (Vercel is optimized for Next.js). Workers' edge-first model is a better fit for a client-heavy app where the server's job is "serve HTML + JS fast." Predictable pricing avoids Vercel's function invocation costs at scale.

**Why Workers over static export**: The landing page benefits from SSR (dynamic i18n, SEO meta tags). A static export would require build-time generation of all language variants and lose dynamic meta tag capabilities.

**Cloud Run (Rust/Axum)** for the backend API. [Phase 3+]

When accounts and progress sync are needed, add a Rust (Axum) service on Cloud Run in us-east4 (Virginia), co-located with Neon PostgreSQL. Rust provides sub-ms response times and 10-30MB memory footprint — critical for solopreneur cost management. Cloud Run auto-scales to zero when idle.

### 5.2 Deployment Strategy

**Phase 1**:
- `main` push → GitHub Actions → `bun run build` → `wrangler deploy` to Cloudflare Workers
- Preview deployments on PRs via Cloudflare Pages preview URLs
- Rollback: redeploy previous Workers version (instant, Cloudflare retains previous versions)

**Phase 3+**:
- Same for web client
- API: `main` push → GitHub Actions → Docker build → Cloud Run deploy (rolling update)
- Database: migrations via version-controlled SQL files, applied before deploy

### 5.3 Environment Topology

| Environment | Web | API [Phase 3+] | DB [Phase 3+] | Purpose |
|-------------|-----|-----|-----|---------|
| Local dev | `bun run dev` (localhost:3000) | `cargo run` (localhost:8080) | Docker Compose (localhost:5432) | Development |
| Preview | Cloudflare preview URL | — | — | PR review |
| Production | `phys.play` (Cloudflare Workers) | Cloud Run (us-east4) | Neon (us-east-1) | Live |

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization [Phase 3+]

Phase 1 has no auth. All state is local and anonymous.

Phase 3+ auth strategy (per infra preferences):
- **Authentication**: Google OAuth2 → self-issued JWT. Access token (15min, in-memory), refresh token (7-30 days, httpOnly cookie).
- **Authorization**: RBAC via middleware in Axum. Roles: `anonymous` (Phase 1 features), `user` (progress sync), `creator` (UGC).
- **Migration path**: Phase 1 anonymous progress is migrated to the new account via a one-time "claim your progress" flow on first login.

### 6.2 Observability

**Analytics** — PostHog (cloud): [Phase 1]
- Core loop funnel: `station_enter` → `predict_submit` → `play_start` → `play_complete` → `discover_view` → `challenge_complete`
- Prediction behavior: `predict_submit` (with type, value) vs. `predict_skip`
- Learning signal: `station_complete` (with correct_count/total)
- Session: `session_start` (device_type, referrer)
- Full event schema defined in [PRD Section 5 (REQ-048~051)](./prd.md)

**Error tracking** — Sentry: [Phase 1]
- JavaScript errors with source maps
- WebGPU/WebGL capability detection failures
- Physics engine exceptions (NaN positions, simulation divergence)
- Performance monitoring (LCP, FID, CLS + custom 3D metrics)

**3D-specific metrics** (custom, reported to PostHog): [Phase 1]
- Actual FPS during simulation (per-engine)
- WebGPU vs. WebGL fallback rate
- Asset load times per engine
- Physics step duration (P50, P95)

### 6.3 Error Handling & Resilience

| Failure | Impact | Handling |
|---------|--------|----------|
| WebGPU unavailable | Degraded visuals | Auto-fallback to WebGLRenderer. Materials branch per renderer. Log to analytics |
| Physics simulation divergence (NaN, explosion) | Broken simulation | Detect NaN in ECS position/velocity → reset to last stable state → show "simulation reset" toast |
| IndexedDB write failure | Progress loss | Retry with exponential backoff (3 attempts). If persistent, fall back to in-memory + warn user |
| Asset load failure (glTF, texture) | Missing visuals | Retry once. On failure, use fallback primitive geometry + solid color material |
| Web Worker crash | Physics stops | Respawn worker, re-initialize physics world from ECS snapshot |
| Engine-specific system error | One engine broken | Isolate per engine. Other engines/stations remain functional |

### 6.4 Security

Phase 1 has a minimal attack surface (static site + client-side JS). Key considerations:

- **CSP headers**: Strict Content-Security-Policy. `script-src 'self'`; `worker-src 'self'`; block inline scripts. WebGPU/WebGL require `'unsafe-eval'` for shader compilation — scope it to the canvas context.
- **No user data collection**: Phase 1 collects only anonymous analytics (PostHog). No PII stored locally or transmitted.
- **Dependency security**: `bun audit` in CI. Pin major versions for Three.js and Rapier (WASM binaries should be hash-verified).
- **WASM integrity**: Rapier and custom Rust WASM binaries loaded from same origin with SRI hash. Custom crates built via wasm-pack in CI with reproducible builds.
- **Phase 3+ additions**: OWASP Top 10 review for API endpoints, JWT validation, CORS, rate limiting, input sanitization.

### 6.5 Performance & Scalability

**Rendering performance target**: 60fps desktop, 30fps mobile.

| Strategy | Target | Implementation |
|----------|--------|----------------|
| WebGPU-first rendering | Lower CPU overhead, GPU-driven rendering | `experience/canvas/` detects WebGPU → WebGLRenderer fallback |
| Code-split per engine | <500ms engine switch | Dynamic `import()` per simulation engine. Only loaded engine's code + assets are in memory |
| Instanced rendering | Many identical objects (e.g., wave particles) | Three.js InstancedMesh for particle systems and repeated objects |
| Web Worker physics | Unblock main thread | Rapier + custom solvers run in dedicated Worker. postMessage for state sync |
| Asset optimization | <3s initial load | KTX2 compressed textures, Draco-compressed glTF, audio sprites. Brotli compression on Workers |
| LOD (Level of Detail) | Mobile performance | Simplified geometry + reduced particle counts on mobile/low-GPU |
| Lazy asset loading | Only load current engine's assets | Service Worker prefetches next likely engine in background |
| Object pooling | Reduce GC pressure | Reuse ECS entities and Three.js objects across challenges instead of create/destroy |

**Load profile**: Phase 1 is a static site — "scalability" means CDN edge caching, which Cloudflare handles inherently. No backend to scale. Phase 3+ API scales via Cloud Run auto-scaling (0 → N instances based on request volume).

---

## 7. Integration Points

| External Service | Phase | Protocol | Provides | Failure Mode | Fallback |
|-----------------|-------|----------|----------|--------------|----------|
| PostHog Cloud | 1 | HTTPS (JS SDK) | User analytics, funnel tracking | Events queued in-memory, retried | Analytics degrade silently. No user impact |
| Sentry Cloud | 1 | HTTPS (JS SDK) | Error tracking, performance monitoring | Events dropped | Errors logged to console. No user impact |
| Cloudflare R2 | 1 | HTTPS (public bucket) | Large static assets (skyboxes, audio) | Asset unavailable | Fallback primitives + cached versions via Service Worker |
| NASA Open API | 4 | HTTPS (REST) | Real planet/orbit data for 우주 관측소 | API down or rate-limited | Use bundled default solar system data |
| PDB / PubChem | 3 | HTTPS (REST) | Real molecular structure data for 분자 실험실 | API down | Use curated set of bundled molecular data |
| Neon PostgreSQL | 3+ | TCP (pg protocol) | User accounts, progress sync, challenge metadata | DB connection failure | Client continues with IndexedDB only. Sync when restored |

---

## 8. Risks & Open Questions

### 8.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Wave engine custom solver can't achieve 60fps in JS Web Worker | High | Medium | Profile early in Discovery. If JS is insufficient, port solver to Rust WASM. Wave engine is the most computationally demanding of the 3 Phase 1 engines |
| WebGPU fallback to WebGL produces visually unacceptable results | Medium | Low | Material branching per renderer (defined in client-structure.md). Test both paths for every material. Accept minor visual differences; ensure no functional difference |
| Three.js + R3F memory leaks on repeated scene transitions | Medium | Medium | Strict disposal in engine cleanup. Monitor heap size in CI performance tests. Use `useEffect` cleanup consistently for R3F components |
| IndexedDB blocked or unavailable (private browsing, storage pressure) | Medium | Low | Detect at startup. Fall back to in-memory storage with "progress won't be saved" warning |
| Koota ECS + Rapier WASM interop overhead via postMessage | Medium | Medium | Profile message serialization cost. If too high, explore SharedArrayBuffer (requires COOP/COEP headers). Alternative: run Rapier on main thread with stepped simulation |
| TanStack Start SSR + Three.js hydration conflicts | Low | Medium | 3D components are client-only (`"use client"` boundary). SSR only renders 2D shell. R3F canvas is mounted after hydration |
| Brotli/gzip compression insufficient for WASM binary size | Low | Low | Rapier WASM is ~2MB compressed. Acceptable for initial load. Can defer load until user enters first simulation |

### 8.2 Open Questions

| # | Question | Options | Decision Needed By |
|---|---------|---------|-------------------|
| 1 | Should Rapier run in a Web Worker or on the main thread? | Worker (isolates physics from rendering, but adds postMessage overhead) vs. Main thread (simpler, but can block rendering) | Discovery sprint |
| 2 | SharedArrayBuffer for Worker ↔ Main thread? | Enables zero-copy physics state transfer but requires COOP/COEP headers (breaks some third-party embeds) | Discovery sprint |
| 3 | Custom wave solver: JS or Rust WASM? | JS is simpler to develop but may be slow. Rust WASM is faster but adds build complexity | Discovery sprint (benchmark) |
| 4 | Landing page SSR strategy: full SSR on Workers vs. ISR-like static with revalidation? | Full SSR per request vs. prerendered at build time with edge caching | Pre-launch |
| 5 | i18n approach: compile-time vs. runtime? | Compile-time (smaller bundles, but requires rebuild for translation changes) vs. runtime (flexible, slightly larger bundle) | Phase 1 implementation |
| 6 | Asset hosting: bundled in Workers vs. R2 bucket vs. external CDN? | Bundled (simplest, but Workers has 25MB limit) vs. R2 (scalable, same platform) vs. external (more infra) | Phase 1 implementation |
| 7 | How to handle physics determinism across browsers for prediction evaluation? | Fixed timestep + tolerance-based evaluation (not bit-exact comparison) | Discovery sprint |

---

## 9. Architecture Decision Records (ADRs)

### ADR-1: TanStack Start + Cloudflare Workers for Frontend

- **Status**: Accepted
- **Context**: PhysPlay needs SSR for SEO (landing page, i18n) but is primarily a client-side 3D interactive application. The codebase already uses TanStack Start with Vite and Bun.
- **Decision**: TanStack Start on Cloudflare Workers.
- **Alternatives Considered**:
  - **Next.js on Vercel**: Mature SSR/SSG, excellent i18n (next-intl). → Rejected because the app is client-heavy; React Server Components add complexity with zero benefit for 3D rendering. TanStack Start is already established in the codebase.
  - **Vite SPA (no SSR)**: Simplest setup, no server runtime. → Rejected because the landing page needs SEO. A pure SPA is invisible to search engines without prerendering hacks.
  - **Astro + R3F islands**: Great for content-heavy sites with interactive islands. → Rejected because the 3D experience is the primary content, not an "island." Astro's island model adds indirection for minimal benefit.
- **Consequences**: (+) Lightweight, type-safe routing, edge delivery, already in codebase. (−) Smaller ecosystem than Next.js, fewer i18n libraries to choose from, TanStack Start is less battle-tested at scale.

### ADR-2: Three.js + React Three Fiber for 3D Rendering

- **Status**: Accepted
- **Context**: The application requires real-time 3D rendering with physics visualization, WebGPU support, and a path to WebXR.
- **Decision**: Three.js (WebGPU-first) with React Three Fiber (R3F) and Drei helpers.
- **Alternatives Considered**:
  - **Babylon.js**: Full-featured engine, built-in physics, strong WebGPU support. → Rejected because of larger bundle size (~1.5MB vs ~500KB for Three.js), less React ecosystem integration, and the team has stronger Three.js familiarity.
  - **PlayCanvas**: Excellent WebGPU support, built-in editor. → Rejected because the editor is irrelevant (we build scenes programmatically), and the runtime is less modular.
  - **Raw Three.js (no R3F)**: Lower abstraction, potentially better performance. → Rejected because R3F's declarative model aligns with the component-based architecture. Performance difference is negligible for our scene complexity. R3F's ecosystem (Drei, @react-three/xr) accelerates development.
- **Consequences**: (+) Largest 3D web ecosystem, React integration, Drei helpers, @react-three/xr for future XR. (−) Three.js WebGPU support is newer than Babylon.js; some features may be less polished.

### ADR-3: Rapier WASM + Custom Solvers for Physics

- **Status**: Accepted
- **Context**: Phase 1 engines need: rigid body dynamics (projectile, collision), and field simulation (wave equation). No single physics library covers both.
- **Decision**: Rapier WASM (`@dimforge/rapier3d`) for rigid body physics. Custom Rust WASM solvers (compiled from `crates/` via wasm-pack) for compute-heavy field simulations (wave equation, particle systems). Both run in a dedicated Web Worker.
- **Alternatives Considered**:
  - **cannon-es**: Pure JS physics, no WASM. → Rejected because Rapier is 2-3x faster for rigid body simulation and provides deterministic simulation (important for reproducible challenge results).
  - **Ammo.js (Bullet WASM)**: Battle-tested, used in AAA games. → Rejected because of larger binary size (~2.5MB), less ergonomic API, and Rapier's Rust origin aligns with custom WASM extensions sharing the same Rust toolchain.
  - **JS-only custom solvers**: Simpler build pipeline, no Rust dependency. → Rejected because wave equation grid computation at 60fps on mid-range hardware is CPU-bound; Rust WASM provides 3-10x speedup over equivalent JS for tight numerical loops. The Rust toolchain is already present for Rapier's ecosystem.
  - **Rapier for everything**: Use Rapier's force fields for wave simulation. → Rejected because wave equation simulation requires grid-based computation, not particle-based rigid body physics. Wrong tool for the job.
- **Consequences**: (+) Best rigid body performance in browser, deterministic simulation, shared Rust toolchain for Rapier and custom solvers. (−) Rust build step adds CI complexity (`crates/` → `wasm-out/`); two physics paradigms (rigid body + grid-based) to maintain.

### ADR-4: Koota for ECS

- **Status**: Accepted
- **Context**: Simulation state (positions, velocities, forces, challenge metadata) needs an efficient data model that decouples physics from rendering. ECS is the standard pattern for simulation-heavy applications.
- **Decision**: Koota ECS.
- **Alternatives Considered**:
  - **bitECS**: Fastest ECS in JS benchmarks, extremely low-level. → Rejected because of poor developer ergonomics (manual component ID management, no TypeScript-friendly API) and no React integration.
  - **Miniplex**: React-friendly, simple API. → Rejected because it uses a "bag of components" model without archetype-based storage, making it slower for large entity counts (wave engine may need 1000+ entities).
  - **No ECS (plain Zustand)**: Simpler, fewer abstractions. → Rejected because Zustand is not designed for per-frame state updates on thousands of entities. ECS provides the performance characteristics simulation systems need.
- **Consequences**: (+) React hooks integration, TypeScript-first, archetype-based storage for performance. (−) Smaller community than bitECS/Miniplex; fewer examples to reference.

### ADR-5: Client-Only Architecture for Phase 1

- **Status**: Accepted
- **Context**: Phase 1 validates the core loop and engine architecture. It needs zero friction (no signup, instant access). User progress is non-critical (loss is acceptable during validation).
- **Decision**: Phase 1 is entirely client-side. No backend API, no database server, no user accounts. All state in IndexedDB.
- **Alternatives Considered**:
  - **Backend from day 1**: Build Rust API + Neon from the start. → Rejected because it doubles development time for features (auth, API, deployment) that provide zero Phase 1 value. The 1-person team should spend 100% of Phase 1 on the 3D experience.
  - **BaaS (Supabase/Firebase)**: Quick backend with auth, database, and real-time. → Rejected because it introduces external dependency and lock-in for a phase that doesn't need persistence. Also adds latency to what should be an instant, offline-capable experience.
- **Consequences**: (+) Fastest development path, zero ops, instant offline capability, zero infrastructure cost. (−) No progress sync between devices; no server-side analytics validation; migration needed in Phase 3.

### ADR-6: Cloudflare Workers for Hosting

- **Status**: Accepted
- **Context**: The TanStack Start app needs a hosting platform that supports SSR for the landing page and serves static assets globally.
- **Decision**: Cloudflare Workers (with R2 for large assets).
- **Alternatives Considered**:
  - **Vercel**: Excellent DX, automatic preview deployments, optimized for React frameworks. → Rejected because Vercel's edge functions are optimized for Next.js, not TanStack Start. Workers have better pricing for a solopreneur (generous free tier, no per-function pricing).
  - **Cloudflare Pages**: Static-first with optional Workers functions. → Rejected because Pages has build size limits and the SSR model is less flexible than Workers.
  - **Self-hosted (Cloud Run + Nginx)**: Full control. → Rejected because it adds ops burden for a static site problem that CDN platforms solve better.
- **Consequences**: (+) Near-zero cold starts, global edge, generous free tier, same-platform R2/KV. (−) V8 runtime constraints (irrelevant for SSR + static serving), smaller deployment ecosystem than Vercel.

### ADR-7: Challenge-as-Data Architecture

- **Status**: Accepted
- **Context**: The product requires "infinite challenges from variable combinations" (REQ-018) and future UGC support (REQ-044). Hardcoding challenges means linear content scaling.
- **Decision**: Challenges are JSON data consumed by simulation engines. Engines are parameterized — they accept any valid variable combination and produce a simulation. The engine code is fixed; content scales by adding JSON.
- **Alternatives Considered**:
  - **Hardcoded scenes per challenge**: Each challenge is a custom React component with its own scene setup. → Rejected because it doesn't scale (26 challenges in Phase 1, hundreds in later phases) and makes UGC impossible.
  - **Visual scripting / node graph**: Challenges defined as visual programs. → Rejected because it's over-engineered for Phase 1 and adds a DSL to maintain. JSON with engine parameters is simpler and equally expressive for the current scope.
- **Consequences**: (+) Content scales without code changes, UGC-ready, A/B testable, adaptive engine can dynamically compose challenges. (−) Must validate JSON at load time (invalid params could crash engine); challenge authoring requires understanding engine variables.

### ADR-8: Zustand + Koota Dual State Model

- **Status**: Accepted
- **Context**: The app has two kinds of state: UI/meta state (theme, language, modal, challenge progress) and simulation state (entity positions, velocities, forces). These have fundamentally different update patterns — UI changes on user action; simulation changes every frame at 60fps.
- **Decision**: Zustand for UI/meta/domain state. Koota ECS for simulation state. No overlap — clear ownership boundary.
- **Alternatives Considered**:
  - **Zustand for everything**: Simpler, one state library. → Rejected because Zustand's immutable update model is unsuitable for per-frame updates on 100-1000+ entities. Would cause excessive re-renders and GC pressure.
  - **Koota for everything**: Unified state model. → Rejected because ECS is not designed for UI state (modals, forms, routing). It would be forcing a square peg into a round hole.
  - **Jotai / Valtio for UI**: Fine-grained reactivity. → Rejected because Zustand is simpler, has no proxy magic, and is sufficient for PhysPlay's UI complexity.
- **Consequences**: (+) Each state model used where it excels. Clear boundary. (−) Two mental models for state; bridge code needed where UI needs to read simulation state (e.g., displaying current velocity in HUD).

### ADR-9: TSL (Three.js Shading Language) for Shaders

- **Status**: Accepted
- **Context**: PhysPlay needs custom shaders for wave field visualization, force field overlays, prediction trajectory rendering, and portal transition effects. These must work on both WebGPU and WebGL renderers.
- **Decision**: TSL (Three.js Shading Language) for all custom shaders. TSL is Three.js's node-based shader system that compiles to WGSL (WebGPU) or GLSL (WebGL) from a single source.
- **Alternatives Considered**:
  - **Raw WGSL + GLSL dual maintenance**: Write shaders twice, one per backend. → Rejected because maintaining two shader implementations per effect is error-prone and doubles shader development effort. Any visual difference between backends becomes a hard-to-debug divergence.
  - **GLSL-only (WebGL fallback for all)**: Skip WebGPU shaders entirely. → Rejected because WebGPU's compute shaders are needed for wave field computation on GPU, and GLSL limits us to WebGL's capabilities even when WebGPU is available.
  - **wgpu-matrix / custom shader abstraction**: Build a custom abstraction layer. → Rejected because TSL is the official Three.js solution, actively maintained, and integrated with Three.js's material system. Building our own would duplicate effort.
- **Consequences**: (+) Single shader source for both backends, integrated with Three.js material pipeline, access to WebGPU compute shaders when available. (−) TSL is newer and less documented than raw GLSL; complex effects may hit TSL limitations.

### ADR-10: glTF 2.0 as 3D Asset Format

- **Status**: Accepted
- **Context**: PhysPlay needs 3D assets for simulation environments (skyboxes, lab equipment, interactive objects). Assets must load fast, compress well, and integrate with the Three.js/R3F pipeline.
- **Decision**: glTF 2.0 as the exclusive 3D asset format. Draco compression for geometry, KTX2 (Basis Universal) for GPU-compressed textures. Loaded via Drei's `useGLTF` with automatic caching.
- **Alternatives Considered**:
  - **FBX**: Common in game industry. → Rejected because FBX is a proprietary Autodesk format, has larger file sizes, and Three.js's FBX loader is less maintained than the glTF loader.
  - **USD (Universal Scene Description)**: Pixar's format, gaining traction. → Rejected because browser support is nascent, Three.js USD support is experimental, and the tooling ecosystem is not mature for web delivery.
  - **Procedural-only (no asset files)**: Generate all geometry in code. → Rejected for environments and complex objects. Procedural generation is used for simulation objects (balls, ramps, wave surfaces) but lab environments, skyboxes, and visual polish require authored assets.
- **Consequences**: (+) Industry standard for web 3D, excellent compression (Draco + KTX2), first-class Three.js/Drei support, broad tooling ecosystem (Blender, etc.). (−) KTX2 transcoding adds ~100ms to first texture load; Draco WASM decoder adds ~50KB to initial bundle.

---

## 10. Phase Implementation Summary

### Phase 1 — Mechanics Lab (역학 실험실)

**Components**:
- `site/`: Landing page (SSR), Hub (2D), Settings
- `experience/`: Canvas (WebGPU/WebGL), Scene (environments, cameras, materials), HUD (prediction UI, discovery overlay, controls)
- `engine/`: ECS world, Rapier physics adapter, 3 simulation engines (projectile, collision-energy, wave), challenge loader + validator, adaptive selector (rule-based)
- `domains/`: mechanics-lab (orchestrates 3 stations), hub, onboarding
- `content/`: 26 challenge JSONs, concept library JSONs
- `shared/`: Zustand stores (progress, theme, language), i18n (en/ko), types

**Infrastructure**: Cloudflare Workers + R2. GitHub Actions CI/CD. PostHog analytics. Sentry error tracking.

**Key ADRs**: ADR-1 (TanStack Start), ADR-2 (Three.js/R3F), ADR-3 (Rapier + Rust WASM), ADR-4 (Koota), ADR-5 (Client-only), ADR-6 (Cloudflare), ADR-7 (Challenge-as-Data), ADR-8 (Zustand + Koota), ADR-9 (TSL shaders), ADR-10 (glTF).

### Phase 2 — Mechanics Expansion + AI [Phase 2]

**New components**:
- `engine/simulation/`: 2 new stations in mechanics-lab (sound/light, electromagnetic)
- `engine/challenge/adaptive.ts`: Swap rule-based port for ML-based implementation
- ML model served via Python (FastAPI) sidecar or edge inference (ONNX Runtime WASM)

**New infrastructure**: Potentially a lightweight ML inference endpoint (Cloud Run, Python). Depends on ML model complexity.

### Phase 3 — Molecular Lab + Accounts [Phase 3+]

**New components**:
- `engine/simulation/molecular/`: Molecular engine (VSEPR, stereochemistry, bonding)
- Backend: Rust (Axum) API on Cloud Run — auth, progress sync, challenge metadata
- `shared/stores/auth.ts`: Auth state, token management
- UGC v1: Challenge editor UI (composes engine params → JSON)

**New infrastructure**: Cloud Run (Rust API), Neon PostgreSQL (us-east-1), auth (Google OAuth2 + JWT).

**New integrations**: PDB / PubChem for real molecular structure data.

### Phase 4 — Space Observatory [Phase 4+]

**New components**:
- `engine/simulation/orbit/`: Orbit engine (Kepler, tidal forces, Lagrange, three-body)
- `domains/space-observatory/`: New space domain
- Cross-engine knowledge graph (REQ-028): recommendation system connecting concepts across engines

**New integrations**: NASA Open API for real planet/orbit data.

### Phase 5 — Quantum Lab + XR [Phase 5+]

**New components**:
- `engine/simulation/quantum/`: Quantum engine (double-slit, tunneling, orbitals, entanglement)
- `experience/xr/`: WebXR session, hand tracking controllers, interaction mapping
- `domains/quantum-lab/`: New space domain
- UGC v3: Space editor

**New infrastructure**: No additional infra. XR runs client-side (same Workers deployment).

---

*Detailed engine specs: `docs/contents/engines/*/concepts.md`, `docs/contents/engines/*/challenges.md`*
*Client folder structure: [client-structure.md](./client-structure.md)*
*Full requirements: [prd.md](./prd.md) | [prd-phase-1.md](./prd-phase-1.md)*
