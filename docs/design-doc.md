# PhysPlay — Software Architecture Design Document

**Status**: Draft
**Date**: 2026-03-03
**PRD Reference**: [PRD](./prd.md) | [Phase 1 PRD](./prd-phase-1.md) | [Product Brief](./product-brief.md)

---

## 1. Context & Scope

### 1.1 Problem Statement

PhysPlay is a browser-based 3D science gamification platform that makes physics concepts explorable through a Predict-Play-Discover core loop. Users predict outcomes, run 3D simulations with God Hand (first-person tabletop manipulation), and discover concepts by comparing predictions against results. The system must deliver 60fps 3D simulations in a browser with zero installation, adapt challenge difficulty to individual users, and support progressive expansion from classical mechanics to quantum physics.

The technical challenge is unusual: this is a **client-heavy, GPU-bound application** with no backend server in Phase 1. All state lives locally. The architecture must support real-time physics simulation, WebGPU/WebGL rendering, an adaptive rule engine, and a content pipeline driven by JSON data — all running in the browser.

### 1.2 System Context

```
                     ┌──────────────────────┐
                     │       Browser         │
                     │  ┌──────────────────┐ │
   User ────────────▶│  │   PhysPlay SPA   │ │
   (PC/Mobile/XR)    │  │                  │ │
                     │  │  site/ (2D)      │ │
                     │  │  experience/ (3D)│ │
                     │  │  engine/ (sim)   │ │
                     │  └────────┬─────────┘ │
                     │           │           │
                     │  ┌────────▼─────────┐ │
                     │  │   IndexedDB      │ │
                     │  │   (local state)  │ │
                     │  └──────────────────┘ │
                     └───────────┬───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   External Services     │
                    │                         │
                    │  PostHog (analytics)    │
                    │  Tally (email forms)    │
                    │  CDN (static assets)    │
                    └─────────────────────────┘

                    [Phase 3+]
                    ┌─────────────────────────┐
                    │  Backend API (Axum)     │
                    │  Neon PostgreSQL        │
                    │  Auth (OAuth2 + JWT)    │
                    │  NASA API / PDB        │
                    └─────────────────────────┘
```

### 1.3 Assumptions

1. **No backend in Phase 1.** All user data (progress, predictions, settings) lives in IndexedDB. This trades data durability for zero-ops launch.
2. **WebGPU is available on target browsers.** Chrome stable has shipped WebGPU. Safari and Firefox are in progress. WebGL 2 fallback is required for coverage.
3. **Solo developer.** Architecture decisions prioritize simplicity and operational zero-cost over scalability features that would matter at team scale.
4. **Educational accuracy, not research accuracy.** Physics simulations approximate — projectile motion uses parametric equations, not N-body solvers. This keeps computation within browser main thread budgets.
5. **26 challenges are sufficient for Phase 1 validation.** The adaptive engine only needs to work with a small challenge pool; ML-based personalization comes in Phase 2+.

---

## 2. Goals & Non-Goals

### 2.1 Goals

- Deliver 60fps on mid-range PC (GTX 1060 / M1) and 30fps on mid-range mobile (Snapdragon 7 Gen 1) for all 3 simulation engines
- Initial load (URL to first interactive frame) under 3 seconds on 50 Mbps connection
- Support 3 simulation engine types (projectile, collision-energy, wave) with shared ECS architecture
- Challenge data is 100% JSON-driven — adding a challenge requires zero code changes
- WebGPU primary, WebGL 2 automatic fallback with acceptable visual degradation
- Offline-capable simulation execution (no network required after initial load)
- XR-ready architecture: same scene graph, input abstracted behind ports [Phase 2+]

### 2.2 Non-Goals

- **No backend server in Phase 1.** No API, no database, no auth. IndexedDB only.
- **No real-time multiplayer.** Single-user local experience.
- **No native app.** Browser only — URL access is a core product differentiator.
- **No XR implementation in Phase 1.** Architecture supports it; code doesn't ship it.
- **No ML-based adaptive engine in Phase 1.** Rule-based only. ML comes in Phase 2+ when behavioral data exists.
- **No UGC editor UI in Phase 1.** Data schema supports UGC; the editor is Phase 3.
- **No Service Worker / PWA in Phase 1.** Offline works because simulations are client-side, but aggressive caching is Phase 2.

---

## 3. High-Level Architecture

### 3.1 Architecture Style

**Single-Page Application (SPA)** with two rendering layers (2D DOM + 3D WebGPU/WebGL) sharing global state through Zustand stores. No backend services in Phase 1.

This is **not** a traditional web app. The critical path is a real-time simulation loop:

```
Input (mouse/touch) → Physics step (Rapier WASM) → ECS update (Koota) → Render (Three.js/R3F) → HUD update (React DOM)
```

