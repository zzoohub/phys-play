# PhysPlay — UX Design

**Status:** Draft
**Date:** 2026-03-04
**PRD Reference:** [prd.md](./prd.md) | [product-brief.md](./product-brief.md) | [design-doc.md](./design-doc.md)

---

## 1. First Principles

### User's ONE Goal (JTBD)

> "I want to predict what will happen, see if I was right, and understand why — in a way that feels like a game, not homework."

Every screen, every interaction, every animation must serve this goal. If an element doesn't help the user predict, play, or discover — remove it.

### Minimum Needed

1. A way to see the challenge and make a prediction (Predict)
2. A way to run the experiment with my hands (Play)
3. A way to compare my prediction with reality and understand why (Discover)
4. A way to move to the next challenge (Next)

### What Can Be Removed

- Account creation (Phase 1: local storage)
- Leaderboards, points, badges (core motivation comes from cognitive conflict, not external rewards)
- Tutorial screens (the first challenge IS the tutorial)
- Settings pages beyond essentials (language, theme, sound)
- Any 2D page between the user and the 3D experience

---

## 2. Information Architecture

### Site Map

```
PhysPlay
├── / (Landing → auto-redirect to onboarding on first visit) [Phase 1]
│
├── /hub (Research Lab Hub — 2D) [Phase 1]
│   ├── Space cards (unlocked / locked silhouettes)
│   ├── Progress overview
│   └── Settings access
│
├── /lab/:spaceId (Lab — fullscreen 3D + HUD) [Phase 1]
│   ├── Station selector (HUD)
│   ├── Challenge flow (HUD: Predict → Play → Discover → Next)
│   └── Lab settings (HUD: sound, graphics quality)
│
├── /settings (Settings — 2D) [Phase 1]
│   ├── Language (en / ko)
│   ├── Theme (light / dark / system)
│   ├── Sound (master, BGM, SFX)
│   └── Graphics quality
│
├── /progress (Progress — 2D) [Phase 3+]
│   ├── Station completion stats
│   ├── Concept mastery map
│   └── Prediction accuracy history
│
├── /editor (Challenge Editor — 2D + 3D) [Phase 3+]
│   ├── Engine selection
│   ├── Variable configuration
│   ├── Prediction question builder
│   └── Preview & publish
│
├── /community (Community — 2D) [Phase 3+]
│   ├── Browse shared challenges
│   ├── Browse shared stations/spaces [Phase 4+]
│   └── User profiles [Phase 3+]
│
└── /account (Account — 2D) [Phase 3+]
    ├── Sign up / Sign in
    ├── Profile
    └── Data sync
```

### Navigation Depth

| Destination | Taps from Hub |
|------------|---------------|
| Start a challenge | 2 (Hub → Space card → auto-enters first available challenge) |
| Continue where I left off | 1 (Hub → "Continue" card at top) |
| Switch station (inside lab) | 1 (HUD station selector) |
| Settings | 1 (Hub → settings icon) |

### Layer Model

```
┌─────────────────────────────────────────────────┐
│  2D Layer (site/)                                │
│  Landing, Hub, Settings, Progress, Account       │
│  ─────────────────────────────────────────────   │
│  "Outside the lab" — clean, educational, light   │
├─────────────────────────────────────────────────┤
│  Portal Transition                               │
│  2D → 3D boundary animation                     │
│  Psychological gate into immersion               │
├─────────────────────────────────────────────────┤
│  3D Layer (experience/)                          │
│  Lab viewport + HUD overlay                      │
│  ─────────────────────────────────────────────   │
│  "Inside the lab" — immersive, game-like, dark   │
└─────────────────────────────────────────────────┘
```

**Hard rule:** `site/` and `experience/` never import each other. State crosses the boundary through `shared/stores/` only.

---

## 3. User Flows

### 3.1 First Visit (Onboarding)

**Goal:** First core-loop completion within 30 seconds. Zero friction.

```
URL opened
    │
    ▼
[Splash: PhysPlay logo, 1.5s max]
    │
    ▼
[Portal Transition → Mechanics Lab 3D]
    │
    ▼
[Onboarding Challenge: Simplified "Monkey & Hunter"]
    │
    ├── HUD: coach mark — "Aim at the target" (arrow pointing to target)
    │
    ▼
PREDICT
    │  HUD shows target + question
    │  User taps where to aim (simplified placement prediction)
    │  Coach mark: "Tap where you'd aim to hit it"
    │
    ▼
PLAY
    │  Target starts falling on launch
    │  User sees result — hit or miss
    │  Coach mark: "Drag to aim, release to fire" (first time only)
    │
    ▼
DISCOVER
    │  Overlay: prediction vs. result comparison
    │  Brief concept card (Level 1 depth)
    │  "Both the ball AND the target fall at the same rate!"
    │
    ▼
[Celebration effect + "Welcome to your lab!" transition]
    │
    ▼
[Portal Transition → Hub (2D)]
    │  Hub reveals: Mechanics Lab (unlocked) + 3 locked silhouettes
    │  "Continue" button prominent at top
    │
    ▼
[User taps "Continue" → back to Mechanics Lab]
```

**Key UX decisions:**
- No language selection screen. Detect browser language (en/ko), show toggle in hub settings.
- No "welcome" modal. The challenge IS the welcome.
- Coach marks appear only on first visit, fade after first interaction, never reappear.
- If user fails the onboarding challenge, they still see Discover — failure is a feature, not an error state.

### 3.2 Returning Visit

