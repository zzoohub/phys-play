# PhysPlay — UX Design

**Status:** Draft
**Last Updated:** 2026-03-02
**PRD:** [prd.md](./prd.md) | **Phase 1 PRD:** [prd-phase-1.md](./prd-phase-1.md)

---

## 1. First Principles

### User's ONE Goal
"과학 개념을 직접 조작하며 직관적으로 이해하고 싶다."
(I want to manipulate science concepts directly and understand them intuitively.)

### Minimum Needed
3 screens: **Landing** (what is this?) → **Explore** (choose a module) → **Simulation** (manipulate and learn). Everything else is secondary.

### What Can Be Removed
- Onboarding tutorial — the simulation UI must be self-explanatory with contextual hints
- Account/login — anonymous access through Phase 2
- Complex navigation — flat structure, 2 taps to any simulation
- Marketing copy inside product — landing page only, never in simulation flow

---

## 2. User Context & JTBD

### Primary Persona: "민준" (16, Student)

```
Goal:           과학 개념을 수식 없이 체험으로 이해
Context:        학교/집에서 모바일 또는 노트북으로 접근, 5분~30분 세션
Frustrations:   수식 먼저 나오면 흥미 상실, 2D 다이어그램으로 3D 개념 상상 불가
Tech comfort:   High (모바일 네이티브 세대)
```

**JTBD:** "수업에서 배운 과학 개념이 실제로 어떻게 작동하는지, 직접 변수를 바꿔가며 눈으로 확인하고 싶다. 수식이 아니라 체험으로 시작해서 '아하!' 하는 순간을 느끼고 싶다."

### Secondary Persona: "박 선생님" (35, Teacher)

```
Goal:           수업 중 실시간 시연용 교보재
Context:        교실 프로젝터 + 학생 개인 기기, 수업 시간 50분 내 활용
Frustrations:   2D 자료 한계, 고가/설치형 도구, URL 공유만으로 즉시 사용 불가
Tech comfort:   Medium
```

**JTBD:** "수업 중에 URL 하나만 공유하면 학생들이 바로 시뮬레이션에 접근해서 직접 실험할 수 있는 도구가 필요하다."

### Entry Points
| Entry | Context | User Expectation |
|-------|---------|-----------------|
| Direct URL (physplay.app) | SNS, 검색, 교사 추천 | 전체 소개 → 빠른 체험 진입 |
| Module deep link (/classical/motion) | 교사 공유, 링크 북마크 | 바로 시뮬레이션 시작 |
| Search engine | "물리 시뮬레이션", "3D 과학" | 어떤 도구인지 파악 → 체험 |

---

## 3. Information Architecture

### Sitemap

```
[PhysPlay]
├── Landing Page [Phase 1]
│
├── Explore [Phase 1]
│   ├── Track: 고전물리 [Phase 1]
│   │   ├── 1-1 운동과 힘 [Phase 1]
│   │   ├── 1-2 에너지와 일 [Phase 1]
│   │   ├── 1-3 파동 [Phase 1]
│   │   ├── 1-4 소리와 빛 [Phase 2]
│   │   ├── 1-5 전기와 자기 [Phase 2]
│   │   └── 1-6 전자기파 [Phase 2]
│   ├── Track: 화학 [Phase 3]
│   │   └── 2-1 ~ 2-6 (6 modules)
│   ├── Track: 우주과학 [Phase 4]
│   │   └── 3-1 ~ 3-6 (6 modules)
│   └── Track: 양자역학 [Phase 5]
│       └── 4-1 ~ 4-6 (6 modules)
│
├── Learning Paths [Phase 2]
│   ├── 흥미 우선 (Interest-first)
│   ├── 기초 탄탄 (Fundamentals)
│   └── 하이라이트 (Highlights)
│
├── Simulation View [Phase 1]
│   └── (per-module 3D simulation)
│
├── Teacher Dashboard [Phase 3+]
│   ├── Class Management
│   ├── Progress Tracking
│   └── Custom Paths
│
└── Account [Phase 3+]
    ├── Profile
    ├── Progress
    └── Settings (language, theme)
```

### Navigation Pattern

**Web (Desktop/Tablet):** Top navigation bar — minimal, stays out of the way during simulation.

```
┌────────────────────────────────────────────────┐
│ PhysPlay    탐험하기    학습경로    [🌐][🌙]    │
└────────────────────────────────────────────────┘
```

- `탐험하기` (Explore): browse all tracks/modules
- `학습경로` (Paths): recommended learning paths [Phase 2]
- `🌐`: language selector
- `🌙`: theme toggle

**Web (Mobile):** Simplified top bar. Navigation collapses to keep simulation full-screen.

```
┌────────────────────────────────┐
│ PhysPlay              [🌐][≡] │
└────────────────────────────────┘
```

**IA Validation:**
- Landing → Explore → Simulation = **2 taps** to core content
- Deep link → Simulation = **0 taps** (direct access)
- Explore → any module = **1 tap** (flat grid, no track drill-down required)