The architecture is closer to a game engine than a web application. React manages lifecycle and DOM; the simulation runs independently at fixed timestep.

**Why SPA over SSR/SSG:** The product is a 3D interactive experience, not a content site. There's no SEO benefit to server-rendering a WebGPU canvas. The landing page (`site/`) benefits from SSG, but since Phase 1 has no backend, static export from the SPA framework is sufficient. Phase 3+ may introduce Next.js for the landing/marketing site if SEO becomes critical.

**Framework choice: TanStack Start** on Cloudflare Workers (static deployment in Phase 1, edge SSR available for Phase 3+). TanStack Router provides type-safe routing between 2D pages (hub, landing, settings) and 3D experience views. The app lives behind no auth — SEO matters only for the landing page, which is a static route.

### 3.2 Container Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Runtime                          │
│                                                                 │
│  ┌─────────────────┐    ┌────────────────────────────────────┐ │
│  │   site/ (2D)    │    │       experience/ (3D)             │ │
│  │                 │    │                                    │ │
│  │ Landing page    │    │  ┌──────────┐  ┌───────────────┐  │ │
│  │ Hub (React DOM) │    │  │  scene/   │  │    hud/       │  │ │
│  │ Settings        │    │  │ R3F+Three │  │ React overlay │  │ │
│  │                 │    │  │ WebGPU/GL │  │ on <Canvas>   │  │ │
│  └────────┬────────┘    │  └─────┬────┘  └───────┬───────┘  │ │
│           │             │        │               │           │ │
│           │             │  ┌─────▼───────────────▼────────┐  │ │
│           │             │  │     domains/ (orchestration)  │  │ │
│           │             │  │  projectile / energy / wave   │  │ │
│           │             │  └─────────────┬────────────────┘  │ │
│           │             │                │                    │ │
│           │             └────────────────┼────────────────────┘ │
│           │                              │                      │
│  ┌────────▼──────────────────────────────▼────────────────────┐│
│  │                    engine/ (no React)                       ││
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐  ││
│  │  │ Koota    │  │ Rapier WASM  │  │ Adaptive Rule       │  ││
│  │  │ ECS      │  │ Physics      │  │ Engine              │  ││
│  │  │ World    │  │ (fixed step) │  │ (challenge select)  │  ││
│  │  └──────────┘  └──────────────┘  └─────────────────────┘  ││
│  └────────────────────────────────────────────────────────────┘│
│                              │                                  │
│  ┌───────────────────────────▼────────────────────────────────┐│
│  │                    shared/                                  ││
│  │  Zustand stores │ i18n │ types │ IndexedDB adapter │ audio ││
│  └────────────────────────────────────────────────────────────┘│
│                              │                                  │
│  ┌───────────────────────────▼────────────────────────────────┐│
│  │                    content/                                 ││
│  │  Challenge JSON files │ Concept library │ Space themes      ││
│  └────────────────────────────────────────────────────────────┘│
│                              │                                  │
│  ┌───────────────────────────▼────────────────────────────────┐│
│  │                    IndexedDB                                ││
│  │  user_profile │ challenge_results │ tag_accuracy │          ││
│  │  station_progress │ session_meta                            ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Key containers:**

| Container | Technology | Responsibility |
|-----------|-----------|----------------|
| `site/` | React DOM (FSD structure) | 2D pages: landing, hub, settings. No 3D dependencies. |
| `experience/` | React Three Fiber + Three.js (WebGPU-first) | Full-screen 3D viewport, HUD overlays, space themes, camera control. |
| `engine/` | Koota ECS + Rapier WASM (no React) | Physics simulation, ECS world, adaptive rule engine. Framework-agnostic — can run in a Web Worker. |
| `domains/` | React + Zustand | Per-station orchestration (projectile, collision-energy, wave). Composes engine systems + scene objects + HUD for each station type. |
| `shared/` | Zustand, i18n, IndexedDB wrapper | Cross-cutting: theme, locale, user profile, persistence, audio manager. |
| `content/` | Static JSON + markdown | Challenge definitions, concept library, space theme configs. Loaded at build time, validated by Zod. |

### 3.3 Component Overview

**Three major bounded contexts emerge from the PRD:**

**1. Simulation Context** (`engine/`)
The physics simulation core. Contains ECS components (Position, Velocity, Force, TrajectoryPoint), systems (ProjectileMotionSystem, CollisionSystem, WaveInterferenceSystem), and the Rapier physics adapter. Never imports React. Communicates with the rendering layer through ECS queries that React hooks read reactively.

**2. Experience Context** (`experience/` + `domains/`)
The 3D rendering and interaction layer. Scene graph (objects, environments, cameras, materials), HUD overlay system, God Hand input handling. Each domain (projectile, collision-energy, wave) registers its own ECS systems, defines its scene objects, and provides its HUD panels.