```
URL opened
    │
    ▼
[Hub (2D) — home screen]
    │
    ├── "Continue" card: last active station + challenge progress
    │   (e.g., "Projectile Station — Challenge 3/10")
    │
    ├── Space cards: Mechanics Lab (active), 3 locked silhouettes
    │
    └── Quick stats: total challenges completed, accuracy trend
    │
    ▼
[User taps "Continue" or a space card]
    │
    ▼
[Portal Transition → Lab 3D]
    │
    ▼
[Resumes at last station/challenge]
```

### 3.3 In-Lab Core Loop

```
┌──────────────────────────────────────────────────┐
│                   LAB (3D + HUD)                  │
│                                                    │
│   ┌─────────────────────────────┐                 │
│   │ HUD: Station Selector       │  ← top bar     │
│   │ [Projectile] [Energy] [Wave]│                 │
│   └─────────────────────────────┘                 │
│                                                    │
│   PREDICT PHASE                                    │
│   ┌─────────────────────────────────────────┐     │
│   │ Question panel (left or top)             │     │
│   │ "이 공을 달에서 던지면 어디에 떨어질까?"    │     │
│   │                                          │     │
│   │ 3D viewport: interactive prediction area  │     │
│   │ (draw trajectory / place marker / choose) │     │
│   │                                          │     │
│   │ [Submit Prediction]     [Skip]           │     │
│   └─────────────────────────────────────────┘     │
│                                                    │
│   PLAY PHASE                                       │
│   ┌─────────────────────────────────────────┐     │
│   │ 3D viewport: God Hand manipulation       │     │
│   │ (throw, build, place, pull, shake)       │     │
│   │                                          │     │
│   │ HUD: minimal — simulation controls only  │     │
│   │ [Replay] [Slow-mo] [Camera angles]       │     │
│   └─────────────────────────────────────────┘     │
│                                                    │
│   DISCOVER PHASE                                   │
│   ┌─────────────────────────────────────────┐     │
│   │ Comparison overlay:                      │     │
│   │   My prediction (dashed) vs result (solid)│    │
│   │                                          │     │
│   │ Result: ✓ Correct / ✗ Incorrect          │     │
│   │                                          │     │
│   │ Concept card:                            │     │
│   │   Level 1: intuitive explanation         │     │
│   │   [Show more ▾] → Level 2, Level 3      │     │
│   │                                          │     │
│   │ [Try Again] [Next Challenge →]           │     │
│   └─────────────────────────────────────────┘     │
│                                                    │
└──────────────────────────────────────────────────┘
```

### 3.4 Station/Space Navigation

```
Inside Lab (3D):
    │
    ├── HUD top bar: station tabs
    │   Tap a tab → camera sweeps to new station area
    │   Current station highlighted
    │
    ├── HUD: challenge progress indicator
    │   Dots or progress bar showing position in sequence
    │
    └── Exit Lab:
        HUD corner: [← Hub] button
        → Portal Transition (reverse) → Hub (2D)

Hub (2D):
    │
    ├── Space cards with visual state:
    │   - Unlocked: colored card with station count, progress ring
    │   - Locked: silhouette with lock icon + unlock condition hint
    │   - Active: "Continue" badge
    │
    └── Tap space card → Portal Transition → Lab (3D)
```

---

## 4. Screen Inventory

### 4.1 Hub Screen (2D) [Phase 1]

**Purpose:** Home base. Navigate to labs, view progress, access settings.

