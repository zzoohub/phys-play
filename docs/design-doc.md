# PhysPlay — Software Architecture Design Document

**Status:** Draft
**Author:** —
**Date:** 2026-03-02
**PRD Reference:** [prd.md](./prd.md) | [Phase 1 PRD](./prd-phase-1.md)

---

## 1. Context & Scope

### 1.1 Problem Statement

Students learn inherently 3D scientific concepts — molecular structures, wave interference, orbital mechanics — through 2D textbooks and passive videos. Existing 3D tools are either expensive ($50K+/school), installation-heavy, or scattered across single-topic simulations with no integrated curriculum. PhysPlay delivers browser-based 3D interactive science simulations across 4 tracks (24 modules) with zero installation, progressive XR enhancement, and an interaction-first learning model that builds intuition before introducing equations.

Phase 1 validates the core hypothesis with 3 classical physics modules (Motion & Force, Energy & Work, Waves) targeting Korean high school students and English-speaking global users.

### 1.2 System Context Diagram

```
  ┌──────────────┐         ┌──────────────────────────────────┐
  │   Student /  │  HTTPS  │       PhysPlay Web App            │
  │   Teacher    │────────▶│  (Browser-side 3D simulations)    │
  │   (Browser)  │         │                                    │
  └──────────────┘         └──────┬──────────┬────────┬────────┘
                                  │          │        │
                          ┌───────▼──┐  ┌────▼────┐  ┌▼─────────────┐
                          │Cloudflare│  │PostHog  │  │Sentry        │
                          │CDN / R2  │  │Analytics│  │Error Tracking│
                          │Workers   │  │(SaaS)   │  │(SaaS)        │
                          └──────────┘  └─────────┘  └──────────────┘

  Browser Runtime APIs:
  ├── WebGPU / WebGL (rendering)
  ├── WASM (Rapier physics)
  ├── WebXR [Phase 2+]
  └── IndexedDB (local persistence)
```

### 1.3 Assumptions

| # | Assumption | If Wrong |
|---|-----------|----------|
| A1 | WebGPU is available on 60%+ of target devices by launch; WebGL covers the rest | Must invest more in WebGL rendering path quality |
| A2 | Rapier WASM physics runs at 60fps on mid-range mobile (2020+ devices) | Need simulation complexity budget or Web Worker offload |
| A3 | No backend API is needed in Phase 1 — all state is client-side (IndexedDB) | Must add a lightweight API earlier than planned |
| A4 | TanStack Start on Cloudflare Workers provides sufficient SSR for initial load performance | May need to add prerendering or switch to SSG for landing page |
| A5 | 3 physics modules provide enough content for 3-minute average session time | May need to add more interactive depth per module |
| A6 | Korean + English i18n can be handled with static JSON bundles without a translation management service | Need Crowdin/Lokalise if more languages are added faster than planned |

---

## 2. Goals & Non-Goals

### 2.1 Goals

- **G1**: Render 3D physics simulations at 60fps on mid-range devices (2020+ smartphones/laptops) with <100ms input-to-visual-feedback latency
- **G2**: First meaningful paint in <5s on 3G connections; full simulation interactive in <8s
- **G3**: Support WebGPU (primary) with automatic WebGL fallback — zero user intervention. XR sessions use WebGL2 (WebGPU+WebXR binding spec incomplete)
- **G3a**: XR-ready from day 1 via @react-three/xr v6. Same scene graph renders in both XR and non-XR modes. XR device detected → show "Enter VR/AR" button; no device → standard 3D with OrbitControls
- **G4**: Deploy 3 classical physics modules (1-1, 1-2, 1-3) with full interactivity (sliders, toggles, drag, vector overlays)
- **G5**: Responsive layout across desktop, tablet, and mobile with adaptive 3D quality
- **G6**: i18n for ko and en with all UI text and physics terminology
- **G7**: Track module visits, interaction rates, session duration, and device performance via PostHog
- **G8**: Landing page that showcases the 4-track vision with "Coming Soon" for unreleased modules

### 2.2 Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Backend API / database | Phase 1 is anonymous-only. No accounts, no server-side persistence |
| User accounts / progress saving | Deferred to Phase 3+. IndexedDB covers Phase 1 local persistence |
| XR hand tracking | P2. Basic XR session entry (REQ-014) is P1 — same scene graph, minimal overhead via @react-three/xr v6 |
| Real-time multiplayer | Out of scope entirely. Single-user experience |
| Server-side physics computation | All physics runs client-side in WASM. No physics server |
| Mobile native app | Web-only. Native app decision is data-driven post-launch |
| AI tutor / chatbot | Not in any phase scope. Separate discovery needed |
| B2B teacher dashboard | Phase 3+. Phase 1 collects teacher interest via email |

---

## 3. High-Level Architecture

### 3.1 Architecture Style

**System Architecture: Static Web Application (Phase 1) → Client-Server (Phase 3+)**

Phase 1 is a **client-heavy static web application**. All simulation logic, physics computation, and rendering happen in the browser. The "backend" is a CDN/edge layer that serves static assets and handles SSR for the landing page. No API server, no database.