**3. Progression Context** (`shared/stores/` + adaptive rule engine in `engine/`)
User state: which challenges are completed, tag accuracy, station progress, current difficulty. The adaptive rule engine reads this state and produces the next challenge recommendation. IndexedDB persists this across sessions.

**Critical path:** User submits prediction → engine runs simulation (fixed timestep loop) → ECS updates entity positions each frame → R3F scene reads ECS data via bridge hooks → Three.js renders → HUD displays result comparison → adaptive engine selects next challenge → IndexedDB persists result.

---

## 4. Data Architecture

### 4.1 Data Flow

**Flow 1: Challenge Lifecycle (Predict → Play → Discover)**

```
Challenge JSON (static)
    │
    ▼
[PREDICT] User prediction → Zustand store (in-memory)
    │
    ▼
[PLAY] Engine reads challenge params → Rapier physics step (16ms fixed) →
       Koota ECS updates → R3F reads ECS → Three.js renders
    │
    ▼
[DISCOVER] Compare prediction vs simulation result →
           Read concept from content/ library →
           Display in HUD overlay
    │
    ▼
[PERSIST] Write ChallengeResult + TagAccuracy update → IndexedDB
    │
    ▼
[NEXT] Adaptive rule engine reads StationProgress + TagAccuracy from IndexedDB →
       Filters challenge pool → Returns next challenge ID
```

**Flow 2: Hub → Lab Transition**

```
Hub (2D React DOM) → User clicks station card
    │
    ▼
Route change: /hub → /lab/mechanics/projectile
    │
    ▼
experience/canvas/ initializes WebGPU (or WebGL fallback)
    │
    ▼
domains/projectile/ registers ECS systems, loads challenge JSON
    │
    ▼
scene/environments/ loads mechanics-lab theme (skybox, lighting, particles)
    │
    ▼
Camera transition animation (1.5s) → Station ready
```

### 4.2 Storage Strategy

| Store | Type | What | Why | Consistency |
|-------|------|------|-----|-------------|
| **IndexedDB** (`physplay-local`) | Document (local) | User profile, challenge results, tag accuracy, station progress, session meta | No backend in Phase 1. IndexedDB survives page refreshes, has no size limit for this data volume (~100KB per user). | Strong (single client) |
| **Zustand** (in-memory) | Key-value (RAM) | Active challenge state, prediction values, simulation running flag, HUD visibility, theme, locale | Frame-by-frame UI state that doesn't need persistence. Lost on tab close — that's fine. | Strong (single client) |
| **Koota ECS** (in-memory) | Columnar (RAM) | Entity positions, velocities, forces, trajectory points, particle emitter state | Hot simulation data queried 60 times/sec. ECS columnar layout maximizes cache coherence for system iteration. | N/A (frame-consistent) |
| **Static JSON** (bundled) | Document (build-time) | Challenge definitions, concept library, space theme configs | Content is immutable per deployment. Validated by Zod at build time. No runtime loading variability. | N/A (immutable) |

**Phase 3+ storage migration:** When accounts are introduced, IndexedDB data will sync to a PostgreSQL backend (Neon). The `user_profile.id` (locally-generated UUID) serves as the migration key. All records have timestamps for conflict resolution. The IndexedDB schema is designed to be serializable to a server API without transformation.

### 4.3 Caching Strategy

| What | How | TTL | Rationale |
|------|-----|-----|-----------|
| 3D assets (glTF, KTX2 textures) | Browser HTTP cache + `Cache-Control: immutable` with content-hash filenames | Indefinite (cache-bust via filename) | Assets are large (5-20MB total), must not re-download on revisit. Content-hashed filenames handle versioning. |
| WASM binaries (Rapier) | Same as above | Indefinite | ~2MB. Critical for first-load performance. |
| Challenge JSON | Bundled at build time (no runtime fetch) | N/A | 26 challenges at ~2KB each = 52KB. Not worth a separate fetch. Tree-shaken per station for code splitting. |
| Audio files | Lazy-loaded on first station entry, then cached | Browser cache | BGM and effects per space theme. Only load the active space's audio. |

---

## 5. Infrastructure & Deployment

### 5.1 Compute Platform [Phase 1]

**Cloudflare Pages** (static site hosting). Phase 1 has no backend — the entire application is a static SPA bundle deployed to a global CDN.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting | Cloudflare Pages | Free tier handles 10K+ UV/month. Global edge CDN. Automatic HTTPS. Zero ops. |
| Build | GitHub Actions → `pnpm build` → deploy to CF Pages | Standard CI. Build validates challenge JSON schema via Zod. |
| Preview | Cloudflare Pages branch previews | Every PR gets a preview URL. Free. |

**Why Cloudflare Pages over Vercel:** Phase 1 is a static SPA — no SSR, no API routes. Cloudflare Pages' free tier is more generous for static sites (unlimited bandwidth vs. Vercel's 100GB). When Phase 3 adds a backend, the frontend can stay on Cloudflare while the API moves to GCP Cloud Run.