**Layout (PC — desktop first):**
```
┌──────────────────────────────────────────────────────────┐
│  PhysPlay                                [🌐 en] [⚙️]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ▶ Continue: Projectile Station — Challenge 4/10  │   │
│  │    [Resume →]                                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────┐ │
│  │ 🔬         │ │ 🧪         │ │ 🔭         │ │ ⚛️   │ │
│  │ Mechanics  │ │ Molecular  │ │ Space      │ │Quantum│ │
│  │ Lab        │ │ Lab        │ │ Observatory│ │ Lab   │ │
│  │            │ │            │ │            │ │       │ │
│  │ ████░░ 60% │ │ 🔒         │ │ 🔒         │ │ 🔒    │ │
│  │            │ │ Phase 3    │ │ Phase 4    │ │Phase 5│ │
│  └────────────┘ └────────────┘ └────────────┘ └──────┘ │
│                                                          │
│  Quick Stats: 15 challenges completed · 67% accuracy     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Layout (Mobile):**
```
┌─────────────────────┐
│ PhysPlay    [🌐] [⚙️]│
├─────────────────────┤
│                     │
│ ▶ Continue          │
│   Projectile — 4/10 │
│   [Resume →]        │
│                     │
│ ┌─────────────────┐ │
│ │ 🔬 Mechanics Lab │ │
│ │ ████░░ 60%      │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 🧪 Molecular 🔒  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 🔭 Space 🔒      │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ⚛️ Quantum 🔒    │ │
│ └─────────────────┘ │
│                     │
│ 15 completed · 67%  │
└─────────────────────┘
```

**States:**
- **First visit (post-onboarding):** Only Mechanics Lab unlocked. Other 3 show as silhouettes with lock icon. "Continue" card points to the onboarding station.
- **Returning:** "Continue" card shows last active station/challenge. Progress rings fill over time.
- **Space unlocked:** Unlock animation plays once (card flips from silhouette to colored). Never re-plays.
- **Offline:** All data local. No change to UI. (Phase 1 has no server dependency.)

### 4.2 Portal Transition [Phase 1]

**Purpose:** Psychological gate between 2D hub and 3D lab. Makes entry feel like "stepping into" the lab.

**Sequence (1.2–1.8s total):**
1. Hub card zooms to fill screen (0.3s ease-out)
2. 2D dissolves into a dimensional shift effect — particles, light beams, depth blur (0.6s)
3. Lab 3D environment fades in with camera pulling back to reveal the station (0.5s)
4. HUD elements animate in after the scene settles (0.2s stagger)

**Reverse (Lab → Hub):**
1. HUD fades out (0.2s)
2. 3D collapses into the portal center (0.6s)
3. Hub fades in with card animation (0.3s)

**Reduced motion:** Instant crossfade (0.3s) between hub and lab. No particle effects.

### 4.3 Lab Screen — Predict Phase (3D + HUD) [Phase 1]

**Purpose:** Present the challenge question. Get the user's prediction.

**HUD Layout (PC):**
```
┌──────────────────────────────────────────────────────┐
│ [← Hub]  [Projectile ▼] [Energy] [Wave]    [⚙️] [?] │  ← Top bar
│                                                      │
│                                                      │
│  ┌───────────────────────┐                           │
│  │ PREDICT                │                           │
│  │                        │         3D VIEWPORT       │
│  │ "이 공을 달에서 던지면   │         (fullscreen)      │
│  │  어디에 떨어질까?"      │                           │
│  │                        │                           │
│  │ Draw your prediction   │                           │
│  │ on the 3D scene →      │                           │
│  │                        │                           │
│  │                        │                           │
│  │ [Submit]    [Skip]     │                           │
│  └───────────────────────┘                           │
│                                                      │
│  ● ● ● ○ ○ ○ ○ ○ ○ ○   Challenge 3/10               │  ← Bottom bar
└──────────────────────────────────────────────────────┘
```

**HUD Layout (Mobile):**
```
┌─────────────────────┐
│ [←] [Proj▼]    [⚙️]  │
├─────────────────────┤
│                     │
│    3D VIEWPORT      │
│    (70% height)     │
│                     │
│                     │
│                     │
├─────────────────────┤
│ PREDICT             │
│ "이 공을 달에서       │
│  던지면 어디에?"      │
│                     │
│ [Submit]    [Skip]  │
│                     │
│ ● ● ● ○ ○ ○  3/10  │
└─────────────────────┘
```

**Prediction type variations:**

| Type | PC Interaction | Mobile Interaction | HUD Element |
|------|---------------|-------------------|-------------|
| **Trajectory** | Mouse draw on 3D viewport (freehand curve) | Finger draw on 3D viewport | Draw hint animation, clear/redo buttons |
| **Binary** | Click one of 2–3 option cards in HUD | Tap one of 2–3 option cards | Option cards with text + small illustration |
| **Pattern** | Click one of 3–4 pattern thumbnails | Tap one of 3–4 pattern thumbnails | Animated 3D preview thumbnails in HUD |
| **Placement** | Click/drag marker in 3D space | Tap to place marker in 3D | Ghost marker + "place here" cursor |

### 4.4 Lab Screen — Play Phase (3D + HUD) [Phase 1]

**Purpose:** User executes the experiment via God Hand. HUD is minimal — don't obstruct the simulation.

**HUD Layout (PC):**
```
┌──────────────────────────────────────────────────────┐
│                                              [⚙️]    │  ← Minimal top bar
│                                                      │
│                                                      │
│                    3D VIEWPORT                        │
│                   (fullscreen)                        │
│                                                      │
│              God Hand manipulation area               │
│                                                      │
│                                                      │
│                                                      │
│                                                      │
│                                                      │
│      [▶ Replay]  [🐌 Slow-mo]  [📷 Camera]           │  ← Bottom controls
└──────────────────────────────────────────────────────┘
```

**God Hand cursor states (PC):**

| State | Cursor | Visual Feedback |
|-------|--------|----------------|
| Default (over 3D canvas) | Crosshair | — |
| Hovering interactable object | Open hand | Object highlight glow |
| Grabbing/dragging | Closed hand | Object follows + shadow updates |
| Drawing (trajectory prediction) | Pencil | Trail renders in real-time |
| Over HUD element | Default pointer | Standard button hover states |

**Simulation controls:**
- **Replay:** Re-run the simulation from the same initial conditions. Available after first run.
- **Slow-motion:** 0.25x / 0.5x / 1x toggle. Default 1x.
- **Camera angle:** Preset views per challenge (e.g., "Side", "Top", "Follow projectile"). Free orbit always available.

### 4.5 Lab Screen — Discover Phase (3D + HUD) [Phase 1]

**Purpose:** Compare prediction with result. Deliver concept explanation at the right depth.

**HUD Layout (PC):**
```
┌──────────────────────────────────────────────────────┐
│ [← Hub]  [Projectile ▼] [Energy] [Wave]    [⚙️]     │
│                                                      │
│                                                      │
│                   3D VIEWPORT                        │
│              (prediction overlay ON)                  │
│                                                      │
│  ┌───────────────────────┐   Prediction: ─ ─ ─ ─    │
│  │ DISCOVER               │   Result:    ─────────   │
│  │                        │                           │
│  │ ✗ Not quite!           │                           │
│  │                        │                           │
│  │ "공도 떨어지고 원숭이도  │                           │
│  │  떨어진다 — 같은 속도로!"│                           │
│  │                        │                           │
│  │ [Show more ▾]          │                           │
│  │                        │                           │
│  │ [Try Again]            │                           │
│  │ [Next Challenge →]     │                           │
│  └───────────────────────┘                           │
│                                                      │
│  ● ● ● ○ ○ ○ ○ ○ ○ ○   Challenge 3/10               │
└──────────────────────────────────────────────────────┘
```

**Concept depth progressive disclosure:**

```
Level 1 (always visible):
  "공도 떨어지고 원숭이도 떨어진다 — 같은 속도로!"
  Intuitive one-liner. Visual language, no jargon.

  [Show more ▾]