This is the correct choice because:
- **No server-side state in Phase 1** — anonymous users, IndexedDB for local persistence
- **Physics must run client-side** — real-time 60fps simulation cannot tolerate network roundtrips
- **Minimal operational overhead** — one solo developer, zero backend ops
- **Cost-efficient** — Cloudflare Workers free tier covers substantial traffic

Phase 3+ introduces a backend (Rust/Axum on Cloud Run + Neon) for accounts, progress, and teacher features. The architecture cleanly separates the client 3D experience from the server data layer, so this addition doesn't require restructuring.

**Code Structure: Web 2D + 3D / WebXR pattern** from client-structure.md. Two parallel layers:
- `site/` — 2D pages (landing, module browser, "Coming Soon" cards) using FSD
- `experience/` — 3D simulation layer (R3F, Three.js, physics)
- `engine/` — Framework-agnostic simulation logic (Koota ECS, Rapier physics)
- `shared/` — Cross-layer state and utilities

Core rule: `site/` and `experience/` NEVER import each other. Data flows through `shared/stores/`.

**Frontend Framework: TanStack Start**

TanStack Start over Next.js because:
- Post-auth SEO is irrelevant (simulations are the product, not content pages)
- Landing page SEO is handled via Vinxi SSR on Cloudflare Workers
- Type-safe routing with TanStack Router reduces runtime errors
- Lighter runtime, no React Server Component complexity
- Better fit for highly interactive, client-driven 3D applications
- Cloudflare Workers deployment = global edge delivery

### 3.2 Container Diagram

```
                          ┌─────────────────────┐
                          │   User (Browser)     │
                          └──────────┬───────────┘
                                     │ HTTPS
                          ┌──────────▼───────────┐
                          │   Cloudflare CDN      │
                          │   (Global Edge Cache) │
                          └──────────┬───────────┘
                           cache miss│
                 ┌───────────────────┼───────────────────┐
                 ▼                   ▼                   ▼
       ┌─────────────────┐ ┌────────────────┐  ┌────────────────┐
       │  CF Workers      │ │  CF R2          │  │  CF Pages       │
       │  (Edge SSR)      │ │  (3D Assets)    │  │  (Preview)      │
       │  Vinxi/Nitro     │ │  glTF, KTX2,    │  │                 │
       │                  │ │  WASM, textures  │  │                 │
       └─────────────────┘ └────────────────┘  └────────────────┘

       ┌────────────── Browser Runtime ──────────────────────┐
       │                                                      │
       │  ┌──────────┐    ┌────────────────┐                 │
       │  │ Site (2D)│    │Experience (3D) │                 │
       │  │ Landing, │    │ R3F Canvas,    │                 │
       │  │ Module   │    │ Scene, HUD     │                 │
       │  │ Browser  │    │                │                 │
       │  └────┬─────┘    └───────┬────────┘                 │
       │       │                  │                           │
       │       │    ┌─────────────▼──────────┐               │
       │       │    │  Engine (WASM)         │               │
       │       │    │  Koota ECS + Rapier    │               │
       │       │    └────────────────────────┘               │
       │       │                                              │
       │       ▼                                              │
       │  ┌──────────┐  ┌──────────┐                         │
       │  │ PostHog  │  │ Sentry   │  (fire-and-forget)      │
       │  └──────────┘  └──────────┘                         │
       └──────────────────────────────────────────────────────┘
```

| Container | Technology | Responsibility |
|-----------|-----------|----------------|
| Cloudflare Workers | Vinxi/Nitro on Workers | SSR for landing page, serves HTML shell, edge-optimized |
| Cloudflare R2 | Object storage | glTF models, KTX2 textures, WASM binaries, chunked JS |
| CDN | Cloudflare global CDN | Asset caching, compression, HTTP/3 |
| Site Layer | TanStack Start + React | 2D pages: landing, module browser, i18n switcher, theme toggle |
| Experience Layer | React Three Fiber + Drei + Three.js + @react-three/xr | 3D Canvas, scene graph, HUD controls, camera management, XR session |
| Engine | Koota ECS + Rapier WASM | Physics simulation, ECS state, systems (gravity, collision, waves) |

### 3.3 Component Overview

**Site Layer Components** (`site/`):

| Component | Responsibility |
|-----------|---------------|
| Landing View | Hero with embedded 3D preview, 4-track overview, CTA |
| Module Browser | Grid of 24 modules (3 active, rest "Coming Soon"), track filtering |
| Module Detail Shell | Learning objectives, concept summary, formula reveal (P1) |
| Teacher CTA | Email collection for B2B interest |
| i18n Feature | Language switcher (ko/en), translation loading |
| Theme Feature | Light/dark mode toggle for 2D UI |

**Experience Layer Components** (`experience/`):