### Navigation Rules
- No nested navigation deeper than 2 levels
- Every simulation has a permanent URL for sharing (Front Doors principle)
- Back button always returns to Explore grid (not browser history dependent)
- Coming Soon modules are visible but clearly non-interactive (Growth principle)

---

## 4. User Flows

### Flow A: First Visit → First Simulation [Phase 1]

```
Landing Page
    │
    ├── Scan hero: 한 줄 설명 + 3D preview
    │
    ├── See module grid (3 modules Phase 1)
    │
    ▼
Tap module card
    │
    ▼
Simulation View loads
    │
    ├── Skeleton shimmer while 3D loads (< 3s target)
    │
    ├── Simulation ready → contextual hint appears
    │   "슬라이더를 움직여 힘의 크기를 바꿔보세요"
    │
    ├── User interacts with sliders/toggles/drag
    │
    ├── Overlay toggles available (vectors, energy bars)
    │
    ▼
Module footer: "다음 모듈" cards
    │
    ▼
Tap next module → new Simulation View
```

**Critical moments:**
- **Simulation load** — skeleton shimmer, never blank. Target: first meaningful frame < 3s
- **First interaction** — contextual hint auto-appears, dismisses on first interaction (Cognitive Load: reduce uncertainty)
- **Between modules** — seamless transition, no return to landing required

### Flow B: Explore Grid Browse [Phase 1]

```
Explore Grid
    │
    ├── All modules in flat grid (grouped by track)
    │   ├── Available: full card with thumbnail + title
    │   └── Coming Soon: muted card with lock icon + track label
    │
    ├── Filter by track (tab-style filter bar)
    │   [전체] [고전물리] [화학] [우주과학] [양자역학]
    │
    ▼
Tap available module card
    │
    ▼
Simulation View
```

### Flow C: Learning Path [Phase 2]

```
Learning Paths page
    │
    ├── 3 path cards with description
    │   ├── 흥미 우선: "우주에서 시작해서 양자까지"
    │   ├── 기초 탄탄: "고전물리부터 차근차근"
    │   └── 하이라이트: "각 트랙의 최고 모듈만"
    │
    ▼
Tap path card
    │
    ▼
Path overview: module sequence + progress
    │
    ▼
Tap "시작하기" → first module Simulation View
    │
    ▼
Module complete → "다음: [module name]" auto-suggested
```

### Flow D: Teacher Classroom Use [Phase 1 partial, Phase 3+ full]

```
Teacher accesses module URL
    │
    ▼
Simulation View (full-screen mode available)
    │
    ├── Teacher manipulates live on projector
    │
    ├── Shares URL with students (copy URL button)
    │
    ▼
Students open URL → same Simulation View on their devices
```

### Flow E: Deep Link Access [Phase 1]

```
User opens shared URL (e.g., /classical/motion)
    │
    ▼
Simulation View loads directly
    │
    ├── Header shows: ← 탐험하기  │  모듈 제목
    │   (back link to Explore, never dead-end)
    │
    ├── Full simulation experience
    │
    ▼
Footer: related module suggestions
```

---

## 5. Screen Specifications

### 5.1 Landing Page [Phase 1]

**Identity:** `/` — primary entry point for new visitors
**Primary action:** Enter a simulation (ONE tap to start)

```
Desktop (1280px+):
┌──────────────────────────────────────────────────────────┐
│ PhysPlay    탐험하기    학습경로    [🌐 한국어][🌙]       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   과학을 만지다                                           │
│   브라우저에서 바로 체험하는 3D 과학 시뮬레이션              │
│                                                          │
│   [탐험 시작하기]                                         │
│                                                          │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│   │ 3D      │  │ 3D      │  │ 3D      │                 │
│   │ preview  │  │ preview  │  │ preview  │                 │
│   │         │  │         │  │         │                 │
│   ├─────────┤  ├─────────┤  ├─────────┤                 │
│   │운동과 힘 │  │에너지와 일│  │파동      │                 │
│   │물체를 던져│  │롤러코스터 │  │파동을 합성│                 │
│   │보세요    │  │를 설계하세│  │해보세요  │                 │
│   │         │  │요        │  │         │                 │
│   └─────────┘  └─────────┘  └─────────┘                 │
│                                                          │
│   ── 더 많은 트랙이 곧 찾아옵니다 ──                       │
│   ┌────────┐ ┌────────┐ ┌────────┐                      │
│   │ 화학   │ │ 우주과학│ │ 양자역학│  (muted, Coming Soon) │
│   └────────┘ └────────┘ └────────┘                      │
│                                                          │
│   교사이신가요?                                           │
│   URL만 공유하면 학생들이 바로 체험할 수 있습니다.            │
│   [새 소식 받기]  ← email capture                         │
│                                                          │
│   ─────────────────────────────────────                  │
│   PhysPlay · 한국어 · 이용약관 · 개인정보                  │
└──────────────────────────────────────────────────────────┘
```