**Why not TanStack Start + Cloudflare Workers yet:** Phase 1 doesn't need SSR. Static export from TanStack Start (via Vinxi static adapter) deploys to Pages. Phase 3+ can switch to Workers for SSR if the landing page needs it.

### 5.2 Deployment Strategy

```
main branch push → GitHub Actions → pnpm build → Zod validates challenge JSON →
    → Lighthouse CI (performance budget: LCP < 3s, TBT < 200ms) →
    → Deploy to Cloudflare Pages (production)

PR push → Same pipeline → Deploy to Cloudflare Pages (preview URL)
```

Rollback: Cloudflare Pages keeps deployment history. One-click rollback in dashboard.

### 5.3 Environment Topology [Phase 1]

| Environment | URL | Purpose |
|-------------|-----|---------|
| Production | `physplay.app` | Live users |
| Preview | `{branch}.physplay.pages.dev` | PR review, stakeholder demos |
| Local | `localhost:3000` | Development (Vite dev server) |

No staging environment in Phase 1 — preview deployments serve this role.

### 5.4 Infrastructure Evolution [Phase 3+]

```
Phase 1: Cloudflare Pages (static SPA) + IndexedDB
Phase 3: + GCP Cloud Run (Axum API) + Neon PostgreSQL + Auth (Google OAuth2)
Phase 4: + NASA API integration + Cloudflare R2 (UGC asset storage)
Phase 5: + ML inference endpoint (adaptive AI) + Pub/Sub (event pipeline)
```

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization [Phase 1]

**No auth in Phase 1.** Anonymous usage with locally-generated UUID (`crypto.randomUUID()`). All data in IndexedDB.

**Phase 3+ auth plan:**
- Social login (Google OAuth2) + self-issued JWT
- Access token: 15min, in-memory
- Refresh token: 7-30 days, httpOnly secure cookie
- Authorization: RBAC (student, teacher, admin)
- Phase 1 IndexedDB data migrates to server on first login (user consent required)

### 6.2 Observability

**Analytics (Phase 1):** PostHog (cloud). Client-side SDK sends events directly. Privacy-friendly — no cookies, IP anonymization enabled.

Key events tracked (16 event types defined in Phase 1 PRD §11):
- Funnel: `session_start` → `onboarding_start` → `predict_submit` → `play_complete` → `discover_view`
- Engagement: `station_navigate`, `station_complete`, `predict_skip`
- B2B: `teacher_email_submit`

**Performance monitoring (Phase 1):**
- FPS counter in development builds (R3F `<Stats>`)
- `PerformanceObserver` for LCP, TBT reported to PostHog as custom events
- WebGPU vs. WebGL fallback rate tracked as a property on `session_start`

**Error tracking:** Sentry. Source maps uploaded at build time. Breadcrumbs capture: route changes, challenge transitions, WebGPU/WebGL selection, IndexedDB errors.

### 6.3 Error Handling & Resilience

| Failure | Impact | Mitigation |
|---------|--------|------------|
| WebGPU unavailable | Can't render with preferred API | Automatic fallback to WebGL 2. Detected at canvas initialization. Visual quality degrades gracefully (no emissive materials, simpler post-processing). |
| IndexedDB blocked (private browsing) | No persistence | Detect at startup. Show warning: "Your progress won't be saved in private browsing mode." App still functions with in-memory state. |
| IndexedDB data corruption | Lost progress | Wrap all IDB operations in try/catch. On corruption, offer "Reset progress" instead of crashing. |
| Rapier WASM fails to load | No physics simulation | Fatal error. Show "Your browser doesn't support this experience. Try Chrome 110+." This is unlikely — WASM is supported everywhere WebGPU/WebGL 2 is. |
| Challenge JSON invalid | Challenge can't load | Validated at build time via Zod. Runtime: skip invalid challenge, log to Sentry, advance to next. |
| PostHog unreachable | No analytics | Fire-and-forget. SDK handles offline gracefully. Never blocks user interaction. |

### 6.4 Security

| Concern | Approach |
|---------|----------|
| Data in transit | HTTPS enforced by Cloudflare. HSTS header. |
| User data | Phase 1: all data local (IndexedDB). No PII collected except optional teacher email (sent to Tally, not stored locally). |
| Input validation | Challenge JSON validated by Zod schema at build time. User prediction input (trajectory points, selection indices) bounds-checked at submission. |
| XSS | React's default escaping. Concept explanations from static JSON (not user-generated) rendered as text, not innerHTML. |
| Dependency supply chain | `pnpm audit` in CI. Lockfile committed. |

### 6.5 Performance & Scalability