Level 2 (tap to expand):
  "수평 운동과 수직 운동은 독립적이다. 중력은 발사체와
   타깃에 동일하게 작용하므로, 수직 낙하분이 정확히 상쇄된다"
  Conceptual explanation. Natural language, variable relationships.

  [Show formula ▾]

Level 3 (tap to expand):
  y₁(t) = y₀ - ½gt²
  y₂(t) = v₀t·sinθ - ½gt²
  -½gt² term is identical → cancels out
  Formal mathematical representation.
```

**Result states:**

| State | Visual | Text | Action |
|-------|--------|------|--------|
| Correct | Green glow + particle burst | Encouraging (varies: "Great prediction!", "Exactly right!") | [Next Challenge →] prominent |
| Incorrect | Gentle amber highlight | Curiosity-framing: "Not quite! Here's why..." | [Try Again] and [Next Challenge →] both available |
| Skipped prediction | Neutral | "Here's what happened — and why" | [Next Challenge →] |

### 4.6 Settings Screen (2D) [Phase 1]

**Purpose:** Essential preferences only.

**Sections:**
1. **Language:** en / ko toggle
2. **Theme:** Light / Dark / System
3. **Sound:** Master volume, BGM on/off, SFX on/off
4. **Graphics:** Quality preset (Low / Medium / High / Auto). "Auto" detects device capability.
5. **Data:** [Reset all progress] (with confirmation dialog)

---

## 5. HUD Design System

### 5.1 HUD Principles

1. **Minimal during Play.** The 3D viewport is the star. HUD elements are semi-transparent, edge-positioned, and auto-hide after idle.
2. **Informative during Predict/Discover.** These phases need text, options, and explanations — HUD panels expand to accommodate.
3. **Consistent position.** Question panel always left (PC) or bottom (mobile). Controls always bottom. Progress always bottom-right.
4. **Never block the center.** The center 60% of the viewport is sacred 3D space. HUD panels hug edges.
5. **Glass material.** Semi-transparent background (blur + 60–80% opacity) so the 3D scene shows through. Adapts to lab theme colors.

### 5.2 HUD Component Library

| Component | Position | Visibility | Content |
|-----------|----------|------------|---------|
| **Top Bar** | Top edge, full width | Always visible (compact in Play) | [← Hub] · Station tabs · [Settings] |
| **Question Panel** | Left edge (PC) / Bottom sheet (mobile) | Predict + Discover only | Challenge question, prediction input, concept explanation |
| **Progress Indicator** | Bottom-right | Always visible | Challenge dots (● ● ○ ○) or "3/10" |
| **Simulation Controls** | Bottom-center | Play phase only | Replay, Slow-mo, Camera presets |
| **Coach Mark** | Near relevant element | First-time only, per interaction type | Arrow + short text instruction |
| **Variable Display** | Top-right corner | Play phase, optional | Current physics values (g, v, m) with real-time updates |

### 5.3 HUD Transitions by Phase

```
PREDICT                      PLAY                        DISCOVER
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Top bar: full     │   │ Top bar: compact  │   │ Top bar: full     │
│                   │   │                   │   │                   │
│ Question panel:   │   │ (hidden)          │   │ Concept panel:    │
│ visible, expanded │──▶│                   │──▶│ visible, expanded │
│                   │   │ Sim controls:     │   │                   │
│ Progress: visible │   │ visible, bottom   │   │ Progress: visible │
│                   │   │                   │   │                   │
│ (Submit/Skip)     │   │ Progress: visible │   │ (Try Again/Next)  │
└──────────────────┘   └──────────────────┘   └──────────────────┘