| Component | Responsibility |
|-----------|---------------|
| Canvas | WebGPU detection → WebGL fallback, adaptive quality. XR session → force WebGL2 |
| Scene Objects | Reusable 3D primitives (sphere, block, track spline, wave mesh) |
| Environments | Per-module lighting, skybox, post-processing |
| Cameras | OrbitControls (non-XR) via `<IfInSessionMode>`. XR mode: headset-controlled camera |
| XR | `<XR>` wrapper + `createXRStore()`. Enter VR/AR buttons. `<IfInSessionMode>` for conditional controls |
| HUD Controls | Sliders, toggles, buttons (HTML overlay in non-XR; adaptation needed for XR P2) |
| HUD Overlays | Vector arrows, energy bars, probability distributions |
| HUD Panels | Grouped controls per simulation context |

**Engine Components** (`engine/`):

| Component | Responsibility |
|-----------|---------------|
| ECS World | Koota world instance, entity lifecycle |
| ECS Components | Position, Velocity, Force, Mass, Friction, WaveSource, Energy |
| ECS Systems | GravitySystem, CollisionSystem, WaveSystem, EnergySystem, VectorOverlaySystem |
| Physics Adapter | Rapier WASM ↔ ECS sync (bodies, colliders, forces) |
| Prefabs | Pre-configured entity bundles (projectile, roller-coaster-car, wave-source) |

**Domain Components** (`domains/`):

| Domain | Module | Key Simulation |
|--------|--------|---------------|
| `motion-and-force` | 1-1 | Object throw/push, friction, gravity environments, free fall |
| `energy-and-work` | 1-2 | Roller coaster track editor, energy bars, collision, pendulum |
| `waves` | 1-3 | Wave generator, ripple tank interference, wave superposition, resonance |

Each domain composes experience + engine components and owns its specific HUD layout, parameter config, and ECS systems.

---

## 4. Data Architecture

### 4.1 Data Flow

**Primary Flow: Student interacts with simulation**

```
User Input (slider drag)
  → Zustand store update (domains/[name]/stores/)
    → ECS component write (engine/ecs/components/)
      → ECS system tick (engine/ecs/systems/)
        → Rapier physics step (engine/adapters/rapier/)
          → ECS component update (position, velocity)
            → R3F re-render (experience/scene/)
              → HUD overlay update (experience/hud/)
                → Visual output (60fps)
```

Latency budget: slider input → visual update < 100ms (REQ-010). Since everything is in-process (no network), this is achievable with a single requestAnimationFrame cycle (~16ms at 60fps).

**Secondary Flow: Analytics event tracking**

```
User Interaction (module enter, slider change, toggle flip)
  → PostHog client SDK capture()
    → Batched HTTP POST to PostHog Cloud
      → Dashboard (module visits, interaction rate, session duration)
```

Analytics is fire-and-forget. No user-facing latency impact. Events are batched and sent asynchronously.

**Tertiary Flow: Module content loading**

```
Route change (TanStack Router)
  → Lazy import domain component (code split per domain)
    → Parallel fetch: glTF models + WASM binary + curriculum JSON
      → Rapier world init + ECS prefab spawn
        → First simulation frame render
```

Target: route change → interactive simulation < 3s on fast connection, < 8s on 3G.

### 4.2 Storage Strategy

| Store | Technology | Data | Consistency | Retention |
|-------|-----------|------|-------------|-----------|
| Simulation State | Koota ECS (in-memory) | Position, velocity, forces, wave amplitudes | Frame-consistent (60fps tick) | Session only — reset on module exit |
| UI State | Zustand (in-memory) | Theme, language, active module, HUD visibility | Immediate | Session only |
| Local Persistence | IndexedDB (via idb-keyval) | Visited modules, language preference, simulation snapshots (e.g. roller coaster tracks), re-visit recommendations | Eventual (write-on-change) | Permanent (survives browser restart). Phase 3+: sync to server on account creation |
| 3D Assets | Cloudflare R2 + CDN | glTF, KTX2, WASM binaries | Immutable (content-hashed) | Permanent (versioned) |
| Curriculum Content | Static JSON (bundled) | Module titles, descriptions, formulas, i18n strings | Immutable (deployed) | Permanent (deployed) |
| User Preferences [Phase 3+] | Neon PostgreSQL | Account, progress, saved states | Strong | Permanent |

### 4.3 Caching Strategy

| Asset Type | Cache Location | TTL | Invalidation |
|-----------|---------------|-----|-------------|
| JS/CSS bundles | Cloudflare CDN | 1 year | Content-hashed filenames (immutable) |
| glTF models | Cloudflare CDN + browser | 1 year | Content-hashed filenames |
| KTX2 textures | Cloudflare CDN + browser | 1 year | Content-hashed filenames |
| WASM binaries | Cloudflare CDN + browser | 1 year | Content-hashed filenames |
| HTML shell | Cloudflare CDN | 5 min | Revalidate on deploy |
| Curriculum JSON | Bundled in JS | N/A | Deployed with code |

All static assets use content-hashed filenames for immutable caching. HTML is the only asset that revalidates — short TTL ensures users get new deployments quickly.

---

## 5. Infrastructure & Deployment

