# Folder Structure

## Web (Nextjs)
```
app/                 # Next.js App Router — routing only (thin re-exports)
├── layout.tsx       # Root layout (imports @/app/providers, @/app/globals.css)
├── page.tsx         # import { DashboardPage } from '@/views/dashboard'
└── some-page/
    └── page.tsx     # Thin: import page from @/views/, render it

src/                 # All FSD layers
├── app/             # FSD app-layer: providers, global styles (NO routing files)
│   ├── globals.css
│   └── providers/
├── views/           # FSD pages layer (named "views" to avoid Next.js pages/ conflict)
│   └── dashboard/   # Compose widgets into full page layouts
│       └── ui/
├── widgets/         # Sections/blocks (Header, Sidebar, StatsCards, RecentRuns)
├── features/        # User interactions (auth, send-comment, add-to-cart)
│   └── auth/
│       ├── ui/
│       ├── model/
│       ├── api/
│       └── actions/   # Server Actions
├── entities/        # Business entities (user, product, order)
│   └── user/
│       ├── ui/
│       ├── model/
│       └── api/
└── shared/          # Reusable infrastructure
    ├── ui/          # Design system
    ├── lib/         # Utilities, helpers
    ├── api/         # API client
    └── config/      # Environment, constants
```

- Root `app/` is for Next.js routing only. `src/` holds all FSD layers.
- `src/app/` is the FSD app-layer (providers, global styles), NOT routing.

## Mobile (Expo)
```
app/                 # Expo Router (file-based routing)
├── _layout.tsx      # Root layout
├── index.tsx        # Home (/)
└── some-page/
    └── index.tsx    # /some-page (routing + page composition)
src/
├── app/             # App-wide settings, providers, global styles
│   └── providers/
├── widgets/         # Large composite blocks (Header, Sidebar, Feed)
├── features/        # User interactions (auth, send-comment, add-to-cart)
│   └── auth/
│       ├── ui/
│       ├── model/
│       └── api/
├── entities/        # Business entities (user, product, order)
│   └── user/
│       ├── ui/
│       ├── model/
│       └── api/
└── shared/          # Reusable infrastructure
    ├── ui/          # Design system
    ├── lib/         # Utilities, helpers
    ├── api/         # API client
    └── config/      # Environment, constants
```


## Web 2D + 3D / WebXR

Applications where 2D web pages and 3D/XR content coexist. Same structure applies regardless of 2D/3D weight.

**Stack**: Three.js (WebGPU-first) · React Three Fiber · Drei · TSL shaders · @react-three/xr · Koota ECS · Rapier WASM · Zustand · Rust WASM · glTF

- `site/` — 2D layer (FSD). Pure web pages, design system.
- `experience/` — 3D layer. R3F scene, WebXR, HUD.
- `engine/` — Framework-agnostic pure logic. Koota ECS, Rapier physics, TSL shaders. Never imports React.
- `domains/` — Independent area composition. Composes experience + engine; may reference shared/.
- `shared/` — Global shared. Referenced by all layers.

**Core rule: `site/` and `experience/` NEVER import each other.** Cross-layer data flows through `shared/` stores.

### Base Structure
```
src/
├── app/                          # App shell & routing (framework-specific)
│   └── ...                       #   Rule: imports downward only
│
├── site/                         # 2D layer (FSD)
│   ├── pages/                    #   Page compositions (landing, dashboard)
│   ├── widgets/                  #   Composite blocks (Header, Footer, Card)
│   ├── features/                 #   User interactions (auth, theme-toggle, i18n-switcher)
│   ├── entities/                 #   Business entities (user, product, order)
│   └── shared/
│       ├── ui/                   #   Design system
│       ├── api/                  #   HTTP client
│       ├── hooks/                #   DOM hooks
│       └── lib/                  #   2D utilities
│
├── experience/                   # 3D layer (R3F + Three.js)
│   ├── canvas/                   #   WebGPURenderer → WebGLRenderer fallback
│   ├── scene/
│   │   ├── objects/              #   Reusable R3F components
│   │   ├── environments/         #   Lighting, skybox, post-processing
│   │   ├── cameras/              #   OrbitControls, etc. (Drei)
│   │   ├── materials/            #   TSL Node Materials (WebGPU/WebGL branches)
│   │   ├── hooks/                #   Scene-level hooks (add ecs/, physics/ with engine)
│   │   └── helpers/
│   ├── hud/                      #   Shared HUD components
│   │   ├── controls/             #   Slider, Toggle, Button (mesh + HTML adaptive)
│   │   ├── overlays/             #   Labels, indicators
│   │   └── panels/               #   Grouped control panels
│   ├── xr/                       #   @react-three/xr
│   │   ├── session.tsx
│   │   ├── controllers/
│   │   ├── interactions/
│   │   └── spaces/
│   └── shared/
│       ├── hooks/                #   R3F hooks
│       ├── utils/                #   Three.js utilities
│       └── assets/               #   glTF, KTX2 textures, audio
│
└── shared/                       # Global shared (referenced by all layers)
    ├── types/                    #   Cross-layer types (User, Config, etc.)
    ├── stores/                   #   Cross-layer state (auth, prefs, etc.)
    │   └── ...                   #     Rule: never imports site/, experience/, engine/, domains/
    ├── constants/
    ├── hooks/
    └── utils/
```