Transition: 300ms ease. Panels slide in/out from edges.
```

### 5.4 HUD Opacity & Readability Rules

- **Background blur:** 12px gaussian blur on HUD panels
- **Panel opacity:** 70% dark in dark lab, 80% light in bright areas. Auto-adjusts per lab theme.
- **Text contrast:** Minimum 4.5:1 against the blurred background, regardless of what's behind it
- **Safety margin:** HUD panels maintain 16px padding from viewport edges (respects safe areas on mobile)
- **3D occlusion:** HUD panels never occlude more than 35% of the total viewport area

---

## 6. God Hand Interaction Design

### 6.1 Interaction Principles

1. **Physical, not parametric.** Users throw, grab, pull, place — they don't adjust sliders (except in settings).
2. **Continuous feedback.** While dragging/pulling, the object responds in real-time. Release commits the action.
3. **Forgiving.** Undo is always available. "Try Again" after every experiment.
4. **Skill curve.** Easy to start (tap to aim), depth to master (precise 3D trajectory drawing).

### 6.2 Input Mapping per Device

#### PC (Primary)

| God Hand Pattern | Mouse Input | Keyboard Modifier | Feedback |
|-----------------|-------------|-------------------|----------|
| **Throw/Launch** | Click + drag (direction + distance = angle + force) → release | Hold Shift for precision mode (slower drag-to-force ratio) | Arrow appears showing direction + force magnitude. Release triggers launch. |
| **Assemble/Place** | Click to pick up → drag to position → click to place | Snap to grid: hold Ctrl | Ghost preview at placement position. Snap feedback when aligned. |
| **Pull/Push** | Click + drag on handle | — | Spring/chain visual stretches. Force meter appears. |
| **Install/Remove** | Click to toggle, or drag to position | — | Highlight valid placement areas. Click again to remove. |
| **Draw (trajectory)** | Click + hold + drag to draw freehand | — | Colored trail renders in real-time. Release completes. |

**Camera controls (always available):**

| Action | Input | Notes |
|--------|-------|-------|
| Orbit | Right-click + drag | Rotate around scene center |
| Zoom | Scroll wheel | Toward/away from focus point |
| Pan | Middle-click + drag | Shift the view |
| Reset | Double-right-click or R key | Return to default camera for this challenge |

**Conflict resolution:** Left-click is reserved for God Hand interaction. Right-click for camera orbit. This separation prevents accidental camera moves during gameplay.

#### Mobile

| God Hand Pattern | Touch Input | Feedback |
|-----------------|-------------|----------|
| **Throw/Launch** | One-finger swipe on object (direction + speed = angle + force) | Arrow preview, haptic on release |
| **Assemble/Place** | Long-press to pick up → drag → release to place | Ghost preview, snap haptic |
| **Pull/Push** | Touch + drag on handle | Spring visual, haptic resistance |
| **Install/Remove** | Tap to toggle | Highlight valid areas |
| **Draw (trajectory)** | One-finger draw on viewport | Colored trail |

**Camera controls (mobile):**

| Action | Gesture | Notes |
|--------|---------|-------|
| Orbit | Two-finger drag | Rotate around scene center |
| Zoom | Two-finger pinch | In/out |
| Pan | Three-finger drag (or two-finger drag while zoomed) | Shift the view |
| Reset | Double-tap on empty space | Return to default camera |

**Conflict resolution:** One-finger gestures on interactive objects = God Hand. One-finger on empty 3D space = no action (prevents accidental orbit). Two-finger gestures = camera. This prevents the "I wanted to orbit but I threw the ball" problem.

#### XR (Phase 2+)

| God Hand Pattern | Hand Tracking Input | Feedback |
|-----------------|---------------------|----------|
| **Throw/Launch** | Grab (pinch) → arm motion → release | Object follows hand trajectory, audio whoosh |
| **Assemble/Place** | Grab → move to position → release | Snap feedback, spatial audio click |
| **Pull/Push** | Grab handle → pull/push | Resistance haptic, spring visual |
| **Install/Remove** | Grab → place or grab → remove | Spatial audio feedback |
| **Draw (trajectory)** | Index finger extended → draw in air | Light trail follows fingertip |

### 6.3 Prediction Input per Type

| Prediction Type | PC | Mobile | Visual Feedback |
|----------------|-----|--------|----------------|
| **Trajectory** | Mouse draw on 3D viewport. Click-hold-drag to draw freehand. Release to complete. | Finger draw on 3D viewport. Lift to complete. | Colored dashed line renders in real-time. "Clear" button to redraw. |
| **Binary** | Click option card in HUD panel | Tap option card | Selected card highlights. Others dim. |
| **Pattern** | Click pattern thumbnail (shows animated 3D preview on hover) | Tap pattern thumbnail | Selected pattern highlights with border. Preview plays inline. |
| **Placement** | Click in 3D space to place marker. Drag to reposition. | Tap in 3D space to place. Tap-hold-drag to reposition. | Ghost marker at cursor position. Placed marker pulses gently. |

---

## 7. Visual Design Language

### 7.1 Two-Tone System

| Layer | Tone | Characteristics |
|-------|------|-----------------|
| **2D (Hub, Settings)** | Clean & Airy | Rounded corners (12–16px). Generous whitespace. Sans-serif type. Soft shadows. Light/dark theme support. |
| **3D (Lab + HUD)** | Immersive Lab | Semi-transparent glass panels. Lab-theme-tinted borders. Monospace or semi-mono for data values. Glow accents. Dark-dominant (even in light theme). |

### 7.2 Color System

**2D Layer:**

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `bg-primary` | `#FFFFFF` | `#0F1117` | Page background |
| `bg-secondary` | `#F5F6F8` | `#1A1D27` | Card backgrounds |
| `text-primary` | `#1A1D27` | `#F5F6F8` | Headings, body text |
| `text-secondary` | `#6B7280` | `#9CA3AF` | Captions, metadata |
| `accent` | `#3B82F6` | `#60A5FA` | Buttons, links, active states |
| `success` | `#10B981` | `#34D399` | Correct predictions |
| `warning` | `#F59E0B` | `#FBBF24` | Incorrect predictions (curiosity, not failure) |
| `error` | `#EF4444` | `#F87171` | System errors only |

**3D HUD Layer:**

| Token | Value | Usage |
|-------|-------|-------|
| `hud-bg` | `rgba(15, 17, 23, 0.75)` + `backdrop-filter: blur(12px)` | Panel backgrounds |
| `hud-border` | Lab theme accent at 30% opacity | Panel borders |
| `hud-text` | `#F5F6F8` | All HUD text (always light, even in light theme) |
| `hud-accent` | Varies per lab theme | Interactive elements |
| `predict-color` | `#60A5FA` (blue) | Prediction overlays, draw trails |
| `result-color` | `#F59E0B` (amber) | Actual result overlays |
| `correct-color` | `#34D399` (green) | Correct match |

**Color-blind safety:** All state indicators use icon + text + color (never color alone). Prediction vs. result overlays use solid vs. dashed line style in addition to color difference.

### 7.3 Typography