**Load profile:** Client-side only. "Scalability" means the app runs well on a single user's device, not handling concurrent users on a server.

**Performance budgets:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial load (LCP) | < 3s on 50Mbps | Lighthouse CI in pipeline |
| Time to interactive (first challenge ready) | < 5s | Custom metric: `onboarding_start` timestamp - `session_start` |
| Frame rate (PC mid-range) | 60fps | R3F `<Stats>` + PerformanceObserver |
| Frame rate (mobile mid-range) | 30fps | Same, tested on physical devices |
| Total bundle size (gzipped) | < 2MB (app code) + < 3MB (WASM) + < 15MB (assets) | Build output analysis |
| Memory usage | < 512MB | Chrome DevTools profiling |

**Identified bottlenecks and mitigation:**

| Bottleneck | Mitigation |
|------------|------------|
| Rapier WASM initialization (~200ms) | Preload WASM during loading screen. Initialize physics world before first challenge. |
| Wave interference computation (N^2 per frame for N sources) | GPU compute via TSL shader for interference pattern. Fallback: reduce grid resolution on mobile. |
| 3D asset loading | glTF + KTX2 compressed textures. Draco mesh compression. Progressive loading: low-poly placeholder → full mesh. |
| Memory pressure on mobile | Object pooling for particles. Dispose Three.js geometries/materials on station switch. |
| Code bundle size | Route-based code splitting: `site/` and `experience/` in separate chunks. Each station's domain lazily loaded on entry. |

---

## 7. Integration Points

### 7.1 Phase 1 Integrations

| Service | Purpose | Protocol | Failure Mode |
|---------|---------|----------|-------------|
| **PostHog** | Analytics | HTTPS (client SDK) | Silently drops events. No user impact. |
| **Tally** | Teacher email collection | HTTPS (form embed / API) | Form submission fails. Show retry message. |
| **Sentry** | Error tracking | HTTPS (client SDK) | Silently fails. No user impact. |
| **Cloudflare Pages** | Hosting / CDN | HTTPS | If CDN is down, site is down. Acceptable — Cloudflare's SLA is 99.99%. |

### 7.2 Phase 3+ Integrations

| Service | Purpose | Phase |
|---------|---------|-------|
| **Neon PostgreSQL** | Persistent user data, B2B analytics | Phase 3 |
| **Google OAuth2** | Authentication | Phase 3 |
| **NASA Open API** | Real planet/orbit data for Space Observatory | Phase 4 |
| **PDB / PubChem** | Molecular structure data for Molecular Lab | Phase 3 |

---

## 8. Migration & Rollout

### 8.1 Phase 1 → Phase 3 Data Migration

The biggest migration is IndexedDB → server PostgreSQL when accounts are introduced in Phase 3.

**Strategy:** Incremental merge on first login.

1. User creates account (Google OAuth2)
2. Client reads all IndexedDB data
3. Client sends `{ localUserId, challengeResults[], tagAccuracy[], stationProgress[] }` to `POST /api/migrate`
4. Server checks for conflicts (same `challengeId` + close timestamps) and merges
5. Server responds with merged state
6. Client overwrites IndexedDB with server-authoritative state
7. From this point, client syncs to server on each challenge completion

**Why not dual-write from Phase 1:** Adding a backend doubles complexity for zero Phase 1 benefit. The migration is a one-time event per user.

---

## 9. Risks & Open Questions

### 9.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Wave interference at 60fps on mobile exceeds GPU budget | High (core experience degrades) | Medium | Compute interference via TSL shader on GPU. If still too slow: reduce grid resolution, limit max sources to 2 on mobile. Discovery eng spike. |
| WebGPU not available on Safari during Phase 1 launch window | Medium (Safari users get WebGL fallback) | High | WebGL 2 fallback is mandatory. Accept visual downgrade (no emissive neon, simpler particles). Track WebGPU vs. WebGL ratio in analytics. |
| IndexedDB data loss from browser cache clear | Medium (user loses progress) | High | Show warning UI. Phase 3 server sync resolves this permanently. Consider `navigator.storage.persist()` to request persistent storage. |
| Trajectory drawing UX feels unnatural on mobile touch | High (prediction skip rate increases) | Medium | Discovery user testing with 3 people. Fallback: offer simplified "select landing zone" prediction type on mobile. |
| Rapier WASM bundle size (~2MB) delays initial load | Medium (3s budget exceeded) | Low | WASM loaded during splash screen. Streaming compilation (`WebAssembly.compileStreaming`). Compression reduces transfer to ~800KB. |
| God Hand drag-to-throw feels imprecise | Medium (core interaction broken) | Medium | Velocity-based mapping with visual feedback (trajectory preview line during drag). Tune sensitivity curves per device type. Discovery eng spike. |

### 9.2 Open Questions