### 5.1 Compute Platform

**Cloudflare Workers + R2 + CDN**

| Factor | Cloudflare | Alternative (Vercel) | Decision |
|--------|-----------|---------------------|----------|
| Edge SSR | Workers (V8 isolates) | Vercel Edge Functions | Workers — native TanStack Start support via Vinxi/Nitro, predictable pricing |
| Asset storage | R2 (no egress fees) | Vercel Blob | R2 — critical for large 3D assets (glTF, textures, WASM). Zero egress cost |
| CDN | Global by default | Global by default | Tie |
| Pricing | Generous free tier, pay-per-request | Free tier, then per-seat/bandwidth | Cloudflare — 3D asset egress would be expensive on Vercel |
| Cold start | ~0ms (V8 isolates) | ~0ms (edge) | Tie |

Cloudflare wins on cost for 3D asset delivery. R2's zero-egress pricing is decisive — serving glTF models, textures, and WASM binaries to 10K+ monthly visitors would accumulate significant egress costs on other platforms.

### 5.2 Deployment Strategy

```
PR merge to main
  → GitHub Actions CI
    → Lint + typecheck + unit tests
    → Build (Vinxi/TanStack Start)
    → Deploy to Cloudflare Workers (wrangler deploy)
    → Invalidate CDN cache for HTML
    → Sentry release + source maps upload
```

**Rollback:** Cloudflare Workers supports instant rollback to previous deployment via `wrangler rollback`. No blue-green needed — Workers deployments are atomic.

**Asset pipeline (3D):**
```
Source assets (glTF, textures)
  → Optimize (gltf-transform, KTX2 compression)
    → Content-hash filenames
      → Upload to R2 (wrangler r2 put)
        → Reference in build manifest
```

3D assets are processed and uploaded separately from code deployments. This allows code deploys to be fast (<30s) while asset updates happen independently.

### 5.3 Environment Topology

| Environment | Purpose | URL |
|-------------|---------|-----|
| Local dev | Development | `localhost:3000` |
| Preview | PR preview | `pr-{N}.physplay.pages.dev` |
| Production | Public | `physplay.app` (TBD) |

No staging environment in Phase 1. Preview deployments per PR provide sufficient testing. Staging is added when B2B teacher features require it (Phase 3+).

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization [Phase 3+]

Phase 1 has no authentication. All access is anonymous.

Phase 3+ plan:
- Google OAuth2 + self-issued JWT
- Access token (15min) in memory, refresh token (30 days) in httpOnly cookie
- RBAC: `student` (default), `teacher`, `admin`
- Enforced in Rust/Axum middleware

### 6.2 Observability

**Analytics (PostHog)**

구체적인 이벤트 정의, 프로퍼티, 퍼널은 product analytics 작업에서 결정한다. 여기서는 아키텍처 수준의 결정만 기술한다.

- **SDK**: PostHog JS SDK (client-side). 서버사이드 추적 없음 (Phase 1에 백엔드 없음)
- **통합 방식**: `shared/lib/analytics.ts`에 래퍼 함수 작성. `site/`와 `experience/` 모두 이 래퍼를 통해 이벤트 전송
- **초기화**: 앱 루트 provider에서 PostHog 초기화. 환경변수로 project key 주입
- **PII 정책**: IP 저장 안함, 익명 device ID만 사용, 개인정보 수집 없음
- **성능 영향**: 이벤트는 비동기 배치 전송. 시뮬레이션 렌더 루프에서 직접 호출하지 않음 (Zustand store 변경 시 구독으로 디바운스)
- **Phase 1 성공 기준** (PRD에서 정의): UV, 세션 체류시간, 인터랙션율, 모듈간 이동률, 교사 이메일 수집 — 이 메트릭을 측정할 수 있는 이벤트 설계가 필요
- **이벤트 설계 소유**: product analytics 에서 tracking plan 작성 후 구현

**Error Tracking (Sentry)**

- Source maps uploaded on deploy
- Custom tags: `module_id`, `renderer_type`, `device_tier`
- Performance monitoring: Web Vitals (LCP, FID, CLS) + custom `simulation_load_time` span
- Alert: crash rate >1% per module triggers investigation

**Logging**

Phase 1: browser console only (development). No server-side logging needed.
Phase 3+: structured logging in Rust/Axum backend via `tracing` crate → Cloud Logging.

### 6.3 Error Handling & Resilience

| Failure | User Impact | Handling |
|---------|------------|---------|
| WebGPU unavailable | Degraded visuals | Auto-fallback to WebGL. Detection at canvas init |
| WASM load failure | Simulation broken | Retry 2x → error boundary with "Refresh" CTA |
| glTF/texture load failure | Missing 3D objects | Placeholder geometry + retry. Error reported to Sentry |
| Physics divergence (NaN) | Frozen/glitched sim | ECS system detects NaN → auto-reset simulation state |
| Browser tab backgrounded | Sim runs wild | `visibilitychange` listener → pause physics tick |
| Low FPS detected (<30fps) | Choppy experience | Auto-reduce quality tier (shadow off → particle count down → resolution scale) |