| Context | Family | Size (PC) | Size (Mobile) | Weight |
|---------|--------|-----------|---------------|--------|
| Hub heading | System sans | 28px | 22px | 700 |
| Hub body | System sans | 16px | 14px | 400 |
| HUD heading | System sans | 20px | 16px | 600 |
| HUD body | System sans | 14px | 13px | 400 |
| HUD data value | Monospace | 16px | 14px | 500 |
| Concept L1 | System sans | 16px | 14px | 400 |
| Concept L3 (formula) | Monospace / KaTeX | 14px | 12px | 400 |
| Coach mark | System sans | 13px | 12px | 500 |

**i18n:** Korean text uses the same font stack. Line heights may differ (ko needs ~1.8 line-height vs. en ~1.6). All user-facing strings are externalized to i18n keys.

### 7.4 Spacing & Layout

- **Grid:** 8px base unit. All spacing is multiples of 8 (8, 16, 24, 32, 48, 64).
- **HUD panel padding:** 16px internal, 16px from viewport edge.
- **HUD panel max-width:** 360px (PC), 100% width (mobile bottom sheet).
- **Touch targets:** Minimum 44x44px (48x48px recommended) for all HUD buttons.
- **3D hit volumes:** Extended beyond visual object boundaries to cover 44x44px screen projection minimum.

---

## 8. Space Themes

Each lab space has a unique visual identity that makes it feel like a distinct game stage. Themes affect the 3D environment, HUD tint, and ambient sound.

### 8.1 Mechanics Lab (Phase 1)

| Element | Specification |
|---------|--------------|
| **Skybox** | Industrial workshop / clean lab. Warm overhead lighting. Neutral grey walls with blue accent strips. |
| **Lighting** | Warm white key light (5500K) + cool blue fill. Soft shadows. |
| **Color palette** | Steel grey base, electric blue accents, warm amber highlights |
| **Materials** | Brushed metal surfaces, concrete floor, glass panels. Semi-stylized (not photorealistic). |
| **Particles** | Subtle dust motes in light beams. Spark effects on collisions. |
| **HUD tint** | `hud-accent: #60A5FA` (electric blue) |
| **Ambient sound** | Low mechanical hum, occasional metallic tink, air conditioning |
| **BGM** | Upbeat, curious, electronic — medium tempo. Adaptive: calmer during Predict, energetic during Play. |
| **Entry transition** | Blue light streaks converging → workshop materializes from wireframe → solid |

### 8.2 Molecular Lab (Phase 3)

| Element | Specification |
|---------|--------------|
| **Skybox** | Microscopic inner-space. Dark background with floating luminous particles. Biological/chemical feel. |
| **Lighting** | Cool blue-green key light. Bioluminescent glow from objects. |
| **Color palette** | Deep teal base, neon green/cyan accents, purple molecule highlights |
| **Materials** | Translucent glass-like molecules, glow-in-dark bonds, soft orbitals |
| **Particles** | Floating molecular fragments, soft glowing dots |
| **HUD tint** | `hud-accent: #34D399` (emerald green) |
| **Ambient sound** | Soft bubbling, molecular vibration hum, crystalline tones |
| **BGM** | Ethereal, flowing, ambient — slower tempo. Science documentary feel. |
| **Entry transition** | Green cellular zoom-in effect → microscopic world unfolds |

### 8.3 Space Observatory (Phase 4)

| Element | Specification |
|---------|--------------|
| **Skybox** | Deep space starfield. Milky Way visible. Nebula in distance. |
| **Lighting** | Dim ambient + bright point lights from stars. High contrast. |
| **Color palette** | Deep navy/black base, starlight white, nebula purple/orange accents |
| **Materials** | Metallic spacecraft surfaces, rocky planetary textures, gas giant swirls |
| **Particles** | Star field parallax, comet trails, solar wind |
| **HUD tint** | `hud-accent: #A78BFA` (violet) |
| **Ambient sound** | Deep space drone, radio telescope static, distant pulsar rhythm |
| **BGM** | Vast, orchestral, slow-building — "Interstellar" feel. Sense of scale. |
| **Entry transition** | Telescope zoom-out → camera flies through star tunnel → observatory dome opens |

### 8.4 Quantum Lab (Phase 5)

| Element | Specification |
|---------|--------------|
| **Skybox** | Abstract probability cloud space. Non-euclidean hints. Shifting geometry. |
| **Lighting** | Pulsing, uncertain. Light sources that seem to be in multiple places. |
| **Color palette** | Pure black base, electric pink/magenta accents, probability cloud blues, interference pattern greens |
| **Materials** | Wireframe/holographic objects, probability clouds (volumetric), glitch-effect surfaces |
| **Particles** | Quantum foam, wave function collapse sparks, entanglement connection lines |
| **HUD tint** | `hud-accent: #F472B6` (pink) |
| **Ambient sound** | Probabilistic tones (randomly generated harmonics), quantum chirps, geiger counter ticks |
| **BGM** | Glitchy, experimental electronic — unpredictable rhythm. Eerie beauty. |
| **Entry transition** | Schrödinger's box opens → reality fractures and reassembles → quantum lab manifests |

---

## 9. Motion & Transition Design

### 9.1 Core Motion Principles

1. **Purposeful.** Every animation communicates state change, spatial relationship, or feedback. No decorative motion.
2. **Fast but readable.** 200–400ms for UI transitions. 800–1500ms for spatial transitions (portal).
3. **Physics-based.** Spring easing for interactive elements (throw, bounce). Ease-out for UI panels. No linear easing.
4. **Interruptible.** All animations can be interrupted by user input. New input takes priority.
5. **Reduced-motion safe.** All animations degrade to instant state changes when `prefers-reduced-motion: reduce` is set.