1. **WebGPU feature detection timing.** Should we probe WebGPU at app start (blocking) or attempt it and fallback reactively? Blocking is simpler but adds ~50ms to load. Reactive risks a flash of broken content.
   - Options: (a) Blocking probe, (b) Optimistic with fallback, (c) User-selectable in settings
   - Leaning: (a) — 50ms is acceptable during splash screen

2. **Fixed timestep vs. variable timestep for physics.** Fixed (e.g., 16ms) ensures deterministic simulation but may stutter if a frame takes too long. Variable avoids stutter but introduces non-determinism.
   - Options: (a) Fixed timestep with accumulator (game industry standard), (b) Variable timestep
   - Leaning: (a) — Determinism matters for prediction comparison

3. **ECS system registration per domain.** Should each domain (projectile, energy, wave) register its own ECS systems dynamically, or should all systems be registered globally with conditional execution?
   - Options: (a) Dynamic registration on station enter/leave, (b) All registered, conditionally active
   - Leaning: (a) — Cleaner memory profile, each station owns its systems

4. **HUD rendering: HTML overlay vs. in-scene mesh.** R3F's `<Html>` component places React DOM elements in 3D space. Alternatively, HUD could be rendered as 3D mesh (billboarded quads with text textures).
   - Options: (a) `<Html>` DOM overlay (easier, accessible, responsive), (b) 3D mesh HUD (uniform visual, XR-native), (c) Hybrid (DOM for Phase 1, mesh for XR Phase 2+)
   - Leaning: (c) — DOM overlay works for web, converts to spatial panels for XR later

---

## 10. Architecture Decision Records (ADRs)

### ADR-1: TanStack Start + Cloudflare Pages for Frontend [Phase 1]

- **Status**: Accepted
- **Context**: PhysPlay is a client-heavy SPA with 2D pages (hub, landing) and 3D experiences (lab). Phase 1 has no backend. SEO matters only for the landing page.
- **Decision**: TanStack Start with static export to Cloudflare Pages.
- **Alternatives Considered**:
  - **Next.js + Vercel**: Rejected — SSR/SSG machinery is overkill for a client-side 3D app. App Router's server component model adds complexity with no benefit when there's no backend. The 3D experience can't be server-rendered.
  - **Vite SPA (no meta-framework)**: Rejected — loses type-safe routing, future SSR capability, and structured data loading. TanStack Start adds these with minimal overhead.
  - **Astro**: Rejected — optimized for content sites, not interactive SPAs. Its island architecture doesn't map to a full-screen 3D canvas.
- **Consequences**: (+) Zero-cost hosting, global CDN, type-safe routing, future SSR path. (-) Smaller community than Next.js, fewer off-the-shelf integrations.

### ADR-2: Three.js + React Three Fiber (WebGPU-first) for 3D Rendering

- **Status**: Accepted
- **Context**: Need real-time 3D rendering with physics visualization, particle effects, and HUD overlays in a browser. Must support eventual XR.
- **Decision**: Three.js via React Three Fiber (R3F) + Drei helpers. WebGPU renderer primary, WebGL 2 fallback. TSL (Three.js Shading Language) for custom shaders.
- **Alternatives Considered**:
  - **Babylon.js**: Rejected — larger bundle, less React integration, heavier abstraction for our use case. R3F's declarative model maps better to our component-per-station architecture.
  - **PlayCanvas**: Rejected — editor-centric workflow doesn't suit code-first development. Less community ecosystem.
  - **Raw WebGPU/WebGL**: Rejected — reinventing scene graph, camera, materials, etc. is months of work that Three.js provides tested and optimized.
- **Consequences**: (+) Mature ecosystem, excellent R3F/Drei DX, WebGPU support via Three.js WebGPURenderer, `@react-three/xr` for future XR. (-) Three.js abstractions may limit low-level GPU optimization for wave interference shader.

### ADR-3: Koota ECS for Simulation State

- **Status**: Accepted
- **Context**: Physics simulations produce per-entity state (position, velocity, force) that must be read 60 times/sec by the renderer. Traditional React state (useState/Zustand) would cause excessive re-renders.
- **Decision**: Koota ECS for all simulation entity state. React reads ECS via bridge hooks (`useQuery`, `useEntityValue`). ECS systems run outside React's render cycle.
- **Alternatives Considered**:
  - **Zustand for everything**: Rejected — Zustand triggers React re-renders on every state change. At 60fps with dozens of entities, this overwhelms React's reconciler.
  - **Hecs / Bitecs**: Rejected — Koota has first-class React bindings and TypeScript support. Bitecs is faster but lacks React integration. Hecs is archived.
  - **Custom frame loop with refs**: Rejected — ECS provides a proven pattern for entity management, system composition, and query optimization. Custom implementation would reinvent these poorly.
- **Consequences**: (+) Decoupled simulation from rendering, cache-friendly entity iteration, natural system composition per station. (-) Learning curve, ECS thinking differs from React's component model.