No retry loops or exponential backoff — this is a client-side app. Failures are either instant fallbacks (WebGPU → WebGL) or user-actionable (refresh button).

### 6.4 Security

| Concern | Approach |
|---------|----------|
| Data in transit | HTTPS enforced (Cloudflare always-on SSL) |
| Data at rest | No server-side user data in Phase 1 |
| XSS | React's default escaping. CSP headers via Cloudflare |
| Dependency supply chain | `bun.lockb` pinned. Dependabot alerts. Minimal dependency count |
| WASM integrity | WASM binary content-hashed. Served from same origin |
| Analytics PII | PostHog configured with no PII collection. No IP storage. Anonymous device IDs only |
| Content Security Policy | `script-src 'self'`; `worker-src 'self' blob:`; `connect-src 'self' *.posthog.com *.sentry.io` |

### 6.5 Performance & Scalability

**Performance Budget:**

| Metric | Target | Measurement |
|--------|--------|------------|
| LCP (landing) | <2.5s | Lighthouse / PostHog |
| FID | <100ms | Web Vitals |
| CLS | <0.1 | Web Vitals |
| Simulation FPS | 60fps (mid-range) | Custom `performance_sample` event |
| Input → visual feedback | <100ms | requestAnimationFrame measurement |
| JS bundle (initial) | <200KB gzipped | Build output |
| WASM (Rapier) | <500KB gzipped | Build output |
| glTF per module | <2MB compressed | Asset pipeline |

**Adaptive Quality System:**

```
GPU tier detection (at startup via detect-gpu or probe render)
  → Tier 3 (high): Full shadows, high particle count, full resolution
  → Tier 2 (mid): Reduced shadows, moderate particles, 0.75x resolution
  → Tier 1 (low): No shadows, minimal particles, 0.5x resolution
  → Tier 0 (fallback): WebGL, no post-processing, minimal effects

Runtime monitoring:
  If FPS < 45 for 2 seconds → drop one quality tier
  If FPS > 58 for 5 seconds → attempt one tier upgrade
```

**Scalability**: Phase 1 is a static site. Cloudflare CDN handles traffic scaling automatically. No backend bottlenecks. 10K UV/month is well within free tier.

---

## 7. Integration Points

| Service | Provides | Protocol | Failure Mode | Fallback |
|---------|----------|----------|-------------|----------|
| Cloudflare Workers | SSR + routing | HTTP/3 | 502/timeout | CDN serves stale HTML (stale-while-revalidate) |
| Cloudflare R2 | 3D asset storage | HTTP/3 | 404/timeout | CDN cached version; placeholder geometry |
| PostHog Cloud | Analytics | HTTPS (batched POST) | Network failure | Events silently dropped. No user impact |
| Sentry Cloud | Error tracking | HTTPS | Network failure | Errors silently dropped. No user impact |
| PDB API [Phase 3] | Protein structures | HTTPS REST | 503/timeout | Cached structures; "Unavailable" message |
| NASA Open API [Phase 4] | Astronomical data | HTTPS REST | 503/timeout | Cached data; static fallback images |

Phase 1 has zero critical external dependencies beyond Cloudflare itself. PostHog and Sentry are fire-and-forget — their failure doesn't affect user experience.

---

## 8. Migration & Rollout

Not applicable — greenfield project. No existing system to migrate from.

**Phase 1 Rollout Plan:**

| Week | Milestone | Gate |
|------|-----------|------|
| 1-3 | Discovery: tech spike (projectile sim 60fps on mobile) | FPS confirmed on mid-range Android |
| 4-6 | Module 1-1 Alpha (Motion & Force) | All REQ-100~104 functional |
| 7-9 | Module 1-2 Alpha (Energy & Work) | Roller coaster editor + energy bars |
| 10-11 | Module 1-3 Alpha (Waves) | Ripple tank interference pattern |
| 12 | Landing page + i18n (ko, en) | Lighthouse LCP <2.5s |
| 13 | Beta (20 testers: teachers + students) | Feedback collected |
| 14 | GA Launch | Analytics pipeline verified |

---

## 9. Risks & Open Questions

### 9.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Rapier WASM physics too heavy for mobile main thread | High | Medium | Profile during Discovery spike. If >8ms/frame, move Rapier to Web Worker with SharedArrayBuffer |
| WebGPU adoption lower than assumed on Korean mobile devices | Medium | Medium | WebGL fallback must be near-feature-parity. Test Samsung Internet browser specifically |
| Roller coaster track editor UX too complex for touch devices | High | Medium | Offer preset tracks + modification mode alongside free-draw |
| TanStack Start on Cloudflare Workers hits edge cases | Medium | Low | Vinxi/Nitro on Workers is production-tested. Fallback: static prerender landing, SPA for rest |
| glTF asset size causes slow module loading on 3G | Medium | Medium | Aggressive compression (Draco, KTX2). Progressive loading: low-res first, high-res stream in |
| Koota ECS + R3F integration overhead in React reconciliation | Medium | Low | Bridge via `useQuery`/`useWorld` hooks. ECS runs outside React; React reads via refs |