```
Mobile (375px):
┌──────────────────────────┐
│ PhysPlay         [🌐][≡] │
├──────────────────────────┤
│                          │
│ 과학을 만지다              │
│ 브라우저에서 바로 체험하는   │
│ 3D 과학 시뮬레이션          │
│                          │
│ [탐험 시작하기]            │
│                          │
│ ┌────────────────────┐   │
│ │ 3D preview         │   │
│ │ 운동과 힘            │   │
│ │ 물체를 던져보세요     │   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ 3D preview         │   │
│ │ 에너지와 일          │   │
│ │ 롤러코스터를 설계하세요│   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ 3D preview         │   │
│ │ 파동                │   │
│ │ 파동을 합성해보세요   │   │
│ └────────────────────┘   │
│                          │
│ 더 많은 트랙이 곧 찾아옵니다│
│ [화학] [우주과학] [양자역학] │
│        (muted)           │
│                          │
└──────────────────────────┘
```

**States:**
| State | Behavior |
|-------|----------|
| Loaded | Module cards with animated 3D preview thumbnails (lightweight WebGL snapshot or video loop) |
| Loading | Skeleton shimmer for card area, nav renders instantly |
| Error | "시뮬레이션을 불러오는 중 문제가 발생했습니다. 새로고침해주세요." + retry button |
| Offline | Cached landing page shell + "인터넷 연결이 필요합니다" banner |

**Design decisions:**
- No hero video/animation — module cards ARE the hero (Von Restorff: the clickable 3D previews stand out)
- "탐험 시작하기" scrolls to module grid, not a separate page (reduce steps)
- Coming Soon tracks visible but muted — creates anticipation without frustrating (Zeigarnik Effect)
- Teacher CTA is secondary — below module grid, low-key email capture
- No feature list, no "how it works" — the module previews demonstrate the value

### 5.2 Explore Grid [Phase 1]

**Identity:** `/explore` — all tracks and modules at a glance
**Primary action:** Select a module to start simulation

```
Desktop:
┌──────────────────────────────────────────────────────────┐
│ PhysPlay    [탐험하기]    학습경로    [🌐 한국어][🌙]      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ [전체] [고전물리] [화학] [우주과학] [양자역학]              │
│                                                          │
│ 고전물리 — 힘과 에너지                                    │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│ │ preview  │ │ preview  │ │ preview  │                     │
│ │운동과 힘  │ │에너지와 일│ │파동      │                     │
│ └─────────┘ └─────────┘ └─────────┘                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│ │🔒       │ │🔒       │ │🔒       │  (Coming Soon)       │
│ │소리와 빛 │ │전기와 자기│ │전자기파  │                     │
│ └─────────┘ └─────────┘ └─────────┘                     │
│                                                          │
│ 화학 — 분자의 세계 (Coming Soon)                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│ │🔒       │ │🔒       │ │🔒       │                     │
│ │원자와 결합│ │분자의 형태│ │화학반응  │                     │
│ └─────────┘ └─────────┘ └─────────┘                     │
│ ...                                                      │
└──────────────────────────────────────────────────────────┘
```

**Module card anatomy:**

```
Available:                     Coming Soon:
┌─────────────────────┐        ┌─────────────────────┐
│                     │        │ ░░░░░░░░░░░░░░░░░░░ │
│  3D Preview         │        │ ░░░░░░ 🔒 ░░░░░░░░░ │
│  (hover: subtle     │        │ ░░░░░░░░░░░░░░░░░░░ │
│   animation/rotate) │        │                     │
│                     │        │                     │
├─────────────────────┤        ├─────────────────────┤
│ 운동과 힘            │        │ 소리와 빛            │
│ 1-1 · 고전물리       │        │ 1-4 · 고전물리       │
│                     │        │ Coming Soon          │
└─────────────────────┘        └─────────────────────┘
```