### ADR-4: Rapier WASM for Physics

- **Status**: Accepted
- **Context**: Need rigid body physics for projectile motion, collisions, roller coaster tracks, and pendulum simulation. Must run at 60fps in browser.
- **Decision**: Rapier (Rust physics engine compiled to WASM) via `@dimforge/rapier3d-compat`. Fixed timestep (16ms) with accumulator pattern.
- **Alternatives Considered**:
  - **Custom parametric equations**: Considered for projectile engine (closed-form solution for parabolic motion). Rejected as general approach — collision/energy scenarios need rigid body dynamics that parametric equations can't handle. However, projectile engine **will** use parametric equations for trajectory computation (faster, exact for educational purposes), with Rapier reserved for collision-energy station.
  - **Cannon.js / Oimo.js**: Rejected — JavaScript physics engines are 5-10x slower than Rapier WASM. Won't hit 60fps budget on mobile with multiple interacting bodies.
  - **Ammo.js (Bullet WASM)**: Rejected — larger bundle, less ergonomic API, maintenance concerns. Rapier is actively maintained with excellent TypeScript types.
- **Consequences**: (+) Near-native physics performance, deterministic simulation, ~800KB gzipped WASM. (-) WASM initialization cost (~200ms, mitigated by preloading).

### ADR-5: IndexedDB for Local Persistence [Phase 1]

- **Status**: Accepted
- **Context**: Phase 1 has no backend. User progress must survive page refreshes. Data volume is small (~100KB per user).
- **Decision**: IndexedDB via a thin typed wrapper (Dexie.js or custom). 5 object stores matching Phase 1 PRD §9 schema.
- **Alternatives Considered**:
  - **localStorage**: Rejected — 5-10MB limit per origin, synchronous API blocks main thread, no structured queries.
  - **OPFS (Origin Private File System)**: Rejected — designed for large binary data, not structured records. Worse DX for key-value operations.
  - **No persistence (in-memory only)**: Rejected — losing progress on tab close would tank retention metrics.
- **Consequences**: (+) Sufficient capacity, async API, structured queries by key. (-) Data lost on cache clear (mitigated by warning UI + Phase 3 server sync). Private browsing may block IDB in some browsers.

### ADR-6: Static JSON Content Pipeline

- **Status**: Accepted
- **Context**: Challenge definitions, concept explanations, and space theme configs are authored by the developer, not generated at runtime. Need validation, i18n, and type safety.
- **Decision**: Challenges defined as JSON files in `content/challenges/{engineId}/`. Validated by Zod schema at build time. Imported as static modules (tree-shaken per station via code splitting). i18n keys in JSON reference translation files.
- **Alternatives Considered**:
  - **CMS (Contentful, Sanity)**: Rejected — adds runtime dependency, latency, and cost for 26 static challenges. Overkill for Phase 1.
  - **Markdown with frontmatter**: Rejected — challenge data is structured (params, predict type, tolerance) and better expressed as JSON than markdown.
  - **Runtime fetch from API**: Rejected — no backend in Phase 1. Static bundling is simpler and faster.
- **Consequences**: (+) Type-safe content, build-time validation, zero runtime fetching, works offline. (-) Adding a challenge requires a code deployment. Acceptable for Phase 1; UGC in Phase 3 will need a runtime content API.

### ADR-7: PostHog for Analytics [Phase 1]

- **Status**: Accepted
- **Context**: Need event tracking for 16 event types to validate core loop hypothesis. Privacy matters (education audience, some users are minors).
- **Decision**: PostHog cloud. Client-side JavaScript SDK. No cookies. IP anonymization enabled.
- **Alternatives Considered**:
  - **Plausible**: Rejected — excellent for page analytics but lacks custom event funnels, session replay, and feature flags that will be needed in Phase 2.
  - **Umami**: Rejected — self-hosted adds ops burden. Cloud option is less feature-rich than PostHog.
  - **Google Analytics**: Rejected — cookie-heavy, GDPR/COPPA concerns for education audience, limited custom event support.
  - **IndexedDB + batch export**: Rejected — no way to analyze data across users without a backend. PostHog provides dashboards immediately.
- **Consequences**: (+) Rich funnels, session replay for UX debugging, feature flags for Phase 2+ A/B tests. (-) Third-party dependency for analytics. PostHog's free tier (1M events/month) is sufficient for 10K UV.

### ADR-8: Cloudflare Pages over Vercel for Static Hosting [Phase 1]