### 9.2 Open Questions

| # | Question | Options | Needed to Decide | Owner |
|---|---------|---------|------------------|-------|
| Q1 | Should Rapier physics run on the main thread or in a Web Worker? | A) Main thread (simpler, sufficient for Phase 1 complexity) B) Web Worker + SharedArrayBuffer (better FPS headroom) | Discovery spike profiling results on mid-range mobile | Engineer |
| Q2 | Should HUD controls be HTML overlays or in-canvas mesh UI? | A) HTML overlay (easier a11y, responsive, familiar) B) Mesh UI (consistent 3D aesthetic, XR-ready) C) Hybrid (HTML Phase 1, mesh for XR Phase 2+) | A11y requirements, XR timeline decision | Engineer |
| Q3 | How to handle the roller coaster track editor on mobile? | A) Touch-draw with smoothing B) Preset tracks + control point editing C) Both (presets default, draw optional) | User testing in Discovery phase | PM + Engineer |
| Q4 | CDN region: is Cloudflare's default global adequate for Korean users, or do we need KR-specific optimization? | A) Default (Cloudflare Seoul POP exists) B) R2 bucket in APAC | Latency testing from Korean networks | Engineer |

---

## 10. Architecture Decision Records (ADRs)

### ADR-1: Frontend Framework — TanStack Start on Cloudflare Workers

- **Status**: Accepted
- **Context**: PhysPlay is an interactive 3D web application. Landing page needs basic SEO; simulation pages are post-interaction and SEO-irrelevant. The app is heavily client-driven with complex 3D rendering.
- **Decision**: TanStack Start with Vinxi on Cloudflare Workers.
- **Alternatives Considered**:
  - **Next.js on Vercel** → rejected because: RSC complexity adds overhead for a 3D app that's inherently client-side. Vercel's egress pricing is expensive for large 3D assets (glTF, textures, WASM). TanStack Start's lighter runtime is better suited for R3F-heavy applications.
  - **Vite SPA + static hosting** → rejected because: No SSR for landing page SEO. No file-based routing. More manual setup for code splitting.
- **Consequences**: (+) Lighter runtime, type-safe routing, edge delivery, zero egress for assets via R2. (-) Smaller ecosystem than Next.js, fewer community examples for 3D apps.

### ADR-2: No Backend API in Phase 1

- **Status**: Accepted
- **Context**: Phase 1 serves anonymous users with no accounts, no server-side persistence, and no teacher features. All simulation runs client-side.
- **Decision**: Pure client-side application. No backend API server. Analytics via PostHog SaaS. Curriculum data bundled in the frontend build.
- **Alternatives Considered**:
  - **Lightweight API from day 1** (Rust/Axum on Cloud Run) → rejected because: Zero server-side state to manage. Adds operational overhead and cost for no Phase 1 benefit. Backend infrastructure is added in Phase 3 when accounts and progress tracking require it.
  - **Supabase BaaS** → rejected because: No data to store server-side. Supabase adds a dependency and cost without Phase 1 value.
- **Consequences**: (+) Zero backend ops, zero server cost, faster development. (-) Must architect the client so Phase 3 backend addition is additive, not restructuring. Shared stores design (cross-layer via `shared/stores/`) enables this.

### ADR-3: System Architecture — Static Web App (Phase 1), Request-Response (Phase 3+)

- **Status**: Accepted
- **Context**: Phase 1 has no server-side state. Phase 3+ introduces accounts, progress, and teacher features requiring a backend.
- **Decision**: Phase 1: static web app on Cloudflare. Phase 3+: add Rust/Axum API on GCP Cloud Run + Neon PostgreSQL. Request-response pattern (not event-driven) — the data flows are simple CRUD (save progress, load progress, manage classes).
- **Alternatives Considered**:
  - **Event-driven from Phase 3+** → rejected because: No fan-out, no multi-consumer patterns, no async pipelines. User saves progress, user loads progress — synchronous request-response fits perfectly.
  - **Modular monolith** → considered for Phase 3+ but rejected because: Single API service with hexagonal architecture covers the scope. Module boundaries are useful but a full monolith framework is premature.
- **Consequences**: (+) Simplest possible architecture for each phase. (-) If Phase 4+ introduces analytics pipelines or real-time collaboration, may need to add event-driven patterns later. Acceptable — solve Phase 1 now.

### ADR-4: 3D Rendering — Three.js WebGPU-first with React Three Fiber

- **Status**: Accepted
- **Context**: The core product is interactive 3D physics simulation in the browser. Need 60fps on mid-range devices, WebGPU for modern performance, WebGL fallback for compatibility.
- **Decision**: Three.js (WebGPU-first via `WebGPURenderer`) + React Three Fiber + Drei helpers. TSL (Three Shading Language) for cross-renderer shader compatibility.
- **Alternatives Considered**:
  - **Babylon.js** → rejected because: Heavier bundle, less React-native integration. R3F's declarative model fits the Zustand + ECS architecture better.
  - **PlayCanvas** → rejected because: Editor-centric workflow doesn't fit code-first development. Smaller ecosystem.
  - **Raw Three.js (no R3F)** → rejected because: Imperative scene management is error-prone at scale. R3F's declarative components provide better composition for 24 modules.
