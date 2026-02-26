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


## Web 3D / WebXR

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
│   ├── hooks/
│   │   ├── ecs/                # ECS → R3F read-only bridge (useQuery, useEntity)
│   │   └── physics/            # Physics state reads for R3F
│   └── helpers/
│
├── xr/                         # WebXR (omit if not needed)
│   ├── session.tsx
│   ├── controllers/
│   ├── interactions/
│   └── spaces/
│
├── ui/                         # 2D interface
│   ├── design-system/
│   ├── components/
│   ├── hud/                    # Overlay on 3D
│   ├── panels/
│   └── layout/
│
└── shared/                     # Referenced by all layers above
    ├── stores/                 # Zustand — UI/meta only. Never imports engine/ or domains/
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
+ domains/                      ← 2+ independent scenes/modes
│   └── [domain-name]/
│       ├── use-cases/
│       ├── stores/             # Domain-scoped Zustand (reads engine via scene/hooks/)
│       ├── Scene.tsx
│       ├── config.ts
│       └── ui/
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
┌─────────────────────────────────────────────────────┐
│  app/              ← framework-specific shell        │
│    ↓                                                │
│  domains/          ← composes everything below      │
│    ↓                                                │
│  engine/           ← pure logic, never imports React│
│    ↓                                                │
│  scene/            ← R3F components                 │
│    ↓                                                │
│  ui/               ← 2D overlay                     │
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
  Zustand  domains/[name]/stores/ Domain UI (editor mode, tool selection)
  Koota    engine/ecs/            Simulation (position, velocity, AI)
```