- **Status**: Accepted
- **Context**: Phase 1 is a static SPA. Need CDN hosting with preview deployments and custom domain.
- **Decision**: Cloudflare Pages.
- **Alternatives Considered**:
  - **Vercel**: Rejected for Phase 1 — Vercel's strengths (SSR, ISR, edge middleware) aren't used. 100GB/month bandwidth on free tier is tight if 3D assets are served from the same origin. Cloudflare Pages has unlimited bandwidth.
  - **Netlify**: Rejected — similar to Vercel reasoning. Bandwidth limits on free tier.
  - **GitHub Pages**: Rejected — no preview deployments, no custom headers, basic CDN.
- **Consequences**: (+) Unlimited bandwidth, global CDN, preview URLs, zero cost. (-) Less native support for SSR frameworks (matters in Phase 3 if landing page needs SSR — can be solved with Workers).

### ADR-9: 2D+3D Split Architecture (`site/` + `experience/`) [Phase 1]

- **Status**: Accepted
- **Context**: Product has two distinct rendering contexts: 2D pages (landing, hub, settings) and fullscreen 3D lab experiences. Loading Three.js + Rapier WASM for a 2D hub page wastes resources.
- **Decision**: Follow the "Web 2D + 3D" pattern from client-structure.md. `site/` contains 2D pages (FSD structure). `experience/` contains 3D layer. They never import each other. Cross-layer state flows through `shared/stores/`.
- **Alternatives Considered**:
  - **Single 3D-only app**: Rejected — rendering hub as 3D would require loading the full engine for a page that's just cards and progress bars. Wastes mobile GPU budget and memory.
  - **Separate apps (landing site + 3D app)**: Rejected — two deployments, two build pipelines, navigation between apps breaks SPA feel. Single SPA with code splitting achieves the same isolation with better UX.
- **Consequences**: (+) 2D pages load instantly (no 3D deps), 3D layer loads lazily on lab entry, clean separation of concerns. (-) Shared stores must be carefully scoped to avoid coupling the layers.

---

## 11. Phase Implementation Summary

### Phase 1 — 역학 실험실 (Mechanics Lab)

**Components:**
- `site/`: Landing page, hub, settings (2D React DOM)
- `experience/`: 3D viewport, HUD overlay, mechanics-lab space theme
- `engine/`: Koota ECS world, Rapier WASM adapter, 3 simulation systems (projectile, collision-energy, wave), adaptive rule engine (rule-based)
- `domains/`: 3 domains (projectile, collision-energy, wave) with station-specific systems, scene objects, HUD panels
- `content/`: 26 challenge JSON files, concept library, mechanics-lab theme config
- `shared/`: Zustand stores (user profile, challenge state, theme, locale), IndexedDB adapter, i18n (en/ko), audio manager

**Infrastructure:**
- Cloudflare Pages (static SPA)
- PostHog (analytics)
- Sentry (error tracking)
- Tally (teacher email forms)

**Key ADRs:** 1 (TanStack Start), 2 (R3F), 3 (Koota), 4 (Rapier), 5 (IndexedDB), 6 (JSON pipeline), 7 (PostHog), 8 (CF Pages), 9 (2D+3D split)

### Phase 2 — 역학 확장 + AI

**New components:**
- 2 additional stations in mechanics lab (sound/light, electromagnetic)
- ML-based adaptive engine (replaces rule-based) — likely a lightweight model running client-side (TensorFlow.js or ONNX Runtime Web)
- Service Worker for offline caching
- WebXR mode via `@react-three/xr` (same scene, input abstracted)

**Infrastructure additions:**
- None (still client-only)

### Phase 3 — 분자 실험실 + Backend

**New components:**
- Backend API: Axum (Rust) on GCP Cloud Run
- Database: Neon PostgreSQL (us-east-1)
- Auth: Google OAuth2 + self-issued JWT
- Molecular simulation engine (new ECS systems)
- Teacher dashboard (2D, `site/` layer)
- UGC Stage 1: Teacher challenge editor
- IndexedDB → PostgreSQL migration flow

**Infrastructure additions:**
- GCP Cloud Run (Axum API)
- Neon PostgreSQL
- Cloudflare R2 (UGC assets)

### Phase 4+ — 우주 관측소, 양자 연구소, UGC

**New components:**
- Orbit engine (NASA API integration)
- Quantum engine (custom shaders for wavefunction visualization)
- UGC Stage 2-3: Station/space creation editor
- Cross-engine concept recommendations (knowledge graph queries)
- Real-time collaboration (WebSocket via Cloud Run)

**Infrastructure additions:**
- GCP Pub/Sub (event pipeline for analytics/ML)
- ML inference endpoint (adaptive AI)
- NASA Open API, PDB/PubChem integrations

---

## Appendix

- [PRD](./prd.md) — Full product requirements
- [Phase 1 PRD](./prd-phase-1.md) — Phase 1 detailed requirements
- [Product Brief](./product-brief.md) — Strategic direction
- [Client Structure](./client-structure.md) — Frontend code organization
- [Engine Contents](./contents/engines/README.md) — Content structure per engine