Each folder exposes public API via index.ts barrel only. No cross-import within same layer.

Store scoping guide:

| Store location | Scope | Example |
|----------------|-------|---------|
| `shared/stores/` | Cross-layer state used by both site/ and experience/ | auth, user, language, theme |
| `domains/[name]/stores/` | Domain-scoped state for a specific domain | editor mode, tool selection, active params |
| `site/shared/` | 2D-only state | form drafts, table sort/filter |
| `experience/shared/` | 3D-only state | camera mode, render quality |

### Extensions (add only when triggered)
```
+ engine/                         ← Simulation/game logic. Never imports React
│   ├── ecs/                      #   Koota — frame loop state (position, velocity, AI)
│   │   ├── components/           #     Pure data definitions
│   │   ├── systems/              #     Pure logic (stateless)
│   │   ├── queries/
│   │   ├── prefabs/
│   │   └── world.ts
│   ├── ports/
│   ├── adapters/
│   │   └── rapier/               #   Rapier WASM → ECS sync (no React)
│   ├── physics/                  ←   Imperative Rapier (graduate from @react-three/rapier)
│   └── shaders/                  #   TSL / GLSL
│
+ experience/scene/hooks/ecs/     ← Add with engine/. Koota → R3F read-only bridge
+ experience/scene/hooks/physics/ ← Add with engine/. Rapier state reads for R3F
│
+ domains/                        ← 2+ independent areas with custom logic/state
│   └── [domain-name]/
│       ├── index.tsx             #   Domain entry point (composes scene + engine + hud)
│       ├── use-cases/            #   Domain-specific business logic
│       ├── systems/              #   Domain-specific ECS systems
│       ├── stores/               #   Domain-scoped state
│       ├── hud/                  #   Domain-specific HUD elements
│       └── config.ts             #   Domain parameters, constraints
│
+ networking/                     ← Multiplayer or real-time sync
+ content/                        ← External data injected into 3D scene
│
+ workers/
│   └── compute-worker.ts        #   Imports bindings from wasm-out/
│
+ crates/                         ← Rust source (project root, Cargo workspace)
│   └── compute/src/
+ wasm-out/                       ← Build artifacts only (project root, gitignored)
```

### Dependency Direction
```
Top-level:

  ┌──────────────────────────────────────────────────────────┐
  │  app/              ← routing shell                        │
  │    ↓                                                     │
  │  domains/          ← composes experience + engine        │
  │    ↓                                                     │
  │  experience/  ←bridge→  engine/                          │
  │    ↓                      ↓                              │
  │  shared/           ← referenced by all above             │
  │                                                          │
  │  app/ → site/ → shared/  (independent 2D branch)         │
  │  site/ ✕ experience/     (NEVER import each other)       │
  └──────────────────────────────────────────────────────────┘

Within experience/:

  scene/            ← R3F components
    ↓
  hud/              ← mesh + HTML HUD components
    ↓
  experience/shared/

Cross-links (→ means "depends on"):

  experience/xr/    → experience/scene/
  networking/       → engine/
  workers/          → engine/

Bridges (engine ↔ experience):

  experience/scene/hooks/ecs/   → engine/ecs/    React reads ECS (not the reverse)
  engine/adapters/              → engine/ecs/    External systems sync into ECS
  domains/                      → engine/        Domain composes engine systems
  domains/                      → experience/    Domain composes scene + hud

Cross-layer data (site ↔ experience):

  shared/stores/ carries cross-layer state (auth, user, prefs).
  site/ and experience/ both read from shared/stores/ independently.
  No direct import between site/ and experience/.

State ownership:

  Zustand   shared/stores/              Cross-layer (auth, user, language, theme)
  Zustand   domains/[name]/stores/      Domain-scoped (editor mode, tool selection)
  Zustand   site/shared/                2D-only (form drafts, table state)
  Zustand   experience/shared/          3D-only (camera mode, render quality)
  Koota     engine/ecs/                 Simulation (position, velocity, forces)
```

### When to Add Each Layer