### 9.2 Transition Catalog

| Transition | Duration | Easing | Reduced Motion |
|-----------|----------|--------|----------------|
| Hub → Lab (Portal) | 1.2–1.8s | Custom (see §4.2) | 0.3s crossfade |
| Lab → Hub (Portal reverse) | 0.8–1.2s | Ease-in | 0.3s crossfade |
| HUD panel slide in | 300ms | Ease-out | Instant appear |
| HUD panel slide out | 250ms | Ease-in | Instant disappear |
| Phase transition (Predict → Play) | 400ms | Ease-in-out | 200ms crossfade |
| Station switch (camera sweep) | 800ms | Ease-in-out | 400ms crossfade |
| Challenge result (correct) | 600ms | Spring (bounce) | 0.3s fade-in |
| Challenge result (incorrect) | 400ms | Ease-out | 0.3s fade-in |
| Space unlock | 2.0s | Custom (dramatic) | 0.5s crossfade |
| Object grab | 100ms | Linear | 100ms |
| Object release/throw | Physics-simulated | N/A (simulation) | Same (core mechanic) |

### 9.3 Celebration Effects

| Event | Effect | Duration | Audio |
|-------|--------|----------|-------|
| Correct prediction | Green particle burst from result + prediction overlap point | 1.0s | Bright chime |
| Station complete | Orbiting particle ring + completion badge animation | 2.0s | Achievement fanfare |
| Space unlock | Full-viewport particle cascade + new space card reveal | 3.0s | Epic reveal chord |
| First challenge complete (onboarding) | Gentle confetti + "Welcome to your lab!" text appear | 1.5s | Warm welcome tone |

All celebration effects skip under `prefers-reduced-motion`.

---

## 10. Responsive Strategy

### 10.1 Breakpoints

| Breakpoint | Target | Layout |
|-----------|--------|--------|
| ≥1280px | PC desktop (primary) | Side-by-side HUD panels + fullscreen 3D |
| 768–1279px | Tablet / small laptop | Compact HUD panels, slightly smaller question panel |
| <768px | Mobile | Bottom-sheet HUD, vertical stack, simplified controls |

### 10.2 Layout Adaptations

**Hub (2D):**
- **PC:** 4-column space card grid
- **Tablet:** 2-column grid
- **Mobile:** Single-column stack

**Lab (3D + HUD):**
- **PC:** Question panel as left sidebar (360px max). 3D viewport fills remaining width.
- **Tablet:** Question panel as collapsible left panel (280px). 3D viewport adapts.
- **Mobile:** Question panel as bottom sheet (40% height). 3D viewport fills top 60%. Bottom sheet is draggable (can expand to 70% or collapse to 20%).

### 10.3 Mobile-Specific Adaptations

1. **Landscape lock hint.** On mobile, show a one-time suggestion to rotate to landscape for a better 3D experience. Don't force it.
2. **Simplified HUD.** Fewer visible controls. Settings moved behind a gear icon menu.
3. **Bottom-sheet panels.** All HUD information panels use the bottom sheet pattern. Swipe down to minimize, swipe up to expand.
4. **Touch-friendly hit areas.** All interactive 3D objects have inflated hit volumes (minimum 44x44px screen projection).
5. **Gesture hints.** On first mobile visit, show brief gesture hints ("Swipe to throw", "Pinch to zoom") that fade after first use.
6. **Performance adaptation.** Auto-detect device capability. Reduce particle count, shadow quality, and post-processing on mobile.

---

## 11. Accessibility

### 11.1 2D Layer (Hub, Settings)

| Requirement | Implementation |
|------------|----------------|
| **Keyboard navigation** | Full tab order. Arrow keys for card grids. Enter to select. Escape to close modals. |
| **Screen reader** | All interactive elements have ARIA labels. Space cards announce name + unlock status + progress. |
| **Contrast** | 4.5:1 for text, 3:1 for UI components. Verified in both light and dark themes. |
| **Focus indicators** | Visible focus ring (2px solid accent color) on all focusable elements. |
| **Scalable text** | Supports browser zoom up to 200%. Layout reflows without horizontal scroll. |

### 11.2 3D Layer (Lab + HUD)

| Requirement | Implementation |
|------------|----------------|
| **Keyboard navigation** | Tab into HUD elements. Arrow keys for prediction options. Spacebar to confirm. |
| **3D keyboard controls** | Arrow keys for camera orbit. +/- for zoom. Enter to select 3D object. Tab cycles interactive objects. |
| **Screen reader** | HUD text content announced. Challenge question read aloud. Result + concept explanation read. 3D scene has descriptive ARIA label. |
| **High contrast HUD** | HUD text always on dark translucent background with ≥4.5:1 contrast. |
| **Color-blind safe** | Prediction (dashed blue) vs. result (solid amber) uses line style + color. Correct/incorrect uses icon + text + color. |
| **Reduced motion** | `prefers-reduced-motion`: all HUD animations instant, portal transitions crossfade, celebration effects disabled. Physics simulations still animate (core functionality). |
| **Sound alternatives** | All audio cues have visual equivalents (collision flash, result overlay glow, HUD notifications). |

### 11.3 What's NOT Accessible in Phase 1

- **Full 3D spatial navigation for screen reader users.** The 3D simulation viewport is inherently visual. We provide text descriptions of challenge setups and results, but the act of drawing a trajectory or placing a marker in 3D space requires vision.
- **Mitigation:** All concept learning (Discover phase) is fully accessible via text. The core educational value is available to all. The interactive prediction/play experience requires visual input.