- **Consequences**: (+) Mature ecosystem, large community, WebGPU-first with WebGL fallback, declarative scene graph via R3F. (-) R3F adds a React reconciliation layer — must be careful with performance in the render loop (use refs, avoid re-renders in the frame loop).

### ADR-5: Physics Engine — Rapier WASM

- **Status**: Accepted
- **Context**: Physics simulation is the core interaction. Need rigid body dynamics, collision detection, and forces at 60fps.
- **Decision**: Rapier physics engine compiled to WASM. Integrated via `engine/adapters/rapier/` — syncs physics state into Koota ECS.
- **Alternatives Considered**:
  - **Cannon.js / cannon-es** → rejected because: Pure JS, slower than WASM for complex scenes. No deterministic stepping.
  - **@react-three/rapier** → considered for Phase 1 but graduated to imperative Rapier in `engine/` because: Component-based R3F wrapper limits physics customization. Imperative API in engine layer allows ECS integration without React coupling. R3F wrapper can still be used for simple static colliders.
  - **Custom physics (Euler integration)** → rejected because: Reinventing collision detection and constraint solving is high-risk. Rapier is battle-tested.
- **Consequences**: (+) Fast, deterministic physics. WASM runs near-native speed. Well-maintained by Dimforge. (-) WASM binary adds ~300-500KB to initial load. Mitigated by lazy loading per module.

### ADR-6: State Management — Koota ECS + Zustand

- **Status**: Accepted
- **Context**: Two types of state: simulation state (positions, velocities, forces — 60fps updates) and UI state (theme, language, HUD visibility — user-driven updates). These have fundamentally different update patterns.
- **Decision**: Koota ECS for simulation state. Zustand for UI/meta state. Clear boundary: ECS owns frame-loop data, Zustand owns everything else.
- **Alternatives Considered**:
  - **Zustand for everything** → rejected because: Zustand triggers React re-renders. Simulation state changes 60 times/second — this would kill performance. ECS operates outside React's reconciliation.
  - **Jotai** → rejected because: Same re-render problem for high-frequency simulation state. Atomic model doesn't fit the ECS query pattern.
  - **Custom typed arrays** → rejected because: Reinventing ECS. Koota provides the data-oriented architecture with queries and systems out of the box.
- **Consequences**: (+) Clean separation of concerns. ECS handles hot-path simulation without React overhead. Zustand handles UI reactivity naturally. (-) Two state systems to learn. Bridge layer (`experience/scene/hooks/ecs/`) needed to read ECS from React.

### ADR-7: Hosting Platform — Cloudflare Workers + R2

- **Status**: Accepted
- **Context**: Serving a 3D web application with large assets (glTF, textures, WASM) to a global audience starting with Korean students.
- **Decision**: Cloudflare Workers for compute, R2 for asset storage, Cloudflare CDN for caching.
- **Alternatives Considered**:
  - **Vercel** → rejected because: Egress costs for 3D assets. A single module's assets (glTF + textures + WASM) can be 2-5MB. At 10K UV/month with repeat visits, egress costs accumulate fast. R2 has zero egress fees.
  - **GCP Cloud Run + Cloud CDN** → rejected for Phase 1 because: Overprovisioned for a static site. Cloud Run is reserved for Phase 3+ backend API.
  - **Netlify** → rejected because: Same egress concern as Vercel. Less control over Workers-level edge logic.
- **Consequences**: (+) Zero egress cost for 3D assets, global edge delivery, generous free tier, near-zero cold starts. (-) Workers V8 runtime limits (no Node.js APIs). Vinxi/Nitro handles this, but must validate TanStack Start compatibility.

### ADR-8: Database Platform — Neon PostgreSQL [Phase 3+]

- **Status**: Proposed
- **Context**: Phase 3+ introduces user accounts, learning progress, and teacher features requiring server-side persistence.
- **Decision**: Neon PostgreSQL (us-east-1). Scale-to-zero pricing for cost management. Serverless branching for development workflow.
- **Alternatives Considered**:
  - **Supabase** (ap-northeast-2 Korea) → considered because: Korean users are primary. But rejected because: Neon's scale-to-zero is critical for solopreneur cost management. Cloudflare CDN already provides Korean edge caching. API latency to us-east-1 is acceptable for non-real-time operations (save progress, load progress).
  - **D1 (Cloudflare)** → rejected because: SQLite-based, limited query capabilities, not suitable for relational data (accounts, progress, class management).
- **Consequences**: (+) Scale-to-zero, serverless branching, managed PostgreSQL. (-) us-east-1 adds ~150ms latency for Korean users on API calls. Acceptable because: Phase 3+ API calls are infrequent (save on module complete, load on login) and non-blocking to the simulation experience.