**Filter behavior:**
- Tab-style filter bar, not dropdown (Hick's Law: all options visible, 5 items)
- `[전체]` selected by default — shows all tracks
- Selecting a track scrolls to and highlights that section
- Coming Soon tracks filterable (shows muted cards with future module count)

**Design decisions:**
- Flat grid — no drill-down into tracks (minimize taps, Miller's Law: modules grouped by track heading)
- Available modules first in each track, Coming Soon after
- Module numbering visible (1-1, 1-2...) for teacher reference and curriculum mapping
- No search — < 24 total modules, visual browse is faster (Search vs Browse: < 100 items favors browse)

### 5.3 Simulation View [Phase 1] — Core Screen

**Identity:** `/:track/:module` (e.g., `/classical/motion`) — the primary product experience
**Primary action:** Manipulate simulation variables

This is where users spend 80%+ of time. Every pixel must serve the simulation experience.

```
Desktop (1280px+):
┌──────────────────────────────────────────────────────────┐
│ ← 탐험하기  │  1-1 운동과 힘 · 고전물리  │  [⛶][🌐][🌙] │
├──────────────────────────────────────┬───────────────────┤
│                                      │ 학습 목표          │
│                                      │ 질량과 힘이 물체의  │
│                                      │ 운동에 미치는 영향을 │
│                                      │ 관찰합니다.         │
│                                      │                   │
│          3D Simulation Canvas        │ ── 변수 조절 ──    │
│          (WebGL/WebGPU)              │                   │
│                                      │ 힘의 크기     ──●──│
│          - orbit: left-drag          │ 0 ─────── 100 N  │
│          - zoom: scroll              │                   │
│          - pan: right-drag           │ 질량         ──●──│
│          - interact: click 3D obj    │ 1 ─────── 50 kg  │
│                                      │                   │
│                                      │ 마찰 계수    ──●──│
│                                      │ 0 ─────── 1.0   │
│                                      │                   │
│                                      │ ── 조건 ──       │
│                                      │ 중력: [지구 ▾]     │
│                                      │ 공기저항: [○ OFF]  │
│                                      │                   │
│                                      │ ── 오버레이 ──    │
│                                      │ □ 속도 벡터       │
│                                      │ □ 가속도 벡터     │
│                                      │ □ 힘 벡터        │
├──────────────────────────────────────┤                   │
│ [▶ 재생]  [⏸]  [↺ 초기화]            │                   │
├──────────────────────────────────────┴───────────────────┤
│ 다음 모듈                                                │
│ ┌──────────────┐  ┌──────────────┐                      │
│ │ 에너지와 일   │  │ 파동          │                      │
│ │ 롤러코스터 설계│  │ 간섭 패턴 관찰 │                      │
│ └──────────────┘  └──────────────┘                      │
└──────────────────────────────────────────────────────────┘
```

```
Mobile (375px):
┌──────────────────────────┐
│ ← 탐험    운동과 힘  [⛶] │
├──────────────────────────┤
│                          │
│                          │
│    3D Simulation Canvas  │
│    (60% viewport height) │
│                          │
│                          │
├──────────────────────────┤
│ [▶] [⏸] [↺]    [🎛 조절]│
├──────────────────────────┤
│ 힘의 크기          ──●── │
│ 0 ────────── 100 N      │
│                          │
│ 질량               ──●── │
│ 1 ────────── 50 kg      │
│                          │
│ 마찰 계수          ──●── │
│ 0 ────────── 1.0        │
│                          │
│ 중력: [지구 ▾]           │
│ 공기저항: [○ OFF]        │
│                          │
│ ── 오버레이 ──           │
│ □ 속도 벡터  □ 가속도     │
│ □ 힘 벡터               │
├──────────────────────────┤
│ 다음 모듈                │
│ ┌────────┐ ┌────────┐   │
│ │에너지와 │ │파동     │   │
│ │일       │ │        │   │
│ └────────┘ └────────┘   │
└──────────────────────────┘
```

**Full-screen mode (`⛶`):**
- Hides header, footer, nav — simulation canvas fills viewport
- Control panel becomes floating overlay (bottom-right, collapsible)
- Press `Esc` or tap `⛶` again to exit
- Optimal for teacher projection and immersive sessions

**States:**

| State | Behavior |
|-------|----------|
| Loading | Canvas area shows skeleton shimmer with progress indicator. Control panel renders immediately with disabled sliders. "3D 시뮬레이션 준비 중..." |
| Loaded | Canvas interactive, controls enabled, first-visit hint visible |
| Error (WebGL fail) | "이 브라우저에서 3D를 실행할 수 없습니다. Chrome 또는 Edge를 사용해주세요." + supported browser links |
| Error (asset fail) | "시뮬레이션을 불러오지 못했습니다." + [다시 시도] button |
| Partial (slow device) | Auto-switch to reduced quality. Subtle banner: "성능 최적화 모드로 전환되었습니다" |
| Offline | If previously cached: show cached simulation. If not: "인터넷 연결이 필요합니다" |

**Design decisions:**
- **Side panel, not overlay:** Control panel is always visible on desktop (Cognitive Load: no hiding essential controls behind a button). On mobile, controls are below the canvas in a scrollable area.
- **Learning goal is brief:** 1-2 sentences max, collapsible on mobile. Never a wall of text (Removal test: does it block the goal? No, but it provides context for teachers).
- **Transport controls (play/pause/reset) are separate from variable controls:** Transport = simulation flow. Variables = parameters. Different mental models. (IA Principle of Focused Navigation)
- **Module footer inside simulation view:** Reduces steps to continue exploring (Goal Gradient: show what's next)
- **No tutorial modal:** First-visit hint is a single inline tooltip pointing at the first slider, dismissed on interaction. If UI needs a tutorial, it's not clear enough.

### 5.4 Module Sub-Variations

Each module reuses the Simulation View shell but varies the canvas content and control panel.

#### 1-1 운동과 힘 (Motion & Forces) [Phase 1]

**Canvas:** 3D ground plane with a movable object (sphere/cube). Object can be pushed or thrown.
**Controls:**
| Control | Type | Range | Default |
|---------|------|-------|---------|
| 힘의 크기 | Slider | 0–100 N | 20 N |
| 질량 | Slider | 1–50 kg | 5 kg |
| 마찰 계수 | Slider | 0–1.0 | 0.3 |
| 중력 환경 | Dropdown | 지구/달/무중력 | 지구 |
| 공기저항 | Toggle | ON/OFF | OFF |
**Overlays:** 속도 벡터, 가속도 벡터, 힘 벡터
**Special interaction:** Drag-to-throw on 3D object (Fitts's Law: object is the largest target in canvas)

**First-visit hint:** "물체를 드래그해서 던져보세요" → dismisses on first drag

#### 1-2 에너지와 일 (Energy & Work) [Phase 1]

**Canvas:** Roller coaster track editor + physics simulation.
**Controls:**
| Control | Type | Range | Default |
|---------|------|-------|---------|
| 마찰 | Toggle | ON/OFF | OFF |
| 초기 높이 | Slider | 1–20 m | 10 m |
| 트랙 프리셋 | Selector | 기본/언덕/루프 | 기본 |
**Overlays:** 운동에너지 바, 위치에너지 바, 총 에너지
**Special interaction:** Draw/edit track control points with drag. Pre-made track presets for users who struggle with freeform drawing.

**First-visit hint:** "트랙 위의 점을 드래그해서 코스를 바꿔보세요" → dismisses on first drag

**Track drawing UX (critical path — PRD risk item):**
- Start with a pre-made track (not blank canvas) → reduces blank-page anxiety
- Control points (handles) visible on track, draggable to reshape
- "트랙 초기화" button to reset to preset
- Undo last edit with `Ctrl+Z` / swipe-back gesture

#### 1-3 파동 (Waves) [Phase 1]

**Canvas:** 3D wave visualization with top-down ripple tank view option.
**Controls:**
| Control | Type | Range | Default |
|---------|------|-------|---------|
| 진폭 | Slider | 0.1–2.0 | 1.0 |
| 파장 | Slider | 0.5–5.0 | 2.0 |
| 파원 수 | Selector | 1/2 | 1 |
| 시점 | Toggle | 3D/탑뷰 | 3D |
**Overlays:** 간섭 패턴 색상맵, 파동 합성 그래프
**Special interaction:** Place wave sources by tapping on the ripple tank surface

**First-visit hint:** "파장 슬라이더를 움직여 파동의 모양을 바꿔보세요" → dismisses on first slider interaction

### 5.5 Learning Path Selection [Phase 2]

**Identity:** `/paths`
**Primary action:** Choose a learning path

```
┌──────────────────────────────────────────────────────────┐
│ 나에게 맞는 경로를 선택하세요                               │
│                                                          │
│ ┌──────────────────┐                                     │
│ │ 🚀 흥미 우선       │                                     │
│ │ 우주에서 시작해서   │                                     │
│ │ 양자까지. 가장     │                                     │
│ │ 흥미로운 주제부터.  │                                     │
│ │                  │                                     │
│ │ 우주과학 → 양자 →  │                                     │
│ │ 화학 → 고전물리    │                                     │
│ │                  │                                     │
│ │ [이 경로로 시작]    │                                     │
│ └──────────────────┘                                     │
│                                                          │
│ ┌──────────────────┐                                     │
│ │ 📐 기초 탄탄       │                                     │
│ │ 고전물리부터       │                                     │
│ │ 차근차근.          │                                     │
│ │                  │                                     │
│ │ 고전물리 → 화학 →  │                                     │
│ │ 우주과학 → 양자    │                                     │
│ │                  │                                     │
│ │ [이 경로로 시작]    │                                     │
│ └──────────────────┘                                     │
│                                                          │
│ ┌──────────────────┐                                     │
│ │ ⭐ 하이라이트      │                                     │
│ │ 각 트랙의 최고     │                                     │
│ │ 모듈만 맛보기.     │                                     │
│ │                  │                                     │
│ │ 에너지 → 원자 →   │                                     │
│ │ 태양계 → 이중슬릿  │                                     │
│ │                  │                                     │
│ │ [이 경로로 시작]    │                                     │
│ └──────────────────┘                                     │
└──────────────────────────────────────────────────────────┘
```

**Design decisions:**
- 3 options only (Hick's Law: 3 meaningful choices)
- Each card shows the module sequence — user knows what to expect before committing
- No "quiz to recommend" — that adds a step. User self-selects. (Removal test)

### 5.6 Learning Path Progress [Phase 2]

**Identity:** `/paths/:path-id`
**Primary action:** Continue to next module

```
┌──────────────────────────────────────────────────┐
│ 🚀 흥미 우선 경로                                  │
│                                                  │
│ ●━━━━●━━━━○━━━━○━━━━○━━━━○                       │
│ 3-2   3-5   4-2   2-1   1-2   1-3              │
│ 완료   진행중                                     │
│                                                  │
│ 다음: 4-2 파동-입자 이중성                          │
│ 이중슬릿 실험에서 입자를 하나씩 발사하여              │
│ 간섭무늬가 형성되는 과정을 관찰합니다.               │
│                                                  │
│ [계속하기]                                        │
│                                                  │
│ ── 완료한 모듈 ──                                 │
│ ✓ 3-2 태양계 (12분 체험)                          │
│ ✓ 3-5 은하 (8분 체험)                             │
└──────────────────────────────────────────────────┘
```

**Design decisions:**
- Linear progress visualization (Goal Gradient: visible progression)
- Completed modules show time spent — social proof that others engage deeply
- "계속하기" is the ONE primary action (Von Restorff)
- Can exit path anytime — no lock-in, no guilt (removal of anti-pattern: guilting user to continue)

### 5.7 Teacher Dashboard [Phase 3+]

**Identity:** `/teacher`
**Primary action:** Monitor class progress

```
┌──────────────────────────────────────────────────────────┐
│ 학급 관리                                                │
│                                                          │
│ ┌──────────────────────────────┐                         │
│ │ 3학년 2반 (28명)              │                         │
│ │                              │                         │
│ │ 평균 체류: 8분 │ 인터랙션율: 72%│                         │
│ │                              │                         │
│ │ 모듈별 진도 ──────────────── │                         │
│ │ 1-1 운동과 힘  ████████░░ 82%│                         │
│ │ 1-2 에너지와일  ██████░░░░ 61%│                         │
│ │ 1-3 파동       ███░░░░░░░ 32%│                         │
│ │                              │                         │
│ │ [학생 초대]  [커스텀 경로 배정] │                         │
│ └──────────────────────────────┘                         │
│                                                          │
│ [+ 새 학급 만들기]                                        │
└──────────────────────────────────────────────────────────┘
```

### 5.8 Account & Settings [Phase 3+]

**Identity:** `/account`
**Primary action:** View learning progress

```
┌──────────────────────────────────┐
│ 나의 학습                         │
│                                  │
│ 총 체험 시간: 2시간 34분           │
│ 완료 모듈: 5 / 24                │
│                                  │
│ ── 최근 활동 ──                  │
│ 1-2 에너지와 일 (어제, 15분)      │
│ 1-1 운동과 힘 (3일 전, 12분)      │
│                                  │
│ ── 설정 ──                       │
│ 언어: [한국어 ▾]                  │
│ 테마: [시스템 설정 ▾]             │
└──────────────────────────────────┘
```

---

## 6. 3D Interaction Patterns

### Camera Controls

| Input | Mouse | Touch | Action |
|-------|-------|-------|--------|
| Orbit (회전) | Left-drag on canvas | One-finger drag on canvas | Camera orbits around scene center |
| Zoom (확대/축소) | Scroll wheel | Pinch | Camera zooms in/out |
| Pan (이동) | Right-drag or Middle-drag | Two-finger drag | Camera pans horizontally/vertically |
| Reset view | Double-click on canvas | Double-tap on canvas | Camera returns to default position |

### Object Interaction

| Input | Mouse | Touch | Action |
|-------|-------|-------|--------|
| Select object | Click on 3D object | Tap on 3D object | Highlights object, shows info tooltip |
| Drag object | Click + drag on object | Touch + drag on object | Moves object in 3D space |
| Throw object | Drag + release | Drag + release | Object continues with release velocity |

**Conflict resolution (camera vs object):**
- Clicking/dragging ON a 3D object = object interaction
- Clicking/dragging on EMPTY canvas space = camera control
- Visual feedback: cursor changes to `grab` over interactive objects, `move` over empty canvas
- Mobile: interactive objects have a subtle glow/pulse to indicate they're touchable

### Slider Interaction

```
힘의 크기
┌──────────────────────────────────┐
│ ○────────────●───────────────── │
│ 0           45.2              100│
│              ↑                   │
│        Current value (live)      │
└──────────────────────────────────┘
```

- Drag handle to adjust value
- Tap anywhere on track to jump to that value
- Current value displayed above/beside handle (always visible, not tooltip)
- Value updates simulation in real-time (< 100ms feedback, Doherty Threshold)
- Touch: enlarged handle area (48pt minimum, Fitts's Law)

### Toggle Interaction

```
공기저항:  [OFF ○━━━] → tap → [━━━● ON]
```

- Immediate visual state change on tap (< 100ms)
- Label stays visible (not just color change — accessibility)
- Simulation updates in real-time

### Overlay Controls

```
── 오버레이 ──
[✓] 속도 벡터     ← checked: vectors visible in 3D scene
[ ] 가속도 벡터    ← unchecked: hidden
[ ] 힘 벡터       ← unchecked: hidden
```

- Checkbox style (not toggle — multiple can be active simultaneously)
- Each overlay has distinct color in the 3D scene
- Legend auto-appears when any overlay is active

### Transport Controls

```
[▶ 재생]  [⏸ 일시정지]  [↺ 초기화]
```

- Play/Pause: single button that toggles state (icon changes)
- Reset: returns simulation to initial state AND resets camera to default view
- Keyboard: Space = play/pause, R = reset
- Simulation starts in paused state for modules requiring setup (e.g., track drawing)
- Simulation starts in playing state for modules with live physics (e.g., motion)

---

## 7. UX Writing

### Navigation Labels

| Korean | English | Context |
|--------|---------|---------|
| 탐험하기 | Explore | Main nav — browse all modules |
| 학습경로 | Learning Paths | Main nav — guided paths |
| 탐험 시작하기 | Start Exploring | Landing CTA |
| ← 탐험하기 | ← Explore | Back from simulation |
| 다음 모듈 | Next Module | Simulation footer |

### Simulation Controls

| Korean | English | Context |
|--------|---------|---------|
| 변수 조절 | Adjust Variables | Control panel heading |
| 조건 | Conditions | Toggle section heading |
| 오버레이 | Overlays | Overlay section heading |
| 재생 | Play | Transport |
| 일시정지 | Pause | Transport |
| 초기화 | Reset | Transport |

### First-Visit Hints (one per module, dismissed on interaction)

| Module | Korean | English |
|--------|--------|---------|
| 1-1 | 물체를 드래그해서 던져보세요 | Drag the object to throw it |
| 1-2 | 트랙 위의 점을 드래그해서 코스를 바꿔보세요 | Drag points on the track to reshape it |
| 1-3 | 파장 슬라이더를 움직여 파동의 모양을 바꿔보세요 | Move the wavelength slider to change the wave shape |

### Error Messages

| Scenario | Message (ko) |
|----------|-------------|
| WebGL not supported | 이 브라우저에서 3D를 실행할 수 없습니다. Chrome, Edge, 또는 Safari를 사용해주세요. |
| Simulation load fail | 시뮬레이션을 불러오지 못했습니다. [다시 시도] |
| Slow performance detected | 성능 최적화 모드로 전환되었습니다. |
| Offline | 인터넷 연결이 필요합니다. 연결 후 다시 시도해주세요. |

### Empty States

| Context | Message (ko) |
|---------|-------------|
| Coming Soon module tap | 이 모듈은 준비 중입니다. 출시 알림을 받으시겠어요? [알림 받기] |
| No completed modules (path) | 아직 시작하지 않았습니다. 첫 번째 모듈부터 시작해보세요! [시작하기] |
| Teacher: no classes | 아직 학급이 없습니다. 학급을 만들고 학생들을 초대하세요. [학급 만들기] |

### Tone Guide

| Context | Tone | Example |
|---------|------|---------|
| First visit | Inviting, curious | 과학을 만지다 |
| During simulation | Minimal, unobtrusive | 힘의 크기: 45.2 N |
| First-visit hint | Encouraging, specific | 물체를 드래그해서 던져보세요 |
| Error | Calm, solution-focused | 시뮬레이션을 불러오지 못했습니다. 다시 시도해주세요. |
| Coming Soon | Anticipation | 이 모듈은 준비 중입니다 |

---

## 8. Responsive Strategy

### Breakpoints

| Breakpoint | Width | Layout Strategy |
|-----------|-------|-----------------|
| Mobile | < 768px | Single column. Canvas above controls. Controls scrollable below canvas. |
| Tablet | 768–1024px | Canvas takes 65% width. Control panel as narrow sidebar or below canvas. |
| Desktop | 1025–1440px | Canvas takes 70% width. Control panel as right sidebar (fixed). |
| Desktop L | > 1440px | Content centered, max-width 1440px. |

### Simulation View Responsive Rules

**Desktop (> 1024px):**
- Canvas: 70% width, fills remaining viewport height (minus header and transport bar)
- Control panel: 30% width, right sidebar, scrollable independently
- Transport controls: bottom of canvas area

**Tablet (768–1024px):**
- Canvas: full width, 55% viewport height
- Control panel: below canvas, full width, scrollable
- Transport controls: between canvas and control panel

**Mobile (< 768px):**
- Canvas: full width, 55–60% viewport height (minimum 300px)
- Control panel: below canvas, full width, scrollable
- Transport controls: sticky bar between canvas and controls
- Full-screen mode: canvas fills viewport, controls in floating overlay (bottom sheet)

### Mobile-Specific Adaptations
- Slider handles enlarged to 48pt touch target
- Full-screen button prominent in header (mobile users benefit most)
- Control panel sections collapsible (accordion) to reduce scrolling
- "학습 목표" auto-collapsed on mobile (expandable)
- Module footer cards: horizontal scroll, not grid

---

## 9. Accessibility

### 3D Canvas Accessibility

3D simulations present inherent accessibility challenges. Strategy: make ALL information available through non-visual alternatives.

| Feature | Accessible Alternative |
|---------|----------------------|
| 3D visualization | Descriptive `aria-label` on canvas describing current scene state |
| Slider adjustments | Standard `<input type="range">` with `aria-label` and `aria-valuetext` |
| Toggle switches | Standard toggle with `role="switch"` and `aria-checked` |
| Overlay visualizations | Numeric readouts in control panel (e.g., "속도: 3.2 m/s, 방향: 45°") |
| Object drag interaction | Keyboard arrow keys to move object, Enter to release/throw |
| Camera controls | Keyboard: Arrow keys = orbit, +/- = zoom, Shift+arrows = pan |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between control panel elements |
| Space | Play/Pause simulation |
| R | Reset simulation |
| F | Toggle full-screen |
| Escape | Exit full-screen |
| Arrow keys (in canvas focus) | Orbit camera |
| +/- | Zoom in/out |
| Shift + Arrow keys | Pan camera |

### Color and Contrast
- All UI text: 4.5:1 minimum contrast ratio
- Slider tracks and handles: 3:1 minimum against background
- Overlay colors in 3D scene: use shape + color (arrows for velocity, dashed for acceleration) — never color alone
- Dark mode: recalculated contrast ratios for all elements

### Motion
- `prefers-reduced-motion`: disable canvas animations, show static snapshots
- Simulation still runs (physics engine), but camera transitions and decorative animations are instant
- Users can manually play/pause all simulation motion

### Screen Reader
- Canvas: `role="img"` with dynamic `aria-label` describing scene state
- Live region for value changes: `aria-live="polite"` on slider value display
- Module navigation: proper heading hierarchy (h1: module name, h2: sections)

---

## 10. Theme

### Light / Dark Mode

Applies to **2D UI only** (nav, control panel, text, cards). 3D scene lighting/materials are fixed per simulation design (REQ-021).

| Element | Light | Dark |
|---------|-------|------|
| Background | white | #1a1a2e |
| Surface (cards, panels) | #f5f5f5 | #16213e |
| Text primary | #1a1a2e | #e8e8e8 |
| Text secondary | #6b7280 | #9ca3af |
| Accent (interactive) | #3b82f6 | #60a5fa |
| Border | #e5e7eb | #2d3748 |

**Behavior:**
- Default: follows system preference (`prefers-color-scheme`)
- Manual override via theme toggle in nav
- Persisted in `localStorage` (no account needed)

---

## 11. Performance UX

### Loading Strategy

```
1. HTML shell + nav bar renders instantly (SSR/SSG)
2. Module metadata loads (title, controls config) → control panel renders
3. 3D engine initializes → canvas shows skeleton shimmer
4. 3D assets stream progressively → scene becomes visible
5. Physics engine initializes → simulation interactive
6. First-visit hint appears → user starts interacting
```

**Target:** Step 1–4 in < 3 seconds on 3G. Step 5 in < 5 seconds.

### Progressive Loading Feedback

| Stage | Visual Feedback |
|-------|----------------|
| 0–1s | Nav bar + control panel skeleton |
| 1–3s | Canvas shimmer + "3D 시뮬레이션 준비 중..." + progress % |
| 3–5s | Partial scene visible (ground plane, basic geometry) |
| 5s+ | Full scene interactive |

### Performance Degradation

| Detection | Response | User Message |
|-----------|----------|-------------|
| FPS < 30 for 3+ seconds | Auto-reduce quality (shadows, particle count) | "성능 최적화 모드로 전환되었습니다" (dismissible) |
| WebGPU unavailable | Fall back to WebGL2 | (silent — no user notification needed) |
| WebGL2 unavailable | Show error state | "이 브라우저에서 3D를 실행할 수 없습니다..." |
| Mobile + complex module | Start in reduced quality | (silent — default for mobile) |

---

## Phase Implementation Summary

### Phase 1
**Screens:**
- Landing Page (3 available modules + Coming Soon tracks)
- Explore Grid (all tracks visible, 3 modules active, rest Coming Soon)
- Simulation View (core 3D experience with full control panel)

**Modules:**
- 1-1 운동과 힘 (Motion & Forces)
- 1-2 에너지와 일 (Energy & Work)
- 1-3 파동 (Waves)

**Key flows:**
- First visit → module selection → simulation interaction
- Deep link → direct simulation access
- Teacher URL sharing
- Full-screen simulation mode

**Features:**
- 3D simulation with sliders, toggles, drag interaction
- Transport controls (play/pause/reset)
- Overlay toggles (vectors, energy bars)
- Responsive layout (desktop, tablet, mobile)
- Light/dark mode (2D UI only)
- i18n: ko + en
- Module-level analytics (visit, interaction, session time)

### Phase 2
**New screens:** Learning Path Selection, Learning Path Progress
**Module additions:** 1-4, 1-5, 1-6 (classical physics completion)
**Flow changes:**
- Landing page adds "학습경로" entry point
- Nav adds Learning Paths link
- Simulation footer shows path-aware "다음 모듈"
- i18n expansion: es, pt-BR, id, ja

### Phase 3+
**New screens:** Teacher Dashboard, Account/Settings, Class Management
**New flows:**
- Teacher: create class → invite students → monitor progress
- Student: create account → save progress → view history
- Teacher: assign custom learning path → students follow
**Module additions:** 2-1 ~ 2-6 (Chemistry track)

### Phase 4
**Module additions:** 3-1 ~ 3-6 (Space Science track)
**Flow changes:** Explore grid fully populated for Space Science

### Phase 5
**Module additions:** 4-1 ~ 4-6 (Quantum Mechanics track)
**Flow changes:** All tracks active, Coming Soon labels removed, full 24-module experience