---

## 12. Sound Design

### 12.1 Sound Hierarchy

| Layer | Default Volume | User Control |
|-------|---------------|--------------|
| **BGM** | 30% | On/off + volume slider |
| **Ambient** | 40% | Follows BGM toggle |
| **SFX (UI)** | 60% | On/off |
| **SFX (Simulation)** | 80% | On/off |

### 12.2 Key Sound Events

| Event | Sound Type | Spatialization |
|-------|-----------|---------------|
| HUD button click | UI click | Non-spatial (centered) |
| Prediction submitted | Confirmation tone | Non-spatial |
| Object grab | Subtle grasp | Spatial (at object position) |
| Object release/throw | Whoosh / impact | Spatial |
| Collision | Physics-appropriate impact | Spatial |
| Correct result | Bright chime + particle pop | Non-spatial |
| Incorrect result | Soft low tone (NOT a failure buzzer) | Non-spatial |
| Station complete | Achievement fanfare | Non-spatial |
| Portal transition | Dimensional shift whoosh | Non-spatial (surround) |

**Rule:** Incorrect results never play a "wrong buzzer" or error sound. The sound should convey curiosity ("hmm, interesting") not failure.

---

## 13. Edge Cases & Error States

### 13.1 Loading States

| Scenario | UI |
|----------|-----|
| **Initial page load (<3s)** | PhysPlay logo centered, subtle pulse animation. No progress bar for <3s. |
| **3D scene loading (3-10s)** | Poster image of the lab + progress bar. "Loading Mechanics Lab..." |
| **3D scene loading (>10s)** | Same as above + "This might take a moment on your connection" after 10s |
| **WebGPU fallback to WebGL** | Silent. Lower visual quality applied automatically. No message unless performance is impacted. |
| **Browser not supported** | 2D fallback page: "PhysPlay requires a modern browser. [Try Chrome / Safari / Firefox]" |

### 13.2 Simulation Edge Cases

| Scenario | Handling |
|----------|---------|
| **Physics glitch (object flies off)** | Auto-detect out-of-bounds → "Something went wrong with the simulation. [Restart challenge]" |
| **User does nothing for 30s (Play phase)** | Gentle HUD prompt: "Drag to throw the ball →" (coach mark style) |
| **User does nothing for 60s (any phase)** | No intervention. Respect the user's pace. They may be thinking. |
| **Challenge data fails to load** | "Couldn't load this challenge. [Try again] or [Skip to next]" |

### 13.3 Offline Behavior (Phase 1)

Phase 1 is fully client-side. No offline state is possible — all data is local. If the user has loaded the page, everything works.

**Exception:** If the browser cache is cleared, progress is lost. No recovery. (Phase 3+ adds account sync.)

---

## 14. XR Considerations (Architecture Prep for Phase 2+)

Phase 1 does not implement XR, but the UX architecture prepares for it.

### 14.1 God Hand Mental Model Consistency

The "I am the experimenter, the experiment is in front of me" frame works identically across:
- **PC:** Mouse/keyboard controls manipulate objects on a virtual tabletop
- **Mobile:** Touch gestures manipulate objects on a virtual tabletop
- **XR:** Hands directly manipulate objects on a (real/virtual) tabletop

No UX redesign needed when transitioning to XR — only input mapping changes.

### 14.2 HUD → Spatial Panel Mapping

| HUD Element (Web) | XR Equivalent |
|-------------------|---------------|
| Top bar | World-anchored panel above the experiment table |
| Question panel | World-anchored panel to the left of the table |
| Progress indicator | Wrist-anchored display or integrated into table surface |
| Simulation controls | Hand menu or table-edge controls |
| Concept card (Discover) | World-anchored panel, expandable with gaze+pinch |

### 14.3 Comfort Zone Compliance

All experiment objects positioned at 0.5–2m from the user's head position (optimal interaction zone). HUD panels at 1.25–2m (optimal reading zone). Nothing behind the user (±30° horizontal FOV for primary content).

---

## Phase Implementation Summary

### Phase 1 (Mechanics Lab)
- **Screens:** Hub, Lab (3D + HUD), Settings
- **Key flows:** First visit onboarding, core loop (Predict → Play → Discover), station navigation, hub ↔ lab transitions
- **Stations:** Projectile (10 challenges), Energy (8 challenges), Wave (8 challenges)
- **3 prediction types active:** trajectory, binary, pattern, placement
- **i18n:** en + ko
- **Theme:** Light + Dark
- **No account, no server, all local**

### Phase 2 (Mechanics Expansion + AI)
- **New stations:** Sound/Light, Electromagnetic (inside Mechanics Lab)
- **Flow changes:** AI-adaptive challenge selection replaces fixed sequence. Difficulty adjusts dynamically.
- **XR mode:** WebXR session entry from Lab screen. Same core loop, hand tracking input.

### Phase 3+ (New Spaces + UGC + Accounts)
- **New screens:** Account (sign up/in, profile), Progress (detailed stats, concept mastery map), Challenge Editor, Community browser
- **New flows:** Account creation, cloud sync, challenge creation, challenge sharing (URL), community browsing
- **New spaces:** Molecular Lab (Phase 3), Space Observatory (Phase 4), Quantum Lab (Phase 5)
- **Hub evolution:** Space cards unlock progressively. Community tab appears. Profile icon in top bar.

---

*References: [PRD](./prd.md) | [Product Brief](./product-brief.md) | [Design Doc](./design-doc.md) | [Client Structure](./client-structure.md)*
