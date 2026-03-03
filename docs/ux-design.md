# PhysPlay -- UX Design v2

**Status:** Draft
**Last Updated:** 2026-03-04
**PRD Reference:** [prd.md](./prd.md) | [prd-phase-1.md](./prd-phase-1.md) | [design-doc.md](./design-doc.md)

---

## Table of Contents

1. [Context](#1-context)
2. [Design Principles](#2-design-principles)
3. [Information Architecture](#3-information-architecture)
4. [Screen Inventory](#4-screen-inventory)
5. [User Flows](#5-user-flows)
6. [Core Loop UX](#6-core-loop-ux)
7. [HUD Design](#7-hud-design)
8. [Navigation Model](#8-navigation-model)
9. [Onboarding UX](#9-onboarding-ux)
10. [Responsive Strategy](#10-responsive-strategy)
11. [Accessibility](#11-accessibility)
12. [Motion & Transitions](#12-motion--transitions)
13. [State & Error Handling](#13-state--error-handling)
14. [i18n UX](#14-i18n-ux)
15. [Dark / Light Theme](#15-dark--light-theme)
16. [Phase Implementation Summary](#16-phase-implementation-summary)

---

## 1. Context

### 1.1 User Goal (JTBD)

> When I encounter a science concept I don't understand, I want to predict what will happen, see for myself, and discover why -- so I can build real intuition instead of memorizing formulas.

This is the single goal every UX decision serves. Every screen, interaction, and transition is measured against: "Does this get the user into the Predict-Play-Discover loop faster, keep them in it longer, and make the discovery moment more impactful?"

### 1.2 User Contexts

| Persona | Age | Device Context | Mental State | Friction Tolerance |
|---------|-----|---------------|-------------|-------------------|
| Seoyeon | 10 | PC at home, possibly tablet | Playful, bored by school, wants immediate fun | Very low -- will leave in 10 seconds if bored |
| Minjun | 16 | PC or mobile, study breaks | Frustrated by formulas, curious but impatient | Low -- needs to see the point quickly |
| Jiyoung | 29 | PC at desk, focused work session | Motivated but barrier-sensitive, self-directed | Medium -- will tolerate setup if value is clear |

### 1.3 Proto-Personas

```
Name:           Seoyeon
Role:           Elementary student (4th grade)
Goal:           Have fun while accidentally learning science
Context:        After school, home PC, 15-30 min sessions
Frustrations:   Text-heavy content, boring explanations, things that feel like homework
Tech comfort:   Medium (games yes, productivity tools no)

Name:           Minjun
Role:           High school student (1st year)
Goal:           Build physics intuition without drowning in math
Context:        Study breaks, home PC, 20-40 min sessions
Frustrations:   Formulas without meaning, aimless exploration, no clear progress
Tech comfort:   High

Name:           Jiyoung
Role:           Developer, career changer
Goal:           Grasp quantum basics through hands-on experimentation
Context:        Evening PC sessions, focused, 30-60 min
Frustrations:   Content that doesn't adapt to her level, math barriers
Tech comfort:   Very High
```

### 1.4 Platform Constraints

- **Primary:** PC desktop/laptop (mouse + keyboard)
- **Secondary:** Mobile (touch)
- **Future:** XR headsets (Phase 2+)
- **Browser:** Chrome, Safari, Firefox (latest 2 versions)
- **Rendering:** WebGPU with WebGL fallback
- **Storage:** Local only (SQLite WASM + OPFS), no accounts in Phase 1

---

## 2. Design Principles

Five principles govern all design decisions. They are ordered by priority -- when principles conflict, higher-numbered principles yield to lower-numbered ones.

### P1. Immediate Action, Zero Gatekeeping

> The user should be doing something interesting within 10 seconds of arrival.

No sign-up, no tutorial, no track selection. The first thing that happens is a challenge. This principle exists because our youngest persona (Seoyeon, 10) has a ~10-second patience window, and our core product bet is that the Predict-Play-Discover loop itself is the best onboarding.

**Cognitive basis:** Doherty Threshold (productivity soars when response time < 400ms) and Peak-End Rule (the first moment disproportionately shapes perception). If the first 30 seconds are friction, the product is dead.

### P2. One Question at a Time

> Never ask the user to do two things simultaneously.

Each screen, each HUD state, each moment in the core loop has exactly one thing the user needs to focus on. During Predict: only the prediction input. During Play: only the experiment. During Discover: only the comparison. This is the fundamental guard against the cognitive overload that kills educational tools.

**Cognitive basis:** Cognitive Load Theory (working memory holds 4 +/- 1 chunks). Hick's Law (decision time increases with options).

### P3. The 3D is the Interface

> In the lab, the 3D viewport IS the product. 2D overlays are servants of the 3D experience, never the reverse.

HUD elements must be minimal, translucent, and deferential to the simulation. The user is here for the experiment, not the UI. If a HUD element could be replaced by a direct 3D interaction, prefer the 3D interaction.

**Cognitive basis:** Von Restorff Effect -- the 3D simulation must be the visually dominant element. If HUD competes with the simulation, neither wins.

### P4. Wrong is Wonderful

> Being wrong must feel safe, interesting, and productive -- never punishing.

This is the core product insight: cognitive conflict (my prediction was wrong) drives conceptual change. The UX must protect this moment. No red error screens. No "wrong" labels. The discover phase frames every outcome as a discovery. The tone is "look at that difference" not "you got it wrong."

**Cognitive basis:** Aesthetic-Usability Effect (emotional safety increases willingness to engage). Zeigarnik Effect (the unresolved gap between prediction and reality creates motivation to understand).

### P5. Show the Map, Hide the Path

> The user should always see where they are and what exists, but never feel forced down a predetermined sequence.

The hub shows all spaces and stations, with locked ones visible as silhouettes. Within a station, the adaptive engine chooses the next challenge -- but the user can always leave, switch stations, or return to the hub. No locked sequences, no "you must complete X before Y."

**Cognitive basis:** Goal Gradient Effect (visible destination increases motivation). Serial Position Effect (clear beginning and end points anchor the experience).

---

## 3. Information Architecture

### 3.1 Sitemap

```
[PhysPlay]
|
+-- / (Landing) [Phase 1]                          -- First visit entry point
|
+-- /hub (Research Lab Hub) [Phase 1]               -- Home for returning users
|   |
|   +-- Space selection (4 spaces, Phase 1 = Mechanics Lab only)
|   |   +-- [Mechanics Lab] [Phase 1]
|   |   +-- [Molecular Lab] [Phase 3] (locked silhouette)
|   |   +-- [Space Observatory] [Phase 4] (locked silhouette)
|   |   +-- [Quantum Lab] [Phase 5] (locked silhouette)
|   |
|   +-- Station selection (within space)
|       +-- Projectile Station [Phase 1]
|       +-- Energy Station [Phase 1]
|       +-- Wave Station [Phase 1]
|
+-- /progress (Learning Progress) [Phase 1]         -- Progress tracking dashboard
|
+-- /settings (Settings) [Phase 1]                  -- User preferences
|
+-- [3D Lab Experience] (full-screen, no URL change) [Phase 1]
    |
    +-- [Predict Phase]  -- Prediction input overlay
    +-- [Play Phase]     -- God Hand simulation
    +-- [Discover Phase] -- Comparison overlay + explanation
    +-- [HUD]            -- Station nav, controls, progress
```

### 3.2 Navigation Pattern

| Context | Pattern | Justification |
|---------|---------|---------------|
| 2D pages (Hub, Progress, Settings) | Top nav bar (web standard) | Jakob's Law -- web users expect top navigation. 3-4 top-level items fits Miller's Law. |
| Within 3D Lab | HUD overlays (no page navigation) | REQ-015 mandates full-screen 3D. Page navigation would destroy immersion. |
| 2D to 3D transition | Portal transition animation | REQ-040 -- dramatic shift signals context change from browsing to experimentation. |
| Station switching (within 3D) | HUD station selector | User stays in 3D -- no need to exit to hub for intra-space navigation. |
| 3D to 2D exit | Exit button in HUD -> transition back to hub | Always available, one-click escape from any lab state. |

### 3.3 Depth Validation

Core content (starting a challenge) is reachable in at most 3 actions:

- **First visit:** URL -> instant challenge (0 actions, P1: Immediate Action)
- **Returning user:** Hub (1) -> select space (2) -> select station (3) -> challenge starts
- **Within 3D lab:** Station selector (1) -> challenge starts (2)

This meets the IA reference's rule: core content reachable in 3 or fewer taps/clicks.

### 3.4 Entry Points

| Entry Point | Destination | Context |
|-------------|-------------|---------|
| Direct URL (first visit) | Landing -> immediate first challenge | SEO, social share, marketing |
| Direct URL (returning) | Hub (if local progress exists) | Bookmark, direct navigation |
| /hub | Research Lab Hub | Home for returning users |
| /progress | Progress dashboard | Self-assessment |
| /settings | Settings | Preferences |
| Shared challenge URL [Phase 3+] | Specific challenge in 3D lab | Social sharing, UGC |

---

## 4. Screen Inventory

### 4.1 Landing Page [Phase 1]

**Route:** `/` (index.tsx)
**Purpose:** Entry point for first-time visitors. Immediately routes to the first challenge experience.
**Primary Action:** Start the first challenge (happens automatically or with a single tap).

The landing page has two modes based on user state:

**Mode A: First Visit (no local data)**

This is NOT a marketing page. Per P1 (Immediate Action), the landing page for first-time visitors functions as a launch pad into the first challenge. The page shows a brief value statement and an immediate call to action.

```
+-------------------------------------------------------+
|  [Logo] PhysPlay            [en/ko]                   |
+-------------------------------------------------------+
|                                                       |
|              [Illustration: 3D ball trajectory]        |
|                                                       |
|        Can you predict where the ball lands?          |
|                                                       |
|              [ Start Experimenting ]                  |
|                                                       |
|  "Predict, experiment, discover science"              |
|                                                       |
+-------------------------------------------------------+
```

- Headline: A question, not a feature list. Piques curiosity. (UX Writing: action-oriented, no jargon)
- Single CTA button: "Start Experimenting" -- specific verb, describes what happens next
- No feature tours, no hero sections, no marketing copy (Anti-pattern: promotional language inside product flows)
- i18n: en/ko toggle in top-right

**Mode B: Returning Visitor (local progress exists)**

Redirect to `/hub` automatically. The landing page is no longer relevant once the user has progress data.

**States:**

| State | Behavior |
|-------|----------|
| Empty (first visit) | Show Mode A |
| Loaded (returning visit) | Redirect to /hub |
| Loading (checking local storage) | Brief skeleton (< 300ms expected) |
| Error (storage check fails) | Fall through to Mode A (safe default) |
| Offline | Mode A still works -- no network needed |

### 4.2 Research Lab Hub [Phase 1]

**Route:** `/hub` (hub.tsx)
**Purpose:** Home screen for returning users. Central navigation to all spaces and stations.
**Primary Action:** Select a space/station to enter the 3D lab.

```
+-------------------------------------------------------+
|  [Logo] PhysPlay     [Hub] [Progress] [Settings]      |
+-------------------------------------------------------+
|                                                       |
|  My Research Lab                                      |
|                                                       |
|  +-------------------+  +-------------------+         |
|  |                   |  |                   |         |
|  |  MECHANICS LAB    |  |  MOLECULAR LAB    |         |
|  |  [Unlocked]       |  |  [Locked]         |         |
|  |                   |  |  (silhouette)     |         |
|  |  3/3 Stations     |  |                   |         |
|  |  12/26 Challenges  |  |  Coming soon      |         |
|  +-------------------+  +-------------------+         |
|                                                       |
|  +-------------------+  +-------------------+         |
|  |  SPACE            |  |  QUANTUM LAB      |         |
|  |  OBSERVATORY      |  |  [Locked]         |         |
|  |  [Locked]         |  |  (silhouette)     |         |
|  +-------------------+  +-------------------+         |
|                                                       |
|  ---- Mechanics Lab Stations ---                      |
|                                                       |
|  [ Projectile ]  [ Energy ]  [ Wave ]                 |
|     8/10            3/8         1/8                    |
|    "Continue"     "Continue"  "Start"                  |
|                                                       |
+-------------------------------------------------------+
```

**Key Design Decisions:**

- **Space cards** show both unlocked (full art) and locked (monochrome silhouette + label) spaces. Locked spaces are visible to create curiosity (P5: Show the Map) but not interactive beyond showing unlock conditions. Principle: Goal Gradient Effect.
- **Station chips** appear below the selected space. Each shows completion count and a contextual CTA ("Continue" if in progress, "Start" if new). Principle: Zeigarnik Effect -- incomplete stations are visually prominent.
- **Progress summary** on each space card: "{completed}/{total} Challenges" provides goal gradient visibility.
- **No search needed**: With 4 spaces and 3-5 stations per space, browsing covers all content (IA reference: favor browse for < 100 items).

**States:**

| State | Design |
|-------|--------|
| Empty (first visit, just completed onboarding) | Space map with Mechanics Lab unlocked, welcome message: "Your research lab is ready. Pick a station to begin." |
| Loaded | Full hub with progress data |
| Loading | Skeleton matching card layout (shimmer) |
| Error (storage read fails) | "We had trouble loading your progress. Your data might still be safe -- try refreshing." + [Refresh] button |
| Partial (some data loaded) | Show what loaded, inline error for failed sections |
| Offline | Works fully -- all data is local |

### 4.3 Progress Page [Phase 1]

**Route:** `/progress` (progress.tsx)
**Purpose:** Visualize learning progress across stations and concepts.
**Primary Action:** Identify areas to improve and navigate to relevant stations.

```
+-------------------------------------------------------+
|  [Logo] PhysPlay     [Hub] [Progress] [Settings]      |
+-------------------------------------------------------+
|                                                       |
|  My Progress                                          |
|                                                       |
|  Mechanics Lab                                        |
|  +-------------------------------------------------+ |
|  | Projectile   [========------]  8/10  80%        | |
|  | Energy       [====---------]  3/8   38%         | |
|  | Wave         [=------------]  1/8   13%         | |
|  +-------------------------------------------------+ |
|                                                       |
|  Prediction Accuracy                                  |
|  +-------------------------------------------------+ |
|  | Overall: 62%                                     | |
|  | Best: Projectile trajectory (85%)                | |
|  | Needs work: Wave interference (30%)              | |
|  |                     [ Practice Wave ] <- CTA     | |
|  +-------------------------------------------------+ |
|                                                       |
|  Recent Activity                                      |
|  +-------------------------------------------------+ |
|  | Today: 5 challenges, 3 correct                   | |
|  | This week: 12 challenges                         | |
|  +-------------------------------------------------+ |
|                                                       |
+-------------------------------------------------------+
```

**Key Design Decisions:**

- **Station progress bars** provide at-a-glance completion status. Principle: Goal Gradient Effect.
- **Prediction accuracy section** highlights strengths and weaknesses. The "needs work" area has a direct CTA to practice that topic -- actionable, not just informational. Principle: Zeigarnik Effect (incomplete areas motivate return).
- **No leaderboards or social comparison** in Phase 1. Per P4 (Wrong is Wonderful), the progress page frames everything as personal growth, not competition.

**States:**

| State | Design |
|-------|--------|
| Empty (no challenges completed) | "Start experimenting to see your progress here." + [Go to Hub] CTA |
| Loaded | Full progress dashboard |
| Offline | Works fully -- all data is local |

### 4.4 Settings Page [Phase 1]

**Route:** `/settings` (settings.tsx)
**Purpose:** User preferences for language, theme, audio, and accessibility.
**Primary Action:** Adjust a setting (changes apply immediately, no save button needed).

```
+-------------------------------------------------------+
|  [Logo] PhysPlay     [Hub] [Progress] [Settings]      |
+-------------------------------------------------------+
|                                                       |
|  Settings                                             |
|                                                       |
|  Language                                             |
|  [English v]  [Korean]                                |
|                                                       |
|  Theme                                                |
|  [System v]  [Light]  [Dark]                          |
|                                                       |
|  Audio                                                |
|  Sound Effects  [====|====] 80%                       |
|  Music          [====|====] 60%                       |
|                                                       |
|  Discover Depth                                       |
|  [ Intuitive (Level 1) ]                              |
|  [ Conceptual (Level 2) ] <- default                  |
|  [ With Formulas (Level 3) ]                          |
|                                                       |
|  Accessibility [Phase 2]                              |
|  Reduce Motion  [ OFF ]                               |
|  High Contrast  [ OFF ]                               |
|                                                       |
|  Data                                                 |
|  [Export Progress]  [Clear All Data]                   |
|                                                       |
+-------------------------------------------------------+
```

**Key Design Decisions:**

- **Immediate apply**: All settings take effect instantly. No "Save" button needed. This follows the interaction pattern: optimistic UI for settings toggles (> 95% success rate, reversible).
- **Discover depth preference**: Users can set their preferred explanation depth (Level 1/2/3). The adaptive engine uses this as a starting point but may adjust per challenge. This respects user agency while allowing the system to adapt.
- **Clear All Data**: Destructive action. Requires confirmation dialog: "Clear all progress? This removes all your experiment history and progress. This cannot be undone." + [Cancel] [Clear Data]. Specific verb on the destructive button per UX Writing rules.
- **Segmented controls** for Language and Theme instead of dropdowns (Fitts's Law -- larger targets, fewer steps).
- **Audio sliders** with percentage labels -- accessible, clear current state.

**States:**

| State | Design |
|-------|--------|
| Loaded | All current settings shown with current values |
| Error (setting fails to persist) | Inline error below the failed setting: "Could not save. Try again." |
| Offline | Works fully -- settings are local |

### 4.5 3D Lab Experience [Phase 1]

**Trigger:** User selects a space/station from Hub, or enters via onboarding.
**Purpose:** The core product experience -- full-screen 3D viewport with HUD overlays.
**Primary Action:** Complete the core loop (Predict -> Play -> Discover).

This is NOT a traditional screen -- it is a full-viewport 3D experience with HUD overlays. It has sub-states that correspond to the core loop phases, detailed in Section 6 (Core Loop UX) and Section 7 (HUD Design).

**States:**

| State | Design |
|-------|--------|
| Loading (entering lab) | Portal transition animation plays over a blurred preview of the 3D environment. Progress bar overlaid. "Entering Mechanics Lab..." |
| Loaded (idle in lab) | Full 3D environment with HUD. Station selector visible. Ready for challenge. |
| Predict phase | Prediction input HUD overlaid on 3D scene |
| Play phase | God Hand active, minimal HUD, simulation running |
| Discover phase | Comparison overlay on 3D scene + explanation panel |
| Between challenges | Brief transition (0.5s) + next challenge setup |
| Error (engine fails) | HUD error panel: "Something went wrong with the simulation. [Try Again] or [Back to Hub]" |
| Offline | Works fully -- simulations run locally |

---

## 5. User Flows

### 5.1 First Visit Flow

```
URL (/)
  |
  v
[Landing Page - Mode A]
  |
  | "Start Experimenting" tap
  v
[Portal Transition: 2D -> 3D]
  |
  v
[3D Lab: Onboarding Challenge]
  |-- Contextual hint: "Where will the ball land? Draw your prediction."
  v
[PREDICT: Draw trajectory]
  |-- Skip available (gentle nudge first)
  v
[PLAY: God Hand throw]
  |-- Contextual hint (first time only): "Click and drag the ball to throw it"
  v
[DISCOVER: Overlay comparison]
  |-- Level 1 explanation (intuitive analogy)
  |-- "Next Challenge" CTA
  v
[Hub Reveal]
  |-- Portal Transition: 3D -> 2D
  |-- Hub page with space map
  |-- Mechanics Lab unlocked
  |-- Other spaces visible as silhouettes
  v
[Hub Page - user is home]
```

**Decision Points:**

| Decision | Default | Alternative |
|----------|---------|------------|
| Skip prediction? | Gentle nudge: "Give it a try -- there is no wrong answer!" then allow skip | Skipped -> still see Play + Discover |
| After first challenge: more challenges or hub? | Show Hub to establish the mental model of the research lab | "Keep Going" secondary option to stay in lab |

**Critical timing:** From URL open to first interaction (drawing prediction) must be under 10 seconds. This means:
- Landing page renders in < 2s (SSR)
- Portal transition + 3D load in < 3s (poster image -> progressive loading)
- First challenge ready immediately after load (pre-loaded as the default challenge)

### 5.2 Returning User Flow

```
URL (/) or /hub
  |
  | (local progress detected -> redirect to /hub)
  v
[Hub Page]
  |
  | Select space card (e.g., Mechanics Lab)
  v
[Station chips appear]
  |
  | Select station (e.g., Energy)
  v
[Portal Transition: 2D -> 3D]
  |
  v
[3D Lab: Continue from last challenge]
  |
  v
[PREDICT -> PLAY -> DISCOVER loop]
  |
  |-- Adaptive engine selects next challenge
  |-- Difficulty adjusts based on performance
  |-- Cross-engine recommendations appear in Discover [Phase 3+]
  |
  | At any time: HUD station selector to switch stations
  | At any time: Exit button to return to Hub
  v
[Station complete?]
  |-- Yes: Celebration moment + "Try another station" or "Back to Hub"
  |-- No: Next challenge continues
```

### 5.3 Station Navigation Flow (Within 3D Lab)

```
[Currently in Projectile Station, challenge in progress]
  |
  | Tap station selector in HUD
  v
[Station list appears as HUD overlay]
  |-- Projectile (8/10) -- current
  |-- Energy (3/8)
  |-- Wave (1/8)
  |
  | Select "Energy"
  v
[Brief transition within 3D (0.5s camera move + env shift)]
  |
  v
[Energy Station: Continue from last challenge]
```

No exit to 2D. No loading screen. Station switching within a space is a camera movement and environment parameter change within the same 3D scene.

### 5.4 Settings Flow

```
[Any 2D page]
  |
  | Tap "Settings" in nav bar
  v
[Settings Page]
  |
  | Adjust settings (instant apply)
  |
  | Tap "Hub" or "Progress" in nav bar
  v
[Destination page with settings applied]
```

No save action. No "are you sure" dialogs for non-destructive settings. Only "Clear All Data" gets a confirmation (destructive + irreversible).

### 5.5 Cross-Engine Discovery Flow [Phase 3+]

```
[Discover phase: Wave station - Doppler effect challenge]
  |
  | Explanation includes cross-reference:
  | "This same effect makes distant galaxies appear red.
  |  See it in action at the Space Observatory."
  |
  | [Explore in Space Observatory] CTA
  v
[Is Space Observatory unlocked?]
  |-- Yes: Portal transition -> Space Observatory -> related challenge
  |-- No: "Unlock the Space Observatory by completing Mechanics Lab."
  |        Shows unlock progress. Returns to current station.
```

---

## 6. Core Loop UX

The core loop (Predict -> Play -> Discover) is the product. This section details the interaction design for each phase.

### 6.1 Loop State Machine

```
[IDLE] -- challenge loaded --> [PREDICT]
                                   |
                          submit / skip
                                   |
                                   v
                               [PLAY]
                                   |
                          simulation complete
                                   |
                                   v
                             [DISCOVER]
                                   |
                          "Next Challenge" / "Change Station"
                                   |
                                   v
                               [IDLE]
```

Each state transition is accompanied by a visual shift in the HUD (see Section 7). The 3D viewport remains full-screen throughout -- only the HUD overlay changes.

### 6.2 Predict Phase

**Goal:** User commits a prediction about the experiment outcome. This is the moment that creates cognitive conflict -- without a prediction, there is no "I was wrong" moment.

**Duration:** 10-30 seconds (varies by prediction type).

**HUD State:** Prediction input panel appears. 3D scene shows the experiment setup (objects in starting positions). Scene is static -- no simulation running.

#### 6.2.1 Prediction Type: Trajectory Drawing

**Use case:** "Where will the ball land?" / "What path will it follow?"
**Phase 1 prevalence:** 70% of Projectile station challenges.

**PC (Mouse):**
1. Challenge prompt appears in HUD: "Draw where you think the ball will go."
2. User clicks on the 3D viewport to place the starting point of the trajectory (snaps to the object's position).
3. User drags to draw a freehand curve in 3D space (rendered as a glowing line projected onto a vertical plane).
4. Release to complete the drawing.
5. [Submit Prediction] button confirms. Drawing is editable -- user can redraw before submitting.

```
+-------------------------------------------------------+
|  "Where will the ball go?"                   [Skip]   |
|                                                       |
|          ~ ~ ~ ~ ~ ~ ~ (user's drawn curve)          |
|         O                                             |
|        /                                              |
|   [ball]                                              |
|   ==================== (ground plane)                 |
|                                                       |
|  [Redraw]                    [Submit Prediction]      |
+-------------------------------------------------------+
```

**Mobile (Touch):**
Same interaction. Finger draws on the viewport. Larger touch targets for Redraw and Submit buttons (min 48x48pt). Drawing area receives all touch input (no scroll conflict since the 3D viewport is full-screen).

**Design Decisions:**
- The drawn line is rendered as a distinct visual (e.g., dashed neon line) that looks different from the actual trajectory shown later in Discover. This prevents confusion during comparison.
- Drawing precision is forgiving -- the error tolerance for "correct" is generous (especially at lower difficulties). Principle: P4 (Wrong is Wonderful) -- the prediction should feel low-stakes.
- Redraw is always available (undo pattern). No "are you sure?" for redraw -- it is non-destructive.

#### 6.2.2 Prediction Type: Binary Choice

**Use case:** "Will it make it to the other side?" / "Which ball hits the ground first?"
**Phase 1 prevalence:** ~40% of Energy station, ~12.5% of Wave station.

**PC/Mobile:**
1. Challenge prompt appears with two clear options.
2. Two large buttons (or two highlighted zones in 3D space).
3. Tap to select. Selection highlights immediately.
4. [Submit Prediction] to confirm.

```
+-------------------------------------------------------+
|  "Which ball hits the ground first?"         [Skip]   |
|                                                       |
|         [Ball A]           [Ball B]                   |
|         (heavy)            (light)                    |
|                                                       |
|    +---------------+  +---------------+               |
|    |   Ball A      |  |   Ball B      |               |
|    |   (selected)  |  |               |               |
|    +---------------+  +---------------+               |
|                                                       |
|                          [Submit Prediction]          |
+-------------------------------------------------------+
```

**Design Decisions:**
- Options are presented as large cards or highlighted 3D objects, not radio buttons. This is a game, not a form. Fitts's Law: large targets reduce selection effort.
- Selection provides immediate visual feedback (highlight, scale, or material change on the 3D object). Principle: Doherty Threshold (< 100ms feedback).
- No "I don't know" option. Per P4, guessing is fine and encouraged. The system should make it clear that wrong predictions are part of the experience.

#### 6.2.3 Prediction Type: Pattern Selection

**Use case:** "What interference pattern will form?" / "What happens when the pendulum is released?"
**Phase 1 prevalence:** ~10% of Projectile, ~40% of Energy, ~37.5% of Wave.

**PC/Mobile:**
1. Challenge prompt with 3-4 visual options (diagrams or mini-animations).
2. Tap to select. Visual highlight on selection.
3. [Submit Prediction] to confirm.

```
+-------------------------------------------------------+
|  "What pattern will the waves create?"       [Skip]   |
|                                                       |
|  +----------+  +----------+  +----------+             |
|  | Pattern A |  | Pattern B |  | Pattern C |           |
|  | (diagram) |  | (diagram) |  | (diagram) |           |
|  +----------+  +----------+  +----------+             |
|                  (selected)                            |
|                                                       |
|                          [Submit Prediction]          |
+-------------------------------------------------------+
```

**Design Decisions:**
- Options are visual, not text. For younger users (Seoyeon), pictures communicate faster than descriptions. Principle: Cognitive Load (recognition over recall).
- 3-4 options maximum. More causes decision paralysis. Hick's Law.
- Options are randomized in order to prevent position bias.

#### 6.2.4 Prediction Type: 3D Placement

**Use case:** "Where should you place the reflector for the wave to reach the target?" / "Where will the projectile land?"
**Phase 1 prevalence:** ~20% of Projectile, ~10% of Energy, ~50% of Wave.

**PC (Mouse):**
1. Challenge prompt: "Place the marker where you think [X] will happen."
2. A draggable 3D marker appears near the user's cursor.
3. User clicks and drags the marker to a position in 3D space (snaps to valid surfaces).
4. [Submit Prediction] to confirm.

**Mobile (Touch):**
1. Same flow. Tap-and-drag the marker. Two-finger rotate to view from different angles if needed.

**Design Decisions:**
- The marker has a large hit volume (inflated beyond visual size) per 3D interaction patterns.
- Snap guides or surface constraints prevent placing the marker in impossible locations (inside objects, outside the scene).
- Ghost outline shows where the marker will land when hovering over valid surfaces. Principle: feedback for every action.

#### 6.2.5 Skip Behavior

Available for all prediction types. Skip flow:

1. User taps [Skip].
2. First time in session: gentle nudge appears -- "Predictions make the experiment more fun. Give it a try?" + [Try It] + [Skip Anyway].
3. Subsequent skips: immediate skip without nudge. We respect the user's choice. (Anti-pattern: guilt-tripping in onboarding copy).
4. When skipped: Play phase runs immediately. Discover phase shows the result without a comparison overlay (since there is no prediction to compare).

Analytics: `predict_skip` event fires with station_id and challenge_id.

### 6.3 Play Phase

**Goal:** User performs the experiment using God Hand (1st-person tabletop manipulation).

**Duration:** 5-30 seconds depending on challenge complexity.

**HUD State:** Minimal. Only essential info (current challenge label, exit button). The 3D viewport and God Hand interaction are the entire focus. Principle: P3 (The 3D is the Interface).

#### 6.3.1 God Hand Interaction Patterns

God Hand is the unified interaction model: the user is a disembodied experimenter manipulating objects on a tabletop. No avatar, no character -- just direct manipulation.

**Throw / Launch:**

| Input | Action | Feedback |
|-------|--------|----------|
| PC Mouse | Click object -> drag in launch direction -> release | Velocity arrow appears during drag (shows direction + magnitude). Object launches on release. |
| Mobile Touch | Tap object -> swipe in direction -> release | Same velocity arrow. Haptic pulse on release (where supported). |
| XR [Phase 2+] | Grab object -> swing arm -> release | Physical throwing motion. Haptic on release via controllers. |

- Velocity arrow during drag gives users feedforward about the launch (Principle: show information needed for current decision).
- Drag distance = launch speed. Visible mapping prevents surprise. The arrow updates in real-time during drag.
- Post-release: camera may auto-follow the projectile (smooth tracking, user can override with manual camera movement).

**Assemble / Place:**

| Input | Action | Feedback |
|-------|--------|----------|
| PC Mouse | Click object -> drag to position -> release | Ghost preview at target location. Snap to valid positions. Green highlight = valid, red = invalid. |
| Mobile Touch | Tap-hold -> drag -> release | Same ghost preview. |

**Push / Pull:**

| Input | Action | Feedback |
|-------|--------|----------|
| PC Mouse | Click object -> drag toward/away | Object moves with direct mapping. Spring physics for resistance. |
| Mobile Touch | Tap-hold -> drag | Same. |

**Install / Remove:**

| Input | Action | Feedback |
|-------|--------|----------|
| PC Mouse | Click to pick up -> drag to mount point -> release | Mount point glows when within snap range. Click animation on attachment. Audio click. |
| Mobile Touch | Tap-hold -> drag -> release near mount point | Same. |

**Shake Space:**

| Input | Action | Feedback |
|-------|--------|----------|
| PC Keyboard | Hold Shift + mouse drag on empty space | Camera shakes subtly. Objects in scene respond to applied force. |
| Mobile Touch | Two-finger shake gesture | Same effect. |

#### 6.3.2 Camera Controls During Play

The user may need to adjust the camera to see the experiment from different angles.

| Action | PC Input | Mobile Input |
|--------|----------|-------------|
| Orbit | Right-click + drag | Two-finger drag |
| Zoom | Scroll wheel | Pinch |
| Pan | Middle-click + drag | Three-finger drag [or shift + two-finger drag] |
| Reset view | Double-click empty space / R key | Double-tap empty space |

**Design Decisions:**
- Left-click is reserved for God Hand object interaction. Camera controls use right-click / middle-click to avoid conflict. This differs from standard 3D viewer conventions (left-click = orbit) because object interaction takes priority.
- On mobile, single-finger on empty space could be camera orbit. Single-finger on an object is God Hand interaction. This distinction is critical -- hit testing must be precise.
- Camera has soft boundaries: cannot go below the tabletop, cannot go inside objects, minimum and maximum zoom distances set per challenge.
- Smooth damping on all camera movements (3D Design reference: movement must feel natural).

#### 6.3.3 Simulation Playback

- Simulation runs in real-time after God Hand action.
- Some challenges have a "slow-motion" replay option available after the simulation completes (toggle button in HUD).
- Simulation cannot be paused mid-run in Phase 1. The experiment runs to completion.
- If the simulation runs longer than expected (> 15s), a "skip to result" option fades in.

### 6.4 Discover Phase

**Goal:** Compare prediction with reality. Understand why. Feel motivated to try the next challenge.

**Duration:** 15-60 seconds (user-controlled -- they choose how deep to go).

**HUD State:** Comparison overlay on the 3D scene + explanation panel.

#### 6.4.1 Comparison Overlay

The 3D scene shows the result of the experiment. If the user made a prediction:

- **Trajectory:** The predicted line (dashed, colored A) and actual trajectory (solid, colored B) are both visible in 3D space. Areas of divergence are highlighted.
- **Binary:** The chosen option has a checkmark or X, with the correct answer highlighted.
- **Pattern:** The chosen pattern and actual pattern shown side by side.
- **3D Placement:** The predicted marker and actual result position are both visible, with a distance line between them.

**Outcome Framing:**

Per P4 (Wrong is Wonderful), framing differs from typical "correct/incorrect":

| Outcome | Heading | Tone |
|---------|---------|------|
| Correct (within tolerance) | "Nice prediction!" | Celebratory but brief -- quickly moves to "here's why this works" |
| Close (partially correct) | "Almost! Look at the difference here..." | Curious, points to specific divergence |
| Wrong | "Interesting! Let's see what happened..." | Discovery-oriented, no penalty language |
| Skipped prediction | "Here's what happened." | Neutral -- just shows the result |

**UX copy rules for Discover:**
- Never use "wrong," "incorrect," "failed," or "error" to describe the user's prediction.
- Use "difference," "gap," "what actually happened" instead.
- Frame the explanation as something the user is discovering, not being told.

#### 6.4.2 Explanation Panel (Discover Depth)

The explanation panel slides in from the right (PC) or bottom (mobile). It contains:

**Level 1 -- Intuitive Analogy** (default for first few challenges, younger users):
- One sentence analogy: "Heavy objects don't fall faster -- they all fall at the same speed, like dropping a bowling ball and a baseball in space."
- Visual: Simple illustration or short looping animation.

**Level 2 -- Conceptual Explanation** (default for most users):
- 2-3 sentences explaining the physics concept.
- Key concept highlighted and added to the user's knowledge graph.
- "Gravity pulls everything at the same rate. Mass doesn't matter -- only air resistance does. In a vacuum, a feather and a hammer hit the ground at the same time."

**Level 3 -- With Formulas** (opt-in via settings or expandable section):
- Full equation with variable labels.
- "F = mg, where g = 9.8 m/s^2 regardless of mass m."
- Interactive: user can see how changing variables affects the equation (links back to Play phase for experimentation).

**Depth Selection Logic:**
1. User's setting in Settings page sets the base depth.
2. Adaptive engine may suggest a higher depth if user has been consistently correct (they may be ready for more detail).
3. Each level is expandable -- Level 1 has a "Learn more" link to Level 2, and Level 2 has "See the math" to Level 3. Progressive disclosure per Cognitive Load Theory.

```
+-------------------------------------------------------+
|                                                       |
|   [3D Scene with comparison overlay visible]          |
|                                                       |
|                +-----------------------------+        |
|                | Interesting!                 |        |
|                |                             |        |
|                | The ball followed a          |        |
|                | parabolic arc because        |        |
|                | gravity pulls it down at a   |        |
|                | constant rate while it moves  |        |
|                | forward.                     |        |
|                |                             |        |
|                | [See the math ->]           |        |
|                |                             |        |
|                | Related: Try this concept    |        |
|                | in a different environment   |        |
|                | [Phase 3+]                  |        |
|                +-----------------------------+        |
|                                                       |
|  [Replay]         [Try Different Settings]            |
|                          [Next Challenge]             |
+-------------------------------------------------------+
```

#### 6.4.3 Post-Discover Actions

| Action | Button Label | Behavior |
|--------|-------------|----------|
| Next challenge | "Next Challenge" | Adaptive engine selects the next challenge. Brief transition. |
| Replay experiment | "Replay" | Re-runs the same simulation (no prediction, just replay). |
| Try with different settings | "Try Different Settings" | Re-enters the same challenge type with modified variables. |
| Change station | Station selector in HUD | Switches to a different station within the same space. |
| Exit to hub | Exit button in HUD | Portal transition back to Hub page. |

"Next Challenge" is the primary action (visually dominant). Others are secondary. Principle: Von Restorff Effect -- one action stands out.

#### 6.4.4 Cross-Engine Recommendations [Phase 3+]

When the current concept connects to another engine's content:

```
+----------------------------------------------+
|  This concept appears in another space:       |
|                                               |
|  "The Doppler effect in sound waves is the    |
|   same principle that makes distant galaxies  |
|   appear red."                                |
|                                               |
|  [Explore in Space Observatory]               |
+----------------------------------------------+
```

If the target space is locked, the CTA changes to show unlock progress: "Complete Mechanics Lab to unlock the Space Observatory (70% done)."

---

## 7. HUD Design

The HUD (Heads-Up Display) is the 2D overlay layer rendered on top of the full-screen 3D viewport when the user is inside a lab.

### 7.1 HUD Layout Principles

1. **Peripheral placement:** HUD elements sit at screen edges, leaving the center 70%+ of the viewport clear for the 3D scene. Principle: P3 (The 3D is the Interface) -- the simulation is always the visual focus.

2. **Translucent backgrounds:** All HUD panels use semi-transparent backgrounds (glass-morphism style) so the 3D scene remains partially visible behind them. Opacity: 75-85% on light theme, 80-90% on dark theme.

3. **Context-driven visibility:** HUD elements appear and disappear based on the current core loop phase. Nothing is permanently visible except the exit button and the station indicator.

4. **No hover-only interactions:** All HUD interactions work with click/tap. Hover provides enhancement (tooltips, highlights) but is never required. Critical for mobile and future XR. (Anti-pattern: hover-only interactions on touch devices).

### 7.2 HUD Zones

```
+-------------------------------------------------------+
| [Exit]  Station: Projectile (8/10)          [Sound] [?]|  <- TOP BAR
|                                                        |
|                                                        |
|                                                        |
|                   (3D VIEWPORT)                        |
|                   (Clear zone - no HUD)                |
|                                                        |
|                                                        |
|                                                        |
|                                           [Panel  ]   |  <- RIGHT PANEL
|                                           [Slides ]   |     (Predict/Discover content)
|                                           [In/Out ]   |
|                                                        |
| [Station Nav]            [Phase-specific controls]     |  <- BOTTOM BAR
+-------------------------------------------------------+
```

### 7.3 HUD Elements by Phase

#### Always Visible

| Element | Position | Purpose |
|---------|----------|---------|
| Exit button | Top-left | Return to Hub. Always one tap away. |
| Station indicator | Top-center | Shows current station and challenge progress (e.g., "Projectile 8/10") |
| Sound toggle | Top-right | Mute/unmute sound effects and music |
| Help button | Top-right (next to sound) | Contextual help overlay. Shows control hints for current phase. |

#### Predict Phase

| Element | Position | Purpose |
|---------|----------|---------|
| Challenge prompt | Top-center (below station indicator) | The prediction question |
| Prediction input | Center or right panel | Depends on prediction type (drawing canvas, choice buttons, pattern cards, 3D marker) |
| Skip button | Top-right of prediction panel | Skip this prediction |
| Submit button | Bottom of prediction panel | Confirm prediction |

#### Play Phase

| Element | Position | Purpose |
|---------|----------|---------|
| Interaction hint (first time) | Bottom-center | "Click and drag the ball to throw it" -- dismisses on first interaction |
| Timer (if applicable) | Top-right | Some challenges have time-based elements |

Minimal HUD during Play. The user's focus should be entirely on the God Hand interaction.

#### Discover Phase

| Element | Position | Purpose |
|---------|----------|---------|
| Outcome heading | Top-center | "Nice prediction!" / "Interesting! Let's see..." |
| Explanation panel | Right side (PC) / Bottom sheet (mobile) | Discover depth content (Level 1/2/3) |
| Action buttons | Bottom of explanation panel | "Next Challenge," "Replay," "Try Different Settings" |
| Comparison toggle | Bottom-left | Toggle prediction overlay on/off to see the result clearly |

### 7.4 HUD Sizing and Spacing

| Element | PC Minimum | Mobile Minimum |
|---------|-----------|----------------|
| Buttons | 36x36px visual, 44x44px hit area | 44x44pt visual, 48x48pt hit area |
| Text | 14px minimum | 16px minimum |
| Panel width | 320px (right panel) | Full width (bottom sheet) |
| Panel max-height | 60% viewport height | 50% viewport height |
| Margin from viewport edges | 16px | 12px |

### 7.5 HUD Transitions

| Transition | Animation | Duration |
|------------|-----------|----------|
| Phase change (Predict -> Play) | Prediction panel slides out right, play hints fade in | 300ms |
| Phase change (Play -> Discover) | Explanation panel slides in from right | 300ms |
| Station switch | All HUD elements cross-fade | 200ms |
| HUD element appear | Fade in + slight slide from edge | 200ms ease-out |
| HUD element dismiss | Fade out + slight slide to edge | 150ms ease-in |

All transitions respect `prefers-reduced-motion`: when enabled, transitions become instant cuts (no animation).

---

## 8. Navigation Model

### 8.1 Two Worlds: 2D and 3D

PhysPlay has two distinct interface layers that never overlap:

| Layer | Pages | UI Style | Navigation |
|-------|-------|----------|------------|
| 2D (site/) | Landing, Hub, Progress, Settings | Standard web pages with top nav | URL-based routing (TanStack Router) |
| 3D (experience/) | Lab experience | Full-screen 3D viewport + HUD | In-scene HUD controls (no URL changes) |

**Architecture rule (from client-structure.md):** `site/` and `experience/` NEVER import each other. Cross-layer data flows through `shared/stores/`.

### 8.2 2D Navigation Bar

Present on all 2D pages. Persistent, top of viewport.

```
+-------------------------------------------------------+
|  [Logo] PhysPlay     [Hub] [Progress] [Settings]      |
+-------------------------------------------------------+
```

- **Logo:** Links to Hub (for returning users) or Landing (for first visitors).
- **3-item nav:** Hub, Progress, Settings. Follows Miller's Law (5 +/- 2) and Serial Position Effect (most used items at edges).
- **Active state:** Current page is visually highlighted (underline or fill).
- **Mobile responsive:** Same items, possibly abbreviated labels or icon + label. No hamburger menu needed for only 3 items.

### 8.3 Portal Transition (2D <-> 3D)

The portal transition is the psychological gateway between the browsing/planning mode (2D) and the experimentation mode (3D). Per REQ-040, this must be dramatic enough to signal a mode change.

**2D -> 3D (Entering Lab):**
1. User selects a station from Hub.
2. A portal effect begins: the selected space card expands to fill the screen.
3. A brief wormhole/tunnel animation (0.8-1.2s) plays. During this time, the 3D scene loads in the background.
4. The 3D environment materializes around the user. Camera settles at the default lab viewpoint.
5. HUD fades in. Challenge is ready.

**3D -> 2D (Exiting Lab):**
1. User taps Exit in HUD.
2. The 3D scene contracts into a portal (reverse of entry animation, 0.6-0.8s).
3. Hub page appears underneath.

**Fallback (reduced motion or slow device):**
- Replace portal animation with a simple cross-fade (300ms).
- Ensure the 3D scene is ready before the transition completes (no blank screens after the animation).

**Loading during transition:**
- If the 3D scene is not loaded by the time the portal animation finishes, hold on a progress indicator: "Setting up your experiment..." with a progress bar.
- Never show a blank white/black screen. Always show either the transition animation or a progress indicator against the 2D page background.

### 8.4 In-Lab Navigation

Within the 3D lab, all navigation happens through the HUD:

| Action | Control | Behavior |
|--------|---------|----------|
| Switch station | Station selector (bottom HUD) | Camera moves to new station area. Environment parameters adjust. No loading screen. |
| Exit to hub | Exit button (top-left HUD) | Portal transition (3D -> 2D) back to Hub. |
| Skip to next challenge | "Next Challenge" in Discover phase | In-place transition. Scene resets with new challenge parameters. |
| Access settings | Not available in 3D lab | User must exit to Hub first. Settings are not urgent enough to warrant HUD presence during experiments. |

**Rationale for no settings in 3D:** Adding settings access to the HUD violates P2 (One Question at a Time) and P3 (The 3D is the Interface). The HUD should be minimal. Settings changes are infrequent and can wait until the user exits the lab.

---

## 9. Onboarding UX

### 9.1 Philosophy

The onboarding IS the first challenge. There is no separate tutorial, no feature tour, no welcome carousel. This is the most aggressive possible interpretation of P1 (Immediate Action).

**Why:** Contextual learning through doing is more effective than sequential explanation (UX Writing reference: show, don't tell). The core loop is simple enough (predict, experiment, see result) that the user can learn it by experiencing it once.

### 9.2 First 30 Seconds

| Second | What Happens | UX Principle |
|--------|-------------|-------------|
| 0-2 | Landing page renders. One question + one button visible. | Doherty Threshold: < 2s to interactive |
| 2-4 | User taps "Start Experimenting." Portal transition begins. | Peak-End Rule: first interaction sets the tone |
| 4-7 | Portal transition completes. 3D lab appears. First challenge loaded. | 3D Loading: poster image -> progressive -> full quality |
| 7-10 | Contextual hint: "Where will the ball land? Draw your prediction." | Cognitive Load: one instruction, one action |
| 10-20 | User draws a prediction (or skips). Brief positive feedback. | P4: Wrong is Wonderful -- no risk in predicting |
| 20-25 | User performs God Hand throw. Contextual hint for first interaction. | Direct manipulation: learn by doing |
| 25-30 | Discover phase: comparison overlay + Level 1 explanation. | Peak-End: the "aha" moment is the peak experience |

### 9.3 Contextual Hints

Instead of a tutorial, PhysPlay uses contextual hints that appear at the moment they are needed and disappear after first use.

| Hint | When | Content | Dismissal |
|------|------|---------|-----------|
| Prediction | First Predict phase | "Draw where you think the ball will go." | On first drawing stroke |
| God Hand | First Play phase | "Click and drag the ball to throw it." | On first object interaction |
| Camera | First time user tries to look around | "Right-click + drag to look around." | On first camera orbit |
| Discover depth | First Discover phase with expandable content | "Tap 'Learn more' for deeper explanation." | On first expansion or after 3 challenges |
| Station switch | After first challenge complete | "Try other stations in the station bar below." | On first station switch or after 2 challenges |

**Hint design:**
- Appear as a floating label near the relevant element (not blocking the center viewport).
- Semi-transparent background, small text.
- Fade in with a subtle animation (200ms), dismiss with fade-out on trigger.
- Never re-appear once dismissed (stored in local storage).
- All hints have a small "x" to dismiss manually.

### 9.4 Hub Reveal

After the first challenge (onboarding challenge) is complete:

1. Discover phase completes normally.
2. Instead of "Next Challenge," the CTA is "See Your Research Lab."
3. Portal transition (3D -> 2D) brings the user to the Hub page.
4. A brief first-time message: "Welcome to your research lab. You've unlocked the Mechanics Lab. Explore the stations and keep experimenting."
5. Space map shows Mechanics Lab (unlocked) and other spaces (locked silhouettes).
6. The message dismisses on any interaction or after 5 seconds.

**Why reveal the Hub after the first challenge, not before?** Because the Hub is meaningless without context. After completing one Predict-Play-Discover loop, the user understands what they are selecting from the Hub. If we showed the Hub first, it would be an obstacle before the interesting part (violating P1).

---

## 10. Responsive Strategy

### 10.1 Approach: PC-First, Mobile-Adapted

PhysPlay is PC-first (REQ-057). The 3D lab experience is designed for mouse + keyboard as the primary input. Mobile is supported through responsive layout and touch gesture mapping that preserves the core experience.

### 10.2 Breakpoints

| Breakpoint | Width | Target Device | Layout Strategy |
|------------|-------|---------------|-----------------|
| Desktop L | >= 1280px | Monitors, laptops | Full layout. Right panel for explanations. Generous spacing. |
| Desktop | 1024-1279px | Small laptops | Slightly condensed. Right panel narrows. |
| Tablet | 768-1023px | iPad, tablets | 2D pages: single column. 3D lab: bottom sheet instead of right panel. |
| Mobile | 320-767px | Phones | 2D pages: fully stacked. 3D lab: bottom sheet, larger touch targets, simplified HUD. |

### 10.3 2D Pages (Hub, Progress, Settings) Responsive Rules

| Element | Desktop | Mobile |
|---------|---------|--------|
| Space cards | 2x2 grid | Vertical stack (full width) |
| Station chips | Horizontal row | Horizontal scroll or wrap |
| Progress bars | Full width with labels | Full width, labels above bar |
| Navigation | Top bar, text labels | Top bar, abbreviated labels or icons + text |
| Content width | Max 960px, centered | Full width, 16px horizontal padding |
| Settings | Single column, grouped | Single column, grouped (same) |

### 10.4 3D Lab Responsive Rules

| Element | Desktop | Mobile |
|---------|---------|--------|
| 3D viewport | Full screen | Full screen |
| HUD panels (Predict, Discover) | Right side panel (320px) | Bottom sheet (50-60% height, draggable) |
| Buttons | 36px visual, 44px hit area | 44pt visual, 48pt hit area |
| Text size | 14px minimum | 16px minimum |
| God Hand interaction | Mouse click + drag | Touch tap + drag |
| Camera orbit | Right-click + drag | Two-finger drag |
| Station selector | Bottom bar with labels | Bottom bar with icons + labels (scrollable if needed) |
| Explanation panel | Right side, scrollable | Bottom sheet, scrollable, three snap points (peek/half/full) |

### 10.5 Touch Gesture Conflict Resolution

On mobile, the 3D viewport occupies the full screen. This creates potential conflicts between page scrolling, camera controls, and God Hand interactions.

**Resolution strategy:**

1. **In 3D lab:** No page scrolling. The viewport captures all touch input. This is acceptable because the 3D lab is a full-screen experience, not a page with content below.
2. **Object interaction vs. camera:** Single-finger on an object = God Hand interaction. Single-finger on empty space = camera orbit. Interaction mode is determined by hit testing against 3D objects.
3. **HUD panels:** When a HUD panel (bottom sheet on mobile) is open, touches on the panel scroll the panel content. Touches outside the panel interact with the 3D scene.
4. **Zoom:** Two-finger pinch anywhere = camera zoom (not page zoom). The viewport should use `touch-action: none` to prevent browser zoom interference.

### 10.6 Minimum Viable Mobile Experience

At 320px width (minimum supported), the 3D lab must still function:

- Station selector shows icons only (no labels) in a horizontal scroll.
- Bottom sheet is the only HUD panel layout (no side panels).
- Prediction types adapt: trajectory drawing works with finger, but the drawing area may be smaller. Binary choice uses full-width stacked buttons.
- Font size never goes below 16px (ergonomics reference).

---

## 11. Accessibility

### 11.1 Strategy

PhysPlay has two distinct accessibility contexts:

1. **2D pages (Hub, Progress, Settings):** Standard web accessibility (WCAG 2.1 AA). Full keyboard navigation, screen reader support, semantic HTML.
2. **3D lab experience:** 3D viewports present inherent accessibility challenges. Phase 1 provides foundational accessibility; deeper 3D accessibility is Phase 2 (REQ-059 is P2).

### 11.2 2D Pages Accessibility (Phase 1)

#### Keyboard Navigation

- All interactive elements reachable via Tab.
- Logical tab order matches visual order (DOM order = visual order).
- Enter/Space activates buttons and links.
- Escape closes modals/overlays.
- Focus indicator: 2px solid outline, 3:1 contrast against background.
- Focus management: when navigating to a new page, focus moves to the main content heading.

```css
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}
```

#### Semantic HTML

- Proper heading hierarchy: h1 (page title) -> h2 (sections) -> h3 (subsections).
- Navigation landmarks: `<main>`, `<nav>`, `<header>`.
- Lists use semantic `<ul>`, `<ol>`, `<li>`.
- Form inputs have associated `<label>` elements.
- Images have meaningful `alt` text or `alt=""` for decorative images.

#### Screen Reader Support

- Dynamic content updates use `aria-live="polite"` for non-urgent updates (progress changes, setting confirmations).
- `aria-live="assertive"` for errors.
- Interactive elements have accessible names (`aria-label` when visible text is insufficient).
- Space cards in Hub include descriptive labels: "Mechanics Lab, 3 stations, 12 of 26 challenges completed."
- Locked spaces: "Molecular Lab, locked. Complete Mechanics Lab to unlock."

#### Color and Contrast

- Text contrast: 4.5:1 minimum (3:1 for large text >= 18pt).
- UI component contrast: 3:1 minimum against adjacent colors.
- Color is never the sole indicator of state. All color-coded information is paired with text labels, icons, or patterns.
- Progress bars include numeric labels (e.g., "8/10") not just color fill.
- Settings page tested with protanopia, deuteranopia, tritanopia simulators.

### 11.3 3D Lab Accessibility (Phase 1 Baseline, Phase 2 Enhancement)

#### Phase 1 (Baseline)

- **Reduced motion:** `prefers-reduced-motion` respected. Portal transitions become cross-fades. Auto-rotation disabled. Camera transitions become instant jumps.
- **HUD text size:** Minimum 14px PC, 16px mobile. Scalable with browser zoom.
- **HUD contrast:** All HUD text meets 4.5:1 contrast. HUD panel backgrounds provide sufficient contrast separation from the 3D scene.
- **Keyboard access to HUD:** Tab through HUD elements. Arrow keys navigate between options in prediction panels. Enter submits.
- **No flashing content:** No strobe effects, no rapid flashing (seizure risk prevention).

#### Phase 2 (Enhancement)

- **Keyboard navigation of 3D objects:** Arrow keys to cycle through interactive objects. Enter to select/grab. WASD for camera movement.
- **Screen reader descriptions of 3D state:** "A ball sits on a ramp at 45 degrees. A target is 3 meters to the right." This is a text representation of the 3D scene, updated when the scene state changes.
- **High contrast mode for HUD:** Solid backgrounds instead of translucent panels. Thicker outlines on interactive elements.
- **Alternative text-based challenge mode:** For users who cannot interact with the 3D viewport, provide a text-based version of the prediction (dropdown menus, text input for values instead of drawing/placement).

### 11.4 Cognitive Accessibility

Applies to both 2D and 3D:

- **Plain language:** All text at approximately 8th grade reading level. Science terms are introduced with definitions.
- **Consistent navigation:** Same nav structure on every 2D page. Same HUD layout in every challenge.
- **Predictable behavior:** Identical interactions produce identical results everywhere.
- **No auto-advancing content:** Users control when to proceed to the next challenge. No timers forcing decisions (exception: challenges with time-based physics, where the timer is part of the experiment, not the UI).
- **Error recovery:** All actions in the core loop are recoverable. Wrong predictions lead to discovery. Failed experiments can be replayed.

---

## 12. Motion & Transitions

### 12.1 Motion Principles

1. **Motion communicates, it does not decorate.** Every animation serves a purpose: indicate progress, show cause-and-effect, orient the user, or celebrate achievement. If removing the animation loses no information, remove the animation.

2. **Physics-based motion in the 3D lab, ease-based motion in 2D UI.** The 3D environment follows real physics (trajectories, bounces, waves). HUD animations follow standard UI easing.

3. **All motion respects `prefers-reduced-motion`.** When enabled: replace animations with instant state changes, replace portal transitions with cross-fades, disable auto-rotation and particle effects.

### 12.2 Transition Inventory

#### Page Transitions (2D)

| Transition | Animation | Duration | Easing |
|------------|-----------|----------|--------|
| Page to page (Hub -> Progress) | Cross-fade | 200ms | ease-in-out |
| Landing -> first challenge (portal) | Expand + tunnel + materialize | 800-1200ms | ease-out for expand, custom for tunnel |
| Hub -> Lab (portal) | Card expand + tunnel + 3D materialize | 800-1200ms | ease-out |
| Lab -> Hub (portal reverse) | 3D contract + tunnel reverse + page materialize | 600-800ms | ease-in for contract, ease-out for page |

#### HUD Transitions (3D)

| Transition | Animation | Duration | Easing |
|------------|-----------|----------|--------|
| Phase: Predict -> Play | Prediction panel slides out right, fade | 300ms | ease-in |
| Phase: Play -> Discover | Explanation panel slides in from right | 300ms | ease-out |
| Phase: Discover -> Predict (next challenge) | Cross-fade of HUD content | 200ms | ease-in-out |
| Station switch | Camera glide + environment parameter blend | 500ms | ease-in-out |
| HUD element appear | Fade in + 8px slide from edge | 200ms | ease-out |
| HUD element dismiss | Fade out + 8px slide to edge | 150ms | ease-in |

#### 3D Scene Transitions

| Transition | Animation | Duration | Easing |
|------------|-----------|----------|--------|
| Challenge setup (new objects appear) | Objects scale from 0 + slight bounce | 400ms | spring (0.5 damping) |
| Simulation start | Objects affected by physics | Real-time | Physics engine |
| Comparison overlay appear | Predicted trajectory fades in over 300ms | 300ms | ease-out |
| Camera reset | Smooth interpolation to default position | 500ms | ease-in-out |

#### Feedback Animations

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Prediction submitted | Subtle pulse on submitted element + checkmark | 300ms |
| Challenge correct | Brief particle burst + "Nice prediction!" text animation | 500ms |
| Challenge incorrect (not shown as error) | Gentle comparison reveal + "Interesting!" text | 300ms |
| Station complete | Larger celebration effect + progress bar fill animation | 800ms |
| Space unlocked [Phase 2+] | Dramatic reveal: silhouette fills with color + portal opens | 1200ms |

### 12.3 Reduced Motion Fallback

```css
@media (prefers-reduced-motion: reduce) {
  /* All transitions become instant */
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }

  /* Portal transition becomes cross-fade (handled in JS) */
  /* Camera transitions become instant position change */
  /* Particle effects disabled */
  /* Auto-rotation disabled */
  /* Simulation physics still runs normally (it's content, not decoration) */
}
```

---

## 13. State & Error Handling

### 13.1 Loading States

#### 3D Scene Loading (Most Critical)

Users must never see a blank screen while 3D assets load.

**Loading hierarchy (per 3D Design reference):**

```
1. Instant (0ms):
   Container visible. Portal transition animation plays.

2. Quick preview (0-2s):
   Low-resolution environment visible (skybox + ground plane).
   Poster image or low-poly silhouette of experiment setup.

3. Progressive (2-5s):
   Base geometry loaded. User can orbit camera.
   Textures and materials stream in progressively.

4. Full quality (5s+):
   High-resolution textures replace low-res.
   Physics engine initialized. Challenge ready.
```

**Rule:** Allow camera orbit as soon as the low-poly scene is visible (< 2s). Never block interaction with a loading overlay.

**Progress indicator during load:**

```
+-------------------------------------------------------+
|                                                       |
|  [Low-poly 3D environment visible]                    |
|                                                       |
|                                                       |
|           Preparing your experiment...                |
|           [===========----------]  65%                |
|                                                       |
+-------------------------------------------------------+
```

#### 2D Page Loading

- Page shell renders instantly via SSR (landing page) or client-side routing.
- Data-dependent content (progress numbers, space unlock states) shows skeleton shimmer until loaded.
- Expected load time: < 300ms for local data. No spinner needed -- skeleton suffices.

### 13.2 Error States

#### Simulation Engine Error

The physics engine or renderer encounters an unrecoverable error.

```
+-------------------------------------------------------+
|                                                       |
|  [3D scene frozen or partially rendered]              |
|                                                       |
|  +----------------------------------------------+    |
|  |  Something went wrong with the simulation.    |    |
|  |                                               |    |
|  |  [Try Again]        [Back to Hub]             |    |
|  +----------------------------------------------+    |
|                                                       |
+-------------------------------------------------------+
```

- **Tone:** Calm, not alarming. "Something went wrong with the simulation." (not "Error 500" or "Fatal exception").
- **Actions:** "Try Again" reloads the current challenge. "Back to Hub" exits to safe ground.
- **Telemetry:** Automatic Sentry error report with engine state snapshot.

#### WebGPU/WebGL Fallback

If WebGPU is unavailable:
- Silently fall back to WebGL. No user-visible message (user does not care about the rendering backend).
- If WebGL also fails: show a clear message on the landing page: "PhysPlay needs a modern browser with 3D support. Try the latest Chrome, Firefox, or Safari." with links to supported browsers.

#### Storage Error

If local storage (OPFS/IndexedDB) is unavailable:
- First-visit: works normally (nothing to persist yet). Show a non-blocking banner: "Progress may not be saved in private browsing mode."
- Returning visit: fall through to first-visit behavior. Previous progress is lost. Show: "We could not find your saved progress. This can happen in private browsing or if browser data was cleared."
- Never block the experience. Storage is a convenience, not a prerequisite.

#### Network Error

- Phase 1 works entirely offline after initial load. Network errors only affect:
  - Analytics (PostHog): silent failure, events queued.
  - Error tracking (Sentry): silent failure.
  - Initial asset loading: show retry option if CDN assets fail to load.

### 13.3 Empty States

| Location | When | Content | CTA |
|----------|------|---------|-----|
| Hub (first visit) | After onboarding challenge | "Your research lab is ready. Pick a station to begin." | Station chips highlighted |
| Progress (no challenges done) | User navigates to /progress before completing any challenge | "Start experimenting to see your progress here." | [Go to Hub] |
| Station (all challenges complete) | User completed all challenges in a station | "You've explored every challenge in this station. Try a different one, or come back later for new experiments." | [Other Stations] |

Empty states follow the formula: what this place is + why it is empty + what to do next.

### 13.4 Offline Behavior

Phase 1 is designed to work offline after initial load:

| Feature | Online | Offline |
|---------|--------|---------|
| Simulation | Works | Works (WASM runs locally) |
| Challenge data | Loaded from bundle | Available (bundled with app) |
| Progress saving | Saves to local storage | Saves to local storage (same) |
| Analytics | Sent to PostHog | Queued, sent on reconnect |
| Asset loading (textures, models) | Fetched from CDN | Must be cached from previous session |

If the user goes offline before 3D assets are cached, show: "Some experiment visuals could not load. Reconnect to download them." The simulation can still run with lower-fidelity fallback models.

---

## 14. i18n UX

### 14.1 Supported Languages (Phase 1)

- English (en) -- default
- Korean (ko)

### 14.2 Language Selection

- **First visit:** Browser language auto-detected. If `navigator.language` starts with "ko," default to Korean. Otherwise, English.
- **Manual switch:** Language toggle in top-right of Landing page and in Settings page. Segmented control: [English] [Korean].
- **Persistence:** Saved in local storage. Applied immediately on selection (no page reload).

### 14.3 Text Expansion Rules

Korean and English have different text lengths and character widths:

| Content Type | en Length | ko Length | Expansion Factor |
|-------------|----------|----------|-----------------|
| Button labels | Baseline | ~0.8-1.2x | Generally similar or shorter in Korean |
| Headings | Baseline | ~0.7-1.0x | Korean is often more compact |
| Body text | Baseline | ~0.8-1.1x | Variable |
| Error messages | Baseline | ~0.9-1.2x | Can be slightly longer |

**Design rules:**
- No fixed-width text containers that might truncate. Use flexible layouts that adapt to content length.
- Buttons have minimum padding (16px horizontal) but grow with text.
- HUD labels have max-width with ellipsis as a last resort (test both languages to ensure no truncation).
- Test all screens in both languages before shipping.

### 14.4 Layout Considerations

Both English and Korean read left-to-right, so there are no RTL layout concerns.

**Typography:**
- English: system font stack (Inter or similar clean sans-serif).
- Korean: system font stack with Korean-optimized fallback (Pretendard, Noto Sans KR, or system default).
- Line height: 1.5-1.6x for Korean (slightly taller than English) because Korean characters are more visually dense.

**Science terms:**
- Proper nouns and formula symbols (F, m, g, Hz) are not translated.
- Science concept names are displayed in the user's language with the English term in parentheses on first use: "도플러 효과 (Doppler Effect)."
- This helps Korean users who may encounter English-only resources later.

### 14.5 3D Scene Text

- Text rendered in the 3D scene (labels on objects, measurement values) uses the same i18n system.
- 3D text must use SDF (Signed Distance Field) fonts for crisp rendering at all viewing angles and distances.
- Font loading: pre-load both language fonts during initial asset loading to prevent layout shifts on language switch.

---

## 15. Dark / Light Theme

### 15.1 Theme Options

Three-option theme selector in Settings:

| Option | Behavior |
|--------|----------|
| System | Follows OS preference (`prefers-color-scheme`). Auto-switches when OS theme changes. Default. |
| Light | Always light. |
| Dark | Always dark. |

### 15.2 2D Pages Theme Handling

Standard light/dark theming with CSS custom properties:

| Token | Light | Dark |
|-------|-------|------|
| --bg-primary | #FFFFFF | #1A1A2E |
| --bg-secondary | #F5F5F7 | #16213E |
| --text-primary | #1A1A2E | #F5F5F7 |
| --text-secondary | #6B7280 | #9CA3AF |
| --accent | #4F46E5 | #818CF8 |
| --surface | #FFFFFF | #1E293B |
| --border | #E5E7EB | #334155 |
| --error | #DC2626 | #F87171 |
| --success | #16A34A | #4ADE80 |

Contrast ratios verified for both themes against WCAG 2.1 AA.

### 15.3 3D Lab Theme Handling

The 3D environment has its own visual theming that is separate from the 2D theme:

- **Space themes** (skybox, lighting, ambient color) are defined per space (REQ-029). These do not change with light/dark mode. The Mechanics Lab always looks like a Mechanics Lab.
- **HUD panels in 3D** adapt to the user's theme:
  - Light theme: white/translucent panels with dark text.
  - Dark theme: dark/translucent panels with light text.
- **HUD panel transparency:** Must maintain readable contrast against varied 3D backgrounds. Use a stronger backdrop-blur and slightly higher opacity in the 3D context than typical glass-morphism.

**Testing rule:** Verify HUD readability against the lightest and darkest areas of each space's environment. If a space has very bright areas (e.g., Space Observatory skybox), ensure dark-theme HUD text is still readable against it (increase panel opacity or add text shadow as needed).

### 15.4 Theme Transition

Theme changes apply instantly. No animation on theme switch (avoids the jarring "flash of wrong theme" on page load).

**Implementation note:** Theme preference is stored in local storage and applied before first paint (in the `<head>` script) to prevent flash of incorrect theme.

---

## 16. Phase Implementation Summary

### Phase 1 (Launch)

**Screens:**
- Landing Page (first visit entry + returning redirect)
- Research Lab Hub (space/station selection)
- Progress Page (learning progress dashboard)
- Settings Page (language, theme, audio, discover depth)
- 3D Lab Experience (full-screen viewport + HUD)

**Flows:**
- First Visit: Landing -> instant challenge -> Hub reveal
- Returning User: Hub -> station selection -> Portal Transition -> 3D Lab -> core loop
- Station Navigation: within 3D Lab via HUD
- Settings: standard 2D page

**Core Loop:**
- All 4 prediction types (trajectory, binary, pattern, placement)
- God Hand interactions (PC mouse/keyboard primary, mobile touch secondary)
- Discover phase with Level 1 + Level 2 depth (Level 3 opt-in)
- Adaptive challenge selection (rule-based engine)

**Content:**
- Mechanics Lab only (1 space, 3 stations, 26 challenges)
- Other spaces visible as locked silhouettes in Hub

**i18n:** en/ko
**Theme:** Light/Dark/System
**Accessibility:** WCAG 2.1 AA for 2D pages. Baseline 3D accessibility (reduced motion, HUD contrast).
**Performance:** 60fps PC, 30fps mobile, 3s initial load.

### Phase 2

**New:**
- XR hand tracking mode (God Hand maps to real hands)
- 3D accessibility enhancements (keyboard 3D navigation, screen reader descriptions)
- Mechanics Lab expansion (Sound/Light, Electromagnetic stations)
- ML-based adaptive engine (replaces rule-based)
- Enhanced portal transitions and space unlock celebrations

**Flow Changes:**
- XR mode toggle in Settings
- In-lab XR mode entry (same scene, input changes to hand tracking)

### Phase 3+

**New Screens:**
- Molecular Lab (new space, Phase 3)
- Space Observatory (new space, Phase 4)
- Quantum Lab (new space, Phase 5)
- User account system (login, sync progress across devices, Phase 3)
- Challenge Editor (UGC, Phase 3)
- Shared challenge viewer (social links, Phase 3)

**New Flows:**
- Cross-engine discovery recommendations (Discover phase links to related concepts in other spaces)
- Account creation and progress sync
- Challenge sharing via URL
- UGC: create -> preview -> share

**IA Changes:**
- Hub grows from 1 unlocked space to 4 as phases ship
- Station count per space increases with vertical expansion
- Search may become relevant when content exceeds ~100 challenges (Phase 4+)

---

## Appendix A: Design Rationale Summary

| Decision | Principle | Reference |
|----------|-----------|-----------|
| No sign-up, instant first challenge | Doherty Threshold, Peak-End Rule | cognitive-principles.md |
| One action per screen/HUD state | Cognitive Load Theory, Von Restorff Effect | cognitive-principles.md |
| Full-screen 3D with minimal HUD | Von Restorff (simulation is focus), REQ-015 | 3d-design.md |
| Wrong predictions framed as discovery | Aesthetic-Usability (emotional safety), Zeigarnik Effect | cognitive-principles.md |
| Locked spaces visible in Hub | Goal Gradient Effect, Serial Position Effect | cognitive-principles.md |
| Top nav for 2D, HUD for 3D | Jakob's Law (web conventions), REQ-015/016 | information-architecture.md |
| Portal transition between 2D and 3D | Mode change signaling, REQ-040 | interaction-patterns.md |
| Progressive loading (poster -> low-poly -> full) | Doherty Threshold, 3D Loading reference | 3d-design.md |
| Context-based hints, no tutorial | Show don't tell, Cognitive Load reduction | ux-writing.md, design-process.md |
| Immediate-apply settings, no save button | Optimistic UI (>95% success, reversible) | interaction-patterns.md |
| Right panel (PC) / bottom sheet (mobile) for explanations | Platform conventions, responsive patterns | ergonomics.md |
| Language auto-detect + manual toggle | Reduce decisions, respect user agency | ux-writing.md |
| Three-option theme (System/Light/Dark) | Jakob's Law (standard web pattern), smart default | ergonomics.md |
| Skip nudge (once per session, then respect choice) | Respect user autonomy, no guilt-tripping | ux-writing.md |
| God Hand left-click = object, right-click = camera | Object interaction priority over camera orbit in simulation context | 3d-design.md |

## Appendix B: Open UX Questions

- [ ] Optimal error tolerance for trajectory drawing predictions by difficulty level?
- [ ] HUD panel opacity values that work across all space environments in both themes?
- [ ] Ideal portal transition duration (current: 0.8-1.2s) -- too fast loses drama, too slow feels sluggish?
- [ ] God Hand macro-micro scale transition UX when switching between tabletop and atomic-scale views [Phase 3+]?
- [ ] Wave pattern selection: how many options per difficulty level before Hick's Law becomes an issue?
- [ ] Station completion celebration: how dramatic before it becomes annoying on repeat?
- [ ] Audio volume balance between BGM, ambient, and sound effects in 3D lab? User control granularity?
- [ ] Should the Hub show "Continue" to jump straight into the last active challenge, bypassing station selection?
- [ ] Mobile God Hand: is single-finger drag for throwing reliable enough, or does it conflict with camera orbit too often?
- [ ] Cross-engine recommendations [Phase 3+]: inline in Discover phase or separate "Related Concepts" section?