### ADR-9: Backend Language — Rust (Axum) [Phase 3+]

- **Status**: Proposed
- **Context**: Phase 3+ backend serves accounts, progress, and teacher features. No Python-only library dependencies.
- **Decision**: Rust with Axum framework on GCP Cloud Run. Hexagonal architecture.
- **Alternatives Considered**:
  - **Python (FastAPI)** → rejected because: No Python-only library requirements. Rust provides lower memory usage (<30MB vs 100MB+), faster cold starts, and lower Cloud Run costs — critical for solopreneur economics.
  - **Node.js/Bun** → rejected because: TypeScript backend possible but Rust's type system provides stronger correctness guarantees for the data layer.
- **Consequences**: (+) Sub-ms response times, 10-30MB memory, compile-time safety, lower cloud costs. (-) Slower development velocity than Python/Node for simple CRUD. Acceptable because Phase 3+ backend is simple — hexagonal boilerplate is AI-generated.

### ADR-10: i18n Strategy — Static JSON Bundles

- **Status**: Accepted
- **Context**: Phase 1 supports ko and en. Full product targets 6 languages.
- **Decision**: Static JSON translation files bundled with the frontend build. Namespace-per-module for code splitting.
- **Alternatives Considered**:
  - **Translation management service (Crowdin/Lokalise)** → rejected for Phase 1 because: 2 languages managed by one developer. Overhead of a TMS isn't justified until 4+ languages (Phase 3+).
  - **Server-side i18n (ICU messages from API)** → rejected because: No backend in Phase 1. Even in Phase 3+, UI translations should be static bundles, not API calls.
- **Consequences**: (+) Zero-latency translations, offline-capable, no external dependency. (-) Adding languages requires a code deploy. Acceptable for Phase 1-2. Phase 3+ may adopt Crowdin when 4+ languages justify it.

---

## 11. Phase Implementation Summary

### Phase 1 — Classical Physics Core (Current)

**Components:**
- `site/`: Landing page, module browser (3 active + 21 "Coming Soon"), i18n (ko/en), theme toggle, teacher email CTA
- `experience/`: Canvas (WebGPU/WebGL), XR wrapper (@react-three/xr), scene objects, environments, cameras (OrbitControls non-XR / headset XR), HUD (sliders, toggles, overlays)
- `engine/`: Koota ECS (core components + systems), Rapier WASM adapter, physics world
- `domains/`: motion-and-force, energy-and-work, waves
- `shared/`: Zustand stores (theme, language, active module), types, constants

**Infrastructure:**
- Cloudflare Workers + R2 + CDN
- PostHog Cloud (analytics)
- Sentry Cloud (errors)
- GitHub Actions (CI/CD)

**Key ADRs:** ADR-1 (TanStack Start), ADR-2 (no backend), ADR-3 (static web app), ADR-4 (Three.js/R3F), ADR-5 (Rapier), ADR-6 (ECS + Zustand), ADR-7 (Cloudflare), ADR-10 (i18n)

### Phase 2 — Classical Physics Complete

**New Components:**
- `domains/`: sound-and-light, electricity-and-magnetism, electromagnetic-waves
- New engine systems: CircuitSystem, LensRaySystem, EMWaveSystem
- New HUD controls: circuit builder drag-and-drop, lens parameter controls
- XR hand tracking (REQ-015) — @react-three/xr `<XRHand>` components

**New Infrastructure:**
- +ja language bundle

**New Integrations:** None

### Phase 3 — Chemistry + Accounts + B2B [Phase 3+]

**New Components:**
- `domains/`: 6 chemistry modules (atoms-and-bonds through central-dogma)
- Backend API: Rust/Axum on GCP Cloud Run (hexagonal architecture)
- `site/features/auth/`: Google OAuth2 login
- `site/views/dashboard/`: Learning progress view
- `site/views/teacher-dashboard/`: Class management, student progress

**New Infrastructure:**
- Neon PostgreSQL (us-east-1)
- GCP Cloud Run (us-east4)
- +es language bundle
- Crowdin TMS (if 4+ languages)

**New Integrations:**
- PubChem API (molecule data)
- PDB API (protein structures)
- Google OAuth2

### Phase 4 — Space Science [Phase 3+]

**New Components:**
- `domains/`: 6 space modules (earth-and-moon through cosmology)
- New engine: N-body gravity system, scale-transition system

**New Integrations:**
- NASA Open API (planetary data, imagery)
- +pt-BR language bundle

### Phase 5 — Quantum Mechanics [Phase 3+]

**New Components:**
- `domains/`: 6 quantum modules (limits-of-classical through quantum-tech)
- New engine: ProbabilitySystem, WavefunctionRenderer, BlochSphereSystem
- Potential Rust → WASM compute worker for wavefunction calculation

**New Infrastructure:**
- +id language bundle
- Potential Web Worker for heavy quantum simulation compute

**New Integrations:** None (pure simulation)