| Layer | Trigger | Omit when |
|-------|---------|-----------|
| `site/` | Has 2D web pages | Pure 3D/XR app (fullscreen canvas) |
| `experience/` | Has 3D content | Pure 2D app |
| `experience/xr/` | WebXR support needed | No XR |
| `experience/hud/` | In-scene control UI needed | No HUD (e.g., background 3D) |
| `engine/` | ECS, physics, or custom shaders needed | Simple 3D rendering only |
| `domains/` | Independent areas with custom logic/state | Single scene or config-driven variants |
| `networking/` | Multiplayer or real-time sync | Single user |
| `workers/` | CPU-bound computation offload | Main thread sufficient |
| `crates/` | Rust → WASM custom computation | JS/TS sufficient |

---

## Web 3D / WebXR

3D/XR-only applications. No or minimal 2D web pages.

### Base Structure
```
src/
├── app/                        # App shell & routing (framework-specific, internals vary)
│   └── ...                     #   Rule: imports downward only. Nothing below imports app/.
│
├── scene/                      # 3D world (R3F components)
│   ├── canvas.tsx              # WebGPU detect → WebGL fallback
│   ├── objects/
│   ├── environments/           # Lighting, skybox, post-processing
│   ├── cameras/
│   ├── materials/
│   │   ├── create-material.ts  # Factory: (type, renderer) → Material
│   │   └── *.ts                # Each file handles its own WebGPU/WebGL branch
│   ├── hooks/                  # Scene-level hooks (add ecs/, physics/ with engine)
│   └── helpers/
│
├── hud/                        # Shared HUD components
│   ├── controls/               # Slider, Toggle, Button (mesh + HTML adaptive)
│   ├── overlays/               # Labels, indicators
│   └── panels/                 # Grouped control panels
│
├── xr/                         # WebXR (omit if not needed)
│   ├── session.tsx
│   ├── controllers/
│   ├── interactions/
│   └── spaces/
│
└── shared/                     # Referenced by all layers above
    ├── ui/                     # Thin DOM UI (settings modal, loading screen)
    ├── stores/                 # Zustand — UI/meta (theme, modal, prefs)
    ├── types/
    ├── constants/
    ├── hooks/
    ├── utils/
    └── assets/                 # glTF, textures, audio
```

Each folder exposes public API via index.ts barrel only. No cross-import within same layer.

### Extensions (add only when triggered)
```
+ engine/                       ← Never imports React
│   ├── ecs/                    # Koota — frame loop state (position, velocity, AI)
│   │   ├── components/         #   Pure data definitions
│   │   ├── systems/            #   Pure logic (stateless)
│   │   ├── queries/
│   │   ├── prefabs/
│   │   └── world.ts
│   ├── ports/
│   ├── adapters/
│   │   └── rapier/             # Physics → ECS sync (no React)
│   ├── physics/                ← Imperative Rapier WASM (graduate from @react-three/rapier)
│   └── shaders/                # TSL / GLSL
│
+ scene/hooks/ecs/              ← Add with engine/. Koota → R3F read-only bridge
+ scene/hooks/physics/          ← Add with engine/. Rapier state reads for R3F
│
+ domains/                      ← 2+ independent scenes/modes
│   └── [domain-name]/
│       ├── index.tsx           #   Domain entry point
│       ├── use-cases/          #   Domain-specific business logic
│       ├── systems/            #   Domain-specific ECS systems
│       ├── stores/             #   Domain-scoped state
│       ├── hud/                #   Domain-specific HUD elements
│       └── config.ts           #   Domain parameters, constraints
│
+ networking/                   ← Multiplayer or real-time sync
+ content/                      ← External data injected into 3D scene
│
+ workers/
│   └── compute-worker.ts      # Imports bindings from wasm-out/
│
+ crates/                       ← Rust source (project root, Cargo workspace)
│   └── compute/src/
+ wasm-out/                     ← Build artifacts only (project root, gitignored)
```

### Dependency Direction
```
Top-level:

  ┌─────────────────────────────────────────────────────┐
  │  app/              ← framework-specific shell        │
  │    ↓                                                │
  │  domains/          ← composes scene + engine        │
  │    ↓                                                │
  │  scene/  ←bridge→  engine/                          │
  │    ↓                 ↓                              │
  │  hud/                                               │
  │    ↓                                                │
  │  shared/           ← referenced by all above        │
  └─────────────────────────────────────────────────────┘

Cross-links (→ means "depends on"):

  xr/           → scene/
  networking/   → engine/
  workers/      → engine/

Bridges:

  scene/hooks/ecs/     → engine/ecs/      React reads ECS (not the reverse)
  engine/adapters/     → engine/ecs/      Physics syncs into ECS (no React)
  domains/stores/      → scene/hooks/     Domain Zustand reads engine via bridge

State ownership:

  Zustand  shared/stores/         UI/meta (theme, modal, prefs)
  Zustand  domains/[name]/stores/ Domain-scoped (editor mode, tool selection)
  Koota    engine/ecs/            Simulation (position, velocity, AI)
```
